var path = require("path");
var webpack = require("webpack");
module.exports = {
	cache: true,
  entry: './index.js',
	output: {
		path: path.join(__dirname, "dist"),
		publicPath: "dist/",
		filename: "msgflo.js",
        library: 'msgflo',
        libraryTarget: 'umd'
	},
  externals: [function (context,req,cb) {
      !/^\./.test(req)
        ? cb(null,req)
        : cb(null,false);
  }],
	module: {
		loaders: [
            { test: /\.coffee$/, loader: "coffee-loader" },
		]
	},
	resolve: {
        extensions: [".coffee", ".js",]
	},
	plugins: [
        // none
	]
};
