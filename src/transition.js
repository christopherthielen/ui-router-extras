
angular.module("ct.ui.router.extras").config(
  [ "$provide", "$stateProvider", '$stickyStateProvider',
    function ($provide, $stateProvider, $stickyStateProvider) {
      // Need access to both state representations. Decorate any attribute to access private state object.
      var states = {};
      $stateProvider.decorator('path', function(state, parentFn) {
        states[state.self.name] = state;
        if (state.self.resolve === undefined) {
          state.resolve = {};
          state.self.resolve = state.resolve;
        }
        return parentFn(state);
      });

      // Decorate the $state service, so we can replace $state.transitionTo()
      $provide.decorator("$state", ['$delegate', '$rootScope', '$q', '$injector',
        function ($state, $rootScope, $q, $injector) {
          // internal reference to the real $state.transitionTo function
          var $state_transitionTo = $state.transitionTo;
          var transitionDepth = -1;
          var tDataStack = [];
          var restoreFnStack = [];
          var root = $state.$current;
          states[""] = root;

          function decorateInjector(tData, restoreItemFns) {
            var oldinvoke = $injector.invoke;
            var oldinstantiate = $injector.instantiate;
            $injector.invoke = function (fn, self, locals) {
              return oldinvoke(fn, self, angular.extend({$transition$: tData}, locals));
            };
            $injector.instantiate = function (fn, locals) {
              return oldinstantiate(fn, angular.extend({$transition$: tData}, locals));
            };
            restoreItemFns.push(function () {
              $injector.invoke = oldinvoke;
              $injector.instantiate = oldinstantiate;
            });
          }

          function success(deferred, tSuccess) {
            return function successFn(data) {
              restoreFnStack.pop()();
              $rootScope.$broadcast("$transitionSuccess", tSuccess);
              return deferred.resolve(data);
            };
          }

          function failure(deferred, tFail) {
            return function failureFn(error) {
              restoreFnStack.pop()();
              $rootScope.$broadcast("$transitionError", tFail, error);
              return deferred.reject(error);
            };
          }


          $state.transitionTo = function (to, toParams, options) {
            var deferred = $q.defer();
            var t = tDataStack[++transitionDepth] = { promise: deferred.promise };
            var tPromise = $state_transitionTo.apply($state, arguments);
            tDataStack.pop();
            transitionDepth--;

            return tPromise.then(success(deferred, t), failure(deferred, t));
          };


          $rootScope.$on("$stateChangeStart", function (evt, toState, toParams, fromState, fromParams) {
              var depth = transitionDepth;
              var tData = angular.extend(tDataStack[depth], {
                to: { state: toState, params: toParams },
                from: { state: fromState, params: fromParams }
              });

              var restoreItemFns = []; // list of restore functions for this stack level

              restoreFnStack.push(function() {
                for (var i = 0; i < restoreItemFns.length; i++) {
                  restoreItemFns[i]();
                }
              });

              decorateInjector(tData, restoreItemFns);
              $rootScope.$broadcast("$transitionStart", tData);
            }
          );

          return $state;
        }]);
    }
  ]
);


//angular.module("ct.ui.router.extras").run(function ($rootScope) {
//  $rootScope.$on("$transitionStart", function (event, tData) {
////    console.log("$transitionStart: ", tData.to.state.name);
//  });
//  $rootScope.$on("$transitionSuccess", function (event, tData) {
////    console.log("$transitionSuccess: ", tData.to.state.name);
//  });
//  $rootScope.$on("$transitionError", function (event, tData) {
////    console.log("$transitionError: ", tData.to.state.name);
//  });
//});