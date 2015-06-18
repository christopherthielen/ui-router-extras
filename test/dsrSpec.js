"use strict";
var $get, $state, $q, $deepStateRedirect;

function getDSRStates () {
  // This function effectively returns the default DSR state at runtime
  function p7DSRFunction($dsr$) {
    // allow standard DSR behavior by returning true if $dsr$.redirect has a state set
    if ($dsr$.redirect.state) return true;
    // Otherwise, return a redirect object {state: "foo", params: {} } for the default case
    return {
      state: ($dsr$.to.params.param == 2) ? "p7.child2" : "p7.child1",
      params: {}
    };
  }

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
    { name: 'p3.child'},
    { name: 'p4', url: '/p4', dsr: { default: "p4.child" } },
    { name: 'p4.child'},
    { name: 'p4.child2'},
    { name: 'p5', url: '/p5', dsr: { default: { state: "p5.child", params: { p5param: "1" } } } },
    { name: 'p5.child', url: '/child/:p5param'},
    { name: 'p6', url: '/p6/:param', dsr: { params: true, default: "p6.child1" } },
    { name: 'p6.child1'},
    { name: 'p6.child2'},
    { name: 'p6.child3'},
    { name: 'p7', url: '/p7/:param', dsr: { default: {}, fn: p7DSRFunction } },
    { name: 'p7.child1'},
    { name: 'p7.child2'},
    { name: 'p8', dsr: true },
    { name: 'p8child1', parent: 'p8' },
    { name: 'p8child2', parent: 'p8' }
  ];
}

function dsrReset(newStates) {
  addCallbacks(newStates);
  resetTransitionLog();
}


describe('deepStateRedirect', function () {
  beforeEach(module('ct.ui.router.extras.dsr', function ($stateProvider, $urlRouterProvider) {
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

  describe("with child substates configured using {parent: parentState}", function() {
    it("should remember and redirect to the last deepest state", function() {
      testGo("p8child1");
      testGo("other");
      testGo("p8", undefined, { redirect: 'p8child1'} );
    });
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

    // Test for issue #184 getRedirect()
    it("should be returned from getRedirect() for matching DSR params", inject(function($state, $q) {
      $state.go("p1", { param1: "foo", param2: "foo2" } ); $q.flush();
      $state.go(".child"); $q.flush();
      expect($deepStateRedirect.getRedirect("p1", { param1: "foo"}).state).toBe("p1.child");
      expect($deepStateRedirect.getRedirect("p1", { param1: "bar"})).toBeUndefined();
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

  describe("default substates", function() {
    // Test for issue #184 getRedirect()
    it("should be returned by getRedirect", function() {
      expect($deepStateRedirect.getRedirect("p4").state).toBe("p4.child");
    });

    it("should affect the first transition to the DSR state", function() {
      testGo("p4", undefined, { redirect: 'p4.child'});
      testGo("p4.child2");
      testGo("p4", undefined, { redirect: 'p4.child2'});
    });

    it("should provide default parameters", function() {
      testGo("p5", undefined, { redirect: 'p5.child'});
      expect($state.params).toEqual({p5param: "1"});
    });

    it("should redirect to the default state when params: true and transition to DSR with un-seen param values", function() {
      testGo("p6", undefined, { params: {param: "1"}, redirect: 'p6.child1'});
      testGo("p6.child2");
      testGo("p6", undefined, { params: {param: "1"}, redirect: 'p6.child2'});
      testGo("p6", undefined, { params: {param: "2"}, redirect: 'p6.child1'});
    });

    describe("in conjunction with a dsr fn", function() {
      it("should still invoke the dsr fn and use the result", function() {
        // This effectively allows a function to determine DSR default
        testGo("p7", undefined, { params: {param: "2"}, redirect: 'p7.child2'});
        testGo("p7.child1");
        testGo("p7", undefined, { params: {param: "2"}, redirect: 'p7.child1'});
      });

      it("should still invoke the dsr fn and use the result", function() {
        // This effectively allows the default DSR to be determined by a fn
        testGo("p7", undefined, { redirect: 'p7.child1' });
        testGo("p1");
        testGo("p7", undefined, { params: {param: "2"}, redirect: 'p7.child1' });
      });

    })
  })
});
