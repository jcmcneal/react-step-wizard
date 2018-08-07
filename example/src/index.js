import React from 'react';
import ReactDOM from 'react-dom';
import Wizard from './components/wizard';

import './less/app.less';
import 'bootstrap/dist/css/bootstrap.css';

const App = () => (
    <Wizard />
);

ReactDOM.render(<App />, document.getElementById('app'));
