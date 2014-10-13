var gulp = require('gulp')
, child_process = require('child_process')
, browserify = require('browserify')
, vinylSourceStream = require('vinyl-source-stream')
, rimraf = require('rimraf')
;

gulp.task('clean', function (cb) {
	rimraf('./dist', cb);
});

gulp.task('bundle', ['clean'], function () {
	return browserify({
			entries: './index.js'
			, detectGlobals: false
			, standalone: 'pfeil'
		})
		.bundle()
		.on('error', function (e) {
			console.log(e);
			process.exit(1);
		})
		.pipe(vinylSourceStream('pfeil.js'))
		.pipe(gulp.dest('./dist'))
});

gulp.task('test', function (cb) {
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

gulp.task('default', ['bundle']);
