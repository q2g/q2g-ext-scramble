var gulp = require("gulp");
var less = require("gulp-less");
var path = require("path");
var clean = require("gulp-clean");
 
gulp.task("removePlaceholder", function () {
    return gulp.src("placeholder", {read: false})
        .pipe(clean());
});

gulp.task("less", function () {
  return gulp.src(["./*.less"], { base: "./src/" })
    .pipe(less())
    .pipe(gulp.dest("./src/"));
});