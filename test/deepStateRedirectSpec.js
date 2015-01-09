"use strict";
var $get, $state, $q, $deepStateRedirect;
var tLog;

function getDSRStates () {
  return [
    { name: 'other' },
    { name: 'tabs' },
    { name: 'tabs.tabs1', deepStateRedirect: true },
    { name: 'tabs.tabs1.deep' },
    { name: 'tabs.tabs1.deep.nest' },
    { name: 'tabs.tabs2', deepStateRedirect: true },
    { name: 'tabs.tabs2.deep' },
    { name: 'tabs.tabs2.deep.nest' },
    { name: 'p1', url: '/p1/:param1/:param2', deepStateRedirect: { params: ['param1'] } },
    { name: 'p1.child' },
    { name: 'p2', url: '/p2/:param1/:param2', deepStateRedirect: { params: true } },
    { name: 'p2.child' },
    { name: 'p3', url: '/p3/:param1', deepStateRedirect: { params: true } },
    { name: 'p3.child'}
  ];
}

function dsrReset(newStates) {
  addCallbacks(newStates);
  resetTransitionLog();
}


describe('deepStateRedirect', function () {
  beforeEach(module('ct.ui.router.extras', function ($stateProvider, $urlRouterProvider) {
    // Load and capture $stickyStateProvider and $stateProvider
    $urlRouterProvider.otherwise("/");
    var newStates = getDSRStates();
    dsrReset(newStates);
    angular.forEach(newStates, function(state) { $stateProvider.state(state); });
  }));

  // Capture $injector.get, $state, and $q
  beforeEach(inject(function($injector) {
    $get = $injector.get;
    $state = $get('$state');
    $q = $get('$q');
    $deepStateRedirect = $get('$deepStateRedirect');
  }));

  describe(' - ', function () {
    it("should toggle between tab states", function() {
      testGo("tabs", {entered: 'tabs'});
      testGo("tabs.tabs2", {entered: 'tabs.tabs2'});
      testGo("tabs.tabs1", {entered: 'tabs.tabs1', exited: 'tabs.tabs2'});
    });

    it("should redirect to tabs.tabs1.deep.nest", function() {
      testGo("tabs", {entered: 'tabs'});
      testGo("tabs.tabs2.deep.nest", {entered: ['tabs.tabs2', 'tabs.tabs2.deep', 'tabs.tabs2.deep.nest' ]});
      testGo("tabs.tabs1", {entered: 'tabs.tabs1', exited: [ 'tabs.tabs2.deep.nest', 'tabs.tabs2.deep', 'tabs.tabs2' ]});
      testGo("tabs.tabs2", {entered: ['tabs.tabs2', 'tabs.tabs2.deep', 'tabs.tabs2.deep.nest'], exited: 'tabs.tabs1'}, { redirect: 'tabs.tabs2.deep.nest' });
    });

    it("should forget a previous redirect to tabs.tabs2.deep.nest", inject(function($deepStateRedirect) {
      testGo("tabs", {entered: 'tabs'});
      testGo("tabs.tabs2.deep.nest", {entered: ['tabs.tabs2', 'tabs.tabs2.deep', 'tabs.tabs2.deep.nest' ]});
      testGo("tabs.tabs1.deep.nest", {entered: ['tabs.tabs1', 'tabs.tabs1.deep', 'tabs.tabs1.deep.nest' ], exited: [ 'tabs.tabs2.deep.nest', 'tabs.tabs2.deep', 'tabs.tabs2' ]});
      testGo("tabs.tabs2", {entered: ['tabs.tabs2', 'tabs.tabs2.deep', 'tabs.tabs2.deep.nest'], exited: [ 'tabs.tabs1.deep.nest', 'tabs.tabs1.deep', 'tabs.tabs1' ]}, { redirect: 'tabs.tabs2.deep.nest' });
      testGo("tabs.tabs1", {entered: ['tabs.tabs1', 'tabs.tabs1.deep', 'tabs.tabs1.deep.nest' ], exited: [ 'tabs.tabs2.deep.nest', 'tabs.tabs2.deep', 'tabs.tabs2' ]}, { redirect: 'tabs.tabs1.deep.nest' });
      $deepStateRedirect.reset("tabs.tabs2");
      testGo("tabs.tabs2", {entered: ['tabs.tabs2'], exited: [ 'tabs.tabs1.deep.nest', 'tabs.tabs1.deep', 'tabs.tabs1' ]});
      testGo("tabs.tabs1", {entered: ['tabs.tabs1', 'tabs.tabs1.deep', 'tabs.tabs1.deep.nest' ], exited: [ 'tabs.tabs2' ]}, { redirect: 'tabs.tabs1.deep.nest' });
      $deepStateRedirect.reset();
      testGo("tabs.tabs2", { entered: 'tabs.tabs2', exited: [ 'tabs.tabs1.deep.nest', 'tabs.tabs1.deep', 'tabs.tabs1' ]});
      testGo("tabs.tabs1", { entered: 'tabs.tabs1', exited: [ 'tabs.tabs2' ]});
    }));
  });

  describe('with configured params', function () {
    it("should redirect only when params match", inject(function($state, $q) {
      $state.go("p1", { param1: "foo", param2: "foo2" } ); $q.flush();
      expect($state.current.name).toEqual("p1");
      expect($state.params).toEqual({ param1: "foo", param2: "foo2" });

      $state.go(".child"); $q.flush();
      expect($state.current.name).toEqual("p1.child");

      $state.go("p1", { param1: "bar" } ); $q.flush();
      expect($state.current.name).toEqual("p1");

      $state.go("p1", { param1: "foo", param2: "somethingelse" } ); $q.flush();
      expect($state.current.name).toEqual("p1.child"); // DSR
    }));

    it("should not redirect if a param is resetted", inject(function($state, $q) {
      $state.go("p3", { param1: "foo" } );$q.flush();
      $state.go(".child");$q.flush();
      $state.go("p3", { param1: "bar" } );$q.flush();
      $state.go(".child");$q.flush();

      $deepStateRedirect.reset("p3", { param1 : 'foo' });

      $state.go("p3", { param1: "foo" }); $q.flush();
      expect($state.current.name).toEqual("p3"); // DSR

      $state.go("p3", { param1: "bar" }); $q.flush();
      expect($state.current.name).toEqual("p3.child"); // DSR
    }));

    it("should redirect only when all params match if 'params: true'", inject(function($state, $q) {
      $state.go("p2", { param1: "foo", param2: "foo2" } ); $q.flush();
      expect($state.current.name).toEqual("p2");
      expect($state.params).toEqual({ param1: "foo", param2: "foo2" });

      $state.go(".child"); $q.flush();
      expect($state.current.name).toEqual("p2.child");

      $state.go("p2", { param1: "bar" } ); $q.flush();
      expect($state.current.name).toEqual("p2");

      $state.go("p2", { param1: "foo", param2: "somethingelse" } ); $q.flush();
      expect($state.current.name).toEqual("p2");

      $state.go("p2", { param1: "foo", param2: "foo2" } ); $q.flush();
      expect($state.current.name).toEqual("p2.child"); // DSR
    }));
  });

  describe('ignoreDsr option', function () {
    it("should not redirect to tabs.tabs2.deep.nest when options are: { ignoreDsr: true }", function() {
      testGo("tabs", {entered: 'tabs'});
      testGo("tabs.tabs2.deep.nest", {entered: pathFrom('tabs.tabs2', 'tabs.tabs2.deep.nest') });
      testGo("tabs.tabs1.deep.nest", {entered: pathFrom('tabs.tabs1', 'tabs.tabs1.deep.nest'), exited: pathFrom('tabs.tabs2.deep.nest', 'tabs.tabs2') });
      $state.go("tabs.tabs2", {}, { ignoreDsr: true });
      $q.flush();
      expect($state.current.name).toBe("tabs.tabs2");
    });

    it("should redirect to tabs.tabs2.deep.nest after a previous ignoreDsr transition", function() {
      testGo("tabs", {entered: 'tabs'});
      testGo("tabs.tabs2.deep.nest", {entered: pathFrom('tabs.tabs2', 'tabs.tabs2.deep.nest') });
      testGo("tabs.tabs1.deep.nest", {entered: pathFrom('tabs.tabs1', 'tabs.tabs1.deep.nest'), exited: pathFrom('tabs.tabs2.deep.nest', 'tabs.tabs2') });
      $state.go("tabs.tabs2", {}, { ignoreDsr: true });
      $q.flush();
      expect($state.current.name).toBe("tabs.tabs2");

      resetTransitionLog();
      testGo("tabs.tabs1", { exited: 'tabs.tabs2', entered: pathFrom('tabs.tabs1', 'tabs.tabs1.deep.nest') }, { redirect: 'tabs.tabs1.deep.nest' } );
    });

    it("should remember the DSR state itself when transitioned to using ignoreDsr ", function() {
      testGo("tabs.tabs1.deep", {entered: pathFrom('tabs', 'tabs.tabs1.deep') });
      testGo("tabs.tabs2", {entered: 'tabs.tabs2', exited: pathFrom('tabs.tabs1.deep', 'tabs.tabs1')});
      $state.go("tabs.tabs1", {}, { ignoreDsr: true }); $q.flush();
      expect($state.current.name).toBe("tabs.tabs1");
      $state.go("tabs.tabs2", {}, { }); $q.flush();
      expect($state.current.name).toBe("tabs.tabs2");
      $state.go("tabs.tabs1", {}, { }); $q.flush();
      expect($state.current.name).toBe("tabs.tabs1");
    });
  });
});
