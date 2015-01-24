"use strict";
var $get, $state, $rootScope, $q, $compile,
  _stateProvider,
  el;

describe('$transition$', function () {
  beforeEach(module('ct.ui.router.extras.transition', function ($stateProvider) {
    // Load and capture $stickyStateProvider and $stateProvider
    _stateProvider = $stateProvider;
    _stateProvider.state("A", { url: '/A' , template: '<ui-view/>' });
    _stateProvider.state("A.AA", { url: '/AA' , template: '<ui-view/>' });
    _stateProvider.state("A.AA.AAA", { url: '/AAA' , template: '<ui-view/>', onEnter: function($state) { $state.go("B"); }});
    _stateProvider.state("B", { url: '/B' , template: '<ui-view/>' });
    _stateProvider.state("C", { url: '/C' , template: '<ui-view/>',
      onEnter: function($transition$, $rootScope) { $rootScope.$broadcast("t_onEnterInjected",  $transition$); },
      onExit: function($transition$, $rootScope) { $rootScope.$broadcast("t_onExitInjected",  $transition$); }
    });
    _stateProvider.state("D", { url: '/D' , template: '<ui-view/>'
      , controller: function($transition$, $rootScope) { $rootScope.$broadcast("t_controllerInjected",  $transition$); }
    });

  }));

  // Capture $injector.get, $state, and $q
  beforeEach(inject(function ($injector) {
    $get = $injector.get;
    $state = $get('$state');
    $rootScope = $get('$rootScope');
    $q = $get('$q');
    $compile = $get('$compile');
    el = $compile("<ui-view/>")($rootScope);
  }));

  describe('service', function () {
    it("should allow transitions normally", function () {
      $state.go("A");
      $q.flush();
      expect($state.current.name).toBe("A");
    });
  });

  describe('$transitionStart event', function () {
    var startEventCount = 0;
    var t;

    beforeEach(function() {
      startEventCount = 0;
      t = undefined;
      $rootScope.$on("$transitionStart", function (evt, $transition$) {
        startEventCount++;
        t = $transition$;
      });
    });

    it("should fire when a transition starts", function () {
      expect(startEventCount).toBe(0);
      $state.go("A"); // Triggers $transitionState
      expect(startEventCount).toBe(1);
      $q.flush();
    });

    it("should pass $transition$ as the second arg", function () {
      $state.go("B"); // Triggers $transitionState
      expect(t).toBeDefined();
      expect(t.promise).toBeDefined();
      expect(t.from).toBeDefined();
      expect(t.to).toBeDefined();
      expect(t.from.state.name).toBe("");
      expect(t.to.state.name).toBe("B");
      $q.flush();
    });

    it("$transition$ arg should async invoke .then", function () {
      var invokeCount = 0;
      $state.go("A"); // Triggers $transitionState
      t.promise.then(function() {  invokeCount++; });
      expect(invokeCount).toBe(0);
      $q.flush();
      expect(invokeCount).toBe(1);
    });

    it("should be correct when TransitionSuperseded", function () {
//      $compile("<ui-view/>")($rootScope);
      var invokeCount = 0;
      $state.go("A.AA.AAA");
      t.promise.then(function() {
        throw Error("Shouldn't get here.");
      }, function() {
        invokeCount++;
      });
      expect(invokeCount).toBe(0);
      $q.flush();
      expect($state.current.name).toBe("B");
      expect(invokeCount).toBe(1);
    });

    describe('promise arg of $transitionStart', function () {
      var promiseCount = 0;
      it("1 should resolve when the state change occurs", function () {
        expect($state.current.name).toBe("");
        $state.go("B");

        t.promise.then(function (data) {
          promiseCount++;
          expect($state.current.name).toBe("B");
          expect(data.name).toBe("B");
        });

        $q.flush();
        expect(startEventCount).toBe(1);
        expect(promiseCount).toBe(1);
      });
    });

    describe('promise injected in onEnter', function () {
      var promiseCount = 0;
      it("2 should resolve when the state change occurs", function (done) {
        var cancelListen = $rootScope.$on("t_onEnterInjected", function(evt, $transition$) {
          expect($transition$).toBeDefined();
          expect($transition$.to).toBeDefined();

          $transition$.promise.then(function (data) {
            promiseCount++;
            expect($state.current.name).toBe("C");
            expect(data.name).toBe("C");
            expect(startEventCount).toBe(1);
            expect(promiseCount).toBe(1);
            done();
            cancelListen();
          });
        });
        $state.go("C");
        $q.flush();
      });
    });

    describe('promise injected in onExit', function () {
      var promiseCount = 0;
      it("3 should resolve when the state change occurs", function (done) {
        var cancelListen = $rootScope.$on("t_onExitInjected", function(evt, $transition$) {
          expect($transition$).toBeDefined();
          expect($transition$.to).toBeDefined();
          expect($transition$.to.state.name).toBe("B");

          $transition$.promise.then(function (data) {
            promiseCount++;
            expect($state.current.name).toBe("B");
            expect(data.name).toBe("B");
            expect(startEventCount).toBe(2);
            expect(promiseCount).toBe(1);
            done();
            cancelListen();
          });
        });

        $state.go("C");
        $q.flush();
        $state.go("B");
        $q.flush();
      });
    });

    describe('promise injected in controller', function () {
      var promiseCount = 0;
      it("4 should resolve when the state change occurs", function (done) {
        var cancelListen = $rootScope.$on("t_controllerInjected", function(evt, $transition$) {
          expect($transition$).toBeDefined();
          expect($transition$.to).toBeDefined();
          expect($transition$.to.state.name).toBe("D");

          $transition$.promise.then(function (data) {
            promiseCount++;
            expect($state.current.name).toBe("D");
            expect(data.name).toBe("D");
            expect(startEventCount).toBe(2);
            expect(promiseCount).toBe(1);
            done();
            cancelListen();
          });
        });

        $state.go("C");
        $q.flush();
        $state.go("D");
        $q.flush();
      });
    });
  });
});
