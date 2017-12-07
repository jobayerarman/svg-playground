var path    = require('path');

module.exports = {
  entry: {
    user: './src/js/user/user.js'
  },

  output: {
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }
    ]
  }
};
