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

      // Used by processTransition to determine if what kind of sticky state transition this is.
      // returns { from: (bool), to: (bool) }
      function getStickyTransitionType(fromPath, toPath, keep) {
        if (fromPath[keep] === toPath[keep]) return { from: false, to: false };
        var stickyFromState = keep < fromPath.length && fromPath[keep].self.sticky;
        var stickyToState = keep < toPath.length && toPath[keep].self.sticky;
        return { from: stickyFromState, to: stickyToState };
      }

      // Returns a sticky transition type necessary to enter the state.
      // Transition can be: reactivate, updateStateParams, or enter

      // Note: if a state is being reactivated but params dont match, we treat
      // it as a Exit/Enter, thus the special "updateStateParams" transition.
      // If a parent inactivated state has "updateStateParams" transition type, then
      // all descendant states must also be exit/entered, thus the first line of this function.
      function getEnterTransition(state, stateParams, reloadStateTree, ancestorParamsChanged) {
        if (ancestorParamsChanged) return "updateStateParams";
        var inactiveState = inactiveStates[state.self.name];
        if (!inactiveState) return "enter";
        if (state.self === reloadStateTree) return "updateStateParams";
//      if (inactiveState.locals == null || inactiveState.locals.globals == null) debugger;
        var paramsMatch = equalForKeys(stateParams, inactiveState.locals.globals.$stateParams, state.ownParams);
//      if (DEBUG) $log.debug("getEnterTransition: " + state.name + (paramsMatch ? ": reactivate" : ": updateStateParams"));
        return paramsMatch ? "reactivate" : "updateStateParams";
      }

      // Given a state and (optional) stateParams, returns the inactivated state from the inactive sticky state registry.
      function getInactivatedState(state, stateParams) {
        var inactiveState = inactiveStates[state.name];
        if (!inactiveState) return null;
        if (!stateParams) return inactiveState;
        var paramsMatch = equalForKeys(stateParams, inactiveState.locals.globals.$stateParams, state.ownParams);
        return paramsMatch ? inactiveState : null;
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
          var states = [];
          angular.forEach(inactiveStates, function (state) {
            states.push(state);
          });
          return states;
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
        //    deepestReactivateChildren: Array of inactive children states of the toState, if the toState is being reactivated.
        //        Note: Transitioning directly to an inactive state with inactive children will reactivate the state, but exit all the inactive children.
        //    enter: Enter transition type for all added states.  This is a sticky array to "toStates" array in $state.transitionTo.
        //    exit: Exit transition type for all removed states.  This is a sticky array to "fromStates" array in $state.transitionTo.
        // }
        processTransition: function (transition) {
          // This object is returned
          var result = { inactives: [], enter: [], exit: [], keep: 0 };
          var fromPath = transition.fromState.path,
            fromParams = transition.fromParams,
            toPath = transition.toState.path,
            toParams = transition.toParams,
            reloadStateTree = transition.reloadStateTree,
            options = transition.options;
          var keep = 0, state = toPath[keep];

          if (options.inherit) {
            toParams = inheritParams($stateParams, toParams || {}, $state.$current, transition.toState);
          }

          while (state && state === fromPath[keep] && equalForKeys(toParams, fromParams, state.ownParams)) {
            // We're "keeping" this state. bump keep var and get the next state in toPath for the next iteration.
            state = toPath[++keep];
          }

          result.keep = keep;

          var idx, deepestUpdatedParams, deepestReactivate, noLongerInactiveStates = {}, pType = getStickyTransitionType(fromPath, toPath, keep);
          var ancestorUpdated = !!options.reload; // When ancestor params change, treat reactivation as exit/enter

          var inactives = [], reactivatingStates = [], enteringStates = [], exitingStates = [];

          // Calculate the "exit" transition for states not "kept", in fromPath.
          // Exit transition can be one of:
          //   exit: standard state exit logic
          //   inactivate: register state as an inactive state
          for (idx = keep; idx < fromPath.length; idx++) {
            if (pType.from) {
              // State is being inactivated, note this in result.inactives array
              result.inactives.push(fromPath[idx]);
              inactives.push(fromPath[idx]);
              result.exit[idx] = "inactivate";
            } else {
              exitingStates.push(fromPath[idx]);
              result.exit[idx] = "exit";
            }
          }

          // Calculate the "enter" transitions for new states in toPath
          // Enter transitions will be either "enter", "reactivate", or "updateStateParams" where
          //   enter: full resolve, no special logic
          //   reactivate: use previous locals
          //   updateStateParams: like 'enter', except exit the inactive state before entering it.
          for (idx = keep; idx < toPath.length; idx++) {
            var enterTrans = !pType.to ? "enter" : getEnterTransition(toPath[idx], toParams, reloadStateTree, ancestorUpdated);
            ancestorUpdated = (ancestorUpdated || enterTrans == 'updateStateParams');
            result.enter[idx] = enterTrans;
            // If we're reactivating a state, make a note of it, so we can remove that state from the "inactive" list
            if (enterTrans == 'reactivate') {
              reactivatingStates.push(toPath[idx]);
              deepestReactivate = noLongerInactiveStates[toPath[idx].name] = toPath[idx];
            } else if (enterTrans == 'updateStateParams') {
              deepestUpdatedParams = noLongerInactiveStates[toPath[idx].name] = toPath[idx];
            }
            enteringStates.push(toPath[idx]);
          }

          // Get the currently inactive states (before the transition is processed), mapped by parent state
          var inactivesByAllParents = mapInactivesByImmediateParent();
          
          // If we are transitioning directly to an inactive state, and that state also has inactive children,
          // then find those children so that they can be exited.
          var deepestReactivateChildren = [];
          if (deepestReactivate === transition.toState) {
            deepestReactivateChildren = inactivesByAllParents[deepestReactivate.name] || [];
          }
          // Add them to the list of states being exited.
          exitingStates = exitingStates.concat(deepestReactivateChildren);

          // Find any other inactive children of any of the states being "exited"
          var exitingChildren = map(exitingStates, function (state) {
            return inactivesByAllParents[state.name] || [];
          });

          // append each array of children-of-exiting states to "exitingStates" because they will be exited too.
          forEach(exitingChildren, function(children) {
            exitingStates = exitingStates.concat(children);
          });

          // Now calculate the states that will be inactive if this transition succeeds.
          // We have already pushed the transitionType == "inactivate" states to 'inactives'.
          // Second, add all the existing inactive states
          inactives = inactives.concat(map(inactiveStates, angular.identity));
          // Finally, remove any states that are scheduled for "exit" or "enter", "reactivate", or "updateStateParams"
          inactives = inactives.filter(function(state) {
            return exitingStates.indexOf(state) === -1 && enteringStates.indexOf(state) === -1;
          });

          result.inactives = inactives;
          result.reactivatingStates = reactivatingStates;
          result.deepestReactivateChildren = deepestReactivateChildren;

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
