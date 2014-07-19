var _StickyState; // internal reference to $stickyStateProvider
var internalStates = {}; // Map { statename -> InternalStateObj } holds internal representation of all states
var root, // Root state, internal representation
    pendingTransitions = [], // One transition may supersede another.  This holds references to all pending transitions
    pendingRestore, // The restore function from the superseded transition
    inactivePseudoState; // This pseudo state holds all the inactive states' locals (resolved state data, such as views etc)

// Creates a blank surrogate state
function SurrogateState(type) {
  return {
    resolve: { },
    locals: {
      globals: root && root.locals && root.locals.globals
    },
    views: { },
    self: { },
    params: { },
    ownParams: [],
    surrogateType: type
  };
}


// Grab a copy of the $stickyState service for use by the transition management code
angular.module("ct.ui.router.extras").run(["$stickyState", function ($stickyState) { _StickyState = $stickyState; }]);

angular.module("ct.ui.router.extras").config(
    [ "$provide", "$stateProvider", '$stickyStateProvider',
      function ($provide, $stateProvider, $stickyStateProvider) {
        // inactivePseudoState (__inactives) holds all the inactive locals (resolved states data: views, etc)
        // 
        // __inactives needs to reference root.locals.globals.  At this time, root.locals.globals isn't populated
        // so copy a reference to root.locals onto __inactives.locals (then when ui-router populates root.locals.globals
        // it also populates __inactives.locals.globals.  Likewise, this means inactive states are stored on the 
        // root state's locals, hmmm that might not be great.
        var pState = { 
          self: {  name: '__inactives'  },
          onEnter: function() { inactivePseudoState.locals.globals = root.locals.globals; }
        };
        inactivePseudoState = angular.extend(new SurrogateState("__inactives"), pState);
        
        // Need access to the internal 'root' state object.  Get it by decorating the StateBuilder parent function.  
        $stateProvider.decorator('parent', function (state, parentFn) {
          if (!root) {
            // Note: this code gets run only on the first state
            root = parentFn({}); // StateBuilder.parent({}) returns the root internal state object
            inactivePseudoState.parent = root; // Hook pseudoState.parent up to the root state
            inactivePseudoState.locals = root.locals; 
          }
          return parentFn(state);
        });

        // Sticky States retains views by holding onto the inactivated locals of states.  It stores 
        // them in a pseudo state called __inactives which is inserted between root and each top level state.
        $stateProvider.decorator('path', function (state, parentFn) {
          // Decorate the path of each state, adding the __inactives pseudostate to the beginning.
          
          // Note to self: I think this could be simplified by adding __inactives to the root state in the 'parent' 
          // decorator.  Then, stock UI-Router code will build the substate path with __inactives as pre-root.
          
          // Capture each internal state representations
          internalStates[state.self.name] = state;
          state.self.$$state = function() { return internalStates[state.self.name]; };
          
          // Register the ones marked as "sticky"
          if (state.self.sticky === true) {
            $stickyStateProvider.registerStickyState(state.self);
          }
          // Add a fake parent node to each state's path to hold all the inactive states' locals
          var realPath = [], temp = parentFn(state); // call parent path function, which returns an array of states
          angular.forEach(temp, function (pathElem) {
            // paths are constructed from the parent paths
            if (pathElem !== inactivePseudoState) {
              realPath.push(pathElem);
            }
          });
          // Return a fake path with the first element being the inactivePseudState
          return [ inactivePseudoState ].concat(realPath);
        });

        $provide.decorator("$state", ['$delegate', '$log', function ($state, $log) {
          var realTransitionTo = $state.transitionTo;
          $state.transitionTo = function (to, toParams, options) {
            var idx = pendingTransitions.length;
            if (pendingRestore) {
              pendingRestore();
              if (DEBUG) { $log.debug("Restored paths from pending transition"); }
            }

            // Custom transitionTo logic here
            var fromState = $state.$current, fromParams = $state.params;
            var rel = options && options.relative || $state.$current; // Not sure if/when $state.$current is appropriate here.
            var toStateSelf = $state.get(to, rel); // exposes findState relative path functionality, returns state.self
            var savedToStatePath, savedFromStatePath, stickyTransitions;
            var reactivated = [], exited = [], terminalReactivatedState;

            function debugTransition(currentTransition, stickyTransition) {
              function message(path, index, state) {
                return (path[index] ? path[index].toUpperCase() + ": " + state.self.name : "(" + state.self.name + ")");
              }

              var inactiveLogVar = map(stickyTransition.inactives, function (state) {
                return state.self.name;
              });
              var enterLogVar = map(toState.path, function (state, index) {
                return message(stickyTransition.enter, index, state);
              });
              var exitLogVar = map(fromState.path, function (state, index) {
                return message(stickyTransition.exit, index, state);
              });
              
              var transitionMessage = currentTransition.fromState.self.name + ": " +
                  angular.toJson(currentTransition.fromParams) + ": " +
                  " -> " +
                  currentTransition.toState.self.name + ": " +
                  angular.toJson(currentTransition.toParams);
              
              $log.debug("   Current transition: ", transitionMessage);
              $log.debug("Before transition, inactives are:   : ", map(_StickyState.getInactiveStates(), function(s) { return s.self.name; } ));
              $log.debug("After transition,  inactives will be: ", inactiveLogVar);
              $log.debug("Transition will exit:  ", exitLogVar);
              $log.debug("Transition will enter: ", enterLogVar);
            }

            var noop = function () { };
            var restore = function () {
              if (savedToStatePath) {
                toState.path = savedToStatePath;
                savedToStatePath = null;
              }

              if (savedFromStatePath) {
                fromState.path = savedFromStatePath;
                savedFromStatePath = null;
              }

              angular.forEach(restore.restoreFunctions, function (restoreFunction) {
                restoreFunction();
              });
              restore = noop;
              pendingRestore = null;
              pendingTransitions.splice(idx, 1); // Remove this transition from the list
            };
            restore.restoreFunctions = [];
            restore.addRestoreFunction = function addRestoreFunction(fn) {
              this.restoreFunctions.push(fn);
            };

            function stateReactivatedSurrogatePhase1(state) {
              var surrogate = angular.extend(new SurrogateState("reactivate_p1"), { locals: state.locals });
              surrogate.self = angular.extend({}, state.self);
              return surrogate;
            }

            function stateReactivatedSurrogatePhase2(state) {
              var surrogate = angular.extend(new SurrogateState("reactivate_p2"), state);
//              surrogate.self = angular.extend({}, state.self);
              var oldOnEnter = surrogate.self.onEnter;
              surrogate.self.onEnter = function () {
                // ui-router sets locals on the surrogate to a blank locals (because we gave it nothing to resolve)
                // Re-set it back to the already loaded state.locals here.
                surrogate.locals = state.locals;
                _StickyState.stateReactivated(state);
              };
              restore.addRestoreFunction(function() {
                state.self.onEnter = oldOnEnter;
              });
              return surrogate;
            }

            function stateInactivatedSurrogate(state) {
              var surrogate = new SurrogateState("inactivate");
              surrogate.self = state.self;
              var oldOnExit = state.self.onExit;
              surrogate.self.onExit = function () {
                _StickyState.stateInactivated(state);
              };
              restore.addRestoreFunction(function() {
                state.self.onExit = oldOnExit;
              });
              return surrogate;
            }

            function stateEnteredSurrogate(state, toParams) {
              var oldOnEnter = state.self.onEnter;
              state.self.onEnter = function () {
                _StickyState.stateEntering(state, toParams, oldOnEnter);
              };
              restore.addRestoreFunction(function () {
                state.self.onEnter = oldOnEnter;
              });

              return state;
            }

            function stateExitedSurrogate(state) {
              var oldOnExit = state.self.onExit;
//              state.self = angular.extend({}, state.self);
              state.self.onExit = function () {
                _StickyState.stateExiting(state, exited, oldOnExit);
              };
              restore.addRestoreFunction(function () {
                state.self.onExit = oldOnExit;
              });

              return state;
            }

            // if (!toStateSelf) defugger;
            if (toStateSelf) {
              var toState = internalStates[toStateSelf.name]; // have the state, now grab the internal state representation
//              if (!toState) debugger;
              if (toState) {
                savedToStatePath = toState.path;
                savedFromStatePath = fromState.path;

                var currentTransition = {toState: toState, toParams: toParams || {}, fromState: fromState, fromParams: fromParams || {}};
//                console.log("Current transition: ", msg);

                pendingTransitions.push(currentTransition);
                pendingRestore = restore;
                stickyTransitions = _StickyState.processTransition(currentTransition);
                if (DEBUG) debugTransition(currentTransition, stickyTransitions);

                var surrogateToPath = toState.path.slice(0, stickyTransitions.keep);
                var surrogateFromPath = fromState.path.slice(0, stickyTransitions.keep);

                // Rebuild root.inactiveLocals each time...
                angular.forEach(inactivePseudoState.locals, function(local, name) {
                  delete inactivePseudoState.locals[name];
                });
                
                for (var i = 0; i < stickyTransitions.inactives.length; i++) {
                  var iLocals = stickyTransitions.inactives[i].locals;
                  angular.forEach(iLocals, function(view, name) {
                    if (iLocals.hasOwnProperty(name) && name.indexOf("@") != -1) {
                      inactivePseudoState.locals[name] = view; // Add all inactive views not already included.
                    }
                  });
                }

                angular.forEach(stickyTransitions.enter, function (value, idx) {
                  var surrogate;
                  if (value === "reactivate") {
                    surrogate = stateReactivatedSurrogatePhase1(toState.path[idx]);
                    // Add surrogate to ToPath again and FromPath.
                    // This is to get ui-router to add the surrogate locals to the protoypal locals object
                    surrogateToPath.push(surrogate);
                    surrogateFromPath.push(surrogate);  // so toPath[i] === fromPath[i]
                    reactivated.push(stateReactivatedSurrogatePhase2(toState.path[idx]));
                    terminalReactivatedState = surrogate;
                  } else if (value === "updateStateParams") {
                    surrogate = stateEnteredSurrogate(toState.path[idx]);
                    surrogateToPath.push(surrogate);
                    terminalReactivatedState = surrogate;
                  } else if (value === "enter") {
                    surrogateToPath.push(stateEnteredSurrogate(toState.path[idx]));
                  }
                });

                angular.forEach(stickyTransitions.exit, function (value, idx) {
                  var exiting = fromState.path[idx];
                  if (value === "inactivate") {
                    surrogateFromPath.push(stateInactivatedSurrogate(exiting));
                    exited.push(exiting);
                  } else if (value === "exit") {
                    surrogateFromPath.push(stateExitedSurrogate(exiting));
                    exited.push(exiting);
                  }
                });

                if (reactivated.length) {
                  angular.forEach(reactivated, function (surrogate) {
                    // Add surrogate for reactivated to ToPath again, this time without a matching FromPath entry
                    // This is to get ui-router to call the surrogate's onEnter callback.
                    surrogateToPath.push(surrogate);
                  });
                }

                if (terminalReactivatedState) {
                  var prefix = terminalReactivatedState.self.name + ".";
                  var inactiveStates = _StickyState.getInactiveStates();
                  var inactiveOrphans = [];
                  inactiveStates.forEach(function (exiting) {
                    if (exiting.self.name.indexOf(prefix) === 0) {
//                      $log.debug("exitable: ", exiting.self.name);
                      inactiveOrphans.push(exiting);
                    }
                  });
                  inactiveOrphans.sort();
                  inactiveOrphans.reverse();
                  surrogateFromPath = surrogateFromPath.concat(map(inactiveOrphans, function (exiting) {
                    return stateExitedSurrogate(exiting);
                  }));
                  exited = exited.concat(inactiveOrphans);
                }

                toState.path = surrogateToPath;
                fromState.path = surrogateFromPath;

                var pathMessage = function (state) {
                  return (state.surrogateType ? state.surrogateType + ":" : "") + state.self.name;
                };
                
                if (DEBUG) $log.debug("SurrogateFromPath: ", map(surrogateFromPath, pathMessage));
                if (DEBUG) $log.debug("SurrogateToPath:   ", map(surrogateToPath, pathMessage));
              }
            }

            var transitionPromise = realTransitionTo.apply($state, arguments);
            transitionPromise.then(function transitionSuccess(state) {
              restore();
              state.status = 'active';
              if (DEBUG) {
                var currentState = internalStates[state.name];
                $log.debug("Current state: " + currentState.self.name + ", inactive states: ", map(_StickyState.getInactiveStates(), function (s) {
                  return s.self.name;
                }));
                
                var viewMsg = function(local, name) {
                  return "'" + name + "' (" + local.$$state.name + ")";
                };
                var statesOnly = function(local, name) {
                  return name != 'globals' && name != 'resolve';
                };
                var viewsForState = function(state) {
                  var views = map(filterObj(state.locals, statesOnly), viewMsg).join(", ");
                  return "(" + (state.self.name ? state.self.name : "root") + ".locals" + (views.length ? ": " + views : "") + ")"; 
                };
                
                var message = viewsForState(currentState);
                var parent = currentState.parent;
                while (parent && parent !== currentState) {
                  if (parent.self.name === "") {
                    // Show the __inactives before showing root state.
                    message = viewsForState($state.$current.path[0]) + " / " + message;
                  }
                  message = viewsForState(parent) + " / " + message;
                  currentState = parent;
                  parent = currentState.parent;
                }
                
                $log.debug("Views: " + message);
              }
            }, function transitionFailed(err) {
              if (err.message !== "transition prevented" && 
                  err.message !== "transition aborted" && 
                  err.message !== "transition superseded") {
                if (DEBUG) $log.debug("transition failed", err);
                if (DEBUG) console.log(err.stack);
              }
              restore();
            });
          };
          return $state;
        }]);
      }]);



