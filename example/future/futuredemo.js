// Require angularAMD, ui-router, and ui-router-extras
define([ 'angularAMD',  'angular-ui-router',  'ui-router-extras-future', 'ui-router-extras-statevis' ],
function (angularAMD) { // Only need to inject angularAMD for app config
  var app = angular.module("futureStates",
    ['ct.ui.router.extras.future', 'ct.ui.router.extras.statevis']);

  app.config(['$futureStateProvider', '$controllerProvider', 
    function($futureStateProvider, $controllerProvider) {
    // Loading states from .json file during runtime
    var loadAndRegisterFutureStates = function ($http) {
      // $http.get().then() returns a promise
      return $http.get('futureStates.json').then(function (resp) {
        angular.forEach(resp.data, function (fstate) {
          // Register each state returned from $http.get() with $futureStateProvider
          $futureStateProvider.futureState(fstate);
        });
      });
    };

    $futureStateProvider.stateFactory('ngload', ngloadStateFactory); // register AngularAMD ngload state factory
    $futureStateProvider.stateFactory('iframe', iframeStateFactory); // register silly iframe state factory
    $futureStateProvider.stateFactory('requireCtrl', requireCtrlStateFactory); // Register state factory that registers controller via eval.
      
    $futureStateProvider.addResolve(loadAndRegisterFutureStates);
  }]);
  
  app.run(function ($rootScope, $state, $window, $timeout) {
    $rootScope.$state = $state;
    $rootScope.$on("$stateChangeSuccess", function() {
      $timeout(function() {
        $window.ga('send', 'pageview', $window.location.pathname+$window.location.hash);
      } );
    });
  });
  
  // Tell angularAMD to tell angular to bootstrap our app
  angularAMD.bootstrap(app);
  // return app for requireJS registration
  return app;

  function requireCtrlStateFactory($q, futureState) {
    var d = $q.defer(); // make a deferred

    // Tell RequireJS to load lazyController 
    // (leave off the .js)
    require(['lazyController'], function (lazyController) {
      // RequireJS asynchronousely gives us the result of 
      // lazyController.js as the 'lazyController' parameter

      // Define the full UI-Router state using the 
      // lazyController and the injected futureState 
      var fullstate = { controller: lazyController,
        name: futureState.stateName,
        url: futureState.urlPrefix,
        templateUrl: futureState.templateUrl
      };

      // Resolve the promise with the full UI-Router state.
      d.resolve(fullstate);
    });
    
    // The state factory returns the promise
    return d.promise;
  }
  
  function iframeStateFactory ($q, futureState) {
    var state = {
      name: futureState.stateName,
      template: "<iframe src='" + futureState.src + "'></iframe>",
      url: futureState.urlPrefix
    };
    return $q.when(state);
  }

  function ngloadStateFactory($q, futureState) {
    var ngloadDeferred = $q.defer();
    require([ "ngload!" + futureState.src , 'ngload', 'angularAMD'],
        function ngloadCallback(result, ngload, angularAMD) {
          angularAMD.processQueue();
          ngloadDeferred.resolve(undefined);
        });
    return ngloadDeferred.promise;
  } 
});