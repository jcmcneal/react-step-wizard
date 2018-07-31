module.exports = {
    entry: './src/index.js',
    output: {
        path: `${__dirname}/dist`,
        filename: 'bundle.js',
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
                use: [
                    'style-loader',
                    'css-loader?modules&importLoaders=1',
                ],
            },
        ],
    },
};
