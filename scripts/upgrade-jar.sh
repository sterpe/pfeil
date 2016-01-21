#!/bin/sh

rm -rf ./lib/jar
mkdir -p ./lib/jar

curl -LSo ./lib/jar/compiler-latest.zip \
	http://dl.google.com/closure-compiler/compiler-latest.zip
unzip ./lib/jar/compiler-latest.zip -d ./lib/jar
