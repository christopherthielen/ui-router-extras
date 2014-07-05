(function() {
  "use strict";
  var app = angular.module("futureStates", ['ct.ui.router.extras'
//    , 'ui.router.extras.chat', 'firebase'
  ]);
  app.controller("tab", function($scope) {
    $scope.scrollTo = function scrollTo(elemid) {
      var elm = (document.getElementById(elemid));
      if (elm) elm.scrollIntoView();
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
    $sp.state("previous", {
      url: '/previous',
      controller: 'tab',
      templateUrl: 'partials/previous/previous.html'
    });
    $sp.state("future", {
      url: '/future',
      controller: 'tab',
      templateUrl: 'partials/future/future.html'
    });
  }]);

  app.run(function ($rootScope, $state, $window, $timeout) {
    $rootScope.$state = $state;
    $rootScope.$on("$stateChangeSuccess", function() {
      $timeout(function() {
        $window.ga('send', 'pageview', $window.location.pathname+$window.location.hash);
      } );
    });
  });
})();