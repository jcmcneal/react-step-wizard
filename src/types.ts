import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

export interface StepWizardTransitionProps {
    enterRight?: string;
    enterLeft?: string;
    exitRight?: string;
    exitLeft?: string;
    intro?: string;
}

export interface StepMetadata {
    hashKey?: string;
    stepName?: string;
}

export interface StepDescriptor extends Required<StepMetadata> {
    /** Zero-based array position, independent of indexBase. */
    index: number;
    step: number;
    key: string;
    props: Readonly<Record<string, unknown>>;
}

export interface StepChangeStats {
    previousStep: number;
    activeStep: number;
    previousStepName: string;
    activeStepName: string;
    /** Alias retained for the named-step callback feature request. */
    activeNamedStep: string;
    previousHashKey: string;
    activeHashKey: string;
    reason: 'navigation' | 'hash';
}

export interface StepWizardControls {
    firstStep: () => Promise<boolean>;
    lastStep: () => Promise<boolean>;
    nextStep: () => Promise<boolean>;
    previousStep: () => Promise<boolean>;
    goToStep: (step: number | string) => Promise<boolean>;
    goToNamedStep: (name: string) => Promise<boolean>;
    /** Original child props; accepts a number in indexBase's numbering. */
    stepProps: (step: number) => Readonly<Record<string, unknown>> | undefined;
}

export interface StepWizardSnapshot extends StepWizardControls {
    currentStep: number;
    currentIndex: number;
    currentStepName: string;
    totalSteps: number;
    steps: readonly StepDescriptor[];
    hashKeys: readonly string[];
    isPending: boolean;
}

/** A stable handle with live getters. Use useStepWizard for reactive UI. */
export type StepWizardHandle = Readonly<StepWizardSnapshot>;
export type StepWizardInstanceProps = StepWizardHandle;

export type StepWizardChildProps<T extends object = object> = StepWizardSnapshot & StepMetadata & {
    isActive: boolean;
    transitions: string;
} & T;

export type WizardSlot = ReactNode | ((wizard: StepWizardSnapshot) => ReactNode);

export interface StepWizardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    children?: ReactNode;
    initialStep?: number;
    /** Defaults to 1. Applies to every numeric public step value. */
    indexBase?: 0 | 1;
    instance?: (wizard: StepWizardHandle) => void;
    isHashEnabled?: boolean;
    isLazyMount?: boolean;
    nav?: WizardSlot;
    footer?: WizardSlot;
    onStepChange?: (change: StepChangeStats) => void;
    /** Return false to veto. All navigation methods and URL changes use this guard. */
    beforeStepChange?: (change: StepChangeStats) => boolean | void | Promise<boolean | void>;
    onNavigationError?: (error: unknown) => void;
    transitions?: StepWizardTransitionProps;
    /** Maximum transition duration; animation/transitionend can finish sooner. Defaults to 820ms. */
    transitionDuration?: number;
    wrapperClassName?: string;
    wrapperStyle?: CSSProperties;
    stepClassName?: string;
    stepStyle?: CSSProperties;
    isSwipeEnabled?: boolean;
    swipeThreshold?: number;
}

export interface StepProps extends HTMLAttributes<HTMLDivElement>, StepMetadata {
    children?: ReactNode;
    isActive?: boolean;
    isExiting?: boolean;
    transitions?: string;
}

export interface NormalizedStep {
    element: ReactElement<Record<string, unknown>>;
    descriptor: StepDescriptor;
}
