const path = require('path');
const webpack = require('webpack');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
	devtool: false,
	mode: 'production',
	entry: [
		'babel-polyfill',
		'./js/client',
	],
	output: {
		path: path.join(__dirname, 'build', 'js'),
		filename: 'bundle.js',
		publicPath: '/js',
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			app: path.resolve(__dirname, './js/common'),

			// To remove unused modules from xanda-components
			'draft-js': '@xanda/react-components/lib/NoResults.js',
			'draftjs-to-html': '@xanda/react-components/lib/NoResults.js',
			'rc-time-picker': '@xanda/react-components/lib/NoResults.js',
			'react-datepicker"': '@xanda/react-components/lib/NoResults.js',
			'react-draft-wysiwyg': '@xanda/react-components/lib/NoResults.js',
			'react-google-maps': '@xanda/react-components/lib/NoResults.js',
			'react-tinymce': '@xanda/react-components/lib/NoResults.js',
			'react-slider': '@xanda/react-components/lib/NoResults.js',
		},
	},
	optimization: {
		nodeEnv: 'production',
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.RELEASE_STAGE': JSON.stringify(process.env.RELEASE_STAGE),
		}),
		// new BundleAnalyzerPlugin(),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	],
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: [/node_modules/],
				use: 'babel-loader',
				include: path.join(__dirname, 'js'),
			},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: 'url-loader?limit=10000&minetype=application/font-woff',
			},
			{
				test: /\.(ttf|eot|svg|jpg|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: 'file-loader',
			},
			{
				test: /\.scss?/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
				include: path.join(__dirname, 'sass'),
			},
		],
	},
};
