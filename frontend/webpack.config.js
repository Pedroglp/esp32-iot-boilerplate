const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpackMockServer = require("webpack-mock-server");

module.exports = {
  mode: 'production',

  target: ['web', 'es5'],

  entry: {
    main: './src/script.js',
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'src'),
    },
    setupMiddlewares: (middlewares, devServer) => {
      webpackMockServer.use(devServer.app, {
        port: (devServer.options.port || 8080) + 1,
      });
      return middlewares;
    },
    watchFiles: ['src/**/*'],
    port: 8080,
  },

  output: {
    filename: 'script.js',
    path: path.resolve(__dirname, '../data'),
  },

  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin(),
    ],
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.(?:png|jpg|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/[name].[ext]',
            }
          },
        ]
      }
    ],
  },
  // Plugins
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new HtmlWebpackPlugin({
      filename: "../data/index.html",
      template: path.resolve(__dirname, "./src/index.html"),
    })
  ],
};