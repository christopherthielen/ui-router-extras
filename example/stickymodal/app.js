(function() {
  "use strict";
  var app = angular.module("ct.ui.router.extras.examples.dsr", [ 'ui.bootstrap.modal', 'ui.bootstrap.tpls', 'ct.ui.router.extras.examples', 'ct.ui.router.extras.examples.statevis' ]);
  
  app.config(function ($stateProvider, $urlRouterProvider) {
    var states = [];
    // Modal states
    states.push({ name: 'modal1',                     url: '/modal1',       controller: 'timerCtrl',  
                  onEnter: showModal1, onExit: closeModal1 });
    states.push({ name: 'modal2',                     url: '/modal2',       controller: 'timerCtrl', 
                  onEnter: showModal1, onExit: closeModal1 });
    
    // Root of main app states
    states.push({ name: 'top',                        url: '/',             
                  deepStateRedirect: true, sticky: true,
                  views: {
                    'instructions@': { controller: 'timerCtrl', templateUrl: 'instructions.html' },
                    'top@':          { controller: 'tabCtrl',   templateUrl: 'top.html' }
                  }});
    
    // Personnel tab
    states.push({ name: 'top.people',                 url: 'people',        
                  views: { 'peopletab@top': { controller: 'peopleCtrl', templateUrl: '../partials/people.html'} },
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

    function showModal1($modal) {
      $modal.open({
        templateUrl: 'modal1.html'
      })
    }
    
    function closeModal1($modal) {
//      $modal.open({
//        templateUrl: 'modal1.html'
//      })
    }
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
  
