import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { GenerateSW } from 'workbox-webpack-plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const config: webpack.Configuration = {
  mode: 'production',
  entry: ['url-search-params-polyfill', './src/index.tsx'],
  cache: false,
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
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '/../src/index.ejs'),
      inject: true,
      hash: false,
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeAttributeQuotes: false,
        minifyJS: true,
        minifyCSS: true,
        processConditionalComments: true
      }
    }),
    new GenerateSW({
      navigateFallback: '/index.html',
      navigateFallbackAllowlist: [/^(?!\/__).*/],
      exclude: [/\.map$/, /asset-manifest\.json$/]
    }),
    new WebpackManifestPlugin({
      fileName: 'asset-manifest.json'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: path.join(__dirname, '/../dist/report.html'),
      openAnalyzer: false,
      generateStatsFile: false
    }),
    function (this: webpack.Compiler) {
      this.hooks.done.tapPromise('gh-404-plugin', () => {
        const htmlFileName = '/../dist/index.html';
        const htmlFilePath = path.join(__dirname, htmlFileName);
        fs.writeFileSync(
          htmlFilePath.replace('index', '404'),
          fs.readFileSync(htmlFilePath).toString()
        );
        return Promise.resolve();
      });
    }
  ]
};

export default config;
