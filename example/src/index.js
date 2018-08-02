import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Wizard from './components/wizard';

import styles from './less/app.less';
import 'bootstrap/dist/css/bootstrap.css';

class App extends Component {
  render() {
    return (
        <Wizard />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
