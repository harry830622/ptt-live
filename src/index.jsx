import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import { Global, css } from '@emotion/core';
import CssBaseline from '@material-ui/core/CssBaseline';

import App from './components/App';

ReactDOM.render(
  <>
    <CssBaseline />
    <Global
      styles={css`
        html,
        body {
          background-color: #ffffff00;
          -webkit-app-region: drag;
        }
      `}
    />
    <App />
  </>,
  document.querySelector('#react'),
);
