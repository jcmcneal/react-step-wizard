# Contributing

Steps to develop locally:

• `nvm use`
• `yarn install` (dont' use npm install)
• `yarn start`

### Testing
Once your changes look good, test it intensely!

• `yarn test` - runs existing unit tests. If your changes require a new unit test, please add it to `src/index.test.js`

**Manual Testing**
Create a production build of the example app and test in Chrome, Safari, Firefox, Edge, and IE 11 (will drop support for IE in 2020). Make sure the dev server is no longer running.

• `yarn build` - build react-step-wizard in dist/
• `yarn app:build` - builds example app in app/

Open `app/index.html` in all the browsers listed above and ensure there are no console errors. Also, make sure hashKeys still work as expected.

### Create Pull Request
If you feel confidence in your changes, open a PR for me to review. I'll most likely have you merge into a dev branch before going straight to master. From there I will handle the versioning and publish your changes! 🎉

Thanks for your help in making this library better! 😁
