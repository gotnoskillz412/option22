'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

// Run linter on javascript
gulp.task('lint', () => {
	return gulp.src(['**/*.js','!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

// Concatinate and uglify javascript
gulp.task('js', () => {
	return gulp.src('lib/**/*.js')
		.pipe(concat('main.js'))
		.pipe(gulp.dest('dist'))
		.pipe(rename('main.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
	gulp.watch('lib/*/**.js', ['lint', 'js']);
});

gulp.task('default', ['lint', 'js', 'watch']);
