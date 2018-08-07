const path = require('path');

module.exports = {
    entry: path.join(__dirname, 'src/index.js'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist'),
        publicPath: 'http://localhost:8080/dist/',
    },
    devServer: {
        compress: true,
        index: 'index.html',
        overlay: {
            warnings: false,
            errors: true,
        },
        publicPath: 'http://localhost:8080/dist/',
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
