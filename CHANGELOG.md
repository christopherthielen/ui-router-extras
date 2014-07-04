Version numbers correspond to `bower.json` version

# 0.0.5-preview
## Features
Added state locals/view debugging output when $stickyStateProvider.enableDebug(true);

## Bug Fixes
- Sticky transitions lose locals (cached views) when pivoting over root state #9
- Wrap release ct-ui-router-extras.js in IIFE (function(){})() #6
- Clean up grunt warnings #5
- Remove sticky state debugging output #4

## Breaking Changes
- example state factories are now hidden inside the IIFE.


# 0.0.4-preview
## Features
Sticky states
Deep State Redirect
Future States

## Bug Fixes

## Breaking Changes
