import React, { Fragment, useState, useEffect } from 'react';
import StepWizard from '../../dist/react-step-wizard.min';

import Nav from './nav';
import Plugs from './Plugs';

import styles from './wizard.less';
import transitions from './transitions.less';
/* eslint react/prop-types: 0 */

/**
 * A basic demonstration of how to use the step wizard
 */
const Wizard = () => {
    const [state, updateState] = useState({
        form: {},
        transitions: {
            enterRight: `${transitions.animated} ${transitions.enterRight}`,
            enterLeft: `${transitions.animated} ${transitions.enterLeft}`,
            exitRight: `${transitions.animated} ${transitions.exitRight}`,
            exitLeft: `${transitions.animated} ${transitions.exitLeft}`,
            intro: `${transitions.animated} ${transitions.intro}`,
        },
        // demo: true, // uncomment to see more
    });

    const updateForm = (key, value) => {
        const { form } = state;

        form[key] = value;
        updateState({
            ...state,
            form,
        });
    };

    // Do something on step change
    const onStepChange = (stats) => {
        // console.log(stats);
    };

    const setInstance = SW => updateState({
        ...state,
        SW,
    });

    const { SW, demo } = state;

    return (
        <div className='container'>
            <h3>React Step Wizard</h3>
            <div className={'jumbotron'}>
                <div className='row'>
                    <div className={`col-12 col-sm-6 offset-sm-3 ${styles['rsw-wrapper']}`}>
                        <StepWizard
                            onStepChange={onStepChange}
                            isHashEnabled
                            transitions={state.transitions} // comment out for default transitions
                            nav={<Nav />}
                            instance={setInstance}
                        >
                            <First hashKey={'FirstStep'} update={updateForm} />
                            <Second form={state.form} />
                            <Progress />
                            <Last hashKey={'TheEnd!'} />
                        </StepWizard>
                    </div>
                </div>
            </div>
            { (demo && SW) && <InstanceDemo SW={SW} /> }
        </div>
    );
};

export default Wizard;

/** Demo of using instance */
const InstanceDemo = ({ SW }) => (
    <Fragment>
        <h4>Control from outside component</h4>
        <button className={'btn btn-secondary'} onClick={SW.previousStep}>Previous Step</button>
        &nbsp;
        <button className={'btn btn-secondary'} onClick={SW.nextStep}>Next Step</button>
    </Fragment>
);

/**
 * Stats Component - to illustrate the possible functions
 * Could be used for nav buttons or overview
 */
const Stats = ({
    currentStep,
    firstStep,
    goToStep,
    lastStep,
    nextStep,
    previousStep,
    totalSteps,
    step,
}) => (
    <div>
        <hr />
        { step > 1 &&
            <button className='btn btn-default btn-block' onClick={previousStep}>Go Back</button>
        }
        { step < totalSteps ?
            <button className='btn btn-primary btn-block' onClick={nextStep}>Continue</button>
            :
            <button className='btn btn-success btn-block' onClick={nextStep}>Finish</button>
        }
        <hr />
        <div style={{ fontSize: '21px', fontWeight: '200' }}>
            <h4>Other Functions</h4>
            <div>Current Step: {currentStep}</div>
            <div>Total Steps: {totalSteps}</div>
            <button className='btn btn-block btn-default' onClick={firstStep}>First Step</button>
            <button className='btn btn-block btn-default' onClick={lastStep}>Last Step</button>
            <button className='btn btn-block btn-default' onClick={() => goToStep(2)}>Go to Step 2</button>
        </div>
    </div>
);

/** Steps */

const First = props => {
    const update = (e) => {
        props.update(e.target.name, e.target.value);
    };

    return (
        <div>
            <h3 className='text-center'>Welcome! Have a look around!</h3>

            <label>First Name</label>
            <input type='text' className='form-control' name='firstname' placeholder='First Name'
                onChange={update} />
            <Stats step={1} {...props} />
        </div>
    );
};

const Second = props => {
    const validate = () => {
        if (confirm('Are you sure you want to go back?')) { // eslint-disable-line
            props.previousStep();
        }
    };

    return (
        <div>
            { props.form.firstname && <h3>Hey {props.form.firstname}! 👋</h3> }
            I've added validation to the previous button.
            <Stats step={2} {...props} previousStep={validate} />
        </div>
    );
};

const Progress = (props) => {
    const [state, updateState] = useState({
        isActiveClass: '',
        timeout: null,
    });

    useEffect(() => {
        const { timeout } = state;

        if (props.isActive && !timeout) {
            updateState({
                isActiveClass: styles.loaded,
                timeout: setTimeout(() => {
                    props.nextStep();
                }, 3000),
            });
        } else if (!props.isActive && timeout) {
            clearTimeout(timeout);
            updateState({
                isActiveClass: '',
                timeout: null,
            });
        }
    });

    return (
        <div className={styles['progress-wrapper']}>
            <p className='text-center'>Automated Progress...</p>
            <div className={`${styles.progress} ${state.isActiveClass}`}>
                <div className={`${styles['progress-bar']} progress-bar-striped`} />
            </div>
        </div>
    );
};

const Last = (props) => {
    const submit = () => {
        alert('You did it! Yay!') // eslint-disable-line
    };

    return (
        <div>
            <div className={'text-center'}>
                <h3>This is the last step in this example!</h3>
                <hr />
                <Plugs />
            </div>
            <Stats step={4} {...props} nextStep={submit} />
        </div>
    );
};
