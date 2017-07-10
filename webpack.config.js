const webpack = require('webpack');
const path = require('path');
const rootPath = path.resolve(__dirname, './');

module.exports = {
  context: path.resolve(__dirname, './src'),

  entry: ['./index.js'],

  output: {
    path: path.join(rootPath, 'build'),
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['.js']
  },

  module: {
    rules: [
      { 
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      }
    ]
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ],

  watch: true
};
