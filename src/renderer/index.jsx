import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import Store from 'electron-store';
import { Global as GlobalStyle, css } from '@emotion/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { GlobalCtx } from './contexts';
import App from './components/App';

const store = new Store();

const Index = () => {
  const [paletteType, setPaletteType] = useState('light');
  const handleAppModeChange = useCallback((mode) => {
    setPaletteType(mode);
  }, []);
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: paletteType,
        },
      }),
    [paletteType],
  );

  return (
    <>
      <CssBaseline />
      <GlobalStyle
        styles={css`
          html,
          body {
            -webkit-app-region: drag;
            background-color: ${theme.palette.background.default +
            (theme.palette.type === 'light' ? 'aa' : '55')};
            color: ${theme.palette.text.primary};
          }
        `}
      />
      <ThemeProvider theme={theme}>
        <GlobalCtx.Provider
          value={{
            store,
          }}
        >
          <Router>
            <App onModeChange={handleAppModeChange} />
          </Router>
        </GlobalCtx.Provider>
      </ThemeProvider>
    </>
  );
};

ReactDOM.render(<Index />, document.querySelector('#react'));
