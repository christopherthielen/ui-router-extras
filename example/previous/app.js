(function() {
  "use strict";
  var app = angular.module("ct.ui.router.extras.examples.dsr", [ 'ct.ui.router.extras.examples', 'ct.ui.router.extras.examples.statevis' ]);

  app.controller("previousStateCtrl", ['$scope', '$previousState', 'timerService', function($scope, $previousState, timerService) {
    timerService.instrument($scope);
    $previousState.memo("caller"); // When this controller is entered, make a memo of the calling state, named 'caller'
  }]);
  app.controller("peoplePSCtrl", function($state, $previousState, $scope, timerService) {
    timerService.instrument($scope);
    $previousState.memo("caller"); // When this controller is entered, make a memo of the calling state, named 'caller'
    if ($state.current.name === 'top.people') $state.go(".managerlist");
  });
  app.controller("invPSCtrl", function($state, $previousState, $scope, timerService) {
    timerService.instrument($scope);
    $previousState.memo("caller"); // When this controller is entered, make a memo of the calling state, named 'caller'
    if ($state.current.name === 'top.inv') $state.go(".storelist");
  });
  app.controller("custPSCtrl", function($state, $previousState, $scope, timerService) {
    timerService.instrument($scope);
    $previousState.memo("caller"); // When this controller is entered, make a memo of the calling state, named 'caller'
    if ($state.current.name === 'top.cust') $state.go(".customerlist");
  });
  
  app.config(function ($stateProvider, $urlRouterProvider) {
    var states = [];
    states.push({ name: 'aside1',                     url: '/aside1',       controller: 'previousStateCtrl',  templateUrl: '../partials/aside.html' });
    states.push({ name: 'aside2',                     url: '/aside2',       controller: 'previousStateCtrl',  templateUrl: '../partials/aside.html' });
    
    // Root of main app states
    states.push({ name: 'top',                        url: '/',
                  deepStateRedirect: true,
                  views: {
                    'instructions@': { controller: 'timerCtrl', templateUrl: 'instructions.html' },
                    '@':             { controller: 'timerCtrl', templateUrl: 'top.html' }
                  }});
    
    // Personnel tab
    states.push({ name: 'top.people',                 url: 'people',        controller: 'peoplePSCtrl', templateUrl: '../partials/people.html',
                  deepStateRedirect: true });
    states.push({ name: 'top.people.managerlist',     url: '/managers',     controller: 'managerCtrl',templateUrl: '../partials/managers.html' });
    states.push({ name: 'top.people.manager',         url: '/manager/:mid', controller: 'managerCtrl',templateUrl: '../partials/manager.html' });
    states.push({ name: 'top.people.manager.emplist', url: '/emps',         controller: 'empCtrl',    templateUrl: '../partials/emps.html' });
    states.push({ name: 'top.people.manager.emp',     url: '/emp/:eid',     controller: 'empCtrl',    templateUrl: '../partials/emp.html' });

    // Inventory tab
    states.push({ name: 'top.inv',                    url: 'inv',           controller: 'invPSCtrl',    templateUrl: '../partials/inv.html',
                  deepStateRedirect: true });
    states.push({ name: 'top.inv.storelist',          url: '/stores',       controller: 'storeCtrl',  templateUrl: '../partials/stores.html' });
    states.push({ name: 'top.inv.store',              url: '/store/:sid',   controller: 'storeCtrl',  templateUrl: '../partials/store.html' });
    states.push({ name: 'top.inv.store.productlist',  url: '/products',     controller: 'productCtrl',templateUrl: '../partials/products.html' });
    states.push({ name: 'top.inv.store.product',      url: '/product/:pid', controller: 'productCtrl',templateUrl: '../partials/product.html' });

    // Customer tab
    states.push({ name: 'top.cust',                   url: 'cust', controller: 'custPSCtrl',    templateUrl: '../partials/cust.html',
                  deepStateRedirect: true });
    states.push({ name: 'top.cust.customerlist',      url: '/customers',    controller: 'customerCtrl', templateUrl: '../partials/customers.html' });
    states.push({ name: 'top.cust.customer',          url: '/customer/:cid',controller: 'customerCtrl', templateUrl: '../partials/customer.html' });
    states.push({ name: 'top.cust.customer.orderlist',url: '/orders',       controller: 'orderCtrl',    templateUrl: '../partials/orders.html' });
    states.push({ name: 'top.cust.customer.order',    url: '/order/:oid',   controller: 'orderCtrl',    templateUrl: '../partials/order.html' });
    
    
    angular.forEach(states, function(state) { $stateProvider.state(state); });
    $urlRouterProvider.otherwise("/");
  });


  
  app.run(function ($rootScope, $state, $window, $timeout, $previousState) {
    $rootScope.$state = $state;
    
    $rootScope.$watch(function() {
      return $previousState.get('caller');
    }, function(newval, oldval) {
      if (!newval || newval.state.abstract) {
        $rootScope.previous = null;
        $rootScope.previousLink = "No previous state";
      } else {
        $rootScope.previous = newval;
        $rootScope.previousLink = "Return to " + newval.state.name;
      }
    });
    $rootScope.goPrevious = function() { 
      $previousState.go('caller'); 
    };
    
    $rootScope.$on("$stateChangeSuccess", function() {
      $timeout(function() {
        $window.ga('send', 'pageview', $window.location.pathname+$window.location.hash);
      } );
    });
  });
})();
  
