const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

/** Is Development */
const isDev = process.env.NODE_ENV !== 'production';

/** Config */
const config = {
    entry: path.join(__dirname, 'src/index.js'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: ['node_modules'],
                loader: 'babel-loader',
            },
            {
                /** Globals */
                test: /(\.css)$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /(\.less)$/,
                use: [
                    'style-loader',
                    'css-loader?modules&localIdentName=[local]_[hash:base64:5]',
                    'less-loader',
                ],
            },
        ],
    },
    stats: {
        warnings: false,
    },
};

/** Development */
if (isDev) {
    config.output.publicPath = 'http://localhost:8080/dist/';
    config.devServer = {
        compress: true,
        index: 'index.html',
        overlay: {
            warnings: false,
            errors: true,
        },
        publicPath: 'http://localhost:8080/dist/',
    };
    config.optimization = {
        minimize: false,
    };
} else {
    /** Prod */
    config.plugins = [
        new UglifyJsPlugin({
            uglifyOptions: {
                mangle: true,
                compress: {
                    warnings: false,
                    pure_getters: true,
                    unsafe: true,
                    unsafe_comps: true,
                },
                output: {
                    comments: false,
                },
            },
        }),
    ];
}

/** Export */
module.exports = config;
