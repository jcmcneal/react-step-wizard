// Initial typings by dmk99 - https://github.com/jcmcneal/react-step-wizard/issues/31#issuecomment-505399131
import * as React from "react"

export interface StepWizardTransitionProps {
    enterRight?: string;
    enterLeft?: string;
    exitRight?: string;
    exitLeft?: string;
    intro?: string;
}


export interface StepWizardInstanceProps {
    getHash: () => string;
    getTransitions: () => StepWizardTransitionProps;
    onHashChange: () => void;
    isInvalidStep: (next: number) => boolean;
    setActiveStep: (next: number) => void;
    currentStep: number;
    totalSteps: number;
    getSteps: () => JSX.Element[] | React.ReactElement[];
    firstStep: () => void;
    lastStep: () => void;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: number) => void;
    goToNamedStep: (stepName: string) => void;
    updateHash: (activeHash: string) => void;
}

export type StepWizardProps = Partial<{
  className: string

  hashKey: string
  stepName: string
  initialStep: number
  instance: (wizard: StepWizardTransitionProps) => void
  isHashEnabled: boolean
  isLazyMount: boolean
  nav: JSX.Element

  onStepChange: (stepChange: {
    previousStep: number
    activeStep: number
  }) => void

  transitions: StepWizardInstanceProps;

  children: JSX.Element | JSX.Element[] | React.ReactElement
}>

export type StepWizardChildProps<T extends Record<string, any> = {}> = {
  isActive: boolean
  currentStep: number
  totalSteps: number
  firstStep: () => void
  lastStep: () => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: number) => void
  goToNamedStep: (step: string) => void
  hashKey?: string
  stepName?: string
} & T

export declare function StepWizard(props: StepWizardProps): JSX.Element
export default StepWizard
