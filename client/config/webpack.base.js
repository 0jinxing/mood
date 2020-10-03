const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',

  entry: path.resolve('src', 'index.ts'),

  output: {
    publicPath: '/',
    path: path.resolve('dist'),
    filename: '[name].[hash:8].js'
  },

  module: {
    rules: [
      {
        test: /.tsx?$/i,
        use: ['babel-loader', 'ts-loader']
      },
      {
        test: /.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
        include: [/node_modules/, /global\.s?css/]
      },
      {
        test: /.s?css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { modules: true } },
          'sass-loader'
        ],
        exclude: [/node_modules/, /global\.s?css/]
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: [{ loader: 'url-loader', options: { limit: 8192 } }]
      }
    ]
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve('src')
    }
  },

  plugins: [
    new webpack.EnvironmentPlugin(['URL_PREFIX']),

    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css'
    }),

    new HtmlPlugin({
      template: path.resolve('public/index.html'),
      filename: 'index.html',
      hash: true
    })
  ],

  devServer: {
    contentBase: path.resolve('dist'),
    compress: true,
    hot: true,
    historyApiFallback: true,
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        // target: 'https://report.ghoo.cc',
        secure: false,
        changeOrigin: true
      }
    }
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        common: {
          test: module => [/react/, /redux/].some(r => r.test(module.context)),
          name: 'common',
          priority: 1000
        },
        rc: {
          test: module => /rc-[a-z-]+/.test(module.context),
          name: 'rc',
          priority: 100
        },
        antd: {
          test: module =>
            /antd/.test(module.context) || /@ant-design/.test(module.context),
          name: 'antd',
          priority: 10
        },
        vendor: {
          test: /node_modules/,
          name: 'vendor',
          priority: 1
        }
      }
    }
  }
};
