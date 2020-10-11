const path = require('path');
const { EnvironmentPlugin } = require('webpack');

require('dotenv').config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV === 'development' ? '.env.dev' : '.env.prod',
  ),
});

module.exports = {
  target: 'electron-main',
  entry: {
    index: path.resolve(__dirname, './src/main/index.js'),
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  plugins: [new EnvironmentPlugin(['NODE_ENV'])],

  externals: {
    puppeteer: 'commonjs2 puppeteer',
  },

  // Prevent __dirname and __filename from being substituted by webpack
  node: {
    __dirname: false,
    __filename: false,
  },
};
