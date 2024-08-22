// Initial typings by dmk99 - https://github.com/jcmcneal/react-step-wizard/issues/31#issuecomment-505399131
import { PropsWithChildren } from "react";
import StepWizard from "../index";

export type StepWizardState = {
    activeStep: number;
    classes: { [key: number]: string };
    hashKeys: { [key: number]: string } & { [key: string]: number };
    namedSteps: { [key: string]: string | number };
};

export type StepWizardProps = React.PropsWithChildren<{
    className?: string;
    initialStep?: number;
    instance?: (wizard: StepWizardProps) => void;
    isHashEnabled?: boolean;
    isLazyMount?: boolean;
    isZeroIndexed?: boolean;
    nav?: JSX.Element;

    onStepChange?: (stepChange: StepChangeStats) => void;

    transitions?: {
        enterRight?: string;
        enterLeft?: string;
        exitRight?: string;
        exitLeft?: string;
        intro?: string;
    };
}>;

export type StepChangeStats = {
    previousStep: number;
    activeStep: number;
};

export interface StepProps {
    hashKey?: string;
    stepName?: string;
}

export interface StepPassThroughProps extends Pick<StepWizard,
    'currentStep' |
    'totalSteps' |
    'firstStep' |
    'lastStep' |
    'nextStep' |
    'previousStep' |
    'goToStep' |
    'goToNamedStep'
> {
    isActive: boolean;
    transitions: string;
}

export interface StepWizardChildProps extends PropsWithChildren, StepProps, StepPassThroughProps {
}

