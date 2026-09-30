import { createRef, Fragment, StrictMode, useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import StepWizard, { Step, useStepWizard, type StepMetadata, type StepWizardChildProps, type StepWizardHandle } from './index.js';

function Status() {
    const wizard = useStepWizard();
    return <output data-testid="status">{wizard.currentStep}:{wizard.currentStepName}:{wizard.totalSteps}:{String(wizard.isPending)}</output>;
}
const children = [<Step key="a" stepName="A" hashKey="a">Alpha</Step>, <Step key="b" stepName="B" hashKey="b">Beta</Step>, <Step key="c" stepName="C" hashKey="c">Gamma</Step>];
async function move(fn: () => Promise<boolean>) {
    let accepted = false;
    await act(async () => { accepted = await fn(); });
    return accepted;
}

describe('navigation and public API', () => {
    it('defaults work with no props, no class defaults or warnings (#128, PR #138)', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const ref = createRef<StepWizardHandle>();
        const view = render(<StepWizard ref={ref} />);
        expect(ref.current?.totalSteps).toBe(0);
        expect(ref.current?.currentIndex).toBe(-1);
        view.rerender(<Step />);
        expect(view.container.querySelector('.rsw-step')?.hasAttribute('hidden')).toBe(true);
        expect(error).not.toHaveBeenCalled();
        error.mockRestore();
    });
    it('supports first, last, next, previous, named and hash navigation', async () => {
        const ref = createRef<StepWizardHandle>();
        render(<StepWizard ref={ref} footer={<Status />}>{children}</StepWizard>);
        expect(screen.getByTestId('status').textContent).toBe('1:A:3:false');
        expect(await move(() => ref.current!.lastStep())).toBe(true);
        expect(ref.current!.currentStep).toBe(3);
        await move(() => ref.current!.previousStep());
        expect(ref.current!.currentStep).toBe(2);
        await move(() => ref.current!.firstStep());
        await move(() => ref.current!.nextStep());
        await move(() => ref.current!.goToNamedStep('C'));
        await move(() => ref.current!.goToStep('a'));
        expect(ref.current!.currentStep).toBe(1);
        // String lookup works independently of URL persistence (#119).
        expect(window.location.hash).toBe('');
    });
    it('rejects invalid targets and no-ops without callbacks or state corruption', async () => {
        const ref = createRef<StepWizardHandle>();
        const changed = vi.fn();
        render(<StepWizard ref={ref} onStepChange={changed}>{children}</StepWizard>);
        for (const value of [NaN, Infinity, -1, 0, 4, 1.5, 'unknown', 'toString', '__proto__']) {
            expect(await move(() => ref.current!.goToStep(value))).toBe(false);
        }
        expect(await move(() => ref.current!.firstStep())).toBe(false);
        expect(await move(() => ref.current!.goToNamedStep('missing'))).toBe(false);
        expect(changed).not.toHaveBeenCalled();
        expect(ref.current!.currentStep).toBe(1);
    });
    it('consistently supports zero indexing (#10)', async () => {
        const ref = createRef<StepWizardHandle>();
        const changed = vi.fn();
        render(<StepWizard indexBase={0} initialStep={1} ref={ref} onStepChange={changed}>{children}</StepWizard>);
        expect(ref.current!.currentStep).toBe(1);
        expect(ref.current!.steps.map(s => s.step)).toEqual([0, 1, 2]);
        expect(ref.current!.stepProps(0)?.stepName).toBe('A');
        await move(() => ref.current!.firstStep());
        expect(changed.mock.calls[0][0]).toMatchObject({ previousStep: 1, activeStep: 0 });
        await move(() => ref.current!.lastStep());
        expect(ref.current!.currentStep).toBe(2);
    });
    it('validates initialStep and keeps it initialization-only', () => {
        const ref = createRef<StepWizardHandle>();
        const view = render(<StepWizard initialStep={3} ref={ref}>{children}</StepWizard>);
        expect(ref.current!.currentStep).toBe(3);
        view.rerender(<StepWizard initialStep={1} ref={ref}>{children}</StepWizard>);
        expect(ref.current!.currentStep).toBe(3);
        view.unmount();
        render(<StepWizard initialStep={NaN} ref={ref}>{children}</StepWizard>);
        expect(ref.current!.currentStep).toBe(1);
    });
    it('keeps a stable typed handle, with reactive descendants (#67, #91, #103)', async () => {
        const instance = vi.fn();
        const ref = createRef<StepWizardHandle>();
        render(<StrictMode><StepWizard ref={ref} instance={instance} nav={<Status />}>{children}</StepWizard></StrictMode>);
        const handle = ref.current;
        await move(() => handle!.nextStep());
        expect(ref.current).toBe(handle);
        expect(handle!.currentStep).toBe(2);
        expect(screen.getByTestId('status').textContent).toBe('2:B:3:false');
        expect(instance.mock.calls.every(([value]) => value === handle)).toBe(true);
    });
    it('provides names, hash keys and original props (#39, #94, PR #96, #105)', async () => {
        const ref = createRef<StepWizardHandle>();
        const changed = vi.fn();
        render(<StepWizard ref={ref} onStepChange={changed}>{children}</StepWizard>);
        expect(ref.current!.hashKeys).toEqual(['a', 'b', 'c']);
        expect(ref.current!.stepProps(2)?.stepName).toBe('B');
        expect(ref.current!.stepProps(99)).toBeUndefined();
        await move(() => ref.current!.goToNamedStep('B'));
        expect(changed).toHaveBeenCalledWith({ previousStep: 1, activeStep: 2,
            previousStepName: 'A', activeStepName: 'B', activeNamedStep: 'B', previousHashKey: 'a', activeHashKey: 'b', reason: 'navigation' });
    });
    it('preserves child props and exposes navigation to nested controls (#102, #109)', async () => {
        function Custom({ message, nextStep }: Partial<StepWizardChildProps> & { message: string }) {
            return <button onClick={nextStep}>{message}</button>;
        }
        function Nested() { const wizard = useStepWizard(); return <button onClick={wizard.previousStep}>Nested back</button>; }
        render(<StepWizard footer={<Status />}><Custom message="Custom next" /><Step><Nested /></Step></StepWizard>);
        await act(async () => fireEvent.click(screen.getByText('Custom next')));
        expect(screen.getByTestId('status').textContent).toBe('2:step2:2:false');
        await act(async () => fireEvent.click(screen.getByText('Nested back')));
        expect(screen.getByTestId('status').textContent).toBe('1:step1:2:false');
    });
    it('offers sibling footer/render slots and stable styling hooks (#33, #34)', () => {
        const view = render(<StepWizard id="wizard" wrapperClassName="wrapper" wrapperStyle={{ minHeight: 10 }}
            stepClassName="panel" stepStyle={{ padding: 12 }} nav={w => <header>{w.hashKeys.join(',')}</header>}
            footer={<Status />}>{children}</StepWizard>);
        const wrapper = view.container.querySelector('.rsw-step-wrapper.wrapper')!;
        expect(wrapper.previousElementSibling?.tagName).toBe('HEADER');
        expect(wrapper.nextElementSibling?.tagName).toBe('OUTPUT');
        expect(view.container.querySelector('.rsw-active.panel')).not.toBeNull();
        expect(view.container.querySelector('#wizard')).not.toBeNull();
    });
    it('has a helpful hook error outside its provider', () => {
        expect(() => render(<Status />)).toThrow('useStepWizard must be used inside a StepWizard');
    });
    it('applies sequential navigation in one event without stale positions', async () => {
        const ref = createRef<StepWizardHandle>();
        const changed = vi.fn();
        render(<StepWizard ref={ref} onStepChange={changed}>{children}</StepWizard>);
        await act(async () => { await ref.current!.nextStep(); await ref.current!.nextStep(); });
        expect(ref.current!.currentStep).toBe(3);
        expect(changed.mock.calls.map(([change]) => change.activeStep)).toEqual([2, 3]);
    });
    it('composes named navigation with pathname routing (#119)', async () => {
        const ref = createRef<StepWizardHandle>();
        render(<StepWizard ref={ref} onStepChange={({ activeStepName }) => window.history.pushState(null, '', `/${activeStepName}`)}>{children}</StepWizard>);
        await move(() => ref.current!.goToNamedStep('B'));
        expect(window.location.pathname).toBe('/B');
        expect(window.location.hash).toBe('');
        await act(async () => { window.history.replaceState(null, '', '/C'); await ref.current!.goToNamedStep(window.location.pathname.slice(1)); });
        expect(ref.current!.currentStepName).toBe('C');
    });
});

describe('dynamic children and mounting', () => {
    it('flattens arrays/fragments and ignores conditional holes (#42)', () => {
        const ref = createRef<StepWizardHandle>();
        render(<StepWizard ref={ref}>{null}{false}<Fragment>{children.slice(0, 2)}</Fragment>{[]}{children[2]}</StepWizard>);
        expect(ref.current!.totalSteps).toBe(3);
        expect(ref.current!.hashKeys).toEqual(['a', 'b', 'c']);
    });
    it('rejects non-elements and duplicate names with actionable errors', () => {
        expect(() => render(<StepWizard>text</StepWizard>)).toThrow('children must be React elements');
        expect(() => render(<StepWizard><Step stepName="same" /><Step stepName="same" /></StepWizard>)).toThrow('unique stepName');
    });
    it('retains the active keyed step across insertion/reorder without ghost exits (#84)', async () => {
        const ref = createRef<StepWizardHandle>();
        const view = render(<StepWizard ref={ref}>{children}</StepWizard>);
        await move(() => ref.current!.goToNamedStep('B'));
        view.rerender(<StepWizard ref={ref}>{children[2]}{children[0]}{children[1]}</StepWizard>);
        expect(ref.current!.currentStep).toBe(3);
        expect(ref.current!.currentStepName).toBe('B');
        expect(view.container.querySelector('[class*=rsw-exit]')).toBeNull();
        view.rerender(<StepWizard ref={ref}>{children[0]}{children[2]}</StepWizard>);
        expect(ref.current!.currentStepName).toBe('C');
        expect(ref.current!.currentStep).toBe(2);
        view.rerender(<StepWizard ref={ref}>{[]}</StepWizard>);
        expect(ref.current!.totalSteps).toBe(0);
        expect(await move(() => ref.current!.nextStep())).toBe(false);
    });
    it('updates named/hash maps with changing props rather than caching stale registrations (#127)', async () => {
        const ref = createRef<StepWizardHandle>();
        const view = render(<StepWizard ref={ref}>{children}</StepWizard>);
        view.rerender(<StepWizard ref={ref}>{children[0]}<Step key="b" stepName="Renamed" hashKey="new">Beta</Step></StepWizard>);
        expect(await move(() => ref.current!.goToNamedStep('B'))).toBe(false);
        expect(await move(() => ref.current!.goToNamedStep('Renamed'))).toBe(true);
        expect(ref.current!.hashKeys).toEqual(['a', 'new']);
    });
    it('reconciles the hash when the active step is removed', async () => {
        const ref = createRef<StepWizardHandle>();
        const view = render(<StepWizard ref={ref} isHashEnabled>{children}</StepWizard>);
        await move(() => ref.current!.goToNamedStep('B'));
        view.rerender(<StepWizard ref={ref} isHashEnabled>{children[0]}{children[2]}</StepWizard>);
        expect(ref.current!.currentStepName).toBe('C');
        expect(window.location.hash).toBe('#c');
    });
    it('preserves eager local state and unmounts inactive lazy steps', async () => {
        const mounted = vi.fn(), unmounted = vi.fn();
        function Counter(_props: StepMetadata) {
            useEffect(() => { mounted(); return () => { unmounted(); }; }, []);
            return <input aria-label="local" defaultValue="" />;
        }
        const ref = createRef<StepWizardHandle>();
        const view = render(<StepWizard ref={ref}><Counter key="counter" />{children[1]}</StepWizard>);
        fireEvent.change(screen.getByLabelText('local'), { target: { value: 'saved' } });
        await move(() => ref.current!.nextStep()); await move(() => ref.current!.previousStep());
        expect((screen.getByLabelText('local') as HTMLInputElement).value).toBe('saved');
        expect(mounted).toHaveBeenCalledTimes(1);
        view.rerender(<StepWizard isLazyMount ref={ref}><Counter key="counter" />{children[1]}</StepWizard>);
        await move(() => ref.current!.nextStep());
        expect(screen.queryByLabelText('local')).toBeNull();
        expect(unmounted).toHaveBeenCalledTimes(1);
    });
});

describe('guards and lifecycle (#86, #111)', () => {
    it('guards buttons, ref navigation and named jumps; accepts void by default', async () => {
        const ref = createRef<StepWizardHandle>();
        const guard = vi.fn(() => false);
        const change = vi.fn();
        const view = render(<StepWizard ref={ref} beforeStepChange={guard} onStepChange={change}>{children}</StepWizard>);
        expect(await move(() => ref.current!.nextStep())).toBe(false);
        expect(await move(() => ref.current!.goToNamedStep('C'))).toBe(false);
        expect(change).not.toHaveBeenCalled();
        view.rerender(<StepWizard ref={ref} beforeStepChange={() => undefined}>{children}</StepWizard>);
        expect(await move(() => ref.current!.nextStep())).toBe(true);
    });
    it('shows async pending state and discards superseded requests', async () => {
        const ref = createRef<StepWizardHandle>();
        let approve!: (value: boolean) => void;
        const guard = vi.fn().mockImplementationOnce(() => new Promise<boolean>(resolve => { approve = resolve; })).mockReturnValue(true);
        render(<StepWizard ref={ref} beforeStepChange={guard} nav={<Status />}>{children}</StepWizard>);
        let pending!: Promise<boolean>;
        act(() => { pending = ref.current!.nextStep(); });
        expect(screen.getByTestId('status').textContent).toBe('1:A:3:true');
        await move(() => ref.current!.lastStep());
        await act(async () => { approve(true); expect(await pending).toBe(false); });
        expect(ref.current!.currentStepName).toBe('C');
    });
    it('discards async work after children change and after unmount', async () => {
        let approve!: (value: boolean) => void;
        const ref = createRef<StepWizardHandle>();
        const changed = vi.fn();
        const guard = () => new Promise<boolean>(resolve => { approve = resolve; });
        const view = render(<StepWizard ref={ref} beforeStepChange={guard} onStepChange={changed}>{children}</StepWizard>);
        let pending!: Promise<boolean>;
        act(() => { pending = ref.current!.nextStep(); });
        view.rerender(<StepWizard ref={ref} beforeStepChange={guard} onStepChange={changed}>{children.slice(0, 1)}</StepWizard>);
        await act(async () => { approve(true); expect(await pending).toBe(false); });
        view.rerender(<StepWizard ref={ref} beforeStepChange={guard} onStepChange={changed}>{children}</StepWizard>);
        const handle = ref.current!;
        act(() => { pending = handle.nextStep(); });
        view.unmount();
        approve(true);
        expect(await pending).toBe(false);
        expect(await handle.nextStep()).toBe(false);
        expect(changed).not.toHaveBeenCalled();
    });
    it('catches rejected validation and uses the latest callbacks', async () => {
        const ref = createRef<StepWizardHandle>();
        const errors = vi.fn();
        const changed = vi.fn();
        const error = new Error('validation failed');
        const view = render(<StepWizard ref={ref} beforeStepChange={() => Promise.reject(error)} onNavigationError={errors}>{children}</StepWizard>);
        expect(await move(() => ref.current!.nextStep())).toBe(false);
        expect(errors).toHaveBeenCalledWith(error);
        expect(ref.current!.isPending).toBe(false);
        view.rerender(<StepWizard ref={ref} onStepChange={changed}>{children}</StepWizard>);
        await move(() => ref.current!.nextStep());
        expect(changed).toHaveBeenCalledTimes(1);
    });
});

describe('URL and SSR (#93, #119, #127)', () => {
    it('encodes arbitrary hashes, tolerates malformed URLs and ignores unknown hashes', async () => {
        const ref = createRef<StepWizardHandle>();
        render(<StepWizard ref={ref} isHashEnabled>{children[0]}<Step hashKey="hello #/世界" stepName="encoded" /></StepWizard>);
        await move(() => ref.current!.nextStep());
        expect(decodeURIComponent(window.location.hash.slice(1))).toBe('hello #/世界');
        await act(async () => {
            window.history.replaceState(null, '', '/#%E0%A4%A');
            window.dispatchEvent(new HashChangeEvent('hashchange'));
        });
        expect(ref.current!.currentStep).toBe(2);
    });
    it('handles initial URL, toggles listeners, and cleans up under StrictMode', async () => {
        window.history.replaceState(null, '', '/#b');
        const ref = createRef<StepWizardHandle>();
        const add = vi.spyOn(window, 'addEventListener'), remove = vi.spyOn(window, 'removeEventListener');
        const view = render(<StrictMode><StepWizard ref={ref} isHashEnabled>{children}</StepWizard></StrictMode>);
        expect(ref.current!.currentStepName).toBe('B');
        view.rerender(<StrictMode><StepWizard ref={ref} isHashEnabled={false}>{children}</StepWizard></StrictMode>);
        await act(async () => { window.history.replaceState(null, '', '/#c'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
        expect(ref.current!.currentStepName).toBe('B');
        view.rerender(<StrictMode><StepWizard ref={ref} isHashEnabled>{children}</StepWizard></StrictMode>);
        expect(ref.current!.currentStepName).toBe('C');
        view.unmount();
        for (const event of ['hashchange', 'popstate']) {
            const registered = add.mock.calls.filter(([name]) => name === event).map(([, fn]) => fn);
            const removed = remove.mock.calls.filter(([name]) => name === event).map(([, fn]) => fn);
            expect(removed).toEqual(registered);
        }
        add.mockRestore(); remove.mockRestore();
    });
    it('vetoes URL changes and restores the current hash without another history entry', async () => {
        const ref = createRef<StepWizardHandle>();
        render(<StepWizard ref={ref} isHashEnabled beforeStepChange={() => false}>{children}</StepWizard>);
        await act(async () => { window.history.pushState(null, '', '/#b'); window.dispatchEvent(new PopStateEvent('popstate')); });
        expect(ref.current!.currentStepName).toBe('A');
        expect(window.location.hash).toBe('#a');
    });
    it('deduplicates popstate/hashchange while an async URL guard is pending', async () => {
        let approve!: (value: boolean) => void;
        const guard = vi.fn(() => new Promise<boolean>(resolve => { approve = resolve; }));
        const ref = createRef<StepWizardHandle>();
        render(<StepWizard ref={ref} isHashEnabled beforeStepChange={guard}>{children}</StepWizard>);
        act(() => {
            window.history.pushState(null, '', '/#b');
            window.dispatchEvent(new PopStateEvent('popstate'));
            window.dispatchEvent(new HashChangeEvent('hashchange'));
        });
        expect(guard).toHaveBeenCalledTimes(1);
        await act(async () => approve(true));
        expect(ref.current!.currentStepName).toBe('B');
    });
    it('renders hidden inactive steps before CSS and hydrates without mismatches with a different URL', async () => {
        window.history.replaceState(null, '', '/#c');
        const element = <StepWizard isHashEnabled>{children}</StepWizard>;
        const html = renderToString(element);
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.append(container);
        expect(container.querySelectorAll('[hidden]')).toHaveLength(2);
        expect(container.querySelector('.rsw-active')?.textContent).toBe('Alpha');
        const recover = vi.fn();
        let root!: ReturnType<typeof hydrateRoot>;
        await act(async () => { root = hydrateRoot(container, element, { onRecoverableError: recover }); });
        expect(recover).not.toHaveBeenCalled();
        expect(container.querySelector('.rsw-active')?.textContent).toBe('Gamma');
        await act(async () => root.unmount());
        container.remove();
    });
});

describe('transitions and swipe', () => {
    it('hides inactive steps, keeps exit animations briefly, clears classes on completion (#89)', async () => {
        const ref = createRef<StepWizardHandle>();
        const view = render(<StepWizard ref={ref}>{children}</StepWizard>);
        expect(view.container.querySelectorAll('[hidden]')).toHaveLength(2);
        await move(() => ref.current!.nextStep());
        const exit = view.container.querySelector('.rsw-exit-left')!;
        expect(exit.getAttribute('aria-hidden')).toBe('true');
        expect(exit.hasAttribute('inert')).toBe(true);
        fireEvent.animationEnd(exit);
        expect(view.container.querySelectorAll('[hidden]')).toHaveLength(2);
        expect(view.container.querySelector('[class*=rsw-exit]')).toBeNull();
    });
    it('uses custom direction classes and timeout fallback without leaked timers', async () => {
        vi.useFakeTimers();
        const ref = createRef<StepWizardHandle>();
        const style = document.createElement('style');
        style.textContent = '.enter, .leave { animation-name: custom; }';
        document.head.append(style);
        const view = render(<StepWizard ref={ref} transitionDuration={10} transitions={{ enterRight: 'enter', exitLeft: 'leave' }}>{children}</StepWizard>);
        await move(() => ref.current!.nextStep());
        expect(view.container.querySelector('.enter')).not.toBeNull();
        act(() => vi.advanceTimersByTime(10));
        expect(view.container.querySelector('.leave')).toBeNull();
        await move(() => ref.current!.nextStep());
        view.unmount();
        expect(vi.getTimerCount()).toBe(0);
        style.remove();
        vi.useRealTimers();
    });
    it('immediately hides outgoing content when optional animation CSS is absent', async () => {
        const styles = Array.from(document.head.querySelectorAll('style'));
        styles.forEach(style => style.remove());
        try {
            const ref = createRef<StepWizardHandle>();
            const view = render(<StepWizard ref={ref}>{children}</StepWizard>);
            await move(() => ref.current!.nextStep());
            expect(view.container.querySelectorAll('[hidden]')).toHaveLength(2);
            expect(view.container.querySelector('.rsw-active')?.textContent).toBe('Beta');
        } finally { styles.forEach(style => document.head.append(style)); }
    });
    it('supports custom intro animation and forwards marker attributes/events', () => {
        const ended = vi.fn();
        const view = render(<StepWizard transitions={{ intro: 'intro' }}><Step title="panel" className="custom" onAnimationEnd={ended}>Intro</Step></StepWizard>);
        const panel = view.container.querySelector('.intro.custom')!;
        expect(panel.getAttribute('title')).toBe('panel');
        fireEvent.animationEnd(panel);
        expect(ended).toHaveBeenCalledTimes(1);
        expect(view.container.querySelector('.intro')).toBeNull();
    });
    it('supports opt-in horizontal swipes while ignoring scroll and canceled touches (#41)', async () => {
        const ref = createRef<StepWizardHandle>();
        const view = render(<StepWizard ref={ref} isSwipeEnabled>{children}</StepWizard>);
        const wizard = view.container.firstElementChild!;
        await act(async () => {
            fireEvent.touchStart(wizard, { touches: [{ clientX: 100, clientY: 100 }] });
            fireEvent.touchEnd(wizard, { changedTouches: [{ clientX: 0, clientY: 101 }] });
        });
        expect(ref.current!.currentStep).toBe(2);
        await act(async () => {
            fireEvent.touchStart(wizard, { touches: [{ clientX: 100, clientY: 100 }] });
            fireEvent.touchEnd(wizard, { changedTouches: [{ clientX: 30, clientY: 200 }] });
        });
        expect(ref.current!.currentStep).toBe(2);
        fireEvent.touchStart(wizard, { touches: [{ clientX: 100, clientY: 100 }] });
        fireEvent.touchCancel(wizard);
        fireEvent.touchEnd(wizard, { changedTouches: [{ clientX: 0, clientY: 100 }] });
        expect(ref.current!.currentStep).toBe(2);
    });
});
