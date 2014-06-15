angular.module("ct.ui.router.extras", [ 'ui.router' ]);

var _StickyState; // internal reference to $stickyStateProvider
var internalStates = {}; // Map { statename -> InternalStateObj } holds internal representation of all states
var root, pendingTransitions = [], pendingRestore;

function SurrogateState(type) {
  return {
    resolve: { },
    locals: {
      globals: root && root.locals && root.locals.globals
    },
    views: { },
    self: { },
    ownParams: [],
    surrogateType: type
  };
}

var inactivePseudoState = new SurrogateState("__inactives");
inactivePseudoState.self.name = '__inactives';

angular.module("ct.ui.router.extras").run(["$stickyState", function ($stickyState) {
  _StickyState = $stickyState;
}]);

angular.module("ct.ui.router.extras").config(
    [ "$provide", "$stateProvider", '$stickyStateProvider',
      function ($provide, $stateProvider, $stickyStateProvider) {


        $stateProvider.decorator('parent', function (state, parentFn) {
          if (!root) {
            root = parentFn({});
            inactivePseudoState.parent = root;
            inactivePseudoState.locals = root.locals;
//                inactivePseudoState.locals.globals = root.locals.globals;
          }
          return parentFn(state);
        });

        $stateProvider.decorator('path', function (state, parentFn) {
          // Capture each internal state representations
          internalStates[state.self.name] = state;
          console.log(state.self.name + ".ownParams: ", state.ownParams)
          // Register the ones marked as "sticky"
          if (state.self.sticky === true) {
            $stickyStateProvider.registerStickyState(state.self);
          }
          // Add a fake root node to each state's path to hold the inactive states' locals
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

        $provide.decorator("$state", ['$delegate', function ($state) {
          var realTransitionTo = $state.transitionTo;
          $state.transitionTo = function (to, toParams, options) {
            var idx = pendingTransitions.length;
            if (pendingRestore) {
              pendingRestore();
              console.log("Restored paths from pending transition");
            }

            // Custom transitionTo logic here
            var fromState = $state.$current, fromParams = $state.params;
            var rel = options.relative || $state.$current; // Not sure if/when $state.$current is appropriate here.
            var toStateSelf = $state.get(to, rel); // exposes findState relative path functionality, returns state.self
            var savedToStatePath, savedFromStatePath, stickyTransitions;
            var reactivated = [], exited = [], terminalReactivatedState;

            function debugTransition(transition) {
              function message(path, index, state) {
                return (path[index] ? path[index].toUpperCase() + ": " + state.self.name : "(" + state.self.name + ")");
              }

              var inactiveLogVar = map(transition.inactives, function (state) {
                return state.self.name
              });
              var enterLogVar = map(toState.path, function (state, index) {
                return message(transition.enter, index, state);
              });
              var exitLogVar = map(fromState.path, function (state, index) {
                return message(transition.exit, index, state);
              });
              console.log("exit: ", exitLogVar);
              console.log("enter: ", enterLogVar);
              console.log("After transition, inactives: ", inactiveLogVar);
            }

            var noop = function () {
            };
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
              surrogate.self = angular.extend({}, state.self);
              surrogate.self.onEnter = function () {
                // ui-router sets locals on the surrogate to a blank locals (because we gave it nothing to resolve)
                // Re-set it back to the already loaded state.locals here.
                surrogate.locals = state.locals;
                _StickyState.stateReactivated(state);
              };
              return surrogate;
            }

            function stateInactivatedSurrogate(state) {
              var surrogate = new SurrogateState("inactivate");
              surrogate.self = angular.extend({}, state.self);
              surrogate.self.onExit = function () {
                _StickyState.stateInactivated(state);
              };
              return surrogate;
            }

            function stateEnteredSurrogate(state, toParams) {
              var oldOnEnter = state.self.onEnter
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
              state.self = angular.extend({}, state.self);
              state.self.onExit = function () {
                _StickyState.stateExiting(state, exited, oldOnExit);
              };
              restore.addRestoreFunction(function () {
                state.self.onExit = oldOnExit;
              });

              return state;
            }

            if (!toStateSelf) debugger;
            if (toStateSelf) {
              var toState = internalStates[toStateSelf.name]; // have the state, now grab the internal state representation
              if (!toState) debugger;
              if (toState) {
                savedToStatePath = toState.path;
                savedFromStatePath = fromState.path;

                var currentTransition = {toState: toState, toParams: toParams || {}, fromState: fromState, fromParams: fromParams || {}};
                var msg = currentTransition.fromState.self.name + ": " +
                    angular.toJson(currentTransition.fromParams) + ": " +
                    " -> " +
                    currentTransition.toState.self.name + ": " +
                    angular.toJson(currentTransition.toParams);
                console.log("Current transition: ", msg);

                pendingTransitions.push(currentTransition);
                pendingRestore = restore;
                stickyTransitions = _StickyState.processTransition(currentTransition);
                debugTransition(stickyTransitions);

                var surrogateToPath = toState.path.slice(0, stickyTransitions.keep);
                var surrogateFromPath = fromState.path.slice(0, stickyTransitions.keep);

                // Rebuild root.inactiveLocals each time...
                for (var name in inactivePseudoState.locals) {
                  delete inactivePseudoState.locals[name];
                }
                for (var i = 0; i < stickyTransitions.inactives.length; i++) {
                  var iLocals = stickyTransitions.inactives[i].locals;
                  for (name in iLocals) {
                    if (iLocals.hasOwnProperty(name) && name.indexOf("@") != -1) {
                      inactivePseudoState.locals[name] = iLocals[name]; // Add all inactive views not already included.
                    }
                  }
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
                      console.log("exitable: ", exiting.self.name);
                      inactiveOrphans.push(exiting);
                    }
                  });
                  inactiveOrphans.sort();
                  inactiveOrphans.reverse();
                  surrogateFromPath = surrogateFromPath.concat(map(inactiveOrphans, function (exiting) {
                    return stateExitedSurrogate(exiting)
                  }));
                  exited = exited.concat(inactiveOrphans);
                }

                toState.path = surrogateToPath;
                fromState.path = surrogateFromPath;

                var pathMessage = function (state) {
                  return (state.surrogateType ? state.surrogateType + ":" : "") + state.self.name;
                };
                console.log("SurrogateFromPath: ", map(surrogateFromPath, pathMessage));
                console.log("SurrogateToPath: ", map(surrogateToPath, pathMessage));
              }
            }

            var transitionPromise = realTransitionTo.apply($state, arguments);
            transitionPromise.then(function transitionSuccess(state) {
              restore();
              console.log("Current state: " + state.name + ", inactives: ", map(_StickyState.getInactiveStates(), function (s) {
                return s.self.name
              }));
            }, function transitionFailed(err) {
              if (err.message !== "transition prevented") {
                console.log("transition failed", err);
                console.log(err.stack);
              }
              restore();
            })
          };
          return $state;
        }]);
      }]);



