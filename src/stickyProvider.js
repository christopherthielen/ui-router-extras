angular.module("ct.ui.router.extras.sticky", [ 'ct.ui.router.extras.core' ]);

var mod_sticky = angular.module("ct.ui.router.extras.sticky");

$StickyStateProvider.$inject = [ '$stateProvider', 'uirextras_coreProvider' ];
function $StickyStateProvider($stateProvider, uirextras_coreProvider) {
  var core = uirextras_coreProvider;
  var inheritParams = core.inheritParams;
  var objectKeys = core.objectKeys;
  var protoKeys = core.protoKeys;
  var forEach = core.forEach;
  var map = core.map;

  // Holds all the states which are inactivated.  Inactivated states can be either sticky states, or descendants of sticky states.
  var inactiveStates = {}; // state.name -> (state)
  var stickyStates = {}; // state.name -> true
  var $state;
  var DEBUG = false;

  // Called by $stateProvider.registerState();
  // registers a sticky state with $stickyStateProvider
  this.registerStickyState = function (state) {
    stickyStates[state.name] = state;
    // console.log("Registered sticky state: ", state);
  };

  this.enableDebug = this.debugMode = function (enabled) {
    if (angular.isDefined(enabled))
      DEBUG = enabled;
    return DEBUG;
  };

  this.$get = [  '$rootScope', '$state', '$stateParams', '$injector', '$log',
    function ($rootScope, $state, $stateParams, $injector, $log) {
      // Each inactive states is either a sticky state, or a child of a sticky state.
      // This function finds the closest ancestor sticky state, then find that state's parent.
      // Map all inactive states to their closest parent-to-sticky state.
      function mapInactives() {
        var mappedStates = {};
        angular.forEach(inactiveStates, function (state, name) {
          var stickyAncestors = getStickyStateStack(state);
          for (var i = 0; i < stickyAncestors.length; i++) {
            var parent = stickyAncestors[i].parent;
            mappedStates[parent.name] = mappedStates[parent.name] || [];
            mappedStates[parent.name].push(state);
          }
          if (mappedStates['']) {
            // This is necessary to compute Transition.inactives when there are sticky states are children to root state.
            mappedStates['__inactives'] = mappedStates[''];  // jshint ignore:line
          }
        });
        return mappedStates;
      }

      function mapInactivesByImmediateParent() {
        var inactivesByAllParents ={};
        forEach(inactiveStates, function(state) {
          forEach(state.path, function(ancestor) {
            if (ancestor === state) return;
            inactivesByAllParents[ancestor.name] = inactivesByAllParents[ancestor.name] || [];
            inactivesByAllParents[ancestor.name].push(state);
          });
        });
        return inactivesByAllParents;
      }

      // Given a state, returns all ancestor states which are sticky.
      // Walks up the view's state's ancestry tree and locates each ancestor state which is marked as sticky.
      // Returns an array populated with only those ancestor sticky states.
      function getStickyStateStack(state) {
        var stack = [];
        if (!state) return stack;
        do {
          if (state.sticky) stack.push(state);
          state = state.parent;
        } while (state);
        stack.reverse();
        return stack;
      }

      // Returns a sticky transition type necessary to enter the state.
      // Transition can be: reactivate, reload, or enter

      // Note: if a state is being reactivated but params dont match, we treat
      // it as a Exit/Enter, thus the special "reload" transition.
      // If a parent inactivated state has "reload" transition type, then
      // all descendant states must also be exit/entered, thus the first line of this function.
      function getEnterTransition(state, stateParams, reloadStateTree, ancestorReloaded) {
        if (ancestorReloaded) return "reload";
        var inactiveState = inactiveStates[state.self.name];
        if (!inactiveState) return "enter";
        if (state.self === reloadStateTree) return "reload";
        var paramsMatch = paramsEqualForState(state.ownParams, stateParams, inactiveState.locals.globals.$stateParams);
        return paramsMatch ? "reactivate" : "reload";
      }

      // Given a state and (optional) stateParams, returns the inactivated state from the inactive sticky state registry.
      function getInactivatedState(state, stateParams) {
        var inactiveState = inactiveStates[state.name];
        if (!inactiveState) return null;
        if (!stateParams) return inactiveState;
        var paramsMatch = paramsEqualForState(state.ownParams, stateParams, inactiveState.locals.globals.$stateParams);
        return paramsMatch ? inactiveState : null;
      }

      function paramsEqualForState(ownParams, stateParams, stateParams2) {
        if (typeof ownParams.$$equals === 'function')
          return ownParams.$$equals(stateParams, stateParams2);
        return equalForKeys(stateParams, stateParams2, ownParams);
      }

      // Duplicates logic in $state.transitionTo, primarily to find the pivot state (i.e., the "keep" value)
      function equalForKeys(a, b, keys) {
        if (!angular.isArray(keys) && angular.isObject(keys)) {
          keys = protoKeys(keys, ["$$keys", "$$values", "$$equals", "$$validates", "$$new", "$$parent"]);
        }
        if (!keys) {
          keys = [];
          for (var n in a) keys.push(n); // Used instead of Object.keys() for IE8 compatibility
        }

        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          if (a[k] != b[k]) return false; // Not '===', values aren't necessarily normalized
        }
        return true;
      }

      var stickySupport = {
        getInactiveStates: function () {
          return map(inactiveStates, angular.identity);
        },
        getInactiveStatesByParent: function () {
          return mapInactives();
        },
        // Main API for $stickyState, used by $state.
        // Processes a potential transition, returns an object with the following attributes:
        // {
        //    keep: The number of states being "kept"
        //    inactives: Array of all states which will be inactive if the transition is completed.
        //    reactivatingStates: Array of all states which will be reactivated if the transition is completed.
        //    inactiveOrphans: Array of previously inactive states, which are being orphaned by the transition
        //        Note: Transitioning directly to an inactive state with inactive children will reactivate the state, but exit all the inactive children.
        //        Note: Each inactiveOrphans is potentially the root of an orphaned subtree.  The substates of the orphaned node are not in the list.
        //    enter: Enter transition type for all added states.  This is a parallel array to "toStates" array in $state.transitionTo.
        //    exit: Exit transition type for all removed states.  This is a parallel array to "fromStates" array in $state.transitionTo.
        // }
        processTransition: function (transition) {
          /////////////////////////////////////////
          // helper functions
          function flattenReduce(memo, list) { return memo.concat(list); }
          function uniqReduce(memo, orphan) { if (memo.indexOf(orphan) === -1) memo.push(orphan); return memo; }
          function pushAll(dest, src) { dest.push.apply(dest, src); return dest; }
          function val(x) { return function() { return x; }; }
          function prop(attr) { return function(obj) { return obj[attr]; } }

          function typeIs(type) { return function(obj) { return obj.type === type; } }
          function isChildOf(state) { return function(other) { return other.parent === state; }; }
          function notEntered(state) { return enteringStates.indexOf(state) === -1; }
          function notSticky(state) { return !state.sticky; }
          ////////////////////////////////////


          // This object is returned
          var result = { inactives: [], enter: [], exit: [], keep: 0 };
          var fromPath = transition.fromState.path;
          var toPath = transition.toState.path;
          var toParams = transition.toParams;
          var keep = 0, state = toPath[keep];

          if (transition.options.inherit) {
            toParams = inheritParams($stateParams, toParams || {}, $state.$current, transition.toState);
          }

          while (state && state === fromPath[keep] && paramsEqualForState(state.ownParams, toParams, transition.fromParams)) {
            // We're "keeping" this state. bump keep var and get the next state in toPath for the next iteration.
            state = toPath[++keep];
          }

          result.keep = keep;
          var treeChanges = {
            retained: fromPath.slice(0, keep),
            exiting:  fromPath.slice(keep),
            entering: toPath.slice(keep)
          };

          result.exit = treeChanges.retained.map(val(undefined));
          result.enter = treeChanges.retained.map(val(undefined));

          var inactives = [], reactivatingStates = [], enteringStates = [], exitingStates = [];
          var allInactivesByParents = mapInactivesByImmediateParent();

          // Two things must be satisfied in order to inactivate "exiting" states (instead of exit them):
          // - The first element of the exiting path must be sticky
          // - We must be entering any sibling state of the sticky (we can check this using entering.length)
          //if (treeChanges.exiting[0] && treeChanges.exiting[0].sticky && treeChanges.entering.length > 0) {
          var isFromSticky = treeChanges.exiting[0] && treeChanges.exiting[0].sticky && treeChanges.entering.length > 0;

          var exiting = treeChanges.exiting.map(function (state) {
              var type = isFromSticky ? "inactivate" : "exit";
              return { type: type, state: state };
          });

          pushAll(inactives, exiting.filter(typeIs("inactivate")).map(prop("state")));
          pushAll(exitingStates, exiting.filter(typeIs("exit")).map(prop("state")));
          pushAll(result.exit, exiting.map(prop("type")));

          // Calculate the "enter" transitions for new states in toPath
          // Enter transitions will be either "enter", "reactivate", or "reload" where
          //   enter: full resolve, no special logic
          //   reactivate: use previous locals
          //   reload: like 'enter', except exit the inactive state before entering it.
          var reloaded = !!transition.options.reload;
          var entering = treeChanges.entering.map(function(state) {
            var type = getEnterTransition(state, toParams, transition.reloadStateTree, reloaded);
            reloaded = reloaded || type === 'reload';
            return { type: type, state: state };
          });

          pushAll(enteringStates, entering.map(prop("state")));
          pushAll(reactivatingStates, entering.filter(typeIs("reactivate")).map(prop("state")));
          pushAll(result.enter, entering.map(prop("type")));

          var allInactives = map(inactiveStates, angular.identity);

          // Find all the "orphaned" states.  those states that are :
          //  - previously inactive
          //  - are children or siblings of the entering states
          //  - are not being reactivated
          //  - are not sticky
          // These states should now be exited because of the sticky rules
          //
          // Given:
          //   - states A (sticky: true), B, A.foo, A.bar
          //   - A.foo is currently inactive
          //   - B is currently active
          // Orphan case 1)
          //   - Transition to A.bar orphans the inactive state A.foo; it should be exited
          // Orphan case 2)
          //   - Transition directly to A orphans the inactive state A.foo; it should be exited
          //
          // Given:
          //   - states A (sticky: true), B, A.foo (sticky), A.bar
          //   - A.foo is currently inactive
          //   - B is currently active
          // Orphan case 3)
          //   - Transition directly to A orphans the inactive sticky state A.foo; it should be exited
          // Note: transition from B to A.bar does not orphan A.foo
          var orphanedRoots = enteringStates
              // For each entering state in the path, find any sibling states which are currently inactive
              .map(function (entering) { return allInactives.filter(isChildOf(entering.parent)); })
              // Flatten nested arrays. Now we have an array of inactive states that are children of the ones being entered.
              .reduce(flattenReduce, [])
              .reduce(uniqReduce, [])
              // Consider "orphaned": only those children that are themselves not currently being entered
              .filter(notEntered)
              // Consider "orphaned": only those children that are not themselves sticky states.
              .filter(notSticky);
          var orphanedChildrenOfToState = allInactives.filter(isChildOf(transition.toState));

          // Add them to the list of states being exited.
          exitingStates = exitingStates.concat(orphanedRoots).concat(orphanedChildrenOfToState);

          // Now calculate the states that will be inactive if this transition succeeds.
          // We have already pushed the transitionType == "inactivate" states to 'inactives'.
          // Second, add all the existing inactive states
          inactives = inactives.concat(map(inactiveStates, angular.identity));
          // Finally, remove any states that are scheduled for "exit" or "enter", "reactivate", or "reload"
          inactives = inactives.filter(function(state) {
            return exitingStates.indexOf(state) === -1 && enteringStates.indexOf(state) === -1;
          });

          result.inactives = inactives;
          result.reactivatingStates = reactivatingStates;
          result.inactiveOrphans = orphanedRoots.concat(orphanedChildrenOfToState);

          return result;
        },

        // Adds a state to the inactivated sticky state registry.
        stateInactivated: function (state) {
          // Keep locals around.
          inactiveStates[state.self.name] = state;
          // Notify states they are being Inactivated (i.e., a different
          // sticky state tree is now active).
          state.self.status = 'inactive';
          if (state.self.onInactivate)
            $injector.invoke(state.self.onInactivate, state.self, state.locals.globals);
        },

        // Removes a previously inactivated state from the inactive sticky state registry
        stateReactivated: function (state) {
          if (inactiveStates[state.self.name]) {
            delete inactiveStates[state.self.name];
          }
          state.self.status = 'entered';
//        if (state.locals == null || state.locals.globals == null) debugger;
          if (state.self.onReactivate)
            $injector.invoke(state.self.onReactivate, state.self, state.locals.globals);
        },

        // Exits all inactivated descendant substates when the ancestor state is exited.
        // When transitionTo is exiting a state, this function is called with the state being exited.  It checks the
        // registry of inactivated states for descendants of the exited state and also exits those descendants.  It then
        // removes the locals and de-registers the state from the inactivated registry.
        stateExiting: function (exiting, exitQueue, onExit) {
          var exitingNames = {};
          angular.forEach(exitQueue, function (state) {
            exitingNames[state.self.name] = true;
          });

          angular.forEach(inactiveStates, function (inactiveExiting, name) {
            // TODO: Might need to run the inactivations in the proper depth-first order?
            if (!exitingNames[name] && inactiveExiting.includes[exiting.name]) {
              if (DEBUG) $log.debug("Exiting " + name + " because it's a substate of " + exiting.name + " and wasn't found in ", exitingNames);
              if (inactiveExiting.self.onExit)
                $injector.invoke(inactiveExiting.self.onExit, inactiveExiting.self, inactiveExiting.locals.globals);
              angular.forEach(inactiveExiting.locals, function(localval, key) {
                delete inactivePseudoState.locals[key];
              });
              inactiveExiting.locals = null;
              inactiveExiting.self.status = 'exited';
              delete inactiveStates[name];
            }
          });

          if (onExit)
            $injector.invoke(onExit, exiting.self, exiting.locals.globals);
          exiting.locals = null;
          exiting.self.status = 'exited';
          delete inactiveStates[exiting.self.name];
        },

        // Removes a previously inactivated state from the inactive sticky state registry
        stateEntering: function (entering, params, onEnter, updateParams) {
          var inactivatedState = getInactivatedState(entering);
          if (inactivatedState && (updateParams || !getInactivatedState(entering, params))) {
            var savedLocals = entering.locals;
            this.stateExiting(inactivatedState);
            entering.locals = savedLocals;
          }
          entering.self.status = 'entered';

          if (onEnter)
            $injector.invoke(onEnter, entering.self, entering.locals.globals);
        },
        reset: function reset(inactiveState, params) {
          function resetOne(state) { stickySupport.reset(state); }
          if (inactiveState === "*") {
            angular.forEach(stickySupport.getInactiveStates(), resetOne);
            return true;
          }
          var state = $state.get(inactiveState);
          if (!state) return false;
          var exiting = getInactivatedState(state, params);
          if (!exiting) return false;
          stickySupport.stateExiting(exiting);
          $rootScope.$broadcast("$viewContentLoading");
          return true;
        }
      };

      return stickySupport;
    }];
}

mod_sticky.provider("$stickyState", $StickyStateProvider);
