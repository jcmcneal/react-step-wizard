import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';

import Wizard from './components/wizard';

import './less/app.less';

const App = () => (
    <Wizard />
);

/** HMR */
hot(module)(App);

ReactDOM.render(<App />, document.getElementById('app'));
