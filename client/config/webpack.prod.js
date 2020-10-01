const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');

const baseConfig = require('./webpack.base');

module.exports = merge(baseConfig, {
  mode: 'production',

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: { ecma: 8 },

          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2
          },

          mangle: { safari10: true },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true
          }
        },
        sourceMap: true
      }),

      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: { parser: safePostCssParser },
        cssProcessorPluginOptions: {
          preset: ['default', { minifyFontValues: { removeQuotes: false } }]
        }
      })
    ]
  }
});
