(function() {
  "use strict";
  var app = angular.module("futureStates", ['ct.ui.router.extras', 'mgcrea.ngStrap.navbar']);
  app.controller("home", function($scope) {
    
  });
  
  app.config(['$stateProvider', '$urlRouterProvider', function($sp, $urp) {
    $urp.otherwise("/home");
    $sp.state("home", {
      url: '/home',
      controller: function() {},
      templateUrl: 'partials/home.html'
    });
    $sp.state("sticky", {
      url: '/sticky',
      controller: function() {},
      templateUrl: 'partials/sticky.html'
    });
    $sp.state("dsr", {
      url: '/dsr',
      controller: function() {},
      templateUrl: 'partials/dsr.html'
    });
    $sp.state("future", {
      url: '/future',
      controller: function() {},
      templateUrl: 'partials/future.html'
    });
  }]);
  
  app.run(function($rootScope, $state) {
    $rootScope.$state = $state;
  });
})();