import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/core';
import { TextField, Button } from '@material-ui/core';

const LoginPage = (props) => {
  const { className, onFormSubmit } = props;

  const [idTextFieldValue, setIdTextFieldValue] = useState('');
  const [passwdTextFieldValue, setPasswdTextFieldValue] = useState('');
  const handleIdTextFieldChange = useCallback((e) => {
    setIdTextFieldValue(e.target.value);
  }, []);
  const handlePasswdTextFieldChange = useCallback((e) => {
    setPasswdTextFieldValue(e.target.value);
  }, []);
  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const id = idTextFieldValue.trim();
      const passwd = passwdTextFieldValue;
      if (!id || !passwd) {
        return;
      }
      setIdTextFieldValue('');
      setPasswdTextFieldValue('');
      onFormSubmit({ id, passwd });
    },
    [onFormSubmit, idTextFieldValue, passwdTextFieldValue],
  );

  return (
    <div
      className={className}
      css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      `}
    >
      <form
        onSubmit={handleFormSubmit}
        css={css`
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 50%;
        `}
      >
        <TextField
          label="帳號"
          variant="outlined"
          size="small"
          margin="dense"
          fullWidth
          value={idTextFieldValue}
          onChange={handleIdTextFieldChange}
        />
        <TextField
          label="密碼"
          type="password"
          variant="outlined"
          size="small"
          margin="dense"
          fullWidth
          value={passwdTextFieldValue}
          onChange={handlePasswdTextFieldChange}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          css={css`
            margin-top: 20px;
          `}
        >
          登入 PTT
        </Button>
      </form>
    </div>
  );
};

LoginPage.propTypes = {
  className: PropTypes.string,
  onFormSubmit: PropTypes.func.isRequired,
};

LoginPage.defaultProps = {
  className: '',
};

export default LoginPage;
