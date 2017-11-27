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
  externals: {
    'newrelic': 'commonjs newrelic', // optional in msgflo-nodejs, causes all files to be included if not externalized
    'tv4': 'commonjs tv4', // optional in fbp, causes warning
    'amqplib/callback_api': 'commonjs amqplib/callback_api', // optional in fbp, causes warning
    'mqtt': 'commonjs mqtt', // optional in fbp, causes bloated file
  },
  resolve: {
    extensions: [".js"]
  },
  node: {
    fs: 'empty',
  }
};
