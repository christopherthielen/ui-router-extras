(function() {
  "use strict";
  var app = angular.module("ct.ui.router.extras.examples.dsr", [ 'ct.ui.router.extras.examples', 'ct.ui.router.extras.statevis' ]);
  
  app.config(function ($stateProvider, $stickyStateProvider, $urlRouterProvider) {
    $stickyStateProvider.enableDebug(true);
    var states = [];
    states.push({ name: 'aside1',                     url: '/aside1',       controller: 'timerCtrl',  templateUrl: '../partials/aside.html' });
    states.push({ name: 'aside2',                     url: '/aside2',       controller: 'timerCtrl',  templateUrl: '../partials/aside.html' });
    states.push({ name: 'top',                        url: '/',             
                  views: {
                    'instructions@': { controller: 'timerCtrl', templateUrl: 'instructions.html' },
                    '@':             { controller: 'tabCtrl', templateUrl: 'top.html' }
                  }});
    
    // Personnel tab
    states.push({ name: 'top.people',                 url: 'people',        
                  views: { 'peopletab@top': { controller: 'peopleCtrl', templateUrl: '../partials/people.html'} },
                  resolve: { foo: function() { console.log("resolving 'foo' for top.people (issue #22)"); return "foo"; }},
                  deepStateRedirect: true, sticky: true });
    states.push({ name: 'top.people.managerlist',     url: '/managers',     controller: 'managerCtrl',templateUrl: '../partials/managers.html' });
    states.push({ name: 'top.people.manager',         url: '/manager/:mid', controller: 'managerCtrl',templateUrl: '../partials/manager.html' });
    states.push({ name: 'top.people.manager.emplist', url: '/emps',         controller: 'empCtrl',    templateUrl: '../partials/emps.html' });
    states.push({ name: 'top.people.manager.emp',     url: '/emp/:eid',     controller: 'empCtrl',    templateUrl: '../partials/emp.html' });

    // Inventory tab
    states.push({ name: 'top.inv',                    url: 'inv',           
                  views: { 'invtab@top': { controller: 'invCtrl',    templateUrl: '../partials/inv.html' } },
                  deepStateRedirect: true, sticky: true });
    states.push({ name: 'top.inv.storelist',          url: '/stores',       controller: 'storeCtrl',  templateUrl: '../partials/stores.html' });
    states.push({ name: 'top.inv.store',              url: '/store/:sid',   controller: 'storeCtrl',  templateUrl: '../partials/store.html' });
    states.push({ name: 'top.inv.store.productlist',  url: '/products',     controller: 'productCtrl',templateUrl: '../partials/products.html' });
    states.push({ name: 'top.inv.store.product',      url: '/product/:pid', controller: 'productCtrl',templateUrl: '../partials/product.html' });

    // Customer tab
    states.push({ name: 'top.cust',                   url: 'cust',
                  views: { 'custtab@top': { controller: 'custCtrl',    templateUrl: '../partials/cust.html' } },
                  deepStateRedirect: true, sticky: true });
    states.push({ name: 'top.cust.customerlist',      url: '/customers',    controller: 'customerCtrl', templateUrl: '../partials/customers.html' });
    states.push({ name: 'top.cust.customer',          url: '/customer/:cid',controller: 'customerCtrl', templateUrl: '../partials/customer.html' });
    states.push({ name: 'top.cust.customer.orderlist',url: '/orders',       controller: 'orderCtrl',    templateUrl: '../partials/orders.html' });
    states.push({ name: 'top.cust.customer.order',    url: '/order/:oid',   controller: 'orderCtrl',    templateUrl: '../partials/order.html' });
    
    
    angular.forEach(states, function(state) { $stateProvider.state(state); });
    $urlRouterProvider.otherwise("/");
  });
  
  app.run(function ($rootScope, $state, $window, $timeout) {
    $rootScope.$state = $state;
    $rootScope.$on("$stateChangeSuccess", function() {
      $timeout(function() {
        $window.ga('send', 'pageview', $window.location.pathname+$window.location.hash);
      } );
    });
  });
})();
  
