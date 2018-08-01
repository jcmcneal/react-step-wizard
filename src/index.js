import React, { Component } from 'react';
import Animate from './animate.custom.css';
import Styles from './styles.css';

export default class StepWizard extends Component {
    constructor(props) {
        super(props);

        this.state = this.initialState();
    }

    /** Setup Steps */
    initialState = () => {
        const state = {
            activeStep: 0,
            classes: {},
        };

        // Set initial classes
        for (let i = 0; i < this.props.children.length; i += 1) {
            if (this.props.children[i].props.active) {
                state.activeStep = i;
                continue;
            }

            state.classes[i] = Styles.hide;
        }

        // Check for initialStep prop
        if (this.props.initialStep) {
            const initialStep = this.props.initialStep - 1;
            if (this.props.children[initialStep] !== undefined) {
                state.activeStep = initialStep;
            } else {
                console.error("Can't find Step from `initialStep` value.");
            }
        }

        state.classes[state.activeStep] = Styles.active;

        return state;
    }

    animateSteps = (change) => {
        const active = this.state.activeStep;
        const next = this.state.activeStep + change;
        // console.log(change, active, next);
        const styles = this.props.transitions || {
            enterRight: `${Animate.animated} ${Animate.fadeInRight}`,
            enterLeft: `${Animate.animated} ${Animate.fadeInLeft}`,
            exitRight: `${Animate.animated} ${Animate.fadeOutRight}`,
            exitLeft: `${Animate.animated} ${Animate.fadeOutLeft}`,
        };

        const { classes } = this.state;

        if (active < next) {
            // slide left
            classes[active] = `${Styles.hide} ${styles.exitLeft}`;
            classes[next] = styles.enterRight;
        } else {
            // slide right
            classes[active] = `${Styles.hide} ${styles.exitRight}`;
            classes[next] = styles.enterLeft;
        }

        this.setState({ classes });
    }

    setActiveStep = (activeStep) => {
        this.setState({ activeStep });
    }

    /** Go to first step */
    firstStep = () => {
        this.goToStep(1);
    }

    /** Go to last step */
    lastStep = () => {
        this.goToStep(this.props.children.length);
    }

    /** Next Step */
    nextStep = () => {
        this.animateSteps(1);
        this.setActiveStep(this.state.activeStep + 1);
    }

    /** Previous Step */
    previousStep = () => {
        this.animateSteps(-1);
        this.setActiveStep(this.state.activeStep - 1);
    }

    /** Go to step index */
    goToStep = (step) => {
        const next = step - 1;
        const current = this.state.activeStep;
        const change = (next - current);
        const action = (change > 0) ? this.nextStep : this.previousStep;
        // console.log(current, next, change, Math.abs(change));
        let pause = 0;
        for (let i = 0; i < Math.abs(change); i += 1) {
            setTimeout(() => {
                action();
            }, pause);
            pause += 5;
        }
    }

    // updateHash = (activeStep) => {
    //     window.location.hash = `step${activeStep + 1}`;
    // }

    /** Render */
    render() {
        const props = {
            currentStep: this.state.activeStep + 1,
            totalSteps: this.props.children.length,
            /** Functions */
            nextStep: this.nextStep,
            previousStep: this.previousStep,
            goToStep: this.goToStep,
            firstStep: this.firstStep,
            lastStep: this.lastStep,
        };

        const { classes } = this.state;

        const childrenWithProps = React.Children.map(this.props.children, (child, i) => {
            props.isActive = (i === this.state.activeStep);
            props.animate = classes[i];

            return (
                <div className={`${Styles.step} ${props.animate}`}>
                    { React.cloneElement(child, props) }
                </div>
            );
        });

        return (
            <div className={Styles['step-wizard']}>
                { childrenWithProps }
            </div>
        );
    }
}
