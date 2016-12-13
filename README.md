# React Step Wizard

### Install
---
```
npm install react-step-wizard
```

### Import Component
---
```javascript
import {StepWizard, Step} from 'react-step-wizard';
```

### Use
---
Simply create a wrapper with `<StepWizard></StepWizard>` and then add each step as
it's own component wrapped in `<Step></Step>`
```html
<StepWizard>
    <Step><Step1 /></Step>
    <Step><Step2 /></Step>
    <Step><Step.. /></Step>
    <Step><Step..12 /></Step>
    <Step><WhateverComponentName /></Step>
  </StepWizard>
</section>
```

### Props
---
I wanted this step wizard to be as flexible as possible so each step has access to the step
wizard functions via `this.props`

For example:
```html
<div>
  <h2>Step {this.props.currentStep}</h2>
  <p>Total Steps: {this.props.totalSteps}</p>
  <p><button onClick={this.props.previousStep}>Previous Step</button></p>
  <p><button onClick={this.props.nextStep}>Next Step</button></p>
  <p><button onClick={()=>this.props.goToStep(2)}>Step 2</button></p>
  <p><button onClick={this.props.firstStep}>First Step</button></p>
  <p><button onClick={this.props.lastStep}>Last Step</button></p>
</div>
```

### Transitions
---
All the transitions are using CSS via [animate.css](https://daneden.github.io/animate.css/). You can override the transitions by passing in `transitions` prop to `<StepWizard>`.
```html
let custom = {
  enterRight: 'your custom css transition classes',
  enterLeft : 'your custom css transition classes',
  exitRight : 'your custom css transition classes',
  exitLeft  : 'your custom css transition classes'
}
<StepWizard transitions={custom}>...</StepWizard>
```

### Initial Step
---
The order of your steps in JSX will be loaded in the same order in the browser. However, you may specify which step to start on by passing in the `active` prop to `<Step>`. This doesn't reorder it to be first but rather skips directly to it on start.
```html
<Step active><Step7 /></Step>
```
*Neglecting to pass in the `active` prop will result in the first component displaying first.