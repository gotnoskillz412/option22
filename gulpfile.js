'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const del = require('del');
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
	return gulp.src('lib/**/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(concat('main.js'))
		.pipe(gulp.dest('dist'))
		.pipe(rename('main.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

// Serve up the files
gulp.task('start', ['clean', 'lint', 'js'], () => {
	return spawn('node', ['lib/app.js'], { stdio: 'inherit' });
});

// Watch Files For Changes
gulp.task('watch', ['clean', 'lint', 'js', 'start'], function() {
	gulp.watch('lib/*/**.js', ['lint', 'js']);
});

gulp.task('build', ['clean', 'lint', 'js']);
gulp.task('serve', ['clean', 'lint', 'js', 'start', 'watch']);
gulp.task('default', ['watch']);
