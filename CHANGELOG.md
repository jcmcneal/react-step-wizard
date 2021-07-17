# Changelog
All notable changes to this project will be documented in this file.

### [5.3.8]
• Added support for named steps - [Wojciech-Florczak](https://github.com/Wojciech-Florczak)

> Dev Changes
• Updated dev dependencies to address vulnerabilities

### [5.3.7]
• Update Step TS - [LucasCostaAtCyberSaint](https://github.com/LucasCostaAtCyberSaint)

### [5.3.6]
• Support hash as argument to `goToStep` - [GabrielFerrarini](https://github.com/GabrielFerrarini)

### [5.3.5]
• Fill for null children - [resolritter](https://github.com/resolritter)

### [5.3.4]
• Automate publishing to NPM
• Support for TypeScript - Thanks [resolritter](https://github.com/resolritter)!

### [5.3.1]
• Support conditional steps

### [5.3.0]
• Adds instance feature to control the step wizard from anywhere in your app!
• Update to `isReactComponent` to support memo components
• Support for `className` prop on `StepWizard`

### [5.2.2]
• Fix for SSR - Thanks [mathvaleriano](https://github.com/mathvaleriano)!
• Added CONTRIBUTING.md

### [5.2.0]
• Fixed pointer events on inactive steps
• Allow for non-react components as steps (remember they won't have access to props)

> Dev Changes
• Added more unit tests (86% coverage)

### [5.1.0]
• Fixed exit transitions

### [5.0.0]
• Switched build process to rollup - Now `2.36kb` gzipped!

### [4.4.0]
• Added navigation feature! 🎉

> Dev Changes
• Added Jest for unit/snapshot testing
• Upgraded to Babel 7

### [4.3.1]
• Updated component to change step `onhashchange` when using browser back/forward buttons - (applicable only when `isHashEnabled` is `true`)

### [4.3.0]
• Added `hashKey` for persisting step in URL
• Removed `active` prop for child components - use `initialStep` instead

### [4.2.0]
• Added `onStepChange` callback for when step changes

### [4.1.2]
• Fix for IE support

### [4.1.1]
> Dev Changes
    • Added PropTypes for development

### [4.1.0]
• Added `isLazyMount` prop for dynamically mounting steps

> Dev Changes
    • Added webpack-dev-server to example for convenience

### [4.0.0] \*Breaking Changes\*
• Removed `Step` component. It wasn't necessary
• Made `StepWizard` the default export

> Dev Changes
    • Updated eslint rules

### [3.0.1]
> Dev Changes
• clean up dev dependencies
• Update to example demo

### [3.0.0] \*Potentially Breaking Changes\*
• Added `isActive` prop and `initialStep`
• Remove example/ from npm

> Dev Changes
• Updated webpack configs
• Added airbnb eslint rules.
• Updated components for eslint and es6 standards

### [2.0.0]
• Use style-loader to handle CSS