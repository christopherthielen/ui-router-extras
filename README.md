# Addons for Angular UI-Router:
# Sticky State, Deep State Redirect, Future State

UI-Router is the defacto router for AngularJS.

UI-Router Extras adds 3 additional features to help you write large modular applications.

Full Website (description, API, demos): http://christopherthielen.github.io/ui-router-extras/


## Dependencies
- required:
    - "angular": "~1.2.0",
    - "angular-ui-router": "~0.2.10"

## Install
1. download the files
	1. Bower
		1. add `"ui-router-extras": "latest"` to your `bower.json` file then run `bower install` OR run `bower install ui-router-extras`
2. include the files in your app
	1. `ct-ui-router-extras.min.js`
3. include the module in angular (i.e. in `app.js`) - `ct.ui.router.extras`

## Development

1. `git checkout master`
    1. run `npm install && bower install`
    2. write your code then run `grunt`
    3. git commit your changes
    
The Gruntfile.js default target generates the output files into a build/ directory.  It runs all unit tests on
the built file, as well as the minified file.

