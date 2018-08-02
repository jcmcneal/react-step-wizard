# React Step Wizard
A flexible multistep wizard built for React

[![npm version](https://badge.fury.io/js/react-step-wizard.svg)](https://badge.fury.io/js/react-step-wizard)

![What You Can Build](https://raw.githubusercontent.com/jcmcneal/react-step-wizard/master/example.gif)

### Try It Out!
<a href='https://jcmcneal.github.io/react-step-wizard/example/'>Click here</a> to see a live example!

##### Showcasing
If you've made something you're proud of with `react-step-wizard` and want to show it off to the world, send me a message with a link to your project and I'll add it to the README!

### Install
---
```
npm install react-step-wizard
```

### Import Component
---
```js
import StepWizard from 'react-step-wizard';
```

### JSX Syntax
---
Simply create a wrapper with `<StepWizard></StepWizard>` and each child component will be treated as an individual step.
```jsx
<StepWizard>
  <Step1 />
  <Step2 />
  ...
  <Step5 />
  <WhateverComponentName />
</StepWizard>
```

### Props
---
I wanted this step wizard to be as flexible as possible so each child has access to the StepWizard functions via `this.props`

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
#### User-Defined Props
Prop | Data Type | Default | Description
--- | --- | --- | ---
initialStep | `integer` | 1
isLazyMount | `boolean` | false | Only mounts the child component when `isActive` is true
transitions | `object`  | | CSS classes for transitioning between steps

#### Props Accessible On Each Child (_Step_) Component
Prop | Data Type | Parameters
--- | --- | ---
isActive | `boolean`
currentStep | `integer`
totalSteps | `integer`
firstStep | `function`
lastStep | `function`
nextStep | `function`
previousStep | `function`
goToStep | `function` | `integer` : `goToStep(3)`
---

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

Alternatively, passing the `active` prop to a child component makes it the initial step. This doesn't reorder it to be first but rather skips directly to it on start.
```jsx
<StepWizard>
  <Step1>...</Step1>
  <Step2 active>...</Step2>
</StepWizard>
```
<small>*Neglecting to pass in the `active` prop will result in the first component displaying first.</small>
