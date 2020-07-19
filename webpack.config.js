const path = require("path");

module.exports = {
  mode: "development",
  target: "web",
  entry: {
    record: path.resolve("packages", "record/index.ts"),
    player: path.resolve("packages", "player/index.ts"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    library: "$$[name]",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ts$/i,
        use: ["ts-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
