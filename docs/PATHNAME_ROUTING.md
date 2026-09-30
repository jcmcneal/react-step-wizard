# Pathname routing (#119)

Keep `isHashEnabled` false. Your router owns the URL; the wizard owns step state.
Use names instead of relying on changing numeric positions. This example uses
React Router's existing location/navigation APIs; no router is bundled with RSW.

```tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StepWizard, { Step, useStepWizard } from 'react-step-wizard';

function RouteSync() {
  const { pathname } = useLocation();
  const { goToNamedStep } = useStepWizard();
  const step = pathname.slice(1);
  useEffect(() => { void goToNamedStep(step); }, [step, goToNamedStep]);
  return null;
}

function RoutedWizard() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const names = ['intro', 'contact', 'complete'];
  const initialStep = Math.max(0, names.indexOf(pathname.slice(1))) + 1;
  return <StepWizard initialStep={initialStep} nav={<RouteSync />}
    onStepChange={({ activeStepName }) => {
      const nextPath = `/${activeStepName}`;
      if (pathname !== nextPath) navigate(nextPath);
    }}>
    <Step stepName="intro"><Intro /></Step>
    <Step stepName="contact"><Contact /></Step>
    <Step stepName="complete"><Complete /></Step>
  </StepWizard>;
}
```

Unknown paths are a router decision: redirect them or show your application's
not-found page. Configure your server to serve the application on deep paths.
If you add validation, block navigation through your router too, or restore the
previous path when `goToNamedStep` resolves false. `onStepChange` only fires on
accepted wizard navigation. A router's callback should avoid pushing the same
current path again. RSW does not intercept route links or manage pathname history.

The named-navigation/pathname composition is regression-tested without a router
dependency. Confirm the adapter with your router's version and validation policy.
