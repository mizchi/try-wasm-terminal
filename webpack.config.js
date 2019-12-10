const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: path.join(__dirname, "src/index.tsx"),
    worker: path.join(__dirname, "src/worker.ts")
  },
  output: {},
  resolve: {
    extensions: [".js", ".wasm", ".json", ".tsx", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlPlugin({
      template: path.join(__dirname, "src/index.html"),
      inject: false
    })
  ]
};
