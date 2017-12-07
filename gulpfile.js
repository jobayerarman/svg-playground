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
var webpackStream = require('webpack-stream');
var webpack       = webpackStream.webpack;

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
const named      = require('vinyl-named');
var plumber      = require('gulp-plumber');
const path       = require('path');
const gprint     = require('gulp-print');
var replace      = require('gulp-replace');
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
  user: {
    srcfiles: './src/js/user/user.js',
    destPath: './dist/js/',
    destFiles: './dist/js/*.+(js|map)',
  },
  vendor: {}
};

// HTML folders and files
var html = {
  src: {
    path      : './src/site/',
    pages     : './src/site/pages/*.+(html|njk)',
    files     : './src/site/**/*.+(html|njk)',
    templates : './src/site/templates/'
  },
  dest: {
    path      : './',
    files     : '*.html'
  }
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
  * Task: `build:scripts`.
  *
  * Concatenate and uglify vendor and user scripts.
  *
  */
gulp.task('build:appJs', ['clean:js'], () => {
  let options = {
    output: {
      publicPath: './dist/js/',
      filename: config.production ? '[name]-[chunkhash:10].js' : '[name].js'
    },

    devtool: config.production ? null : 'cheap-module-inline-source-map',

    module:  {
      loaders: [{
        test: /\.js$/,
        include: path.join(__dirname, 'src/js/user/'),
        loader: 'babel-loader?presets[]=es2015'
      }]
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin()
    ]
  };

  return gulp.src(script.user.srcfiles)
    .pipe(plumber({errorHandler: errorLog}))
    .pipe(named())
    .pipe(webpackStream(options))
    .pipe(gulp.dest(script.user.destPath));
});

/**
  * Task: `build:vendorJs`.
  *
  * Concatenate and uglify vendor and user scripts.
  *
  */


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
 * Datestamp for cache busting
 */
var getDate = function() {
  var myDate = new Date();

  var myYear    = myDate.getFullYear().toString();
  var myMonth   = ('0' + (myDate.getMonth() + 1)).slice(-2);
  var myDay     = ('0' + myDate.getDate()).slice(-2);
  var mySeconds = myDate.getSeconds().toString();

  var dateStamp = myYear + myMonth + myDay + mySeconds;

  return dateStamp;
};
/**
 * Task: render HTML template
 */
gulp.task( 'render:html', function() {
  var date = getDate();
  var cacheBust = lazypipe()
    .pipe( replace, /(dist)(.*)(\.)(css|js)/g, '$1$2$3$4?' + date );

  return gulp.src( html.src.pages )
    .pipe( plumber({errorHandler: errorLog}) )
    .pipe( htmlRender({
      path: html.src.templates
    }))
    .pipe( gulpif( config.production, processhtml() ) )
    .pipe( gulpif( config.production, cacheBust() ) )
    .pipe( gulp.dest( html.dest.path ))
    .pipe( size({
      showFiles: true
    }) );
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
