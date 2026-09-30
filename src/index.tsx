'use client';

import { cloneElement, createContext, forwardRef, isValidElement, useContext, useEffect, useImperativeHandle, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useWizardController } from './controller.js';
import { normalizeSteps } from './steps.js';
import type { StepProps, StepWizardHandle, StepWizardProps, StepWizardSnapshot, StepWizardTransitionProps, WizardSlot } from './types.js';

export type { StepWizardChildProps, StepWizardControls, StepWizardHandle, StepWizardInstanceProps, StepWizardProps,
    StepWizardSnapshot, StepWizardTransitionProps, StepChangeStats, StepDescriptor, StepMetadata, StepProps, WizardSlot } from './types.js';

const WizardContext = createContext<StepWizardSnapshot | null>(null);
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Reactive navigation for any descendant, including nested controls and slots. */
export function useStepWizard(): StepWizardSnapshot {
    const wizard = useContext(WizardContext);
    if (!wizard) throw new Error('useStepWizard must be used inside a StepWizard.');
    return wizard;
}

export function Step({ children, isActive = false, isExiting = false, transitions = '', className = '',
    style, hashKey: _hashKey, stepName: _stepName, ...rest }: StepProps) {
    return <div {...rest} ref={element => {
        if (isActive) element?.removeAttribute('inert');
        else element?.setAttribute('inert', '');
    }} hidden={!isActive && !isExiting} aria-hidden={!isActive}
    className={`rsw-step ${isActive ? 'rsw-active' : ''} ${transitions} ${className}`.trim()}
    style={{ ...style, display: !isActive && !isExiting ? 'none' : style?.display,
        position: isExiting ? 'absolute' : style?.position, top: isExiting ? 0 : style?.top,
        width: isExiting ? '100%' : style?.width, pointerEvents: isActive ? style?.pointerEvents : 'none' }}>
        {children}
    </div>;
}

const defaultTransitions: StepWizardTransitionProps = {
    enterRight: 'rsw-enter-right', enterLeft: 'rsw-enter-left',
    exitRight: 'rsw-exit-right', exitLeft: 'rsw-exit-left',
};

function renderSlot(slot: WizardSlot, wizard: StepWizardSnapshot) {
    if (typeof slot === 'function') return slot(wizard);
    if (isValidElement(slot) && typeof slot.type !== 'string') return cloneElement(slot, wizard);
    return slot;
}

export const StepWizard = forwardRef<StepWizardHandle, StepWizardProps>(function StepWizard(props, ref) {
    const { children, indexBase = 1, initialStep: _initialStep, instance: _instance, isHashEnabled: _hash,
        isLazyMount = false, nav, footer, onStepChange: _onChange, beforeStepChange: _guard, onNavigationError: _error,
        transitions = defaultTransitions, transitionDuration: _duration, wrapperClassName = '', wrapperStyle,
        stepClassName, stepStyle, isSwipeEnabled = false, swipeThreshold = 50,
        onTouchStart, onTouchEnd, onTouchCancel, ...containerProps } = props;
    const steps = normalizeSteps(children, indexBase);
    const { snapshot, handle, transition, intro, finishTransition } = useWizardController(steps, props);
    useImperativeHandle(ref, () => handle, [handle]);
    const wrapper = useRef<HTMLDivElement>(null);
    useClientLayoutEffect(() => {
        if (!transition || !wrapper.current) return;
        const panels = Array.from(wrapper.current.children);
        function hasMotion(element: Element | undefined) {
            if (!element) return false;
            const style = window.getComputedStyle(element);
            return style.animationName.split(',').some(name => name.trim() !== '' && name.trim() !== 'none') ||
                style.transitionDuration.split(',').some(duration => parseFloat(duration) > 0);
        }
        const outgoing = panels.find(element => element.getAttribute('aria-hidden') === 'true' && !element.hasAttribute('hidden'));
        const incoming = panels.find(element => element.getAttribute('aria-hidden') === 'false');
        // Each panel has its own lifecycle: disabling exit must not cancel entry.
        if (transition.from && !hasMotion(outgoing)) finishTransition('exit');
        if (transition.to && !hasMotion(incoming)) finishTransition('enter');
    }, [transition, finishTransition]);
    const touch = useRef<{ x: number; y: number } | null>(null);
    return <WizardContext.Provider value={snapshot}>
        <div {...containerProps} onTouchStart={event => {
            onTouchStart?.(event);
            touch.current = isSwipeEnabled && !event.defaultPrevented && event.touches.length === 1 ?
                { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
        }} onTouchEnd={event => {
            onTouchEnd?.(event);
            const start = touch.current;
            touch.current = null;
            if (!isSwipeEnabled || event.defaultPrevented || !start || !event.changedTouches[0]) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) < Math.max(1, swipeThreshold) || Math.abs(dx) <= Math.abs(dy)) return;
            void (dx < 0 ? snapshot.nextStep() : snapshot.previousStep());
        }} onTouchCancel={event => { touch.current = null; onTouchCancel?.(event); }}>
            {renderSlot(nav, snapshot)}
            <div ref={wrapper} className={`rsw-step-wrapper ${wrapperClassName}`.trim()}
                style={{ ...wrapperStyle, position: wrapperStyle?.position ?? 'relative',
                    overflow: transition ? 'hidden' : wrapperStyle?.overflow }}>
                {steps.map(({ element, descriptor }, i) => {
                    const isActive = i === snapshot.currentIndex;
                    const isExiting = !isLazyMount && descriptor.key === transition?.from;
                    if (isLazyMount && !isActive) return null;
                    const animation = transition ? (isActive && descriptor.key === transition.to ? (transition.forward ? transitions.enterRight : transitions.enterLeft) :
                        isExiting ? (transition.forward ? transitions.exitLeft : transitions.exitRight) : '') : (intro && isActive ? transitions.intro : '');
                    const injected = { ...snapshot, isActive, transitions: animation ?? '' };
                    const marker = element.type === Step ? element.props as StepProps : undefined;
                    return <Step {...marker} key={descriptor.key} isActive={isActive} isExiting={isExiting}
                        transitions={animation} className={[stepClassName, marker?.className].filter(Boolean).join(' ')} style={{ ...stepStyle, ...marker?.style }}
                        onAnimationEnd={event => { marker?.onAnimationEnd?.(event); if (event.target === event.currentTarget) finishTransition(transition ? (isActive ? 'enter' : 'exit') : undefined); }}
                        onTransitionEnd={event => { marker?.onTransitionEnd?.(event); if (event.target === event.currentTarget) finishTransition(transition ? (isActive ? 'enter' : 'exit') : undefined); }}>
                        {marker ? marker.children as ReactNode : typeof element.type === 'string' ? element : cloneElement(element, injected)}
                    </Step>;
                })}
            </div>
            {renderSlot(footer, snapshot)}
        </div>
    </WizardContext.Provider>;
});

export default StepWizard;
