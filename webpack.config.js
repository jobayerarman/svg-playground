var path    = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    user: './src/js/user/user.js'
  },
  output: {
    filename: '[name].js'
  }
};
