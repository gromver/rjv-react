const gulp = require('gulp')
const path = require('path')
const ts = require('gulp-typescript')
const sourcemaps = require('gulp-sourcemaps')
const merge2 = require('merge2')

const buildModule = gulp.series(
  gulp.parallel([
    function buildCjs() {
      const tsProject = ts.createProject(
        path.resolve(__dirname, 'tsconfig.json'),
        {
          module: 'commonjs',
        }
      )
      const tsResult = tsProject
        .src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())

      const jsPipe = tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/cjs'))
      const dtsPipe = tsResult.dts.pipe(gulp.dest('dist/cjs'))

      return merge2([jsPipe, dtsPipe])
    },
    function buildEsm() {
      const tsProject = ts.createProject(
        path.resolve(__dirname, 'tsconfig.json')
      )
      const tsResult = tsProject
        .src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())

      const jsPipe = tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/esm'))
      const dtsPipe = tsResult.dts.pipe(gulp.dest('dist/esm'))

      return merge2([jsPipe, dtsPipe])
    },
  ]),
)

gulp.task('build', buildModule)

const watcher = () => {
  gulp.watch(['src/**/*.ts?(x)'], buildModule)
}

gulp.task('dev', watcher)
