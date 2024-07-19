// "dev": "webpack --watch --mode=development",
// "build": "export NODE_ENV=production; webpack --progress --optimize-minimize --mode=production",
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const args = require('minimist')(process.argv);
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const app = require('./package.json');

const isProd = process.env.NODE_ENV === 'production';

const config = {
    entry: './src/index.tsx',
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
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                /** Globals */
                test: /(\.css)$/,
                use: [{
                    loader: 'style-loader',
                }, {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName: "[local]",
                        },
                    },
                }],
            },
            {
                test: /(\.less)$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            singleton: true,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: "[local]_[hash:base64:5]",
                            },
                            importLoaders: 1,
                            sourceMap: false,
                        },
                    },
                    'less-loader',
                ],
            },
        ],
    },
    /** Don't bundle common dependencies */
    externals: [
        'react-dom',
        'react',
    ],
    node: {
        Buffer: false,
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false
                    }
                },
                extractComments: false
            }),
        ],
    },
    plugins: [
        new TsconfigPathsPlugin({
            configFile: path.resolve(__dirname, './tsconfig.json'),
        }),
    ],
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
