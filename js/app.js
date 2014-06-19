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
      template: '<h6>Sticky State</h6>'
    });
    $sp.state("dsr", {
      url: '/dsr',
      controller: function() {},
      template: '<h6>deep state redirect</h6>'
    });
    $sp.state("future", {
      url: '/future',
      controller: function() {},
      template: '<h6>future states</h6>'
    });
  }]);
  
})();