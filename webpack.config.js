const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: "development",
    entry: "./src/app/app.ts",
    output: {
        path: path.resolve(__dirname, "dist/"),
        filename: "bundle.js",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
    ],
    devServer: {
        contentBase: "./src",
        stats: {
            warnings: true,
            errors: true,
            modules: false,
        }
    },
}