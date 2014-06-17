//define(['angularAMD'], function (angularAMD) {
  angular.module('ct.ui.router.extras').provider('$futureState', function ($stateProvider, $urlRouterProvider) {
    var stateFactory, futureStates, futureUrlFragments;
    var transitionPending = false, initPromises = [], initPromise;

    this.futureStates = function (promiseFn) {
      initPromises.push(promiseFn);
    };

    this.futureStateFactory = function (factory) {
      stateFactory = factory;
    };

    this.futureState = function (futureState) {
      futureStates[futureState.stateName] = futureState;
      futureUrlFragments[futureState.urlPrefix] = futureState;
    };

    this.otherwise = function ($injector, $location) {
      var resyncing = false;

      var otherwiseFunc = function ($state) {
        console.log("Unable to map " + $location.path());
        $location.url("/");
      };

      var lazyLoadMissingState = function ($rootScope, $urlRouter, $state) {
        if (!futureUrlFragments) {
          // Asynchronously load state definitions, then resync URL
          initPromise().then(function () {
            resyncing = true;
            $urlRouter.sync();
            resyncing = false;
          });
          return;
        }

        var futureState = provider.findFutureState({ url: $location.path() });
        if (!futureState) {
          return $injector.invoke(otherwiseFunc);
        }

        transitionPending = true;
        // Config loaded.  Asynchronously lazy-load state definition from URL fragment, if mapped.
        provider.lazyLoadState(futureState).then(function (state) {
          // TODO: Should have a specific resolve value that says 'dont register a state because I already did'
          if (state)
            $stateProvider.state(state);
          resyncing = true;
          $urlRouter.sync();
          resyncing = false;
          transitionPending = false;
        }, function () {
          transitionPending = false;
          $state.go("top");
        });
      };
      if (transitionPending) return;

      var nextFn = resyncing ? otherwiseFunc : lazyLoadMissingState;
      return $injector.invoke(nextFn);
    };
    $urlRouterProvider.otherwise(this.otherwise);

    var provider = {
      config: function () {
        return initPromise();
      },
      findFutureState: undefined,
      lazyLoadState: undefined
    };

    this.$get = function ($injector, $state, $q, $rootScope, $urlRouter) {

      /* options is an object with at least a name or url attribute */
      provider.findFutureState = function findFutureState(options) {
        if (options.name) {
          var nameComponents = options.name.split(/\./);
          while (nameComponents.length) {
            var stateName = nameComponents.join(".");
            if ($state.get(stateName))
              return null; // State is already defined; nothing to do
            if (futureStates[stateName])
              return futureStates[stateName];
            nameComponents.pop();
          }
        }

        if (options.url) {
          var urlComponents = options.url.split(/\//);
          while (urlComponents.length) {
            var urlPrefix = urlComponents.join("/");
            if (futureUrlFragments[urlPrefix])
              return futureUrlFragments[urlPrefix];
            urlComponents.pop();
          }
        }
      };

      provider.init = function init() {
        $rootScope.$on("$stateNotFound", function (event, unfoundState, fromState, fromParams) {
          if (transitionPending) return;
          console.log("event, unfoundState, fromState, fromParams", event, unfoundState, fromState, fromParams);

          var futureState = provider.findFutureState({ name: unfoundState.to });
          if (futureState == null) return;

          event.preventDefault();
          transitionPending = true;

          var promise = provider.lazyLoadState(futureState);
          promise.then(function (state) {
            // TODO: Should have a specific resolve value that says 'dont register a state because I already did'
            if (state)
              $stateProvider.state(state);
            $state.go(unfoundState.to, unfoundState.toParams);
            transitionPending = false;
          }, function (error) {
            console.log("failed to lazy load state ", error);
            $state.go(fromState, fromParams);
            transitionPending = false;
          });
        });

        // Do this better.  Want to load remote config once, before everything else
        if (!initPromise) {
          var promises = [];
          _.each(initPromises, function(promiseFn) {
            promises.push($injector.invoke(promiseFn));
          });
          initPromise = _.once(function() {
            return $q.all(promises).then(function(data) {
              return _.flatten(data);
            })
          });
        }

        initPromise().then(function (array) {
          console.log("Loaded initial future state configuration", array);

          futureStates = {};
          futureUrlFragments = {};
          // Get array of future states from user code.
          _.each(array, stateFactory);

          $urlRouter.sync();
        });
      };


      provider.lazyLoadState = function lazyLoadState(lazyState) {
        var deferred = $q.defer();
        if (!lazyState) {
          deferred.reject("No lazyState passed in " + lazyState);
          return deferred.promise;
        }

        var state = {
          name: lazyState.stateName,
          template: undefined,
          url: lazyState.pathFragment + "/",
          resolve: {},
          data: {}
        };

        switch (lazyState.type) {
          case "USER":
            state.template = "<iframe width='100%' height='100%' src='" + lazyState.url + "'></iframe>";
            deferred.resolve(state);
            break;
          case "JS":
            var d = $q.defer();
            require([lazyState.url + "?v=1"], function (runFunction) {
              var layout = runFunction(window.globalEvents, window.loggedInUserID, jQuery.Deferred());
              d.resolve(layout);
            });
            state.controller = function ($scope, backboneView) {
              $scope.backboneView = backboneView;
            };
            state.resolve.backboneView = function () {
              return d.promise
            };
            state.template = "<div mediture-inbox backbone-view='backboneView'></div>";
            deferred.resolve(state);
            break;
          case "NGAPP":
            var url = lazyState.url.replace(/\.js$/, "");
            require([ "ngload!" + url , 'ngload', 'angularAMD'], function (module, ngload, angularAMD) {
              angularAMD.processQueue();
              deferred.resolve(module);
            });
            state.resolve.ngapp = function () {
              return deferred.promise;
            };
            state.template = "<div ui-view></div>";
            break;
          default:
            throw Error("Unknown State Type: " + lazyState.type);
        }

        return deferred.promise;
      };

      return provider;
    }
  });

  angular.module('ct.ui.router.extras').run(function ($futureState) {
    $futureState.init();
  });

//  return app;
//});
