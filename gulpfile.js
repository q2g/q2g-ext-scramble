var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
  return gulp.src(['./src/**/*.less'], { base: './src/' })
    .pipe(less())
    .pipe(gulp.dest('./src/'));
});

gulp.task('copy-src', function () {
    return gulp.src(['./src/**/*.html',
    './src/**/*.css',
    './src/**/*.js'])
    .pipe(gulp.dest('./dist/src'))
})

gulp.task('copy-node', function () {
    return gulp.src(['./node_modules/davinci.js/**/*'])
    .pipe(gulp.dest('./dist/node_modules/davinci.js'))
})

gulp.task('copy-main', function () {
    return gulp.src(['./q2g-ext-scramble.js',
    './q2g-ext-scramble.qext',
    './LICENSE'])
    .pipe(gulp.dest('./dist'))
})