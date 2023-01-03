// Less configuration
var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();


gulp.task('less', function(cb) {
  gulp
    .src('static/css/*.less')
    .pipe(less())
    .pipe(
      gulp.dest(function(f) {
        return f.base;
      })
    )
    .pipe(livereload());

  cb();
});

gulp.task('less-watch', ['less'], function (done) {
  browserSync.reload();
  done();
});


gulp.task(
  'default',
  gulp.series('less', function(cb) {
    gulp.watch('static/css/*.less', gulp.series('less'))
    // Serve files from the root of this project
      browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch("less/*.less", ['less-watch']);
    cb();
  })
);

