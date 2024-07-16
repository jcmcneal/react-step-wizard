import { getHash } from "./hash";
import { isReactComponent } from "./steps";

import { StepProps, StepWizardProps, StepWizardState } from "../types";
import StepWizard from "..";

const getInitialStep = (props: StepWizardProps) => {
    // if zero based, return initialStep
    if (props.isZeroIndexed) {
        return props.initialStep || 0;
    }

    // if not zero based, return initialStep - 1
    return props.initialStep ? props.initialStep - 1 : 0;
};

function getInitialState(sw: StepWizard, props: StepWizardProps): StepWizardState {
    const state: StepWizardState = {
        activeStep: 0,
        classes: {},
        hashKeys: {},
        namedSteps: {},
    };

    // Set initial classes
    // Get hash only in client side
    const hash = typeof window === 'object' ? getHash() : '';
    const children = sw.getSteps();
    children.forEach((child, i) => {
        let hashKey = `step${i + 1}`;
        let stepName = `step${i + 1}`;

        if (isReactComponent<StepProps>(child)) {
            hashKey = child.props.hashKey || hashKey;
            stepName = child.props.stepName || stepName;
        }
        // Create hashKey map
        state.hashKeys[i] = hashKey;
        state.hashKeys[state.hashKeys[i]] = i;

        // Create namedSteps map
        state.namedSteps[i] = stepName;
        state.namedSteps[state.namedSteps[i]] = i;
    });

    // Set activeStep to initialStep if exists
    const initialStep = getInitialStep(props);
    if (initialStep && children[initialStep]) {
        state.activeStep = initialStep;
    }

    // Set activeStep from hash - trumps initialStep
    if (
        props.isHashEnabled &&
        hash &&
        state.hashKeys[hash] !== undefined
    ) {
        // References hashKey
        state.activeStep = state.hashKeys[hash];
    }

    // Give initial step an intro class
    if (props.transitions) {
        state.classes[state.activeStep] =
            props.transitions.intro || '';
    }

    return state;
}

export default getInitialState;
