// Require angularAMD, ui-router, and ui-router-extras
define([ 'angularAMD',  'angular-ui-router',  'ui-router-extras',  'ui-router-extras-statevis' ],
function (angularAMD) { // Only need to inject angularAMD for app config
  var app = angular.module("futureStates", ['ct.ui.router.extras', 'ct.ui.router.extras.examples.statevis']);

  app.config(['$futureStateProvider', function($futureStateProvider) {
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
});