![travis status](https://travis-ci.org/christopherthielen/ui-router-extras.svg?branch=master "Travis Status")

# END OF LIFE NOTICE

UI-Router 1.0 now includes all the features of ui-router-extras out of the box, or as a plugin.
As such, we are no longer actively maintaining ui-router-extras.

We will still accept well written pull requests and publish new releases as pull requests are merged.
However, we're not watching this repository issues like we used to.

For users of sticky states: https://github.com/ui-router/sticky-states

For users of deep state redirect: https://ui-router.github.io/ng1/docs/latest/interfaces/ng1.ng1statedeclaration.html#redirectto and https://github.com/ui-router/dsr

For users of future states: https://ui-router.github.io/ng1/docs/latest/interfaces/ng1.ng1statedeclaration.html#lazyload

For users of previous states: https://github.com/christopherthielen/ui-router-extras/issues/371#issuecomment-331553096


Thank you for using UI-Router Extras!

# Addons for Angular UI-Router:
Full Website (description, API, demos): http://christopherthielen.github.io/ui-router-extras/

UI-Router is the defacto router for AngularJS.

UI-Router Extras adds additional features to help you write large modular applications.
- Sticky State 
- Deep State Redirect 
- Future State
- Previous State
- And More?

## Dependencies
- required:
    - "angular": "~1.2.0" 
    - "angular-ui-router": "~0.2.8"
    
*Note: ui-router-extras test suite runs against UI-Router versions 0.2.8, 0.2.10, 0.2.12, 0.2.13*
*Support for older versions of ui-router is likely to disappear in the future.*

## Monolithic Install
1. download the files
	1. NPM
		1. run `npm install ui-router-extras --save-dev`
	2. Bower (alternatively)
		1. `bower install ui-router-extras --save-dev`
2. Include the files in your app
	1. `ct-ui-router-extras.min.js`
3. Include the module as an angular dependency (i.e. in `app.js`) - `ct.ui.router.extras`

## Modular Install
1. download the files
	1. NPM
		1. run `npm install ui-router-extras --save-dev`
	2. Bower (alternatively)
		1. `bower install ui-router-extras --save-dev`
2. Choose the modules you want.  You *must* include **core**.
   1. **core** Core requirement. Adds state.$$state() decorator (undocumented)
   2. **sticky** Sticky states
   3. **dsr** Deep State Redirect
   4. **future** Future states
   5. **previous** Previous state (depends on **transition**)
   6. **statevis** D3 based State visualization as seen on the demo site (undocumented)
   7. **transition** Injectible transition promise (undocumented)
3. Include the files for the modules you want into your app
	1. `modular/ct-ui-router-extras.core.min.js`
	2. `modular/ct-ui-router-extras.sticky.min.js`
	3. `modular/ct-ui-router-extras.dsr.min.js`
	4. `modular/ct-ui-router-extras.future.min.js`
	5. `modular/ct-ui-router-extras.previous.min.js`
	6. `modular/ct-ui-router-extras.statevis.min.js`
	7. `modular/ct-ui-router-extras.transition.min.js`
4. Include the submodules as an angular dependency (i.e. in `app.js`) - e.g., `ct.ui.router.extras.sticky`

## Development

1. `git checkout master`
    1. run `npm install && bower install`
    2. write your code then run `gulp`
    3. git commit your changes
    
The gulpfile.js default target generates the output files into a build/ and build/modular directory.  It runs 
all unit tests on the modular files individually, and then runs the tests against the full build file.   When run 
on the full build file, the test suite is run once against each version of UI-Router listed above.

