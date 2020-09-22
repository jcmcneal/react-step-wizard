import React from 'react';
import Renderer from 'react-test-renderer';
// import Enzyme from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';

import StepWizard from './index';

// Enzyme.configure({ adapter: new Adapter() });

/** Helper Functions */
const Step1 = () => <div>Step 1</div>;
const Step2 = () => <div>Step 2</div>;
const Step3 = () => <div>Step 3</div>;
const Step4 = () => <div>Step 4</div>;

const render = jsx => Renderer.create(jsx);
const getInstance = (component) => {
    const wrapper = render(component);
    return wrapper.getInstance();
};
const getState = component => getInstance(component).state;
const takeSnapshot = test => expect(test).toMatchSnapshot();
const getTreeSnapshot = component => takeSnapshot(render(component));
const testComponent = (component) => {
    getTreeSnapshot(component);

    const state = getState(component);
    takeSnapshot(state);

    return state;
};
const basicComponent = () => (
    getInstance((
        <StepWizard>
            <Step1 />
            <Step2 />
            <Step3 />
        </StepWizard>
    ))
);

/** Capture console errors */
console.error = jest.fn();

/** Unit Tests */
describe('Step Wizard Component', () => {
    it('empty component', () => {
        testComponent(<StepWizard />);
    });

    it('html element steps', () => {
        testComponent((
            <StepWizard>
                <Step1 />>
            </StepWizard>
        ));
    });

    it('with 3 basic components', () => {
        testComponent((
            <StepWizard>
                <Step1 />
                <Step2 />
                <Step3 />
            </StepWizard>
        ));
    });

    it('initialStep set to 2', () => {
        testComponent((
            <StepWizard initialStep={2}>
                <Step1 />
                <Step2 />
                <Step3 />
            </StepWizard>
        ));
    });

    it('isHashEnabled - true', () => {
        testComponent((
            <StepWizard isHashEnabled>
                <Step1 hashKey={'First'} />
                <Step2 />
                <Step3 hashKey={'The End!'} />
            </StepWizard>
        ));
    });

    it('isHashEnabled - false', () => {
        testComponent((
            <StepWizard>
                <Step1 hashKey={'First'} />
                <Step2 />
                <Step3 hashKey={'The End!'} />
            </StepWizard>
        ));
    });

    it('isLazyMount - true', () => {
        testComponent((
            <StepWizard isLazyMount initialStep={2}>
                <Step1 />
                <Step2 />
                <Step3 />
            </StepWizard>
        ));
    });

    it('nav', () => {
        testComponent((
            <StepWizard nav={<div>Nav</div>}>
                <Step1 />
                <Step2 />
                <Step3 />
            </StepWizard>
        ));
    });

    it('instance', () => {
        testComponent((
            <StepWizard instance={SW => SW}>
                <Step1 />
                <Step2 />
                <Step3 />
            </StepWizard>
        ));
    });

    it('conditional step when not visible', () => {
        testComponent((
            <StepWizard>
                <Step1 />
                <Step2 />
                <Step3 />
                { false && <Step4 />}
            </StepWizard>));
    });

    it('conditional step when visible', () => {
        testComponent((
            <StepWizard>
                <Step1 />
                <Step2 />
                <Step3 />
                { true && <Step4 />}
            </StepWizard>));
    });

    it('renders a single child without issues (#65)', () => {
        testComponent((
            <StepWizard>
                <Step1 />
            </StepWizard>
        ));
    })

    it('garbage props', () => {
        console.error.mockClear();

        testComponent((
            <StepWizard
                initialStep={true}
                isHashEnabled={'fdjlk'}
                onStepChange={true}
                transitions={false}
            >
                <Step1 hashKey={'First *3@ #$~!,";'} />
                <Step2 />
                <Step3 hashKey={1} />
            </StepWizard>
        ));

        expect(console.error).toHaveBeenCalledWith('Warning: Failed prop type: Invalid prop `initialStep` of type `boolean` supplied to `StepWizard`, expected `number`.\n    in StepWizard');
        expect(console.error).toHaveBeenCalledWith('Warning: Failed prop type: Invalid prop `isHashEnabled` of type `string` supplied to `StepWizard`, expected `boolean`.\n    in StepWizard');
        expect(console.error).toHaveBeenCalledWith('Warning: Failed prop type: Invalid prop `onStepChange` of type `boolean` supplied to `StepWizard`, expected `function`.\n    in StepWizard');
        expect(console.error).toHaveBeenCalledWith('Warning: Failed prop type: Invalid prop `transitions` of type `boolean` supplied to `StepWizard`, expected `object`.\n    in StepWizard');
    });
});

describe('Step Wizard Functions', () => {
    it('null elements are pruned away', () => {
        const wrapper = getInstance((
            <StepWizard>
                {null}
                <Step1 />
                {null}
                <Step2 />
                {null}
            </StepWizard>
        ))
        expect(wrapper.totalSteps).toEqual(2);
        // first child is null, thus it should've been pruned and we should be at <Step1 />
        expect(wrapper.state.activeStep).toEqual(0);
        takeSnapshot(wrapper.state);
        // null children in-between <Step1> and <Step2 /> should have been pruned
        wrapper.nextStep();
        expect(wrapper.state.activeStep).toEqual(1);
        // last children is null, so it should have been pruned; therefore we stay at <Step 2 />
        wrapper.lastStep();
        expect(wrapper.state.activeStep).toEqual(1);
        takeSnapshot(wrapper.state);
    });
    it('lastStep', () => {
        const wrapper = basicComponent();
        wrapper.lastStep();
        takeSnapshot(wrapper.state);
        expect(wrapper.state.activeStep).toEqual(2);
    });
    it('firstStep', () => {
        const wrapper = basicComponent();
        wrapper.firstStep();
        takeSnapshot(wrapper.state);
        expect(wrapper.state.activeStep).toEqual(0);
    });
    it('nextStep', () => {
        const wrapper = basicComponent();
        wrapper.nextStep();
        takeSnapshot(wrapper.state);
        expect(wrapper.state.activeStep).toEqual(1);
    });
    it('previousStep', () => {
        const wrapper = basicComponent();
        wrapper.lastStep();
        wrapper.previousStep();
        takeSnapshot(wrapper.state);
        expect(wrapper.state.activeStep).toEqual(1);
    });
    it('goToStep', () => {
        const wrapper = basicComponent();
        wrapper.goToStep(3);
        takeSnapshot(wrapper.state);
        expect(wrapper.state.activeStep).toEqual(2);
    });
    it('isInvalidStep', () => {
        const wrapper = basicComponent();
        expect(wrapper.isInvalidStep(-1)).toEqual(true);
        expect(wrapper.isInvalidStep(0)).toEqual(false);
        expect(wrapper.isInvalidStep(1)).toEqual(false);
        expect(wrapper.isInvalidStep(2)).toEqual(false);
        expect(wrapper.isInvalidStep(3)).toEqual(true);
        expect(wrapper.isInvalidStep(50)).toEqual(true);
    });
    it('onStepChange', () => {
        const onStepChange = jest.fn();
        const wrapper = getInstance((
            <StepWizard onStepChange={onStepChange}>
                <Step1 />
                <Step2 />
                <Step3 />
            </StepWizard>
        ));
        wrapper.lastStep();
        wrapper.previousStep();
        wrapper.firstStep();
        wrapper.nextStep();
        wrapper.goToStep(1);
        expect(onStepChange).toHaveBeenCalledTimes(5);

        wrapper.firstStep(); // no change
        expect(onStepChange).toHaveBeenCalledTimes(5);
        takeSnapshot(wrapper.state);
    });
    // getHash
    // initialState
    // isInvalidStep
    // onHashChange
    // setActiveStep
    // updateHash
});
