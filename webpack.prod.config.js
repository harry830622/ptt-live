const path = require('path');
const { merge } = require('webpack-merge');

const base = require('./webpack.base.config');

module.exports = merge(base, {
  mode: 'production',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
});
