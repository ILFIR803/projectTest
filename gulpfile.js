"use strict"

const { stream } = require("browser-sync");

const {src, dest} = require("gulp"),
      gulp = require("gulp"),
      autoprefixer = require("gulp-autoprefixer"),
      cssbeautify = require("gulp-cssbeautify"),
      cssnano = require("gulp-cssnano"),
      imagemin = require("gulp-imagemin"),
      plumber = require("gulp-plumber"),
      rename = require("gulp-rename"),
      panini = require("panini"),
      rigger = require("gulp-rigger"),
      sass = require("gulp-sass")(require("sass")),
      removeComments = require("gulp-strip-css-comments"),
      uglify = require("gulp-uglify"),
      del = require("del"),
      notify = require("gulp-notify"),
      browserSync = require("browser-sync").create();

/* Paths*/
const srcPath = "src"
const distPath = "docs"

const path = {
   build: {
      html: distPath + "/",
      css: distPath + "/assets/css/",
      js: distPath + "/assets/js/",
      images: distPath + "/assets/images/",
      fonts: distPath + "/assets/fonts/"
   },
   src: {
      html: srcPath + "/*.html",
      css: srcPath + "/assets/scss/*.scss",
      js: srcPath + "/assets/js/*.js",
      images: srcPath + "/assets/images/**/*.{jpg,jpeg,svg,png,webp,xml,gif,ico,json}",
      fonts: srcPath + "/assets/fonts/**/*.{eot,woof,woof2,ttf,svg}",
   },
   watch: {
      html: srcPath + "/**/*.html",
      css: srcPath + "/assets/scss/**/*.scss",
      js: srcPath + "/assets/js/**/*.js",
      images: srcPath + "/assets/images/**/*.{jpg,jpeg,svg,png,webp,xml,gif,ico,json}",
      fonts: srcPath + "/assets/fonts/**/*.{eot,woof,woof2,ttf,svg}",
   }, 
   clean: "./" + distPath
}

function serve() {
   browserSync.init({
      server: {
         baseDir: "./" + distPath
      }
   });
}

function html() {
   panini.refresh()
   return src(path.src.html, {base: srcPath})
      .pipe(plumber())
      .pipe(panini({
         root: srcPath,
         layouts: srcPath + "/tpl/layouts/",
         partials: srcPath + "/tpl/partials/"
      }))
      .pipe(dest(path.build.html))
      .pipe(browserSync.reload({stream: true}));
}

function css() {
   return src(path.src.css, {base: srcPath + "/assets/scss/"})
      .pipe(plumber({
         errorHandler : function(err) {
            notify.onError({
               title: "SCSS Error",
               message: "Error: <%= error.message %>"
            })(err);
            this.emit('end');
         }
      }))
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(cssbeautify())
      .pipe(dest(path.build.css))
      .pipe(cssnano({
         zindex: false,
         discardComments: {
            removeAll: true
         }
      }))
      .pipe(removeComments())
      .pipe(rename({
         suffix: ".min",
         extname: ".css"
      }))
      .pipe(dest(path.build.css))
      .pipe(browserSync.reload({stream: true}));
}

function js() {
   return src(path.src.js, {base: srcPath + "/assets/js/"})
      .pipe(plumber({
         errorHandler : function(err) {
            notify.onError({
               title: "JS Error",
               message: "Error: <%= error.message %>"
            })(err);
            this.emit('end');
         }
      }))
      .pipe(rigger())
      .pipe(dest(path.build.js))
      .pipe(uglify())
      .pipe(rename({
         suffix: ".min",
         extname: ".js"
      }))
      .pipe(dest(path.build.js))
      .pipe(browserSync.reload({stream: true}));
}

function images() {
   return src(path.src.images, {base: srcPath + "/assets/images/"})
      .pipe(imagemin([
         imagemin.gifsicle({interlaced: true}),
         imagemin.mozjpeg({quality: 85, progressive: true}),
         imagemin.optipng({optimizationLevel: 5}),
         imagemin.svgo({
            plugins: [
               {removeViewBox: true},
               {cleanupIDs: false}
            ]
         })
      ]))
      .pipe(dest(path.build.images))
      .pipe(browserSync.reload({stream: true}));
}

function clean() {
   return del(path.clean)
}

function fonts() {
   return src(path.src.fonts, {base: srcPath + "/assets/fonts/"})
      .pipe(browserSync.reload({stream: true}));
}

function watchFiles() {
   gulp.watch([path.watch.html], html)
   gulp.watch([path.watch.css], css)
   gulp.watch([path.watch.js], js)
   gulp.watch([path.watch.images], images)
   gulp.watch([path.watch.fonts], fonts)
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts))

const watch = gulp.parallel(build, watchFiles,serve)

exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.fonts = fonts
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch



