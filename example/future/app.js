(function() {
  "use strict";
  var app = angular.module("futureStates", ['ct.ui.router.extras']);

  app.config(['$futureStateProvider', '$urlRouterProvider', function($fsp, $urp) {
    $fsp.stateFactory('ngload', ngloadStateFactory);
    $fsp.stateFactory('iframe', iframeStateFactory);
    
    // Loading states from .json file
    $fsp.addResolve(function($http) {
      return $http.get('futureStates.json').then(function(resp) {
        angular.forEach(resp.data, function(fstate) { 
          $fsp.futureState(fstate); 
        });
      });  
    });
  }]);
})();