// import React from 'react';
// import ReactDOM from 'react-dom';
import Wizard from './components/wizard';

class App extends React.Component {
  render() {
    return (
      <Wizard />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'))