// Initial typings by dmk99 - https://github.com/jcmcneal/react-step-wizard/issues/31#issuecomment-505399131
import * as React from "react"

export type StepWizardProps = Partial<{
  className: string

  hashKey: string
  stepName: string
  initialStep: number
  instance: (wizard: StepWizardProps) => void
  isHashEnabled: boolean
  isLazyMount: boolean
  nav: JSX.Element

  onStepChange: (stepChange: {
    previousStep: number
    activeStep: number
  }) => void

  transitions: {
    enterRight?: string
    enterLeft?: string
    exitRight?: string
    exitLeft?: string
  }

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
