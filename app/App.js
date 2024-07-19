import React from 'react';
import { createRoot } from 'react-dom/client';

import Wizard from './components/wizard';

import './less/app.less';

const App = () => (
    <Wizard />
);

const domNode = document.getElementById('app');
const root = createRoot(domNode);

root.render(<App />);