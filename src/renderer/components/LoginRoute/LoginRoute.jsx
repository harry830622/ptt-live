import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const LoginRoute = (props) => {
  const { children, isLoggedIn, ...rest } = props;
  return (
    <Route {...rest}>
      {isLoggedIn ? <Redirect to={{ pathname: '/' }} /> : children}
    </Route>
  );
};

LoginRoute.propTypes = {
  children: PropTypes.element.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

export default LoginRoute;
