const path = require('path');
const { merge } = require('webpack-merge');

const base = require('./webpack.main.base.config');

module.exports = merge(base, {
  mode: 'production',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './build/main'),
  },
});
