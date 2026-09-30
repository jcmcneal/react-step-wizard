import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import StepWizard, { Step, useStepWizard } from 'react-step-wizard';
import 'react-step-wizard/styles.css';
import './app.css';

function Controls() {
    const wizard = useStepWizard();
    return <nav aria-label="Wizard steps">
        <p data-testid="status">Step {wizard.currentStep} of {wizard.totalSteps}: {wizard.currentStepName}</p>
        <button disabled={wizard.currentIndex <= 0 || wizard.isPending} onClick={wizard.previousStep}>Previous</button>
        <button disabled={wizard.currentIndex >= wizard.totalSteps - 1 || wizard.isPending} onClick={wizard.nextStep}>Next</button>
        {wizard.steps.map(step => <button key={step.key} aria-current={wizard.currentIndex === step.index ? 'step' : undefined}
            onClick={() => wizard.goToNamedStep(step.stepName)}>{step.stepName}</button>)}
    </nav>;
}

export function App() {
    const [name, setName] = useState('');
    const [extra, setExtra] = useState(false);
    return <main><h1>React Step Wizard 6</h1><p>TypeScript, hooks, URL history and guarded navigation.</p>
        <label><input type="checkbox" checked={extra} onChange={event => setExtra(event.target.checked)} />Include an extra step</label>
        <StepWizard isHashEnabled isSwipeEnabled footer={<Controls />} wrapperClassName="panels"
            beforeStepChange={({ previousStepName, activeStep }) => previousStepName !== 'Profile' || activeStep === 1 || name.trim().length > 0}>
            <Step key="welcome" stepName="Welcome" hashKey="welcome"><h2>Welcome</h2><p>Continue to create a profile. Swipe left or use the controls.</p></Step>
            <Step key="profile" stepName="Profile" hashKey="profile"><h2>Profile</h2>
                <label>Your name (required before continuing)<input value={name} onChange={event => setName(event.target.value)} /></label>
            </Step>
            {extra && <Step key="extra" stepName="Extra" hashKey="extra"><h2>Extra</h2><p>Conditional steps keep a stable identity.</p></Step>}
            <Step key="done" stepName="Done" hashKey="done"><h2>Done</h2><p>Thanks{name ? `, ${name}` : ''}!</p></Step>
        </StepWizard>
    </main>;
}
const node = document.getElementById('app');
if (node) createRoot(node).render(<StrictMode><App /></StrictMode>);
