/**
 * Load Plugins.
 *
 * Load gulp plugins and assigning them semantic names.
 */
var gulp         = require('gulp');                  // Gulp of-course
var gutil        = require('gulp-util');             // Utility functions for gulp plugins

// CSS related plugins.
var sass         = require('gulp-sass');             // Gulp pluign for Sass compilation.
var cssmin       = require('gulp-cssmin');           // Minifies CSS files.
var autoprefixer = require('gulp-autoprefixer');     // Autoprefixing magic.
var sourcemaps   = require('gulp-sourcemaps');       // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file.
var stylelint    = require('gulp-stylelint');        // Modern CSS linter and fixer

// JS related plugins.
var babel        = require('gulp-babel');            // Next-gen JavaScript, with Babel
var eslint       = require('gulp-eslint');           // ESLint plugin for gulp
var concat       = require('gulp-concat');           // Concatenates JS files
var uglify       = require('gulp-uglify');           // Minifies JS files

// HTML template engine
var htmlRender   = require('gulp-nunjucks-render');  // Render Nunjucks templates
var processhtml  = require('gulp-processhtml');      // Process html files at build time to modify them depending on the release environment
