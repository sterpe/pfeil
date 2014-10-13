var gulp = require('gulp')
, child_process = require('child_process')
, browserify = require('browserify')
, vinylSourceStream = require('vinyl-source-stream')
, rimraf = require('rimraf')
, chmod = require('gulp-chmod')
;

gulp.task('clean', function (cb) {
	rimraf('./dist', cb);
});

gulp.task('bundle', ['clean'], function () {
	return browserify({
			entries: './index.js'
			, detectGlobals: false
    			, standalone: 'pfeil.defer'
		})
		.bundle()
		.on('error', function (e) {
			console.log(e);
			process.exit(1);
		})
		.pipe(vinylSourceStream('pfeil.js'))
		.pipe(chmod(644))
		.pipe(gulp.dest('./dist'))
});

gulp.task('closure-compile', ['bundle'], function (cb) {
	var spawn = child_process.spawn
	, child = spawn('java', [
		'-jar'
		, './bin/closure-compiler/compiler.jar'
		, '--compilation_level'
		, 'ADVANCED_OPTIMIZATIONS'
		, '--js_output_file'
		, './dist/pfeil.min.js'
		, '--externs'
		, './lib/externs.js'
		, '--jscomp_off'
		, 'uselessCode'
		, '--output_wrapper'
		, '(function(){%output%}());'
		, './dist/pfeil.js'
	], {
		stdio: "inherit"
	})
	;
	
	child.on('close', cb);
});

gulp.task('test', ['closure-compile'], function (cb) {
	var spawn = child_process.spawn
	, child
	;
	child = spawn('npm', ['test'], {
		stdio: "inherit"
	});
	child.on('close', function (err) {
		console.log('test exited with code ' + err + '.');
		cb(err);
	});
});

gulp.task('default', ['closure-compile']);
