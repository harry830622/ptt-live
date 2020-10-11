import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/core';
import {
  Container,
  Grid,
  Typography,
  OutlinedInput,
  IconButton,
} from '@material-ui/core';
import { Send as SendIcon } from '@material-ui/icons';

const LiveChatPage = (props) => {
  const { className, comments, onFormSubmit } = props;

  const [colorByUserId, setColorByUserId] = useState({});
  useEffect(() => {
    comments.forEach(({ userId }) => {
      setColorByUserId((prevColorByUserId) =>
        prevColorByUserId[userId]
          ? prevColorByUserId
          : {
              ...prevColorByUserId,
              [userId]: `#${Math.floor(Math.random() * 0xffffff).toString(16)}`,
            },
      );
    });
  }, [comments]);

  const [commentInputValue, setCommentInputValue] = useState('');
  const handleCommentInputChange = useCallback((e) => {
    setCommentInputValue(e.target.value);
  }, []);
  const handleCommentFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const commentText = commentInputValue.trim();
      if (!commentText) {
        return;
      }
      setCommentInputValue('');
      onFormSubmit({ commentText });
    },
    [onFormSubmit, commentInputValue],
  );

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [comments]);

  return (
    <div className={className}>
      <Container
        css={css`
          min-height: 100vh;
        `}
      >
        {comments.slice(comments.length - 100).map((comment) => (
          <Grid container spacing={2} key={comment.id}>
            <Grid item xs={4}>
              <Typography
                variant="subtitle1"
                css={css`
                  text-align: right;
                  font-weight: 700;
                  color: ${colorByUserId[comment.userId]};
                `}
              >
                {comment.userId}
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body1">{comment.text}</Typography>
            </Grid>
          </Grid>
        ))}
        {/* Append a dummy element to pad the bottom so that the comments will not overlap with the input */}
        <div
          css={css`
            visibility: hidden;
          `}
        >
          <Grid container spacing={2}>
            <Grid item xs={4} />
            <Grid item xs={8}>
              <form
                css={css`
                  display: flex;
                  align-items: center;
                `}
              >
                <OutlinedInput
                  variant="outlined"
                  size="small"
                  margin="dense"
                  multiline
                  fullWidth
                  value={commentInputValue}
                />
                <IconButton type="submit" variant="contained" color="primary">
                  <SendIcon />
                </IconButton>
              </form>
            </Grid>
          </Grid>
        </div>
      </Container>
      <Container
        css={css`
          position: fixed;
          bottom: 8px;
        `}
      >
        <div>
          <Grid container spacing={2}>
            <Grid item xs={4} />
            <Grid item xs={8}>
              <form
                onSubmit={handleCommentFormSubmit}
                css={css`
                  display: flex;
                  align-items: center;
                `}
              >
                <OutlinedInput
                  placeholder="推文"
                  variant="outlined"
                  size="small"
                  margin="dense"
                  fullWidth
                  value={commentInputValue}
                  onChange={handleCommentInputChange}
                />
                <IconButton type="submit" variant="contained" color="primary">
                  <SendIcon />
                </IconButton>
              </form>
            </Grid>
          </Grid>
        </div>
      </Container>
    </div>
  );
};

LiveChatPage.propTypes = {
  className: PropTypes.string,
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      timestamp: PropTypes.number.isRequired,
    }),
  ).isRequired,
  onFormSubmit: PropTypes.func.isRequired,
};

LiveChatPage.defaultProps = {
  className: '',
};

export default LiveChatPage;
