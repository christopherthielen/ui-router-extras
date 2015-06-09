"use strict";
var $get, $state, $q, $previousState;
var tLog;

function getPreviousMockStates() {
  var states = [];
  states.push({ name: 'aside1', url: '/aside1'});
  states.push({ name: 'aside2', url: '/aside2'});

  // Root of main app states
  states.push({ name: 'top' });

  // Personnel tab
  states.push({ name: 'top.people', url: 'people'  });
  states.push({ name: 'top.people.managerlist', url: '/managers'});
  states.push({ name: 'top.people.manager', url: '/manager/:mid'});
  states.push({ name: 'top.people.manager.emplist', url: '/emps'});
  states.push({ name: 'top.people.manager.emp', url: '/emp/:eid'});

  // Inventory tab
  states.push({ name: 'top.inv', url: 'inv' });
  states.push({ name: 'top.inv.storelist', url: '/stores'});
  states.push({ name: 'top.inv.store', url: '/store/:sid'});
  states.push({ name: 'top.inv.store.productlist', url: '/products'});
  states.push({ name: 'top.inv.store.product', url: '/product/:pid'});

  // Customer tab
  states.push({ name: 'top.cust', url: 'cust' });
  states.push({ name: 'top.cust.customerlist', url: '/customers'});
  states.push({ name: 'top.cust.customer', url: '/customer/:cid'});
  states.push({ name: 'top.cust.customer.orderlist', url: '/orders'});
  states.push({ name: 'top.cust.customer.order', url: '/order/:oid'});

  return states;
}

describe("$previousState", function () {
  beforeEach(module('ct.ui.router.extras.previous', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    var mockStates = getPreviousMockStates();
    addCallbacks(mockStates);
    angular.forEach(mockStates, function (state) {
      $stateProvider.state(state);
    });
    resetTransitionLog();
  }));           

  // Capture $injector.get, $state, and $q
  beforeEach(inject(function ($injector) {
    $get = $injector.get;
    $state = $get('$state');
    $q = $get('$q');
    $previousState = $get('$previousState');
  }));

  // Test for #123
  it("should not capture root state (or non-navigable states)", inject(function($rootScope) {
    testGo("top", { entered: 'top' });
    expect($previousState.get()).toBeNull();
  }));

  // Test for #175
  it("should not capture root state (or non-navigable states)", inject(function($rootScope) {
    testGo("top", { entered: 'top' });
    testGo("top.cust", { entered: 'top.cust' });
    var prev = $previousState.get();
    expect(prev).toBeDefined();
    expect(prev.state.name).toBe("top");
  }));


  describe('.go()', function () {
    it("should transition back to the previous state", function () {
      testGo("top.people.managerlist", { entered: pathFrom('top', 'top.people.managerlist') });
      testGo("top.inv.storelist", { entered: pathFrom('top.inv', 'top.inv.storelist'), exited: pathFrom('top.people.managerlist', 'top.people') });
      $previousState.go();
      $q.flush();
      expect($state.current.name === "tabs.tabs2");
    });
  });

  describe('.get()', function() {
    // Test for #120
    it("should not return current state, after a transition is cancelled", inject(function($rootScope) {
      testGo("top.people", { entered: [ 'top', 'top.people' ] });
      testGo("top.people.managerlist", { entered: ['top.people.managerlist'] });

      var transitionNum = 0;
      $rootScope.$on("$stateChangeStart", function(evt) { if (transitionNum++ === 0) { evt.preventDefault(); } });

      testGo("top.inv.storelist", undefined, { redirect: 'top.people.managerlist'}); // Cancelled, so we're still at original state

      expect($previousState.get().state.name).toBe("top.people");
    }))
  });
  
  describe('.memo()', function () {
    it("should remember 'top.people.managerlist' with memoName 'foo'", function () {
      testGo("top.people.managerlist", { entered: pathFrom('top', 'top.people.managerlist') });
      testGo("top.inv.storelist", { entered: pathFrom('top.inv', 'top.inv.storelist') , exited: pathFrom('top.people.managerlist', 'top.people') });
      $previousState.memo('foo');
      expect($previousState.get('foo').state).toBe($state.get('top.people.managerlist'));
    });
    
    it("should remember 'top.inv.storelist' with memoName 'foo'", function () {
      testGo("top.people.managerlist", { entered: pathFrom('top', 'top.people.managerlist') });
      testGo("top.inv.storelist", { entered: pathFrom('top.inv', 'top.inv.storelist') , exited: pathFrom('top.people.managerlist', 'top.people') });
      $previousState.memo('foo');
      expect($previousState.get('foo').state).toBe($state.get('top.people.managerlist'));
      testGo('top.people.managerlist');
      $previousState.memo('foo');
      expect($previousState.get('foo').state).toBe($state.get('top.inv.storelist'));
    });
    
    it("should remember 'top.inv.storelist' with memoName 'foo'", function () {
      testGo("top.people.managerlist", { entered: pathFrom('top', 'top.people.managerlist') });
      testGo("top.inv.storelist", { entered: pathFrom('top.inv', 'top.inv.storelist') , exited: pathFrom('top.people.managerlist', 'top.people') });
      $previousState.memo('foo');
      expect($previousState.get('foo').state).toBe($state.get('top.people.managerlist'));
      testGo('top.people.managerlist');
      $previousState.memo('foo');
      expect($previousState.get('foo').state).toBe($state.get('top.inv.storelist'));
    });
    
    // Failing test for issue #16
    it("should return to 'top.inv.storelist'", function () {
      testGo("top.people.managerlist");
      testGo("top.inv");
      testGo("top.inv.storelist");
      $previousState.memo('foo');
      testGo('top.people.managerlist');
      $previousState.memo('foo');
      testGo("top.inv.storelist");
      $previousState.go('foo'); // triggers issue #16
      expect($state.current).toBe($state.get('top.inv.storelist'))
    });

    it("should return to 'top.people.managerList' with memoName 'foo'", function() {
      $previousState.memo('foo', 'top.people.managerList');
      expect($previousState.get('foo').state).toBe($state.get('top.people.managerList'));
    });

    it("should return to 'top.people.managerList' with parameter 'id' equal to 5 with memoName 'foo'", function() {
      $previousState.memo('foo', 'top.people.managerList', { id: 5 });
      expect($previousState.get('foo').state).toBe($state.get('top.people.managerList'));
      expect($previousState.get('foo').params).toEqual({ id: 5 });
    });
  });

  describe('.forget()', function () {
    it("should forget previous state", function () {
      testGo("top.people.managerlist", { entered: pathFrom('top', 'top.people.managerlist') });
      testGo("top.inv.storelist", { entered: pathFrom('top.inv', 'top.inv.storelist'), exited: pathFrom('top.people.managerlist', 'top.people') });
      $previousState.forget();
      expect($previousState.get()).toBeFalsy();
    });

    it("should forget previous state for specific memo", function () {
      testGo("top.people.managerlist", { entered: pathFrom('top', 'top.people.managerlist') });
      testGo("top.inv.storelist", { entered: pathFrom('top.inv', 'top.inv.storelist'), exited: pathFrom('top.people.managerlist', 'top.people') });
      $previousState.memo('foo');
      expect($previousState.get('foo').state.name).toBe("top.people.managerlist");
      $previousState.forget('foo');
      expect($previousState.get('foo')).toBeFalsy();
    });
  });
});
