import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { css } from '@emotion/core';
import { Container, Grid, Typography } from '@material-ui/core';

import { ipcRenderer } from 'electron';

const App = (props) => {
  const { className } = props;

  const [isUpdating, setIsUpdating] = useState(false);
  const ref = useRef({
    livePostComments: [],
    colorByUserId: {},
  });
  useEffect(() => {
    const handleAsyncMsg = (_, msg) => {
      setIsUpdating(true);
      switch (msg.type) {
        case 'SET_LIVE_POST_COMMENTS': {
          const nextLivePostComments = [...msg.payload.livePostComments];
          ref.current.livePostComments = nextLivePostComments;
          ref.current.livePostComments.forEach(({ userId }) => {
            if (!ref.current.colorByUserId[userId]) {
              ref.current.colorByUserId[userId] = `#${Math.floor(
                Math.random() * 0xffffff,
              ).toString(16)}`;
            }
          });
          window.scrollTo(0, document.body.scrollHeight);
          break;
        }
        default: {
          break;
        }
      }
      setIsUpdating(false);
    };
    ipcRenderer.on('async-msg', handleAsyncMsg);
    return () => {
      ipcRenderer.removeListener('async-msg', handleAsyncMsg);
    };
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
        <Container>
          <div>
            {ref.current.livePostComments
              .slice(ref.current.livePostComments.length - 100)
              .map((comment) => (
                <Grid container spacing={2} key={comment.id}>
                  <Grid item xs={4}>
                    <Typography
                      variant="subtitle1"
                      css={css`
                        text-align: right;
                        font-weight: 700;
                        color: ${ref.current.colorByUserId[comment.userId]};
                      `}
                    >
                      {comment.userId}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography
                      variant="body1"
                      css={css`
                        color: #ffffff;
                      `}
                    >
                      {comment.content}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
          </div>
        </Container>
      </div>
    </>
  );
};

App.propTypes = {
  className: PropTypes.string,
};

App.defaultProps = {
  className: '',
};

export default App;
