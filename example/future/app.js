// Require angularAMD, ui-router, and ui-router-extras
define([ 'angularAMD',  'angular-ui-router',  'ui-router-extras' ],
function (angularAMD) { // Only need to inject angularAMD for app config
  var app = angular.module("futureStates", ['ct.ui.router.extras']);

  app.config(['$futureStateProvider', function($futureStateProvider) {
    $futureStateProvider.stateFactory('ngload', ngloadStateFactory); // register AngularAMD ngload state factory
    $futureStateProvider.stateFactory('iframe', iframeStateFactory); // register silly iframe state factory
    
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
    $futureStateProvider.addResolve(loadAndRegisterFutureStates);
  }]);
  
  // Tell angularAMD to tell angular to bootstrap our app
  angularAMD.bootstrap(app);
  // return app for requireJS registration
  return app;
});