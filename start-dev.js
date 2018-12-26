const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config.js');
const { spawn } = require('child_process');
const electron = require('electron');

function startServer(config, options, port) {
  return new Promise((resolve, reject) => {
    let compiler = webpack(config);
    let server = new WebpackDevServer(compiler, options);
    server.listen(port, 'localhost', function (err) {
      console.log('Starting server on http://localhost:' + port);
      compiler.plugin('done', stats => {
        if (!stats.hasErrors()) {
          resolve(server);
        } else {
          reject(stats.compilation.errors[0]);
        }
      });
    });
  });
}

let port = 8089;
let options = {
  contentBase: config.devServer.contentBase,
  publicPath: config.devServer.publicPath,
  hot: true,
  inline: true
};

config.plugins.push(new webpack.HotModuleReplacementPlugin());
config.entry.unshift(
  'webpack-dev-server/client?http://localhost:' + port + '/',
  'webpack/hot/dev-server'
);

startServer(config, options, port)
  .then((server) => {
    spawn(electron, ['--dev', './electron-main.js'], { stdio: 'inherit' })
      .on('close', () => {
        server.close();
      })
      .on('error', err => {
        server.close();
      })
      .on('disconnect', () => {
        server.close();
      })
      .on('exit', () => {
        server.close();
      });
  }).catch(err => {
    console.log(err);
  })