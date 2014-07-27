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
    { name: 'tabs.tabs2.deep.nest' }
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

  describe('deepStateRedirect', function () {
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
