//define(['angularAMD'], function (angularAMD) {
  angular.module('ct.ui.router.extras').provider('$futureState', function _futureStateProvider($stateProvider, $urlRouterProvider) {
    var stateFactories = {}, futureStates = {}, futureUrlFragments = {};
    var transitionPending = false, resolveFunctions = [], initPromise, initDone = false;
    var provider = this;

    // This function registers a promiseFn, to be resolved before the url/state matching code
    // will reject a route.  The promiseFn is injected/executed using the runtime $injector.
    // The function should return a promise.  
    // When all registered promises are resolved, then the route is re-sync'ed.
    
    // Example: function($http) {
    //  return $http.get('//server.com/api/DynamicFutureStates').then(function(data) {
    //    angular.forEach(data.futureStates, function(fstate) { $futureStateProvider.futureState(fstate); });
    //  };
    // }
    this.addResolve = function (promiseFn) {
      resolveFunctions.push(promiseFn);
    };

    // Register a state factory function for a particular future-state type.  This factory, given a future-state object,
    // should create a ui-router state.
    // The factory function is injected/executed using the runtime $injector.  The future-state is injected as 'futureState'.
    
    // Example: 
    //    $futureStateProvider.stateFactory('test', function(futureState) {
    //      return {
    //        name: futureState.stateName,
    //        url: futureState.pathFragment,
    //        template: '<h3>Future State Template</h3>',
    //        controller: function() {
    //          console.log("Entered state " + futureState.stateName);
    //        }
    //      }
    //    });
    this.stateFactory = function (futureStateType, factory) {
      stateFactories[futureStateType] = factory;
    };

    this.futureState = function (futureState) {
      futureStates[futureState.stateName] = futureState;
      futureUrlFragments[futureState.urlPrefix] = futureState;
    };
    
    /* options is an object with at least a name or url attribute */
    function findFutureState(options) {
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
    }


    function futureState_otherwise($injector, $location) {
      var resyncing = false;
      var $log = $injector.get("$log");

      var otherwiseFunc = function otherwiseFunc($state) {
        $log.debug("Unable to map " + $location.path());
        $location.url("/");
      };

      var lazyLoadMissingState = function lazyLoadMissingState($rootScope, $urlRouter, $state) {
        if (!initDone) {
          // Asynchronously load state definitions, then resync URL
          initPromise().then(function initialResync() {
            resyncing = true;
            $urlRouter.sync();
            resyncing = false;
          });
          initDone = true;
          return;
        }

        var futureState = findFutureState({ url: $location.path() });
        if (!futureState) {
          return $injector.invoke(otherwiseFunc);
        }

        transitionPending = true;
        // Config loaded.  Asynchronously lazy-load state definition from URL fragment, if mapped.
        lazyLoadState(futureState).then(function lazyLoadedStateCallback(state) {
          // TODO: Should have a specific resolve value that says 'dont register a state because I already did'
          if (state)
            $stateProvider.state(state);
          resyncing = true;
          $urlRouter.sync();
          resyncing = false;
          transitionPending = false;
        }, function lazyLoadStateAborted() {
          transitionPending = false;
          $state.go("top");
        });
      };
      if (transitionPending) return;

      var nextFn = resyncing ? otherwiseFunc : lazyLoadMissingState;
      return $injector.invoke(nextFn);
    }
    $urlRouterProvider.otherwise(futureState_otherwise);

    var serviceObject = {
      getResolvePromise: function () {
        return initPromise();
      }
    };
    
    // Used in .run() block to init
    this.$get = function futureStateProvider_get($injector, $state, $q, $rootScope, $urlRouter, $log) {
      function init() {
        $rootScope.$on("$stateNotFound", function futureState_notFound(event, unfoundState, fromState, fromParams) {
          if (transitionPending) return;
          $log.debug("event, unfoundState, fromState, fromParams", event, unfoundState, fromState, fromParams);

          var futureState = findFutureState({ name: unfoundState.to });
          if (futureState == null) return;

          event.preventDefault();
          transitionPending = true;

          var promise = lazyLoadState(futureState);
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
          _.each(resolveFunctions, function(promiseFn) {
            promises.push($injector.invoke(promiseFn));
          });
          initPromise = _.once(function flattenFutureStates() {
            var allPromises = $q.all(promises);
            return allPromises.then(function(data) { 
              return _.flatten(data); 
            })
          });
        }

        initPromise().then(function buildRealStates(futureStates) {
          $log.debug("Loaded initial future state configuration", futureStates);

          // Get futureStates of future states from user code.
          angular.forEach(futureStates, function(futureState) {
            provider.futureState(futureState);
          });
          $urlRouter.sync();
        });
      }
      init();
      
      serviceObject.futureState = provider.futureState;
      serviceObject.state = $stateProvider.state;
      
      function lazyLoadState(futureState) {
        if (!futureState) {
          var deferred = $q.defer();
          deferred.reject("No lazyState passed in " + futureState);
          return deferred.promise;
        }

        var state = {
          name: futureState.stateName,
          template: undefined,
          url: futureState.pathFragment + "/",
          resolve: {},
          data: {}
        };

        var type = futureState.type;
        var factory = stateFactories[type];
        if (!factory) throw Error("No state factory for futureState.type: " + (futureState && futureState.type));
        return $injector.invoke(factory, factory, { futureState: futureState });
      }

      return serviceObject;
    }
  });

  angular.module('ct.ui.router.extras').run(['$futureState', 
      // Just inject $futureState so it gets initialized.
    function ($futureState) { }
  ]);

//  return app;
//});
