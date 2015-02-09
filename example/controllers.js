(function() {
  "use strict";
  var app = angular.module("ct.ui.router.extras.examples");

  app.controller("timerCtrl", function($scope, timerService) {
    timerService.instrument($scope);
  });

  app.controller("tabCtrl", function($scope, $state, timerService) {
    var ctrl = $scope.tabCtrl = this;
    timerService.instrument($scope);
    $scope.$on('$stateChangeSuccess', function(toState) {
      if ($state.includes("top") && !$state.is("top")) {
        ctrl.selected = $state.current.name.split(".").slice(1, 2).pop();
      }
    })
  });

  app.controller("tabPreviousCtrl", function($scope, $state, timerService, $previousState) {
    var ctrl = $scope.tabCtrl = this;
    timerService.instrument($scope);
    $scope.$on('$stateChangeSuccess', function(toState) {
      if ($state.includes("top") && !$state.is("top")) {
        ctrl.selected = $state.current.name.split(".").slice(1, 2).pop();
      }
    });
    
    ctrl.previous = $previousState.get(); 
  });

  // Personnel stuff
  app.controller("peopleCtrl", function($state, $scope, timerService) {
    timerService.instrument($scope);
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
    $scope.employees = angular.copy(_.filter(exampleData.employees, function(emp) { return emp.manager == $stateParams.mid }));
  });

  // Inventory stuff

  app.controller("invCtrl", function($state, $scope, timerService) {
    timerService.instrument($scope);
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
    $scope.products = angular.copy(_.filter(exampleData.products, function(prod) { return prod.store == $stateParams.sid; }));
  });

  // Customers stuff

  app.controller("custCtrl", function($state, $scope, timerService) {
    timerService.instrument($scope);
  });

  app.controller("customerCtrl", function($scope, $stateParams, timerService, exampleData) {
    timerService.instrument($scope);
    $scope.orderCount = function(customer) { return _.filter(exampleData.orders, function(order) { return order.customerId === customer.id}).length; };
    if ($stateParams.cid) {
      $scope.customer =   angular.copy(_.find(exampleData.customers, function(customer) { return customer.id == $stateParams.cid; }));
    } else {
      $scope.customers =  angular.copy(exampleData.customers);
    }
  });

  app.controller("orderCtrl", function($scope, $stateParams, timerService, exampleData) {
    timerService.instrument($scope);
    if ($stateParams.oid) {
      $scope.order = angular.copy(_.find(exampleData.orders, function(order) { return order.id == $stateParams.oid; }));
    }
    $scope.orders = angular.copy(_.filter(exampleData.orders, function(order) { return order.customerId == $stateParams.cid; }));
  });


  app.directive("stickyState", function($state, uirextras_core) {
    var objectKeys = uirextras_core.objectKeys;
    return {
      restrict: 'EA',
      compile: function(tElem, tAttrs) {
        var stateName = tAttrs.stickyState || tAttrs.state;
        if (!stateName) {
          throw new Error("Sticky state name must be supplied to stickyState directive.  " +
            "Either <sticky-state state='my.sticky.state' /> or <div sticky-state='my.sticky.state'></div>");
        }

        var state = $state.get(stateName);
        if (!state) {
          throw new Error("Could not find the supplied state: '" + stateName + "'");
        }

        if (!angular.isObject(state.views)) {
          throw new Error("The supplied state: '" + stateName + "' must have a named view declared, i.e., " +
            ".state('" + state.name + "', { views: { stickyView: { controller: myCtrl, templateUrl: 'myTemplate.html' } } });");
        }
        var keys = objectKeys(state.views);
        if (keys.length != 1) {
          throw new Error("The supplied state: '" + stateName + "' must have exactly one named view declared.");
        }

        tElem.append('<div ui-view="' + keys[0] + '"></div>');

        return function(scope, elem, attrs) {
          var autohideDiv = scope.$eval(attrs.autohide);
          autohideDiv = angular.isDefined(autohideDiv) ? autohideDiv : true;

          if (autohideDiv) {
            scope.$on("$stateChangeSuccess", function stateChanged() {
              var addOrRemoveFnName = $state.includes(state) ? "removeClass" : "addClass";
              elem[addOrRemoveFnName]("ng-hide");
            });
          }
        }
      }
    }
  });

  app.directive("showWhenStateActive", function($state) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var showOrHideDiv = function stateChanged() {
          var addOrRemoveFnName = $state.includes(attrs.showWhenStateActive) ? "removeClass" : "addClass";
          elem[addOrRemoveFnName]("ng-hide");
        };
        scope.$on("$stateChangeSuccess", showOrHideDiv);
      }
    }
  });
})();