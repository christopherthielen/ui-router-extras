(function() {
  "use strict";
  var app = angular.module("futureStates", ['ct.ui.router.extras', 'mgcrea.ngStrap.navbar']);
  app.controller("tab", function($scope, $document) {
    $scope.scrollTo = function scrollTo(selector) {
      var elm = $document.find(selector);
      if (elm[0]) elm[0].scrollIntoView();
    };
  });
  
  app.config(['$stateProvider', '$urlRouterProvider', function($sp, $urp) {
    $urp.otherwise("/home");
    $sp.state("home", {
      url: '/home',
      controller: 'tab',
      templateUrl: 'partials/home.html'
    });
    $sp.state("sticky", {
      url: '/sticky',
      controller: 'tab',
      templateUrl: 'partials/sticky/sticky.html'
    });
    $sp.state("dsr", {
      url: '/dsr',
      controller: 'tab',
      templateUrl: 'partials/dsr/dsr.html'
    });
    $sp.state("future", {
      url: '/future/:section',
      controller: 'tab',
      templateUrl: 'partials/future/future.html'
    });
  }]);

  app.run(function ($rootScope, $state, $window, $location) {
    $rootScope.$state = $state;
    $rootScope.$on("$stateChangeSuccess", function() {
      $window.ga('send', 'pageview', $window.location.pathname+$window.location.hash);
    })
  });
})();