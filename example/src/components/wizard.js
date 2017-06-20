import {StepWizard, Step} from 'react-step-wizard';

/**
 * A basic demonstration of how to use the step wizard
 */
export default class Wizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {}
    }
  }
  updateForm(key, value) {
    let form = this.state.form;
    form[key] = value;
    this.setState({form:form});
  }
  render() {
    return (
      <div className='container'>
        <h2>React Step Wizard</h2>

        <div className='jumbotron'>
          <div className='row'>
            <div className='col-xs-12 col-sm-6 col-sm-offset-3'>

              <StepWizard>
                <Step><First update={this.updateForm.bind(this)} /></Step>
                <Step><Second form={this.state.form} /></Step>
                <Step><Third /></Step>
              </StepWizard>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Stats Component - to illustrate the possible functions
 * Could be used for nav buttons or overview
 */
class Stats extends React.Component {
  render() {
    return (
      <div>
        <hr />
        { this.props.currentStep > 1 &&
          <button className='btn btn-default btn-block' onClick={this.props.previousStep}>Go Back</button>
        }
        { this.props.currentStep < this.props.totalSteps ?
          <button className='btn btn-primary btn-block' onClick={this.props.nextStep}>Continue</button>
          :
          <button className='btn btn-success btn-block' onClick={this.props.nextStep}>Finish</button>
        }
        <hr />
        <p>
          <h4>Other Functions</h4>
          <div>Current Step: {this.props.currentStep}</div>
          <div>Total Steps: {this.props.totalSteps}</div>
          <button className='btn btn-default' onClick={()=>this.props.goToStep(2)}>Go to Step 2</button>
          <button className='btn btn-default' onClick={this.props.firstStep}>First Step</button>
          <button className='btn btn-default' onClick={this.props.lastStep}>Last Step</button>
        </p>
      </div>
    )
  }
}

/** Steps */

class First extends React.Component {
  update(e) {
    this.props.update(e.target.name,e.target.value);
  }
  render() {
    return (
      <div>
        <h3 className='text-center'>Welcome! Have a look around!</h3>

        <label>First Name</label>
        <input type='text' className='form-control' name='firstname' placeholder='First Name'
          onChange={this.update.bind(this)} />
        <Stats {...this.props} />
      </div>
    );
  }
}

class Second extends React.Component {
  validate() {
    if(confirm('Are you sure you want to go back?')) {
      this.props.previousStep();
    }
  }
  render() {
    return (
      <div>
        { this.props.form.firstname &&
          <h3>Hey {this.props.form.firstname}! 👋</h3>
        }
        I've added validation to the previous button.
        <Stats {...this.props} previousStep={this.validate.bind(this)} />
      </div>
    );
  }
}

class Third extends React.Component {
  submit() {
    alert('You did it! Yay!')
  }
  render() {
    return (
      <div>
        This is the last step in this example! Do you love it?
        <Stats {...this.props} nextStep={this.submit.bind(this)} />
      </div>
    );
  }
}