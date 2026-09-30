import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { readHash, writeHash } from './steps.js';
import type { NormalizedStep, StepChangeStats, StepWizardControls, StepWizardHandle, StepWizardProps, StepWizardSnapshot } from './types.js';

const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
interface Transition { from: string | null; to: string | null; forward: boolean; request: number }
interface WizardState { key: string | null; index: number; signature: string; transition: Transition | null; intro: boolean }

export function useWizardController(steps: NormalizedStep[], props: StepWizardProps) {
    const base = props.indexBase ?? 1;
    const signature = JSON.stringify(steps.map(({ descriptor: s }) => [s.key, s.hashKey, s.stepName]));
    const [state, setState] = useState<WizardState>(() => {
        const requested = (props.initialStep ?? base) - base;
        const index = Number.isInteger(requested) && requested >= 0 && requested < steps.length ? requested : 0;
        return { key: steps[index]?.descriptor.key ?? null, index, signature, transition: null, intro: true };
    });
    const [isPending, setPending] = useState(false);
    const found = steps.findIndex(s => s.descriptor.key === state.key);
    const index = found >= 0 ? found : Math.max(0, Math.min(state.index, steps.length - 1));
    const activeKey = steps[index]?.descriptor.key ?? null;
    const transition = signature === state.signature ? state.transition : null;
    const runtime = useRef({ steps, props, base, index, signature, mounted: false, request: 0 });

    useClientLayoutEffect(() => {
        const r = runtime.current;
        if (r.signature !== signature) {
            r.request += 1;
            setPending(false);
            if (props.isHashEnabled && steps[index]) writeHash(steps[index].descriptor.hashKey, true);
            setState({ key: activeKey, index, signature, transition: null, intro: false });
        }
        Object.assign(r, { steps, props, base, index, signature, mounted: true });
    });
    useClientLayoutEffect(() => () => {
        runtime.current.mounted = false;
        runtime.current.request += 1;
    }, []);

    const [navigation] = useState(() => {
        async function navigate(target: number, reason: StepChangeStats['reason'] = 'navigation'): Promise<boolean> {
            const r = runtime.current;
            if (!r.mounted) return false;
            const request = ++r.request;
            const from = r.steps[r.index]?.descriptor;
            const to = r.steps[target]?.descriptor;
            const restoreHash = () => {
                if (from && r.props.isHashEnabled) writeHash(from.hashKey, true);
            };
            setPending(false);
            if (!Number.isInteger(target) || !from || !to || target === r.index) {
                restoreHash();
                return false;
            }
            const change: StepChangeStats = {
                previousStep: r.index + r.base, activeStep: target + r.base,
                previousStepName: from.stepName, activeStepName: to.stepName, activeNamedStep: to.stepName,
                previousHashKey: from.hashKey, activeHashKey: to.hashKey, reason,
            };
            let allowed: boolean | void;
            try {
                const decision = r.props.beforeStepChange?.(change);
                if (decision && typeof (decision as Promise<unknown>).then === 'function') {
                    setPending(true);
                    allowed = await decision;
                } else {
                    allowed = decision as boolean | void;
                }
            } catch (error) {
                if (r.mounted && request === r.request) {
                    setPending(false);
                    restoreHash();
                    r.props.onNavigationError?.(error);
                }
                return false;
            }
            if (!r.mounted || request !== r.request) return false;
            setPending(false);
            if (allowed === false) { restoreHash(); return false; }
            const forward = target > r.index;
            r.index = target;
            setState({ key: to.key, index: target, signature: r.signature,
                transition: { from: from.key, to: to.key, forward, request }, intro: false });
            if (r.props.isHashEnabled) writeHash(to.hashKey, reason === 'hash');
            r.props.onStepChange?.(change);
            return true;
        }
        const controls: StepWizardControls = {
            firstStep: () => navigate(0),
            lastStep: () => navigate(runtime.current.steps.length - 1),
            nextStep: () => navigate(runtime.current.index + 1),
            previousStep: () => navigate(runtime.current.index - 1),
            goToStep: step => navigate(typeof step === 'number' ? step - runtime.current.base :
                runtime.current.steps.findIndex(s => s.descriptor.hashKey === step)),
            goToNamedStep: name => navigate(runtime.current.steps.findIndex(s => s.descriptor.stepName === name)),
            stepProps: step => Number.isInteger(step) ? runtime.current.steps[step - runtime.current.base]?.element.props : undefined,
        };
        return { controls, navigateHash: (target: number) => navigate(target, 'hash') };
    });
    const { controls, navigateHash } = navigation;

    const snapshot: StepWizardSnapshot = useMemo(() => ({
        ...controls, currentStep: steps.length ? index + base : base,
        currentIndex: steps.length ? index : -1, currentStepName: steps[index]?.descriptor.stepName ?? '',
        totalSteps: steps.length, steps: steps.map(s => s.descriptor), hashKeys: steps.map(s => s.descriptor.hashKey), isPending,
    }), [controls, steps, index, base, isPending]);
    const snapshotRef = useRef(snapshot);
    useClientLayoutEffect(() => { snapshotRef.current = snapshot; });
    const [handle] = useState<StepWizardHandle>(() => {
        const handle = { ...controls } as StepWizardHandle;
        for (const key of ['currentStep', 'currentIndex', 'currentStepName', 'totalSteps', 'steps', 'hashKeys', 'isPending'] as const) {
            Object.defineProperty(handle, key, { enumerable: true, get: () => snapshotRef.current[key] });
        }
        return handle;
    });
    useClientLayoutEffect(() => { props.instance?.(handle); }, [props.instance, handle]);

    useEffect(() => {
        if (!props.isHashEnabled) return;
        let pendingHash: { hash: string; request: number } | null = null;
        const onHash = () => {
            const r = runtime.current;
            const hash = readHash();
            if (!hash && r.steps[r.index]) { writeHash(r.steps[r.index].descriptor.hashKey, true); return; }
            const target = r.steps.findIndex(s => s.descriptor.hashKey === hash);
            if (target >= 0 && (hash !== pendingHash?.hash || pendingHash.request !== r.request)) {
                const promise = navigateHash(target);
                const pending = { hash, request: r.request };
                pendingHash = pending;
                void promise.finally(() => { if (pendingHash === pending) pendingHash = null; });
            }
        };
        onHash();
        window.addEventListener('hashchange', onHash);
        window.addEventListener('popstate', onHash);
        return () => {
            window.removeEventListener('hashchange', onHash);
            window.removeEventListener('popstate', onHash);
        };
    }, [props.isHashEnabled, navigateHash]);

    const finishTransition = useCallback((part?: 'enter' | 'exit') => setState(previous => {
        if (part && previous.transition) {
            const transition = { ...previous.transition, [part === 'enter' ? 'to' : 'from']: null };
            return { ...previous, transition: transition.from || transition.to ? transition : null };
        }
        return (previous.transition || previous.intro) ? { ...previous, transition: null, intro: false } : previous;
    }), []);
    const transitionRequest = transition?.request;
    useEffect(() => {
        if (transitionRequest === undefined) return;
        const timer = setTimeout(() => setState(previous => previous.transition?.request === transitionRequest ? { ...previous, transition: null } : previous),
            Math.max(0, props.transitionDuration ?? 820));
        return () => clearTimeout(timer);
    }, [transitionRequest, props.transitionDuration]);
    return { snapshot, handle, transition, intro: state.intro, finishTransition };
}
