var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var path = require('path');
var proxy = require('http-proxy-middleware');
var config = require("./webpack.config.js");
var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
    contentBase: path.join(__dirname, "build"),
    compress: true,
    port: 9001,
    setup: function(app) {
        app.use(proxy('https://devx.anypoint.mulesoft.com/icons/', { changeOrigin: true }))
    }
  });
server.listen(9001);