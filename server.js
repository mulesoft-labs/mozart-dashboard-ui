var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var path = require('path');
var proxy = require('http-proxy-middleware');
var config = require("./webpack.config.js");
var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
    contentBase: path.join(__dirname, "docs"),
    compress: true,
    port: 9001
  });
server.listen(9001);
