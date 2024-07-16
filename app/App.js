import React from 'react';
import { createRoot } from 'react-dom/client';
import { hot } from 'react-hot-loader';

import Wizard from './components/wizard';

import './less/app.less';

const App = () => (
    <Wizard />
);

/** HMR */
hot(module)(App);

const domNode = document.getElementById('app');
const root = createRoot(domNode);

root.render(<App />);