# Migrating v5 to v6

6.0.0-beta.0 is a review candidate. Publishing requires maintainer approval.

## Breaking changes

1. React 18 or 19 is required. The wizard is a function component using hooks.
   React 15/16/17 and obsolete IE/browser targets are no longer supported.
2. Import through `react-step-wizard`. ESM and CJS are separate export conditions.
   UMD globals and private `dist/react-step-wizard.min.js` imports are retired.
   CJS users use `require('react-step-wizard').default` or `.StepWizard`. ESM users
   keep `import StepWizard from 'react-step-wizard'`. No interop workaround needed.
3. Default animation styles are an explicit import:
   `import 'react-step-wizard/styles.css'`. Core hiding/layout works without CSS;
   imports/SSR never inject global styles into the document. Hashed v5 selectors
   are replaced by `rsw-step-wrapper`, `rsw-step`, and `rsw-active`.
4. `instance` and `ref` expose `StepWizardHandle`, not a React class. Remove use of
   `.state`, `.setState`, `.setActiveStep`, `.isInvalidStep`, `.getSteps`,
   `.getTransitions`, `.getHash`, `.onHashChange`, and `.updateHash`. Use the public
   snapshot/descriptors and navigation methods. `.currentIndex` replaces
   `.state.activeStep`; `.steps` and `.stepProps(n)` replace internal child access.
5. Navigation returns `Promise<boolean>`. Await it to learn whether a guard accepted
   the request. Invalid/unknown targets and same-step requests return false.
   `goToStep(string)` works independently of hash persistence.
6. Fragments are flattened into steps. Empty/conditional nodes are ignored. Use
   stable keys/names/hashes for dynamic lists. Duplicate identifiers and unwrapped
   text children fail early instead of producing ambiguous navigation.
7. Inactive eager steps are hidden and inert (including exiting content). Hidden
   form controls do not participate in keyboard navigation. Eager mounting keeps
   local state; `isLazyMount` still unmounts inactive content and resets it.
8. Hash selection happens after hydration. The server and first client render use
   `initialStep`; a recognized URL is then selected through the guard. Browser
   history uses pushState/replaceState instead of assigning location.hash, so it
   does not scroll to matching DOM IDs. A blank initial URL receives the current
   hash through replaceState when enabled; unknown hashes are ignored.
9. `onStepChange` runs when navigation is accepted, after requesting the update.
   It is not a DOM-commit signal. Use `useEffect` on `currentStep` for DOM work.
   Structural edits reconcile without callbacks. The callback also contains
   previous/active names, hash keys, `activeNamedStep`, and a navigation/hash reason.

## Common conversions

```tsx
// v5: storing the class instance does not subscribe an external UI to step changes.
const [wizard, setWizard] = useState(null);
<StepWizard instance={setWizard}>...</StepWizard>

// v6: reactive controls belong inside the provider, via a slot or descendant.
function Controls() {
  const { currentStep, nextStep } = useStepWizard();
  return <button onClick={nextStep}>Next from {currentStep}</button>;
}
<StepWizard footer={<Controls />}>...</StepWizard>

// Imperative access outside the wizard is typed and still supported.
const wizard = useRef<StepWizardHandle>(null);
<StepWizard ref={wizard}>...</StepWizard>
await wizard.current?.goToNamedStep('contact');
```

For direct components that used injected props, export
`type Props = Partial<StepWizardChildProps> & YourOwnProps` if the component is
created without supplying wizard props at the call site. Prefer the hook for new
code. `<Step stepName="contact"><ThirdPartyForm /></Step>` attaches metadata and
lets descendant controls use the hook without cloning the third-party form.

Keep one-based numbering unless you explicitly select `indexBase={0}`. That option
changes `initialStep`, `currentStep`, `goToStep(number)`, `stepProps(number)`,
descriptor `.step`, and callback numbers together. Counts and `.currentIndex`
keep their natural meanings.

Replace validation performed inside `onStepChange` with `beforeStepChange`. Return
false to prevent a transition; asynchronous guards expose `isPending`. Thrown
errors invoke `onNavigationError`. The most recent navigation request wins.

For Next App Router, define callbacks and form state in a file with `'use client'`.
Import the library through its package entry point and include the optional CSS in
your application stylesheet entry. No `skipLibCheck` workaround is needed for
React 19; declarations use React-scoped element types.

Review [RESOLUTION_MAP.md](docs/RESOLUTION_MAP.md) and [RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)
before finalizing the major version.
