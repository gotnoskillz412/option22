'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const del = require('del');
const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const nodemon = require('gulp-nodemon');

gulp.task('clean', () => {
	return del(['dist']);
});

// Run linter on javascript
gulp.task('lint', ['clean'], () => {
	return gulp.src(['**/*.js','!node_modules/**', '!gulpfile.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

// Concatinate and uglify javascript
gulp.task('js', ['clean', 'lint'], () => {
	return gulp.src('src/**/*.js')
		.pipe(gulpWebpack({
			target: 'node',
			externals: [nodeExternals()],
			module: {
				loaders: [{
					loader: 'babel-loader',
					test: /\.js$/,
					query: {
						presets: ['es2015']
					}
				},
					{
						loader: 'json-loader',
						test: /\.json$/
					}]
			},
			output: {
				filename: 'main.js'
			},
			plugins: [new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false
				},
				output: {
					comments: false,
					semicolons: true
				}
			})]
		}))
		.pipe(gulp.dest('dist/js'))
});

// web pack

// Serve up the files
gulp.task('start', ['clean', 'js'], () => {
	const stream = process.env.NODE_ENV === 'production' ? nodemon({
		script: 'dist/js/main.js',
		ext: 'html js',
		ignore: 'dist/js/main.js',
		tasks: ['clean', 'lint', 'js']
	}) : nodemon({
				script: 'src/app.js',
				ext: 'html js',
				ignore: 'src/app.js',
				tasks: ['lint', 'js']
			});

	stream
		.on('restart', function () {
			console.log('restarted!')
		})
		.on('crash', function() {
			console.error('Application has crashed!\n');
			stream.emit('restart', 10);  // restart the server in 10 seconds
		});
});

gulp.task('build', ['clean', 'lint', 'js']);
gulp.task('serve', ['clean', 'lint', 'js', 'start']);
gulp.task('default', ['clean', 'lint', 'js']);

