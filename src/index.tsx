import React, { PureComponent } from 'react';

import Animate from './styles/animate.module.css';
import styles from './styles/styles.module.css';

import getInitialState from './utils/getInitialState';
import { isReactComponent } from './utils/steps';

import {
    StepChangeStats,
    StepPassThroughProps,
    StepWizardChildProps,
    StepWizardProps,
    StepWizardState,
} from './types';

export default class StepWizard extends PureComponent<
    StepWizardProps,
    StepWizardState
> {
    constructor(props: StepWizardProps) {
        super(props);

        this.state = getInitialState(this, props);
    }

    componentDidMount() {
        // Hash change listener - for back/forward button
        if (this.props.isHashEnabled) {
            window.addEventListener('hashchange', this.onHashChange);
        }

        // Provide instance to parent
        this.props.instance?.(this);
    }

    componentWillUnmount() {
        // Remove listener
        if (this.props.isHashEnabled) {
            window.removeEventListener('hashchange', this.onHashChange);
        }
    }

    // Get hash and remove #
    getHash = () => decodeURI(window.location.hash).replace(/^#/, '');

    getTransitions = () =>
        this.props.transitions || {
            enterRight: `${Animate.animated} ${Animate.fadeInRight}`,
            enterLeft: `${Animate.animated} ${Animate.fadeInLeft}`,
            exitRight: `${Animate.animated} ${Animate.fadeOutRight}`,
            exitLeft: `${Animate.animated} ${Animate.fadeOutLeft}`,
        };

    onHashChange = () => {
        this.setActiveStep(this.state.hashKeys[this.getHash()] || 0);
    };

    isInvalidStep = (next: number) => next < 0 || next >= this.totalSteps;

    setActiveStep = (next: number) => {
        const active = this.state.activeStep;
        if (active === next) return;
        if (this.isInvalidStep(next)) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(`${next + 1} is an invalid step`);
            }
            return;
        }

        // console.log(change, active, next);

        const { classes } = this.state;
        const transitions = this.getTransitions();

        if (active < next) {
            // slide left
            classes[active] = transitions.exitLeft || '';
            classes[next] = transitions.enterRight || '';
        } else {
            // slide right
            classes[active] = transitions.exitRight || '';
            classes[next] = transitions.enterLeft || '';
        }

        this.setState(
            {
                activeStep: next,
                classes,
            },
            () => {
                // Step change callback
                this.onStepChange({
                    previousStep: active + 1,
                    activeStep: next + 1,
                });
            }
        );
    };

    onStepChange = (stats: StepChangeStats) => {
        // User callback
        this.props.onStepChange?.(stats);

        // Update hash if prop set
        if (this.props.isHashEnabled) this.updateHash(this.state.activeStep);
    };

    /** Getters */
    get currentStep() {
        return this.state.activeStep + 1;
    }

    get totalSteps() {
        return this.getSteps().length;
    }

    getSteps = () => React.Children.toArray(this.props.children);

    /** Go to first step */
    firstStep = () => this.goToStep(1);

    /** Go to last step */
    lastStep = () => this.goToStep(this.totalSteps);

    /** Next Step */
    nextStep = () => this.setActiveStep(this.state.activeStep + 1);

    /** Previous Step */
    previousStep = () => this.setActiveStep(this.state.activeStep - 1);

    /** Go to step index */
    goToStep = (step: string | number) => {
        if (
            this.props.isHashEnabled &&
            typeof step === 'string' &&
            this.state.hashKeys[step] !== undefined
        ) {
            this.setActiveStep(this.state.hashKeys[step]);
        } else if (typeof step === 'number') {
            this.setActiveStep(step - 1);
        } else {
            console.error('Invalid step');
        }
    };

    /** Go to named step */
    goToNamedStep = (step: string) => {
        if (
            typeof step === 'string' &&
            typeof this.state.namedSteps[step] === 'number'
        ) {
            this.setActiveStep(this.state.namedSteps[step]);
        } else {
            console.error(`Cannot find step with name "${step}"`);
        }
    };

    updateHash = (activeStep: number) => {
        window.location.hash = this.state.hashKeys[activeStep];
    };

    /** Render */
    render() {
        const props: StepPassThroughProps = {
            isActive: false,
            currentStep: this.currentStep,
            totalSteps: this.totalSteps,
            transitions: '',
            /** Functions */
            nextStep: this.nextStep,
            previousStep: this.previousStep,
            goToStep: this.goToStep,
            goToNamedStep: this.goToNamedStep,
            firstStep: this.firstStep,
            lastStep: this.lastStep,
        };

        const { classes } = this.state;
        const childrenWithProps = React.Children.map(
            this.getSteps(),
            (child, i) => {
                if (!child) return null;

                props.isActive = i === this.state.activeStep;
                props.transitions = classes[i];

                // Not Lazy Mount || isLazyMount && isActive
                if (
                    !this.props.isLazyMount ||
                    (this.props.isLazyMount && props.isActive)
                ) {
                    return (
                        <Step {...props}>
                            {isReactComponent(child)
                                ? React.cloneElement(child, props)
                                : child}
                        </Step>
                    );
                }

                return null;
            }
        );

        return (
            <div className={this.props.className}>
                {this.props.nav && React.cloneElement(this.props.nav, props)}
                <div className={styles['step-wrapper']}>
                    {childrenWithProps}
                </div>
            </div>
        );
    }
}

export const Step = ({
    children = [],
    isActive = false,
    transitions = '',
}: StepWizardChildProps) => (
    <div
        className={`${styles.step} ${transitions} ${
            isActive ? styles.active : ''
        }`.trim()}
    >
        {children}
    </div>
);
