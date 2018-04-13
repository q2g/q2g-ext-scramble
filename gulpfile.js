var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
  return gulp.src(['./src/**/*.less'], { base: './src/' })
    .pipe(less())
    .pipe(gulp.dest('./src/'));
});
