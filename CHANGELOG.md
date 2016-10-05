<a name="0.1.3"></a>
### 0.1.3 (2016-10-05)


#### Bug Fixes

* **dsr:** Cannot read property 'ignoreDsr' of undefined ([3e23a4ac](https://github.com/christopherthielen/ui-router-extras/commit/3e23a4acc11449bef017758a4fc69cc1660539f6))
* **sticky:** fix inactive child state targeting a named ui-view that inactive parent also tar ([122d5842](https://github.com/christopherthielen/ui-router-extras/commit/122d584223d864f696d8f37751bdfd218b29e5d4), closes [#272](https://github.com/christopherthielen/ui-router-extras/issues/272), [#343](https://github.com/christopherthielen/ui-router-extras/issues/343))


#### Features

* **sticky:** Improve view debugging output using console.table() ([26058304](https://github.com/christopherthielen/ui-router-extras/commit/26058304353b01e454d1aabd08d7b2f310526e1f))


<a name="0.1.1"></a>
### 0.1.1 (2016-03-14)

#### Bug Fixes

* **sticky:**
  * Fix "Cannot read property 'globals' of null" The sticky provider was setting a r ([e401776b](https://github.com/christopherthielen/ui-router-extras/commit/e401776b480f8fd29fca049aa9f42df0732f6443), closes [#258](https://github.com/christopherthielen/ui-router-extras/issues/258))
  * allow empty options parameter to transitionTo() ([1d8b1b6e](https://github.com/christopherthielen/ui-router-extras/commit/1d8b1b6e788106eecab439661614517ed18c45bf), closes [#285](https://github.com/christopherthielen/ui-router-extras/issues/285))
  * Use inherited toParams for calculations. ([83866b57](https://github.com/christopherthielen/ui-router-extras/commit/83866b574ffcb34f8b63a3f7c9d2f287818058f9), closes [#288](https://github.com/christopherthielen/ui-router-extras/issues/288))
* **previous:** Do not throw error if no previous state exists ([a186505d](https://github.com/christopherthielen/ui-router-extras/commit/a186505d7be4797f0d6192f1b691caf285749188), closes [#281](https://github.com/christopherthielen/ui-router-extras/issues/281))

#### Features

* **$previousState:** add a `set` method to `$previousState` to programmatically set the previous stat ([8423e0d6](https://github.com/christopherthielen/ui-router-extras/commit/8423e0d617bc722efb854c562909294b10589e78), closes [#302](https://github.com/christopherthielen/ui-router-extras/issues/302))
* **future:** allow options to be passed to future state ([3a2469d8](https://github.com/christopherthielen/ui-router-extras/commit/3a2469d86e677364fb465f06604d1d17a3d6d7bb))


<a name="0.1.0"></a>
### 0.1.0 (2015-10-13)

## BREAKING CHANGE
This release changes the semantics of navigating to a parent state of a sticky state.  A sticky state tree is now *always exited* if its parent state is directly activated.  This provides a consistent rule and addresses issue #212. 

Previously, navigating from a sticky state tree to the parent of the sticky state tree would not exit the children.  However, if the sticky state tree was inactivated, navigating from elsewhere to the parent of the sticky state tree *would* exit the children.

Example:
Given states A, A.1 (sticky) and A.2

The previous behavior:
 - If A.1 is active and you transition to A, A.1 was inactivated
 - If A.1 is inactive, A.2 is active, and you transition to A, A.1 was exited

The new behavior:
 - If A.1 is active and you transition to A, A.1 is exited
 - If A.1 is inactive and A.2 is active, if you transition to A, A.1 is exited

#### Bug Fixes

* **sticky:**
  * BC-BREAK always orphan inactive children of the toState ([990e73ee](https://github.com/christopherthielen/ui-router-extras/commit/990e73ee1000f2811728b273236859c1a3f22228), closes [#212](https://github.com/christopherthielen/ui-router-extras/issues/212))
  * Exit all orphaned inactive states. ([72a6ce51](https://github.com/christopherthielen/ui-router-extras/commit/72a6ce51a996f9a002ba0db62b42bc11f25fb516), closes [#217](https://github.com/christopherthielen/ui-router-extras/issues/217))
  * Properly support Typed Parameters (object params) by using $$equals() (if ui-router 0.2.12+) to determine if params are equal ([5d5ce6de](https://github.com/christopherthielen/ui-router-extras/commit/5d5ce6de313208ae3123d02a19e75ed5efb72a79), closes [#239](https://github.com/christopherthielen/ui-router-extras/issues/239))
* **transition:** mitigate angular-permissions causing exceptions. ([5fbd478c](https://github.com/christopherthielen/ui-router-extras/commit/5fbd478cdd14c36b439a8f138419fd02edea3819))

* **package.json:** remove engines declaration allowing any version of node ([4a575e41](https://github.com/christopherthielen/ui-router-extras/commit/4a575e4102c8589fb89172610a7454f96ee72c13))


#### Features

* **previous:** reject $previousState.go if unassigned memo is passed in ([48affbc1](https://github.com/christopherthielen/ui-router-extras/commit/48affbc19c1a2c6d13e51beb796c0a0ca127de81))
* **dsr:** Added getRedirect() to $deepStateRedirect ([45c535af59b4](https://github.com/christopherthielen/ui-router-extras/commit/45c535af59b4344fda854dd1c88cd155f8ad241a)), closes [#184](https://github.com/christopherthielen/ui-router-extras/issues/184)



<a name="0.0.14"></a>
### 0.0.14 (2015-06-18)

#### Bug Fixes

* **dsr:** Use state.includes instead of state.name.indexOf to determine if a dsr state is  ([89565f4d](https://github.com/christopherthielen/ui-router-extras/commit/89565f4d0dfdca1b8e75d586fa8f85adcda0f880), closes [#208](https://github.com/christopherthielen/ui-router-extras/issues/208))
* **future:**
  * commented out debug code ([b53c1ef7](https://github.com/christopherthielen/ui-router-extras/commit/b53c1ef73cad583df705fa65d82d2be2d4b1d9c5), closes [#156](https://github.com/christopherthielen/ui-router-extras/issues/156))
  * Fixed double-urlRouter.sync() because of future state retry ([f22c5439](https://github.com/christopherthielen/ui-router-extras/commit/f22c543968750a97346e3938e7c75b02422d69c9), closes [#138](https://github.com/christopherthielen/ui-router-extras/issues/138))
  * Allow future state to be child of url-less abstract state Manually merged in pul ([3a2419a7](https://github.com/christopherthielen/ui-router-extras/commit/3a2419a7a55715661bf38135b041928bc655f804))
* **previous:** Allow previous state to track states without URLs. ([9c4be9f3](https://github.com/christopherthielen/ui-router-extras/commit/9c4be9f3e73c9229dc371af70a3a2ade3980a75a), closes [#175](https://github.com/christopherthielen/ui-router-extras/issues/175))
* **sticky:**
  * Fixed non-strict references to 'forEach' ([710e1d77](https://github.com/christopherthielen/ui-router-extras/commit/710e1d776b9a85ead2b6262e3b37eb4971c74f65))
  * prevent error on reseting missing state PR #206 ([44edae43](https://github.com/christopherthielen/ui-router-extras/commit/44edae43d680550af030d3404d6ee730da03d43d))
  * Refactored logic to better calculate exit/enter/(in|re)activations ([43be5d9d](https://github.com/christopherthielen/ui-router-extras/commit/43be5d9d064cfda547dc50f65c28ae045badeb19), closes [#131](https://github.com/christopherthielen/ui-router-extras/issues/131))
* **extras:** restore ie8 compatibility due to reserved words ([c25346d1](https://github.com/christopherthielen/ui-router-extras/commit/c25346d172fccadebcbf88abb3b7cf5153ab5efd))
* **karma:** fixes "lodash" reference ([4cfc3bbd](https://github.com/christopherthielen/ui-router-extras/commit/4cfc3bbdcc0e53a350858b78089fc375335c74ec))


#### Features

* **dsr:** Added getRedirect() to $deepStateRedirect ([45c535af](https://github.com/christopherthielen/ui-router-extras/commit/45c535af59b4344fda854dd1c88cd155f8ad241a), closes [#184](https://github.com/christopherthielen/ui-router-extras/issues/184))
* **future:** Allow future states to be retried after a failed lazy load attempt ([6e6f3ece](https://github.com/christopherthielen/ui-router-extras/commit/6e6f3ece5034dfcb1c5c23cf8e47405c12c55595), closes [#196](https://github.com/christopherthielen/ui-router-extras/issues/196))
* **sticky:** added $stickyState.reset("*") ([3656835d](https://github.com/christopherthielen/ui-router-extras/commit/3656835ddb949c53b6b99ca69237be917dc1ea85), closes [#162](https://github.com/christopherthielen/ui-router-extras/issues/162))

<a name="0.0.13"></a>
### 0.0.13 (2015-02-02)

This release comes 2 days after 0.0.12 and fixes a couple of bugs

#### Bug Fixes

* **future:** fix modular build of futurestates ([abfdc34d](https://github.com/christopherthielen/ui-router-extras/commit/abfdc34d41afea34ca8cccd3db5f81bb3a856eb4), closes [#151](https://github.com/christopherthielen/ui-router-extras/issues/151))
* **statevis:** add dep from statevis to sticky ([1a488d84](https://github.com/christopherthielen/ui-router-extras/commit/1a488d84257060868f3c70b6ef7305f4936212eb), closes [#153](https://github.com/christopherthielen/ui-router-extras/issues/153))
* **sticky:** Fix modular sticky states build ([21d1d129](https://github.com/christopherthielen/ui-router-extras/commit/21d1d129963b8bfc724823f93ca0efc32868ec77), closes [#154](https://github.com/christopherthielen/ui-router-extras/issues/154))
* **transition:** transition promise now resolved correctly ([598452ed](https://github.com/christopherthielen/ui-router-extras/commit/598452ed5bae76b8add8707794740993d3242011), closes [#152](https://github.com/christopherthielen/ui-router-extras/issues/152))


<a name="0.0.12"></a>
### 0.0.12 (2015-01-31)

<a href="https://github.com/christopherthielen/ui-router-extras/issues?q=milestone%3A0.0.12+">
View issues tagged with 0.0.12
</a>

#### Bug Fixes

* **$futureState:**
  * Better logic for failed lazy load of future state chore($futureState): clean up  ([4f541906](https://github.com/christopherthielen/ui-router-extras/commit/4f541906a620c582ef33c5aab26d8259777ca70a))
  * handle .otherwise() when the typed url matches a future state url + ".*" ([2bdf864e](https://github.com/christopherthielen/ui-router-extras/commit/2bdf864e7c9f8198614d8b24d327cd3599ce6711), closes [#124](https://github.com/christopherthielen/ui-router-extras/issues/124))
  * Fixed url.concat to use parentState.url, or parentState.navigable.url. ([31ca73bd](https://github.com/christopherthielen/ui-router-extras/commit/31ca73bdc07ac80b53e9ec76f7f4eca268461fa2))
* **$stickyState:** Made equalForKeys compatible with state.ownParams breaking change in UI-Router 0 ([5aba1345](https://github.com/christopherthielen/ui-router-extras/commit/5aba1345152f589d6cf913d26b5b00c6ee0f1884), closes [#112](https://github.com/christopherthielen/ui-router-extras/issues/112))
* **dsr:** Allow default substates and parameters for deep state redirect. ([20fade74](https://github.com/christopherthielen/ui-router-extras/commit/20fade743e46bbb68158f251d0880905391ed806), closes [#150](https://github.com/christopherthielen/ui-router-extras/issues/150))
* **previous:**
  * Future states URL is now optional ([9233ea90](https://github.com/christopherthielen/ui-router-extras/commit/9233ea903bfeadfdd24039ea3ceb21359c1a9017), closes [#129](https://github.com/christopherthielen/ui-router-extras/issues/129))
  * Previous state no longer tracks abstract from-states (e.g., root) ([b0431d68](https://github.com/christopherthielen/ui-router-extras/commit/b0431d6884d335208161be1e562d3682da168d9d), closes [#123](https://github.com/christopherthielen/ui-router-extras/issues/123))
  * Previous state now tracked using $transition$ promise ([1127ef62](https://github.com/christopherthielen/ui-router-extras/commit/1127ef62274bc4561370bbc3da6a4d9b5ba1c6d4), closes [#120](https://github.com/christopherthielen/ui-router-extras/issues/120))
* **sticky:**
  * fixed reload: true for ui-router 0.2.8 ([82783374](https://github.com/christopherthielen/ui-router-extras/commit/82783374ae07b7b7f07b597a712fbc89a00ca457))
  * Fixed unexpected exit/reload of inactive state. ([c8eff13d](https://github.com/christopherthielen/ui-router-extras/commit/c8eff13d32216070e743fe772325f8b81b959a17), closes [#131](https://github.com/christopherthielen/ui-router-extras/issues/131))
  * fix sticky state registration ([d84311eb](https://github.com/christopherthielen/ui-router-extras/commit/d84311eb78d0da66911216b0250bc197619cd1d4))


#### Features

* **$futureState:** Added $stateAdded event ([b6da3998](https://github.com/christopherthielen/ui-router-extras/commit/b6da3998dc903eb54f4f74d6eabe776c63260a04))
* **previous:** forget can now forget the previous state ([992b88bd](https://github.com/christopherthielen/ui-router-extras/commit/992b88bd2f716e4bd8637cc6429f7670bf0a5e88), closes [#145](https://github.com/christopherthielen/ui-router-extras/issues/145))
* **sticky:** Allow reloading of partial state tree ([27d6c8c5](https://github.com/christopherthielen/ui-router-extras/commit/27d6c8c5adbf7ffff059d6e66b9ec1b0e4963408), closes [#139](https://github.com/christopherthielen/ui-router-extras/issues/139))
* **uiRouterExtras:** modularize the code base and build system. switched to gulp ([aebf936d](https://github.com/christopherthielen/ui-router-extras/commit/aebf936db9cd4c7dc8f2b813f20572ba3b07bea6))


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
