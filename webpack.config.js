const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const outputPath = path.resolve(__dirname, 'docs');

module.exports = (_, argv = {}) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/js/app.js',
    output: {
      filename: 'static/js/[name].[contenthash:8].js',
      assetModuleFilename: 'static/media/[name].[contenthash:8][ext]',
      clean: true,
      publicPath: '',
      path: outputPath,
    },
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: 'html-loader',
        },
        {
          test: /\.(png|jpe?g|gif|ico|svg|ttf)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.s?css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                url: false,
              },
            },
            'sass-loader',
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: './src/index.html',
        filename: 'index.html',
      }),
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
      }),
      new CopyPlugin({
        patterns: [
          { from: './src/css/6Lqr2qFxkUV.png', to: 'static/media/6Lqr2qFxkUV.png' },
          { from: './src/css/BU-tAT0mj14.png', to: 'static/media/BU-tAT0mj14.png' },
          { from: './src/css/background.png', to: 'static/media/background.png' },
          { from: './src/images/preview.png', to: 'static/media/preview.png' },
        ],
      }),
    ],
  };
};
