import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

    isInvalidStep = next => (next < 0 || next >= this.props.children.length)

    setActiveStep = (next) => {
        const active = this.state.activeStep;
        if (active === next) return;
        if (this.isInvalidStep(next)) {
            console.error(`${next + 1} is an invalid step`);
            return;
        }

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

        this.setState({
            activeStep: next,
            classes,
        }, () => {
            const result = {
                previousStep: active + 1,
                activeStep: next + 1,
            };
            this.props.onStepChange(result);
        });
    }

    /** Go to first step */
    firstStep = () => this.goToStep(1)

    /** Go to last step */
    lastStep = () => this.goToStep(this.props.children.length)

    /** Next Step */
    nextStep = () => this.setActiveStep(this.state.activeStep + 1)

    /** Previous Step */
    previousStep = () => this.setActiveStep(this.state.activeStep - 1)

    /** Go to step index */
    goToStep = step => this.setActiveStep(step - 1)

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
            props.transitions = classes[i];

            // Not Lazy Mount || isLazyMount && isActive
            if (!this.props.isLazyMount || (this.props.isLazyMount && props.isActive)) {
                return <Step {...props}>{ React.cloneElement(child, props) }</Step>;
            }

            return null;
        });

        return (
            <div className={Styles['step-wizard']}>
                { childrenWithProps }
            </div>
        );
    }
}

StepWizard.propTypes = {
    children: PropTypes.node,
    initialStep: PropTypes.number,
    isLazyMount: PropTypes.bool,
    onStepChange: PropTypes.func,
    transitions: PropTypes.object,
};

StepWizard.defaultProps = {
    children: null,
    initialStep: 1,
    isLazyMount: false,
    onStepChange: () => {},
    transitions: undefined,
};

export const Step = ({ children, transitions }) => (
    <div className={`${Styles.step} ${transitions}`}>
        { children }
    </div>
);

Step.propTypes = {
    children: PropTypes.node,
    transitions: PropTypes.string,
};

Step.defaultProps = {
    children: null,
    transitions: '',
};
