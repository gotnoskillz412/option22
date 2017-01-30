'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const del = require('del');
const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const spawn = require('child_process').spawn;

gulp.task('clean', () => {
	return del(['dist']);
});

// Run linter on javascript
gulp.task('lint', ['clean'], () => {
	return gulp.src(['**/*.js','!node_modules/**'])
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
	if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production'){
		return spawn('node', ['dist/js/main.js'], { stdio: 'inherit' });
	}
	return spawn('node', ['src/app.js'], { stdio: 'inherit' })

});

// Watch Files For Changes
gulp.task('watch', ['clean', 'lint', 'js'], function() {
	gulp.watch('src/*/**.js', ['lint', 'js']);
});

gulp.task('build', ['clean', 'lint', 'js']);
gulp.task('serve', ['clean', 'lint', 'js', 'start', 'watch']);
gulp.task('default', ['watch']);
