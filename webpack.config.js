const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  mode: 'development',
  target: 'electron-renderer',
  entry: [
    './webpack-main.js'
  ],
  output: {
    filename: 'bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, './public/dist'),
    publicPath: 'dist/'
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader'
      },
      {
        test: /\.vue$/,
        use: ['vue-loader'],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=50000'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `bundle.css`,
    }),
    new VueLoaderPlugin()
  ]
};
