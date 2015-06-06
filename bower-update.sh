#!/bin/sh
rm -rf bower_components; 
bower install;
cp bower_components/ui-router-extras/release/ct-ui-router-extras.js lib
cp bower_components/ui-router-extras/release/modular/*.js lib/modular
cp bower_components/angular/angular.js lib
cp bower_components/angular-ui-router/release/angular-ui-router.js lib
cp bower_components/jquery/dist/jquery.js lib
cp bower_components/angularAMD/angularAMD.js lib
cp bower_components/angularAMD/ngload.js lib
cp bower_components/d3/d3.js lib
cp bower_components/lodash/lodash.js lib
