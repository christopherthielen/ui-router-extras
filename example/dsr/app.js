(function() {
  "use strict";
  var app = angular.module("ct.ui.router.extras.examples.dsr", ['ct.ui.router.extras.examples']);
  
  app.config(function ($stateProvider, $urlRouterProvider) {
    var states = [];
    states.push({ name: 'aside1',                 url: '/aside1',       controller: 'timerCtrl',  templateUrl: 'partials/aside.html' });
    states.push({ name: 'aside2',                 url: '/aside2',       controller: 'timerCtrl',  templateUrl: 'partials/aside.html' });
    states.push({ name: 'top',                    url: '/',             controller: 'timerCtrl',  templateUrl: 'partials/top.html' });
    states.push({ name: 'top.people',             url: 'people',        controller: 'peopleCtrl', templateUrl: 'partials/people.html',
                  deepStateRedirect: true});
    states.push({ name: 'top.people.manager',     url: '/manager/:mid', controller: 'managerCtrl',templateUrl: 'partials/manager.html' });
    states.push({ name: 'top.people.manager.emp', url: '/emp/:eid',     controller: 'empCtrl',    templateUrl: 'partials/emp.html' });
    states.push({ name: 'top.inv',                url: 'inv',           controller: 'timerCtrl',  templateUrl: 'partials/inv.html',
                  deepStateRedirect: true});
    states.push({ name: 'top.inv.store',          url: '/store/:sid',   controller: 'storeCtrl',  templateUrl: 'partials/store.html' });
    states.push({ name: 'top.inv.store.product',  url: '/product/:pid', controller: 'productCtrl',templateUrl: 'partials/product.html' });
    
    angular.forEach(states, function(state) { $stateProvider.state(state); });
    $urlRouterProvider.otherwise("/");
  });

  app.controller("peopleCtrl", function($state) {
    $state.go(".manager");
  });

  app.controller("timerCtrl", function($scope, timerService) {
    timerService.instrument($scope);
  });

  app.controller("managerCtrl", function($scope, timerService, exampleData) {
    timerService.instrument($scope);
    $scope.managerdata = angular.copy(exampleData.managers);
  });

  app.controller("empCtrl", function($scope, timerService, exampleData) {
    timerService.instrument($scope);
    $scope.empdata = angular.copy(exampleData.peopleloyees);
  });

  app.controller("storeCtrl", function($scope, timerService, exampleData) {
    timerService.instrument($scope);
    $scope.empdata = angular.copy(exampleData.customers);
  });

  app.controller("productCtrl", function($scope, timerService, exampleData) {
    timerService.instrument($scope);
    $scope.empdata = angular.copy(exampleData.products);
  });
})();
  
