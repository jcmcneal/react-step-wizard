import React, { Component, Fragment } from 'react';
import StepWizard from '../../dist/react-step-wizard.min';

import Nav from './nav';
import Plugs from './Plugs';

import styles from './wizard.less';
import transitions from './transitions.css';
/* eslint react/prop-types: 0 */

/**
 * A basic demonstration of how to use the step wizard
 */
export default class Wizard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            form: {},
            transitions: {
                enterRight: `${transitions.animated} ${transitions.enterRight}`,
                enterLeft: `${transitions.animated} ${transitions.enterLeft}`,
                exitRight: `${transitions.animated} ${transitions.exitRight}`,
                exitLeft: `${transitions.animated} ${transitions.exitLeft}`,
                intro: `${transitions.animated} ${transitions.intro}`,
            },
            // demo: true, // uncomment to see more
        };
    }

    updateForm = (key, value) => {
        const { form } = this.state;

        form[key] = value;
        this.setState({ form });
    }

    // Do something on step change
    onStepChange = (stats) => {
        // console.log(stats);
    }

    setInstance = SW => this.setState({ SW })

    render() {
        const { SW, demo } = this.state;

        return (
            <div className='container'>
                <h3>React Step Wizard</h3>
                <div className={'jumbotron'}>
                    <div className='row'>
                        <div className={`col-12 col-sm-6 offset-sm-3 ${styles['rsw-wrapper']}`}>
                            <StepWizard
                                onStepChange={this.onStepChange}
                                isHashEnabled
                                transitions={this.state.transitions} // comment out this line to use default transitions
                                nav={<Nav />}
                                instance={this.setInstance}
                            >
                                <First hashKey={'FirstStep'} update={this.updateForm} />
                                <Second form={this.state.form} />
                                <Progress />
                                <Last hashKey={'TheEnd!'} />
                            </StepWizard>
                        </div>
                    </div>
                </div>
                { (demo && SW) && <InstanceDemo SW={SW} /> }
            </div>
        );
    }
}

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

class First extends Component {
    update = (e) => {
        this.props.update(e.target.name, e.target.value);
    }

    render() {
        return (
            <div>
                <h3 className='text-center'>Welcome! Have a look around!</h3>

                <label>First Name</label>
                <input type='text' className='form-control' name='firstname' placeholder='First Name'
                    onChange={this.update} />
                <Stats step={1} {...this.props} />
            </div>
        );
    }
}

class Second extends Component {
    validate = () => {
        if (confirm('Are you sure you want to go back?')) { // eslint-disable-line
            this.props.previousStep();
        }
    }

    render() {
        return (
            <div>
                { this.props.form.firstname && <h3>Hey {this.props.form.firstname}! 👋</h3> }
                I've added validation to the previous button.
                <Stats step={2} {...this.props} previousStep={this.validate} />
            </div>
        );
    }
}

class Progress extends Component {
    state = {
        isActiveClass: '',
        timeout: null,
    }

    componentDidUpdate() {
        const { timeout } = this.state;

        if (this.props.isActive && !timeout) {
            this.setState({
                isActiveClass: styles.loaded,
                timeout: setTimeout(() => {
                    this.props.nextStep();
                }, 3000),
            });
        } else if (!this.props.isActive && timeout) {
            clearTimeout(timeout);
            this.setState({
                isActiveClass: '',
                timeout: null,
            });
        }
    }

    render() {
        return (
            <div className={styles['progress-wrapper']}>
                <p className='text-center'>Automated Progress...</p>
                <div className={`${styles.progress} ${this.state.isActiveClass}`}>
                    <div className={`${styles['progress-bar']} progress-bar-striped`} />
                </div>
            </div>
        );
    }
}

class Last extends Component {
    submit = () => {
        alert('You did it! Yay!') // eslint-disable-line
    }

    render() {
        return (
            <div>
                <div className={'text-center'}>
                    <h3>This is the last step in this example!</h3>
                    <hr />
                    <Plugs />
                </div>
                <Stats step={4} {...this.props} nextStep={this.submit} />
            </div>
        );
    }
}
