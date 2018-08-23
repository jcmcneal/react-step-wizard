import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Animate from './animate.custom.css';
import styles from './styles.css';

export default class StepWizard extends Component {
    constructor(props) {
        super(props);

        this.state = this.initialState();

        // Hash change listener - for back/forward button
        if (props.isHashEnabled) {
            window.onhashchange = this.onHashChange;
        }
    }

    /** Setup Steps */
    initialState = () => {
        const state = {
            activeStep: 0,
            classes: {},
            hashKeys: {},
            // Transition Classes
            transitions: this.props.transitions || {
                enterRight: `${Animate.animated} ${Animate.fadeInRight}`,
                enterLeft: `${Animate.animated} ${Animate.fadeInLeft}`,
                exitRight: `${Animate.animated} ${Animate.fadeOutRight}`,
                exitLeft: `${Animate.animated} ${Animate.fadeOutLeft}`,
            },
        };
        state.transitions.intro = '';

        // Set initial classes
        const hash = this.getHash();
        this.props.children.forEach((child, i) => {
            // Create hashKey map
            state.hashKeys[i] = child.props.hashKey || `step${i + 1}`;
            state.hashKeys[state.hashKeys[i]] = i;

            // Hide steps by default
            state.classes[i] = styles.hide;
        });

        // Set activeStep to initialStep if exists
        const initialStep = this.props.initialStep - 1;
        if (initialStep && this.props.children[initialStep]) {
            state.activeStep = initialStep;
        }

        // Set activeStep from hash - trumps initialStep
        if (this.props.isHashEnabled && hash && state.hashKeys[hash] !== undefined) {
            // References hashKey
            state.activeStep = state.hashKeys[hash];
        }

        // Give initial step an intro class
        state.classes[state.activeStep] = state.transitions.intro;

        return state;
    }

    // Get hash and remove #
    getHash = () => decodeURI(window.location.hash).replace(/^#/, '')

    onHashChange = () => {
        const next = this.state.hashKeys[this.getHash()];

        if (next !== undefined) this.setActiveStep(next);
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

        const { classes, transitions } = this.state;

        if (active < next) {
            // slide left
            classes[active] = `${styles.hide} ${transitions.exitLeft}`;
            classes[next] = transitions.enterRight;
        } else {
            // slide right
            classes[active] = `${styles.hide} ${transitions.exitRight}`;
            classes[next] = transitions.enterLeft;
        }

        this.setState({
            activeStep: next,
            classes,
        }, () => {
            // Step change callback
            this.onStepChange({
                previousStep: active + 1,
                activeStep: next + 1,
            });
        });
    }

    onStepChange = (stats) => {
        // User callback
        this.props.onStepChange(stats);

        // Update hash if prop set
        if (this.props.isHashEnabled) this.updateHash(this.state.activeStep);
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

    updateHash = (activeStep) => {
        window.location.hash = this.state.hashKeys[activeStep];
    }

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
            <div className={styles['step-wizard']}>
                { childrenWithProps }
            </div>
        );
    }
}

StepWizard.propTypes = {
    children: PropTypes.node,
    initialStep: PropTypes.number,
    isHashEnabled: PropTypes.bool,
    isLazyMount: PropTypes.bool,
    onStepChange: PropTypes.func,
    transitions: PropTypes.object,
};

StepWizard.defaultProps = {
    children: [],
    initialStep: 1,
    isHashEnabled: false,
    isLazyMount: false,
    onStepChange: () => {},
    transitions: undefined,
};

export const Step = ({ children, transitions }) => (
    <div className={`${styles.step} ${transitions}`}>
        { children }
    </div>
);

Step.propTypes = {
    children: PropTypes.node,
    transitions: PropTypes.string,
};

Step.defaultProps = {
    children: [],
    transitions: '',
};
