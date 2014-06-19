(function() {
  "use strict";
  var app = angular.module("futureStates", ['ct.ui.router.extras']);
  app.controller("home", function($scope) {
    
  });
  
  app.config(['$stateProvider', '$urlRouterProvider', function($sp, $urp) {
    $sp.state("home", {
      url: '/',
      controller: 'home',
      template: 'partials/home.html'
    });
  }]);
  
})();