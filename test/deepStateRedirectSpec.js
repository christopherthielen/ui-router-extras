"use strict";
var $get, $state, $q, $deepStateRedirect;
var tLog;

function getDSRStates () {
  return [
    { name: 'other' },
    { name: 'tabs' },
    { name: 'tabs.tabs1' },
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
  });
  
  describe('deepStateRedirect', function () {
    it("should redirect to tabs.tabs1.deep.nest", function() {
      testGo("tabs", {entered: 'tabs'});
      testGo("tabs.tabs2.deep.nest", {entered: ['tabs.tabs2', 'tabs.tabs2.deep', 'tabs.tabs2.deep.nest' ]});
      testGo("tabs.tabs1", {entered: 'tabs.tabs1', exited: [ 'tabs.tabs2.deep.nest', 'tabs.tabs2.deep', 'tabs.tabs2' ]});
      testGo("tabs.tabs2", {entered: ['tabs.tabs2', 'tabs.tabs2.deep', 'tabs.tabs2.deep.nest'], exited: 'tabs.tabs1'}, { redirect: 'tabs.tabs2.deep.nest' });
    });
  });
});
