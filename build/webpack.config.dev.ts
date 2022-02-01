import path from 'path';
import webpack from 'webpack';
import 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const config: webpack.Configuration = {
  mode: 'development',
  stats: 'errors-only',
  devServer: {
    historyApiFallback: true,
    port: 23333,
    // host: '0.0.0.0',
    hot: true,
    open: true
  },
  entry: [
    'url-search-params-polyfill',
    'react-hot-loader/patch',
    './src/index.tsx'
  ],
  cache: true,
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: path.join(__dirname, '/../src')
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '/../src/index.ejs'),
      inject: 'body',
      minify: false
    }),
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin()
  ]
};

export default config;
