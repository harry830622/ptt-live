module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: 3,
      },
    ],
    ['@babel/preset-react'],
    ['@emotion/babel-preset-css-prop'],
  ],
  plugins: [],
};
