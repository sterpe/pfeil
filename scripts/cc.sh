#!/bin/sh
java -jar lib/jar/compiler.jar \
	--compilation_level ADVANCED_OPTIMIZATIONS \
	--js_output_file dist/pfeil.min.js \
	--externs lib/externs.js \
	--jscomp_off uselessCode \
	--output_wrapper '(function(){%output%}());' \
	dist/pfeil.js
