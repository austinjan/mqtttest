const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");
const proxy = require("http-proxy-middleware");
module.exports = {
  //context: path.resolve(__dirname, "src"),
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      components: path.resolve(__dirname, "src/components/"),
      asset: path.resolve(__dirname, "src/asset/"),
      apis: path.resolve(__dirname, "src/apis/"),
      src: path.resolve(__dirname, "src")
    }
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./public/index.html",
      filename: "./index.html"
    })
  ]
};
