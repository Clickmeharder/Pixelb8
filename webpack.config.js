const Dotenv = require('dotenv-webpack');
module.exports = {
  // Other webpack configurations
  plugins: [
    new Dotenv(),
  ],
};