import React from 'react';
import Renderer from 'react-test-renderer';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import StepWizard from './index';

Enzyme.configure({ adapter: new Adapter() });

/** Helper Functions */
const getState = (component) => {
    const wrapper = shallow(component);
    wrapper.instance();

    return wrapper.state();
};
const render = jsx => Renderer.create(jsx);
const takeSnapshot = test => expect(test).toMatchSnapshot();
const getTreeSnapshot = component => takeSnapshot(render(component));
// const getStateSnapshot = component => takeSnapshot(getState(component));
const testComponent = (component) => {
    getTreeSnapshot(component);

    const state = getState(component);
    takeSnapshot(state);

    return state;
};

/** Capture console errors */
console.error = jest.fn();

/** Unit Tests */
describe('Step Wizard Component', () => {
    it('empty component', () => {
        testComponent(<StepWizard />);
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
    // it('test', async () => {
    //     const wrapper = shallow(<StepWizard />);
    //     await wrapper.instance();

    //     expect(wrapper.state()).toEqual({});
    // });
});

const Step1 = () => <div>Step 1</div>;
const Step2 = () => <div>Step 2</div>;
const Step3 = () => <div>Step 3</div>;
