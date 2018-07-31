const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: `${__dirname}/dist`,
        filename: 'react-step-wizard.min.js',
        libraryTarget: 'umd',
        publicPath: '/dist/',
        umdNamedDefine: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: ['node_modules'],
                loader: 'babel-loader',
            },
            {
                test: /(\.scss|\.css)$/,
                use: [{
                    loader: 'style-loader',
                    options: {
                        hmr: false,
                    },
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
        ],
    },
    externals: {
        // Don't bundle react
        react: {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'React',
            root: 'React',
        },
    },
    node: {
        Buffer: false,
    },
    plugins: [
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
    ],
};
