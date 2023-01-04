const { src, dest, watch, series } = require('gulp');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const browsersync = require('browser-sync').create();

// Sass Task
function lessTask(){
	return src('src/*.less', { sourcemaps: true })
		.pipe(less())
		.pipe(dest('static/css', { sourcemaps: '.' }));
  }

  function browsersyncServe(cb){
	browsersync.init({
	  server: {
		baseDir: '.'
	  }    
	});
	cb();
  }

  function browsersyncReload(cb){
	browsersync.reload();
	cb();

  }// Default Gulp Task

  // Watch Task
function watchTask(){
	watch('*.html', browsersyncReload);
	watch(['src/*.less'], series(lessTask, browsersyncReload));
  }

exports.default = series(
	lessTask,
	browsersyncServe,
	watchTask
  );