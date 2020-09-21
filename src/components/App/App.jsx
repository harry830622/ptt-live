import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

const App = (props) => {
  const { className } = props;

  const ref = useRef({ ws: new WebSocket('wss://ws.ptt.cc/bbs') });

  useEffect(() => {
    ref.current.ws.onmessage = (e) => {
      console.log(e);
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

      <div className={className}>Hello World!</div>
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
