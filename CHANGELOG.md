Version numbers correspond to `bower.json` version

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
