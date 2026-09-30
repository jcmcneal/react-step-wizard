# React Step Wizard

A flexible multistep wizard for React 18 and 19, written in TypeScript with hooks.

This branch prepares **6.0.0-beta.0** for review. It has not been published. See
[migration from v5](MIGRATION.md), [changes](CHANGELOG.md), and the
[issue/PR resolution map](docs/RESOLUTION_MAP.md).

## Quick start

```tsx
import StepWizard, { Step, useStepWizard } from 'react-step-wizard';
import 'react-step-wizard/styles.css'; // optional animations

function Controls() {
  const wizard = useStepWizard();
  return <>
    <p>Step {wizard.currentStep} of {wizard.totalSteps}</p>
    <button onClick={wizard.previousStep}>Back</button>
    <button onClick={wizard.nextStep}>Next</button>
  </>;
}

export function Form() {
  return <StepWizard footer={<Controls />}>
    <Step stepName="account"><AccountForm /></Step>
    <Step stepName="contact"><ContactForm /></Step>
    <Step stepName="complete"><Confirmation /></Step>
  </StepWizard>;
}
```

Each direct child is a step. Arrays and fragments are flattened; null, false, and
undefined are ignored. `<Step>` attaches metadata to nested or third-party content
without injecting wizard props into it. Direct custom components still receive the
v5 navigation props; their own application props are preserved, except for names
reserved by the wizard. HTML children receive no wizard props.

Give conditional or reordered steps a stable React `key` (or unique `stepName` or
`hashKey`). The active identity survives insertion/reordering. If it is removed,
the wizard uses the nearest valid position and cancels animation/validation work.
Structural reconciliation does not call `onStepChange`. Duplicate keys, names or
hashes throw an explanatory error. Text nodes must be wrapped in an element.

## Navigation and state

`useStepWizard()` works in any descendant, including nav/footer and deeply nested
form controls. It subscribes to wizard state; using it outside a wizard throws.

| Value / method | Meaning |
| --- | --- |
| `currentStep`, `totalSteps` | Public number (one-based by default), count |
| `currentIndex` | Always zero-based; `-1` for an empty wizard |
| `currentStepName` | Active name; empty string for an empty wizard |
| `steps`, `hashKeys` | Ordered descriptors (key, index, step, name, hash, original props) and hashes |
| `isPending` | An asynchronous guard is running |
| `nextStep`, `previousStep`, `firstStep`, `lastStep` | Navigate |
| `goToStep(number)` | Navigate using `indexBase` numbering |
| `goToStep(string)` | Navigate by hash key; works without URL persistence |
| `goToNamedStep(string)` | Navigate by step name |
| `stepProps(number)` | Read original props of another step; invalid numbers return `undefined` |

All navigation methods return `Promise<boolean>`: true means accepted; false means
invalid, unchanged, vetoed, superseded, failed validation, or unmounted. Sequential
calls in the same event use the latest accepted position. They request a React
update; their promises do not wait for a browser paint.

For controls outside the provider, use `ref` or `instance` with `StepWizardHandle`:

```tsx
const ref = useRef<StepWizardHandle>(null);
<StepWizard ref={ref}>...</StepWizard>
await ref.current?.goToNamedStep('contact');
```

The handle is stable and its getters read the latest committed snapshot. Reading
it does not subscribe an external component to renders. Prefer the context hook
inside the provider; outside it, update application state from `onStepChange`.
Do not wrap a captured handle in `useState` solely to observe `currentStep`.

## Wizard props

Normal div attributes (`id`, `className`, `style`, ARIA attributes, event handlers)
are forwarded to the container.

| Prop | Default / behavior |
| --- | --- |
| `initialStep` | First step; initialization only, invalid values fall back to first |
| `indexBase` | `1`; set `0` for zero-based numeric navigation, descriptors and callbacks |
| `instance` | Callback receiving the stable typed handle; React StrictMode can invoke it twice |
| `isHashEnabled` | `false`; opt into URL fragment/history synchronization |
| `isLazyMount` | `false`; when true only the active step mounts, so local state resets on revisit |
| `nav`, `footer` | React nodes or `(wizard) => ReactNode`; custom element slots receive snapshot props |
| `beforeStepChange` | Sync/async guard; return false to block any navigation, including URL changes |
| `onNavigationError` | Receives thrown/rejected guard errors; the step remains unchanged |
| `onStepChange` | Called once per accepted navigation with numbers, names, hashes and reason |
| `wrapperClassName`, `wrapperStyle` | Style the step wrapper |
| `stepClassName`, `stepStyle` | Style every step; `<Step className/style>` may customize one |
| `transitions` | Default classes; a supplied object replaces the defaults; `''` disables a direction |
| `transitionDuration` | `820` ms, maximum transition lifetime; match custom animation duration |
| `isSwipeEnabled`, `swipeThreshold` | `false`, `50` pixels; left advances, right goes back |

Snapshot props plus `isActive` and a `transitions` class string are injected into
direct custom children. Exported types include `StepWizardChildProps<T>`,
`StepWizardProps`, `StepWizardSnapshot`, `StepWizardHandle`,
`StepWizardInstanceProps`, `StepWizardTransitionProps`, `StepChangeStats`,
`StepMetadata`, `StepDescriptor`, and `StepProps`.

## Validation

```tsx
<StepWizard
  beforeStepChange={async ({ previousStepName, activeStep }) => {
    if (previousStepName === 'account' && activeStep > 1) {
      return await validateAccount();
    }
  }}
  footer={({ nextStep, isPending }) =>
    <button disabled={isPending} onClick={nextStep}>Continue</button>}
>...</StepWizard>
```

Guards run for every navigation route, including jumps and browser URL changes.
Choose backward-navigation rules explicitly. Missing/void results allow movement.
The latest request wins; changing the step list or unmounting invalidates pending
work. Guard failures do not advance or change the hash. `onStepChange` is a
notification after acceptance, not a validation hook; observe committed DOM/state
from a component effect if needed.

## URL, routers and SSR

`isHashEnabled` reads a recognized hash after hydration, so server and initial
client markup match. With no hash, it replaces the initial history entry with the
active hash. Subsequent accepted navigation pushes history entries; Back/Forward
listeners restore recognized steps. Unknown/malformed hashes are ignored safely.
Names/hashes default to `step1`, `step2`, etc., regardless of indexBase. Avoid empty
hash keys. A vetoed URL change restores the current hash with `replaceState`.

For pathname routing, leave `isHashEnabled` false. Call `goToNamedStep` when your
router changes and use `onStepChange` to update its pathname. This library does not
own a router or intercept links.

The published entry points carry `'use client'` for Next.js App Router. Define
interactive forms and callback props in a client component. Browser APIs are used
only in effects/navigation; package imports and SSR work without `window`.

## Styles and accessibility

Inactive steps have `hidden`, inline `display:none` and `aria-hidden`; they take no
space even before a stylesheet loads. Eager steps retain local state. During exits
the outgoing content is absolute and inert, and wrapper overflow is clipped. An
animation/transition-end event or timeout hides it. Incoming and outgoing panels
finish independently; disabling exit motion preserves an entering animation.
Without motion CSS, the outgoing panel hides immediately. Lazy mounting skips exit content.

Optional `styles.css` supplies default animations and reduced-motion support.
Stable classes are `rsw-step-wrapper`, `rsw-step`, and `rsw-active`. Supply custom
classes/styles for layout. The component does not move focus automatically;
applications should focus a heading or first input after navigation. Swipe is
opt-in and ignores primarily vertical movement, canceled touches and multitouch;
keep buttons available for keyboard/screen-reader users.

## Development

Use Node 22.22.2+ (the development toolchain requires it), then `npm ci`,
`npm run check`, and `npm run test:browser`. See [CONTRIBUTING.md](CONTRIBUTING.md)
for the full release validation workflow. `npm run app:dev` builds and watches the TypeScript
example on Vite 8; refresh the browser after edits. This is a fallback for an unresolved
native Vite dev/HMR stall on the validation Mac. Preserve/reproduce standard Vite dev
with `npm run app:dev:vite`; see [validation limitations](docs/VALIDATION.md).
The library runtime targets ES2020 and
supports Node 18+ for server rendering.
