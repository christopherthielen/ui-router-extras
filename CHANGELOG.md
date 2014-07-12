Version numbers correspond to `bower.json` version

# 0.0.6
## Features
Added tests for $previousState.  closes #13
Compatible with UI-Router HEAD (will probably be released as UI-Router 0.2.11 or 0.3.0). Closes #17
Removed last usage of UnderscoreJS. closes #8
Cleaned up bower release files. closes #15

## Bug Fixes
Fixed minification bug. closes #18
Added array notation to deepStateRedirect.js initialization.  closes #18
No longer setting a different state.self object on the surrogate states.  closes #1 , closes #16
Reorganized karma tests to run against multiple versions (0.2.5, 0.2.6, 0.2.7, 0.2.8, 0.2.10, HEAD) of ui-router and minified ct-ui-router-extras.  closes #19
Fixed DSR Spec so its getStates function doesn't conflict with other spec function.

## Other stuff
Moved pathFrom() into testUtil.js
Added uiRouterVersion() parser to testUtil.js
Reorganized files.js layout (this needs a makeover, i do not like)


# 0.0.5
## Features
Added state locals/view debugging output when $stickyStateProvider.enableDebug(true);
Added Previous State service for returning to a workflows entry point issue #10

## Bug Fixes
- Added karma runner for UI-Router versions 0.2.0, 0.2.8, 0.2.10, HEAD@2014-07-05 issue #12
- Removed runtime dependency on underscoreJS. issue #8
- Sticky transitions lose locals (cached views) when pivoting over root state issue #9
- Wrap release ct-ui-router-extras.js in IIFE (function(){})() issue #6
- Clean up grunt warnings issue #5
- Remove sticky state debugging output issue #4

## Breaking Changes
- example state factories are now hidden inside the IIFE.


# 0.0.4-preview
## Features
Sticky states
Deep State Redirect
Future States

## Bug Fixes

## Breaking Changes
