const path = require('path');

module.exports = {
  entry: {
      Map: './src/Map3.js'
  },
  output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
  }
};