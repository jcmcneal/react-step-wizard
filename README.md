# React Step Wizard

![What You Can Build](https://raw.githubusercontent.com/jcmcneal/react-step-wizard/master/example.gif)

### Try It Out!
[Click here](https://jcmcneal.github.io/react-step-wizard/example/) to see a live example!

### Install
---
```
npm install react-step-wizard
```

### Import Component
---
```js
import {StepWizard, Step} from 'react-step-wizard';
```

### JSX Syntax
---
Simply create a wrapper with `<StepWizard></StepWizard>` and then add each step as
it's own component wrapped in a `<Step></Step>` component
```jsx
<StepWizard>
  <Step><Step1 /></Step>
  <Step><Step2 /></Step>
  <Step><Step... /></Step>
  <Step><Step5 /></Step>
  <Step><WhateverComponentName /></Step>
</StepWizard>
```

### Props
---
I wanted this step wizard to be as flexible as possible so each step has access to the step
wizard functions via `this.props`

For example:
```html
<div>
  <!-- Variables -->
  <h2>Step {this.props.currentStep}</h2>
  <p>Total Steps: {this.props.totalSteps}</p>
  <p>Is Active: {this.props.isActive}</p>
  <!-- Functions -->
  <p><button onClick={this.props.previousStep}>Previous Step</button></p>
  <p><button onClick={this.props.nextStep}>Next Step</button></p>
  <p><button onClick={()=>this.props.goToStep(2)}>Step 2</button></p>
  <p><button onClick={this.props.firstStep}>First Step</button></p>
  <p><button onClick={this.props.lastStep}>Last Step</button></p>
</div>
```

### Transitions
---
The default transitions are using CSS taken from [animate.css](https://daneden.github.io/animate.css/). You can override the transitions by passing in custom CSS classes to the `transitions` prop in `<StepWizard>`.
```jsx
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
The order of your steps in JSX will be loaded in the same order in the browser. However, you may specify which step to start on page load by using the `initialStep` prop. It accepts a numeric value corresponding to the step order.

```jsx
<StepWizard initialStep={3}>...</StepWizard>
```

passing in the `active` prop to `<Step>`. This doesn't reorder it to be first but rather skips directly to it on start.
```jsx
<Step active><Step7 /></Step>
```
*Neglecting to pass in the `active` prop will result in the first component displaying first.