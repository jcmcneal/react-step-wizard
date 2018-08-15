import React from 'react';
import ReactDOM from 'react-dom';
// import 'bootstrap/dist/css/bootstrap.css';

import Wizard from './components/wizard';

import './less/app.less';

const App = () => (
    <Wizard />
);

ReactDOM.render(<App />, document.getElementById('app'));
