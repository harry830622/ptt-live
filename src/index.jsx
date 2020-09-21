import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';

import App from './components/App';

ReactDOM.render(
  <>
    <CssBaseline />
    <App />
  </>,
  document.querySelector('#react'),
);
