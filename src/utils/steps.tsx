import React from 'react';
import { StepWizardProps } from '../types';

// Allows for using HTML elements as a step
export const isReactComponent = <P,>(
    child: StepWizardProps['children']
): child is React.ReactElement<P> => {
    if (!child || typeof child === 'string' || typeof child === 'number') {
        return false;
    }

    if (React.isValidElement(child)) {
        const type = child.type;
        return typeof type === 'function' || typeof type === 'object';
    }

    return false;
};
