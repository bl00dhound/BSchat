const gulp = require( 'gulp')
const plumber = require( 'gulp-plumber')
const watch = require( 'gulp-watch')
const sass = require( 'gulp-sass')
const sourcemaps = require( 'gulp-sourcemaps')
const pug = require('gulp-pug')
const babel= require('gulp-babel')
const browserSync = require( 'browser-sync')
const reload = browserSync.reload

const path = {
  build: {
    html: 'dist/',
    css: 'dist/style/',
    img: 'dist/img/',
    js: 'dist/js/'
  },
  src: {
    html: 'src/*.pug',
    style: 'src/style/*.scss',
    img: 'src/img/**/*.+(jpeg|jpg|png|tiff|webp|svg)',
    js: 'src/js/*.js'
  },
  watch: {
    html: 'src/**/*.pug',
    style: 'src/style/**/*.scss',
    img: 'src/img/**/*.*',
    js: 'src/js/**/*.js'
  },
  clean: './dist'
};

const config = {
  server: {
    baseDir: "./dist"
  },
  tunnel: false,
  host: 'localhost',
  port: 9999,
  logPrefix: "front_log"
};


const logErr = function( err){
  console.warn( err);
  this.emit( 'end');
}

gulp.task( 'html:build', function () {
  gulp.src( path.src.html)
    .pipe(pug())
    .pipe( plumber())
    .pipe( gulp.dest( path.build.html))
    .pipe( reload( { stream: true}));
});

gulp.task( 'js:build', function () {
  gulp.src( path.src.js)
    .pipe( babel({
      presets: ['es2015']
    }))
    .pipe( plumber())
    .pipe( sourcemaps.init())
    .pipe( sourcemaps.write())
    .pipe( gulp.dest( path.build.js))
    .pipe( reload( { stream: true}));
});


gulp.task( 'style:build', function () {
  gulp.src( path.src.style)
    .pipe( plumber())
    .pipe( sourcemaps.init())
    .pipe( sass({
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe( sourcemaps.write())
    .pipe( gulp.dest(path.build.css))
    .pipe( reload( { stream: true}));
});


gulp.task('image:build', function () {
  gulp.src( path.src.img)
    .pipe( plumber())
    .pipe( gulp.dest( path.build.img))
    .pipe( reload( { stream: true}));
});


gulp.task('fonts:build', function() {
  gulp.src( path.src.fonts)
    .pipe( plumber())
    .pipe( gulp.dest(path.build.fonts))
});


gulp.task('build', [
  'html:build',
  'style:build',
  'image:build',
  'js:build'
]);


gulp.task('watch', function(){

  watch([path.watch.html], function (event, cb) {
    gulp.start('html:build');
  });
  watch([path.watch.style], function(event, cb) {
    gulp.start('style:build');
  });
  watch([path.watch.js], function(event, cb) {
    gulp.start('js:build');
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start('image:build');
  });
});


gulp.task('webserver', function () {
  browserSync(config);
});


gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});


gulp.task('default', ['build', 'webserver', 'watch']);