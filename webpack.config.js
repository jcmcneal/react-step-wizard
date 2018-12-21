// "dev": "webpack --watch --mode=development",
// "build": "export NODE_ENV=production; webpack --progress --optimize-minimize --mode=production",
const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const args = require('minimist')(process.argv);
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const app = require('./package.json');

const isProd = process.env.NODE_ENV === 'production';

const config = {
    entry: './src/index.js',
    output: {
        path: path.resolve('dist'),
        filename: path.basename(app.main),
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this',
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                include: path.resolve('src/index.js'),
                loader: 'eslint-loader',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                /** Globals */
                test: /(\.css)$/,
                use: [{
                    // https://www.npmjs.com/package/iso-morphic-style-loader
                    loader: 'iso-morphic-style-loader',
                }, {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        importLoaders: 1,
                        sourceMap: false,
                        localIdentName: '[local]_[hash:base64:5]',
                    },
                }],
            },
            {
                test: /(\.less)$/,
                use: [
                    {
                        // https://www.npmjs.com/package/iso-morphic-style-loader
                        loader: 'iso-morphic-style-loader',
                        options: {
                            singleton: true,
                        },
                    },
                    'css-loader?modules&importLoaders=1&localIdentName=[local]_[hash:base64:5]',
                    'less-loader',
                ],
            },
        ],
    },
    /** Don't bundle common dependencies */
    externals: [
        'prop-types',
        'react-dom',
        'react',
    ],
    node: {
        Buffer: false,
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    cache: true,
                    parallel: true,
                    sourceMap: true,
                    uglifyOptions: {
                        output: {
                            comments: false,
                        },
                    },
                },
            }),
            new OptimizeCSSAssetsPlugin({}),
        ],
    },
    plugins: [],
    stats: {
        builtAt: false,
        hash: false,
        modules: false,
        version: false,
        warnings: false,
    },
};

if (isProd) {
    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
    );
}

// Analyze bundle with --analyze flag
if (args.analyze) config.plugins.push(new BundleAnalyzerPlugin());

module.exports = config;
