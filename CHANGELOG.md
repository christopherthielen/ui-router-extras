<a name="0.0.11"></a>
### 0.0.11 (2014-11-21)

This release focuses on improvements to Future States.

#### Bug Fixes

* load  in lazyLoadState ((32fcf169))
* **$futureState:**
  * when concatting with parent url, use parent.navigable.url ((63ec61bf), closes (#69))
  * fix top-level future states (root state is parent) ((e5847356), closes (#98))
  * also register parent future states returned from factory fn ((48995fb3), closes (#99))
  * fix transition to future state using .relative sref ((e953de61), closes (#3))
  * unregister lazyloaded future states closes #2 ((67ad0d47))
  * allow state lookup by object reference, or by state name ((6ca316cd))
* **$stickyState:** Make sticky state compatible with UI-Router 0.2.12 ((751db8e1), closes (#88))
* **ie:** added ['finally'] method invocation on ((095e5675))


#### Features

* **$futureState:** 
  * use UrlMatcher for future url ((f1b0fe57), closes (#54), (#82))
  * allow regexp matching in urlPrefix ((15c150d1))
  * future states may now have parent futurestate ((8e11a7c6), closes (#63))
  * support $urlRouterProvider.otherwise() ((748f2f1f))

* **$previousState:** Add support for default previous state/params ((1c08ed7c))
* **$stickyState:** Added $stickyState.reset() function ((af427116), closes (#48))
* **$deepStateRedirect:** 
  * add support for DSR only when params match. ((ed16ae4c))
  * add service function to reset DSR ((c17e27f0), closes (#87))
  * provide state dsr function with to and redirect info. ((c46fd283), closes (#91))


#### Breaking Changes

* use FutureState.name instead of FutureState.stateName to be consistent with UI-Router (backwards compat attempted, but not guaranteed)
- BREAKING CHANGE: use FutureState.url instead of FutureState.urlPrefix to be consistent with UI-Router (backwards compat attempted, but not guaranteed)
- FutureState.url is now processed using UI-Router's UrlMatcher code.
- FutureState.url is concat'd with the parent state's url to create the UrlMatcher/regexp.
- FutureState.url has a wildcard added to the end to match anything extra (.*)
- Changed example iframe factory to use .name and .url and .parent
- internalStates map now gets root internal state

Fixes #54
Closes #82 (PR)
 ((f1b0fe57))


<a name="0.0.11"></a>
### 0.0.11 (2014-11-21)


#### Bug Fixes

* load  in lazyLoadState ((32fcf169))
* **$deepStateRedirect:** provide state dsr function with to and redirect info. ((c46fd283), closes (#91))
* **$futureState:**
  * when concatting with parent url, use parent.navigable.url ((63ec61bf), closes (#69))
  * fix top-level future states (root state is parent) ((e5847356), closes (#98))
  * also register parent future states returned from factory fn ((48995fb3), closes (#99))
* **ie:** added ['finally'] method invocation on ((095e5675))


<a name="0.0.11"></a>
### 0.0.11 (2014-11-03)


#### Bug Fixes

* allow regexp matching in urlPrefix ((15c150d1))
* **$deepStateRedirect:**
  * add service function to reset DSR ((c17e27f0), closes (#87))
  * add support for DSR only when params match. ((ed16ae4c))
* **$futureState:**
  * future states may now have parent futurestate ((8e11a7c6), closes (#63))
  * fix transition to future state using .relative sref ((e953de61), closes (#3))
  * use UrlMatcher for future url ((f1b0fe57), closes (#54), (#82))
  * support $urlRouterProvider.otherwise() ((748f2f1f))
  * unregister lazyloaded future states closes #2 ((67ad0d47))
  * allow state lookup by object reference, or by state name ((6ca316cd))
* **$stickyState:**
  * Added $stickyState.reset() function ((af427116), closes (#48))
  * Make sticky state compatible with UI-Router 0.2.12 ((751db8e1), closes (#88))


#### Features

* **$previousState:** Add support for default previous state/params ((1c08ed7c))


#### Breaking Changes

* use FutureState.name instead of FutureState.stateName to be consistent with UI-Router (backwards compat attempted, but not guaranteed)
* use FutureState.url instead of FutureState.urlPrefix to be consistent with UI-Router (backwards compat attempted, but not guaranteed)

<a name="0.0.10"></a>
### 0.0.10 (2014-08-27)

#### Bug Fixes

* Proper filename casing for case-sensitive filesystems #47 from theomy ((9b5a62b2))
* **$stickyState:**
  * Fix states not exiting when the state parent attribute is used ((a3f0f9db))

(instead of the fully qualified dotted notation)
  * Fixed the decorated $state.transitionTo promise result. ((873e9a79))

When it should have been returning a rejected promise, it was instead returning a resolved promise with the error as the value. closes #42
  * Made root.locals inherit from __inactives.locals. ((02c804c0))

Removed resolve and globals from __inactives. closes #37
  * Sticky States needs access to the root state. ((f3cf772c))

It can now access it even if no user-defined states have been decorated. closes #36
  * Proper filename casing for case-sensitive filesystems - renamed stickystate.js to stickyState.js

#### Features
* **DSR:**
  * state.deepStateRedirect may now be a function. closes #44 ((d37442e))
* **$transition$:** 
  * new injectable promise object $transition$ ... docs pending

#### Other
  * Add injection annotations so other people can minify correctly.  closes #38 ((68105836))
  * Reformatted code


# 0.0.9
## Features

- fix(build): Add versioned header to release files. closes #33

## Bug Fixes

- fix($futureState) Fixed double resolve on initial app load.  Closes #28  Closes #32
- fix($deepStateRedirect): DSR state is now remembered correctly when using { ignoreDsr: true } to transition directly to DSR state.  Closes #31
- fix($previousState): Added options parameter to $previousState.go().  Closes #30


# 0.0.8
## Features
- chore($stickyState) Technical documentation of Sticky State internal implementation.  closes #23
- Added an transitionTo option, { ignoreDsr: true } to transition directly to a DSR state.  closes #25

## Bug Fixes

- fix(stickyState) Allow transitionTo without options specified.  fixes #21
- fix($stickyState): Fixed sticky-state triggers unnecessary re-resolves. closes #22
- fix($stickyState): Fixed state params inheritance not accounted for when processing the transitions causing sticky transitions to fail when parent state has a parameter.  closes #24
- fix($deepStateRedirect): Added ignoreDsr option for $state.transitionTo. closes #25
- fix($futureState): Delay initial re-sync using $timeout.  This stops the standard ui-router sync from superseding the futureStates resync.  I think this fixes #28
- fix($deepStateRedirect): $q not defined (when a transition is aborted or fails).  closes #27
- fix($stickyState): Fixed bug introduced in 0.0.7 refactor which caused sticky states to fail completely.  Now, I made root.locals prototype inherit from __inactives.locals so views can be located by the ui-views.  fixes #29

## Other Stuff
- Removed UI-Router 0.2.6 from the grunt test runner.  See issue #26
- chore($stickyState) Refactored sticky state internals from inserting __inactives into each state's path to prepending __inactives as a parent to root ("")
- test($stickyState): Added unit test for controller not re-invoked on state reactivation.  closes #24 again.
- test($stickyState): Added unit tests for root locals prototypally inheriting from __inactives.locals to test for the scenario in issue #29

# 0.0.6
## Features
- Added tests for $previousState.  closes #13
- Compatible with UI-Router HEAD (will probably be released as UI-Router 0.2.11 or 0.3.0). Closes #17
- Removed last usage of UnderscoreJS. closes #8
- Cleaned up bower release files. closes #15

## Bug Fixes
- Fixed minification bug. closes #18
- Added array notation to deepStateRedirect.js initialization.  closes #18
- No longer setting a different state.self object on the surrogate states.  closes #1 , closes #16
- Reorganized karma tests to run against multiple versions (0.2.5, 0.2.6, 0.2.7, 0.2.8, 0.2.10, HEAD) of ui-router and minified ct-ui-router-extras.  closes #19
- Fixed DSR Spec so its getStates function doesn't conflict with other spec function.

## Other stuff
- Moved pathFrom() into testUtil.js
- Added uiRouterVersion() parser to testUtil.js
- Reorganized files.js layout (this needs a makeover, i do not like)


# 0.0.5
## Features
- Added state locals/view debugging output when $stickyStateProvider.enableDebug(true);
- Added Previous State service for returning to a workflows entry point issue #10

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
- Sticky states
- Deep State Redirect
Future States

## Bug Fixes

## Breaking Changes
