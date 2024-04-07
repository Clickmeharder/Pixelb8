const webpack = require('webpack');
const dotenv = require('dotenv');
module.exports = {
  // Other webpack configurations
  plugins: [
    new Dotenv(),
  ],
};