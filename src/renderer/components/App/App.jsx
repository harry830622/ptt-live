import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Switch } from 'react-router-dom';
import { css } from '@emotion/core';
import { CircularProgress, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { ipcRenderer } from 'electron';

import PrivateRoute from '../PrivateRoute';
import LoginRoute from '../LoginRoute';
import LoginPage from './LoginPage';
import LiveChatPage from './LiveChatPage';

const App = (props) => {
  const { className, onModeChange } = props;

  const [isLoading, setIsLoading] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState({});
  const [comments, setComments] = useState([]);
  useEffect(() => {
    const handleAsyncMsg = (_, msg) => {
      switch (msg.type) {
        case 'SET_IS_LOADING': {
          setIsLoading(msg.payload.isLoading);
          break;
        }
        case 'SET_IS_LOGGING_IN': {
          setIsLoggingIn(msg.payload.isLoggingIn);
          break;
        }
        case 'SET_IS_LOGGED_IN': {
          setIsLoggedIn(msg.payload.isLoggedIn);
          break;
        }
        case 'SET_MESSAGE': {
          setMessage({ ...msg.payload.message });
          break;
        }
        case 'SET_COMMENTS': {
          setComments([...msg.payload.comments]);
          break;
        }
        default: {
          break;
        }
      }
    };
    ipcRenderer.on('async-msg', handleAsyncMsg);
    return () => {
      ipcRenderer.removeListener('async-msg', handleAsyncMsg);
    };
  }, []);

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  useEffect(() => {
    if (!message.text) {
      return () => {};
    }
    setIsMessageOpen(true);
    const messageTimeoutId = setTimeout(() => {
      setIsMessageOpen(false);
    }, 3000);
    return () => {
      clearTimeout(messageTimeoutId);
    };
  }, [message]);

  useEffect(() => {
    const handleBodyMouseEnter = () => {
      onModeChange('light');
    };
    const handleBodyMouseLeave = () => {
      onModeChange('dark');
    };
    document.body.addEventListener('mouseenter', handleBodyMouseEnter);
    document.body.addEventListener('mouseleave', handleBodyMouseLeave);
    return () => {
      document.body.removeEventListener('mouseenter', handleBodyMouseEnter);
      document.body.removeEventListener('mouseleave', handleBodyMouseLeave);
    };
  }, [onModeChange]);

  const handleLogInPageFormSubmit = useCallback(({ id, passwd }) => {
    ipcRenderer.send('credential', {
      id,
      passwd,
    });
  }, []);
  const handleLiveChatPageFormSubmit = useCallback(({ commentText }) => {
    ipcRenderer.send('comment', {
      commentText,
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>PTT NBA Live</title>
        <meta name="title" content="PTT NBA Live" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Helmet>

      <div className={className}>
        {isLoggingIn || isLoading ? (
          <div
            css={css`
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            `}
          >
            <CircularProgress />
          </div>
        ) : (
          <Switch>
            <PrivateRoute path="/" exact isAuthorized={isLoggedIn}>
              <LiveChatPage
                comments={comments}
                onFormSubmit={handleLiveChatPageFormSubmit}
              />
            </PrivateRoute>
            <LoginRoute path="/login" exact isLoggedIn={isLoggedIn}>
              <LoginPage onFormSubmit={handleLogInPageFormSubmit} />
            </LoginRoute>
          </Switch>
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={isMessageOpen}
        >
          <Alert severity={{ ERROR: 'error' }[message.type]}>
            {message.text}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

App.propTypes = {
  className: PropTypes.string,
  onModeChange: PropTypes.func.isRequired,
};

App.defaultProps = {
  className: '',
};

export default App;
