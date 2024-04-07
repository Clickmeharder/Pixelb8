// webpack.config.js
const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = () => {
  // Load environment variables from .env file
  const env = dotenv.config().parsed;

  // Define environment variables in webpack
  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  return {
    // Your webpack configuration settings here
    plugins: [
      new webpack.DefinePlugin(envKeys)
    ]
  };
};
