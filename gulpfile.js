import { task, src, dest, watch, series } from 'gulp';
import sass, { logError } from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';

task('sass', function () {
    return src('./src/scss/**/*.scss')
      .pipe(sass().on('error', logError))
      .pipe(autoprefixer())
      .pipe(dest('./public/css'));
});

task('default', function () {
    watch('./src/scss/**/*.scss', series('sass'));
});