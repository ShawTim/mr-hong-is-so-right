const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let config = {
  entry: './src/js/app.js',
  output:  {
    filename: 'static/js/[name].[chunkhash:8].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          },
          /*
          {
            loader: 'eslint-loader'
          },
          */
        ]
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {
            minimize: true,
            attrs: ['img:src', 'use:xlink:href', 'option:data-img-src'],
          }
        }
      },
      {
        test: [/\.gif$/, /\.jpe?g$/, /\.png$/],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            }
          }
        ]
      },
      {
        test: [/\.svg$/, /\.ttf$/],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            }
          }
        ]
      },
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
    new MiniCssExtractPlugin({
      filename: '/static/css/[name].[hash:8].css',
      chunkFilename: '/static/css/[name].[hash:8].css',
    }),
  ]
};

// TODO: investigate how to do this with the mode argument
// https://github.com/webpack/webpack/issues/6460
if (JSON.stringify(process.env.NODE_ENV) === `"production"`) {
  config.module.rules.push({
    test: /\.(s)*css$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader
      },
      {
        loader: 'css-loader'
      },
      {
        loader: 'postcss-loader'
      },
      {
        loader: 'sass-loader'
      },
    ]
  });
} else {
  config.module.rules.push({
    test: /\.(s)*css$/,
    use: [
      {
        loader: 'style-loader'
      },
      {
        loader: 'css-loader'
      },
      {
        loader: 'postcss-loader'
      },
      {
        loader: 'sass-loader'
      },
    ]
  });
}

module.exports = config;
