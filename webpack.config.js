var path = require("path");
var webpack = require("webpack");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const isDevEnv = process.env.ENV.indexOf("dev") > -1 || process.env.ENV.indexOf("local") > -1;
const compileMode = isDevEnv ? "development" : "production";
const sourceMap = isDevEnv ? "inline-source-map" : false;
const allowComments = isDevEnv;
const dropConsole = !isDevEnv;
const outputName = process.env.NAME;

const commonSetup = {
    mode: compileMode,
    devtool: sourceMap,
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "nzl_fwk": path.resolve("./node_modules/nzl_fwk")
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.html$/,
                use: ["html-loader"]
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({
            uglifyOptions: {
                output: {
                    comments: allowComments
                },
                compress: {
                    drop_console: dropConsole
                }
            }
        })]
    }
};

module.exports = [
    Object.assign({}, commonSetup, {
        entry: {
            app: [
                "./src/ts/index.ts",
                "./src/scss/index.scss"
            ]
        },
        output: {
            path: path.resolve(__dirname, `dist/${outputName}`),
            filename: "index.js"
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "index.css",
                chunkFilename: "[id].css"
            }),
            new HtmlWebpackPlugin({
                filename: "index.html",
                template: "src/index.html",
                inject: "body",
                hash: true,
                title: "Testiram"
            }),
            new HtmlWebpackPlugin({
                filename: "index.php",
                template: "src/index.php",
                inject: "body",
                hash: true,
                title: "Testiram"
            }),
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: [`dist/${outputName}`]
            })
        ]
    }),
    Object.assign({}, commonSetup, {
        entry: [
            "./src/ts/main.tsx",
            "./src/scss/main.scss"
        ],
        output: {
            path: path.resolve(__dirname, `dist/${outputName}`),
            filename: "bundle.js"
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env.GAME_ID": JSON.stringify(process.env.npm_package_gameId),
                "process.env.ENV": JSON.stringify(process.env.ENV),
                "process.env.AFF_NAME": JSON.stringify(process.env.AFF_NAME)
            }),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"
            }),
            new MiniCssExtractPlugin({
                filename: "main.css",
                chunkFilename: "[id].css"
            }),
            new HtmlWebpackPlugin({
                filename: "game.html",
                template: "src/game.html",
                inject: "body",
                hash: true,
                title: process.env.npm_package_gameName
            }),
            new HtmlWebpackPlugin({
                filename: "game.php",
                template: "src/game.php",
                inject: "body",
                hash: true,
                title: process.env.npm_package_gameName
            }),
            new CopyPlugin({
                patterns: [
                    { from: "src/assets/", to: "assets/" }
                ]
            }),
            new Dotenv()
        ]
    })
];
