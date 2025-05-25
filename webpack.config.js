const path = require('path');

module.exports = {
  entry: {
    getProductsList: './lambda/getProductsList.ts',
    getProductById: './lambda/getProductById.ts',
    createProduct: './lambda/createProduct.ts',
    importProductsFile: './lambda/importProductsFile.ts',
    importFileParser: './lambda/importFileParser.ts',
    catalogBatchProcess: './lambda/catalogBatchProcess.ts',
  },
  target: 'node',
  mode: 'production',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
};
