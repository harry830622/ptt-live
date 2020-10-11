import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = (props) => {
  const { children, isAuthorized, ...rest } = props;
  return (
    <Route {...rest}>
      {isAuthorized ? children : <Redirect to={{ pathname: '/login' }} />}
    </Route>
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.element.isRequired,
  isAuthorized: PropTypes.bool.isRequired,
};

export default PrivateRoute;
