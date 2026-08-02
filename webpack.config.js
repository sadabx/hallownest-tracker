const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (_env, argv) => ({
  entry: "./src/index.js",
  mode: argv.mode || "development",
  devtool: argv.mode === "production" ? false : "source-map",
  optimization: { minimize: argv.mode === "production" },
  performance: { hints: false },
  output: {
    path: `${__dirname}/docs`,
    filename: "app.js",
    assetModuleFilename: "assets/[name][ext]"
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: "main.css" }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      favicon: "./src/favicon.png",
      minify: argv.mode === "production"
    }),
    ...(argv.mode === "production" ? [new CssMinimizerPlugin()] : [])
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: { presets: ["@babel/preset-env"] }
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(svg|jpg|png|ttf|eot|woff|woff2)$/,
        type: "asset"
      }
    ]
  }
});
