(function() {
  "use strict";
  var app = angular.module("ct.ui.router.extras.examples.dsr");
  
  app.controller("timerCtrl", function($scope, timerService) {
    timerService.instrument($scope);
  });

  // Personnel stuff
  app.controller("peopleCtrl", function($state, $scope, timerService) {
    timerService.instrument($scope);
    if ($state.current.name === 'top.people') $state.go(".managerlist");
  });

  app.controller("managerCtrl", function($scope, $stateParams, timerService, exampleData) {
    timerService.instrument($scope);
    if ($stateParams.mid) {
      $scope.manager =   angular.copy(_.find(exampleData.managers, function(mgr) { return mgr.id == $stateParams.mid; }));
    } else {
      $scope.managers =  angular.copy(exampleData.managers);
    }
  });

  app.controller("empCtrl", function($scope, $stateParams, timerService, exampleData) {
    timerService.instrument($scope);
    if ($stateParams.eid) {
      $scope.employee = angular.copy(_.find(exampleData.employees, function(emp) { return emp.id == $stateParams.eid; }));
    }
    $scope.employees = angular.copy(exampleData.employees);
  });
    
  // Inventory stuff

  app.controller("invCtrl", function($state, $scope, timerService) {
    timerService.instrument($scope);
    if ($state.current.name === 'top.inv') $state.go(".storelist");
  });

  app.controller("storeCtrl", function($scope, $stateParams, timerService, exampleData) {
    timerService.instrument($scope);
    if ($stateParams.sid) {
      $scope.store =   angular.copy(_.find(exampleData.stores, function(store) { return store.id == $stateParams.sid; }));
    } else {
      $scope.stores =  angular.copy(exampleData.stores);
    }
  });

  app.controller("productCtrl", function($scope, $stateParams, timerService, exampleData) {
    timerService.instrument($scope);
    if ($stateParams.pid) {
      $scope.product = angular.copy(_.find(exampleData.products, function(prod) { return prod.id == $stateParams.pid; }));
    }
    $scope.products = angular.copy(exampleData.products);
  });

})();