var path = require("path");
module.exports = {
  entry: './index.js',
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "dist/",
    filename: "msgflo.js",
    library: 'msgflo',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: "coffee-loader" },
    ]
  },
  resolve: {
    extensions: [".coffee", ".js"]
  },
};
