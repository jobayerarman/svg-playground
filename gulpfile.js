/**
 * Load Plugins.
 *
 * Load gulp plugins and assigning them semantic names
 */
var gulp         = require('gulp');
var gutil        = require('gulp-util');

// CSS plugins
var sass         = require('gulp-sass');
var cleancss     = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps   = require('gulp-sourcemaps');

// JS plugins
var babel        = require('gulp-babel');
var eslint       = require('gulp-eslint');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');

// HTML template engine
var htmlRender   = require('gulp-nunjucks-render');
var processhtml  = require('gulp-processhtml');

// Utility plugins
var browserSync  = require('browser-sync').create();
var reload       = browserSync.reload;
var del          = require('del');
var filter       = require('gulp-filter');
var gulpif       = require('gulp-if');
var gulpSequence = require('gulp-sequence');
var lazypipe     = require('lazypipe');
var plumber      = require('gulp-plumber');
var size         = require('gulp-size');

// Style related
var style = {
  src: './src/scss/main.scss',
  dest: './dist/css/',
  destFiles: './dist/css/*.+(css|map)'
};
// Browsers you care about for autoprefixing.
// Browserlist https://github.com/ai/browserslist
const AUTOPREFIXER_BROWSERS = [
  'android >= 4',
  'bb >= 10',
  'chrome >= 34',
  'ff >= 30',
  'ie >= 9',
  'ie_mob >= 10',
  'ios >= 7',
  'opera >= 23',
  'safari >= 7',
];

// Script folders and files
var script = {
  user: {},
  vendor: {}
};

var config = {
  production: !!gutil.env.production, // Two exclamations turn undefined into a proper false.
  sourceMaps:  !gutil.env.production
};

/**
 * Notify Errors
 */
function errorLog(error) {
  // Pretty error reporting
  var report = '';
  var chalk = gutil.colors.white.bgRed;

  report += chalk('TASK:') + ' [' + error.plugin + ']\n';
  report += chalk('ERRR:') + ' ' + error.message + '\n';
  if (error.lineNumber) { report += chalk('LINE:') + ' ' + error.lineNumber + '\n'; }
  if (error.column)     { report += chalk('COL:') + '  ' + error.column + '\n'; }
  if (error.fileName)   { report += chalk('FILE:') + ' ' + error.fileName + '\n'; }
  console.error(report);

  this.emit('end');
};

/**
 * Task: Cleanup
 *
 * Cleans destination files
 */
gulp.task('clean:css', function () {
  return del([style.destFiles]);
});
gulp.task('clean:js', function () {
  return del([script.user.destFiles]);
});
gulp.task('clean:all', gulpSequence('clean:css', 'clean:js'));

/**
 * Task: `styles`.
 *
 * Compiles SCSS, Autoprefixes it and Minifies CSS.
 *
 */
var minifyCss = lazypipe()
  .pipe(cleancss, {keepSpecialComments: false});

gulp.task('build:css', ['clean:css'], function() {
  return gulp.src(style.src)
    .pipe(plumber({errorHandler: errorLog}))
    .pipe(gulpif(config.sourceMaps, sourcemaps.init()))

    .pipe(sass().on('error', sass.logError))

    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulpif(config.sourceMaps, sourcemaps.write('.')))

    .pipe(gulpif(config.production, minifyCss()))
    .pipe(gulp.dest(style.dest))

    .pipe(filter('**/*.css'))
    .pipe(browserSync.stream())
    .pipe(size({showFiles: true}));
});

/**
 * Task: `browser-sync`.
 */
gulp.task( 'browser-sync', function() {
  browserSync.init( {

    // built-in static server for basic HTML/JS/CSS websites
    server: true,

    // Will not attempt to determine your network status, assumes you're ONLINE
    online: true,

    // Open the site in Chrome
    browser: 'chrome.exe',

    // `true` Automatically open the browser with BrowserSync live server.
    // `false` Stop the browser from automatically opening.
    open: false,

    // Console log connections
    logConnections: true,

    // The small pop-over notifications in the browser are not always needed/wanted
    notify: true,
  });
});
