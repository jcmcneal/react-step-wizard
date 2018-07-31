import React, { Component } from 'react';
import Animate from './animate.custom.css';
import Styles from './styles.css';

export class StepWizard extends Component {
    constructor(props) {
        super(props);

        this.state = this.initialState();
    }

    /** Setup Steps */
    initialState() {
        const state = {
            step: 0,
            classes: {},
        };

        // Set initial classes
        for (let i = 0; i < this.props.children.length; i += 1) {
            if (this.props.children[i].props.active) {
                state.step = i;
                continue;
            }

            state.classes[i] = Styles.hide;
        }

        state.classes[state.step] = Styles.active;

        return state;
    }

    animateSteps = (change) => {
        const active = this.state.step;
        const next = this.state.step + change;
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

        this.setState(classes);
    }

    /** Go to first step */
    firstStep = () => {
        this.goToStep(1);
    }

    /** Go to step index */
    goToStep = (step) => {
        const next = step - 1;
        const current = this.state.step;
        const change = (next - current);
        const action = (change > 0) ? this.nextStep.bind(this) : this.previousStep.bind(this);
        // console.log(current, next, change, Math.abs(change));
        let pause = 0;
        for (let i = 0; i < Math.abs(change); i += 1) {
            setTimeout(() => {
                action();
            }, pause);
            pause += 5;
        }
    }

    /** Go to last step */
    lastStep() {
        this.goToStep(this.props.children.length);
    }

    nextStep() {
        this.animateSteps(1);
        this.setState({ step: this.state.step + 1 }, () => {
            this.updateHash();
        });
    }

    previousStep() {
        this.animateSteps(-1);
        this.setState({ step: this.state.step - 1 }, () => {
            this.updateHash();
        });
    }

    updateHash = () => {
        // window.location.hash = 'step'+this.state.step;
    }

    render() {
        const props = {
            currentStep: this.state.step + 1,
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
            props.animate = classes[i];
            return React.cloneElement(child, props);
        });

        return (
            <div className={Styles['step-wizard']}>
                { childrenWithProps }
            </div>
        );
    }
}

export class Step extends Component {
    render() {
        const content = React.cloneElement(this.props.children, this.props);

        return (
            <div className={`${Styles.step} ${this.props.animate}`}>
                { content }
            </div>
        );
    }
}
