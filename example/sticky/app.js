(function() {
  "use strict";
  var app = angular.module("ct.ui.router.extras.examples.dsr", [ 'ct.ui.router.extras.examples', 'ct.ui.router.extras.examples.statevis' ]);
  
  app.config(function ($stateProvider, $urlRouterProvider) {
    var states = [];
    states.push({ name: 'aside1',                     url: '/aside1',       controller: 'timerCtrl',  templateUrl: '../partials/aside.html' });
    states.push({ name: 'aside2',                     url: '/aside2',       controller: 'timerCtrl',  templateUrl: '../partials/aside.html' });
    states.push({ name: 'top',                        url: '/',             controller: 'timerCtrl',  templateUrl: 'top.html' });
    states.push({ name: 'top.people',                 url: 'people',        
                  views: { 'peopletab@top': { controller: 'peopleCtrl', templateUrl: '../partials/people.html'} },
                  deepStateRedirect: true, sticky: true });
    states.push({ name: 'top.people.managerlist',     url: '/managers',     controller: 'managerCtrl',templateUrl: '../partials/managers.html' });
    states.push({ name: 'top.people.manager',         url: '/manager/:mid', controller: 'managerCtrl',templateUrl: '../partials/manager.html' });
    states.push({ name: 'top.people.manager.emplist', url: '/emps',         controller: 'empCtrl',    templateUrl: '../partials/emps.html' });
    states.push({ name: 'top.people.manager.emp',     url: '/emp/:eid',     controller: 'empCtrl',    templateUrl: '../partials/emp.html' });
    states.push({ name: 'top.inv',                    url: 'inv',           
                  views: { 'invtab@top': { controller: 'invCtrl',    templateUrl: '../partials/inv.html' } },
                  deepStateRedirect: true, sticky: true });
    states.push({ name: 'top.inv.storelist',          url: '/stores',       controller: 'storeCtrl',  templateUrl: '../partials/stores.html' });
    states.push({ name: 'top.inv.store',              url: '/store/:sid',   controller: 'storeCtrl',  templateUrl: '../partials/store.html' });
    states.push({ name: 'top.inv.store.productlist',  url: '/products',     controller: 'productCtrl',templateUrl: '../partials/products.html' });
    states.push({ name: 'top.inv.store.product',      url: '/product/:pid', controller: 'productCtrl',templateUrl: '../partials/product.html' });
    
    angular.forEach(states, function(state) { $stateProvider.state(state); });
    $urlRouterProvider.otherwise("/");
  });
  
  app.run(function($rootScope, $state) {
    $rootScope.$state = $state;
  })
})();
  
