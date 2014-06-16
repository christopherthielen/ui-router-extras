var $get, $state, $q, _stickyStateProvider;
var states, tLog;

var TransitionDelta = function transitionDelta() {
  this.entered = [];
  this.exited = [];
  this.reactivated = [];
  this.inactivated = [];
  
  this.toString = angular.bind(this,
      function toString() {
        var copy = {};
        angular.forEach(this, function(value, key) {
          if (key === 'inactivated' || key === 'reactivated' ||
              key === 'entered' || key === 'exited') {
            copy[key] = value;
          }
        });
        return angular.toJson(copy);
      });
};

describe('stickyState', function () {
  // Reset Transition Log 
  function resetLog() { tLog = new TransitionDelta(); }
  
  // Set up base state heirarchy
  function makeStates () {
    states = {};
    states['main'] = {
      onEnter: function () {
        console.log("Entered --------------------------------------->");
      }
    };
    states['tabs'] = {};
    states['tabs._tab1'] = {sticky: true};
    states['tabs._tab2'] = {sticky: true};
    states['tabs._tab3'] = {sticky: true};
  }
  
  // Add callbacks to each 
  function addCallbacks () {
    angular.forEach(states, function (state, key) {
      state.onInactivate = function () { tLog.inactivated.push(state.name); };
      state.onReactivate = function () { tLog.reactivated.push(state.name); };
      state.onEnter =      function () { tLog.entered.push(state.name); };
      state.onExit =       function () { tLog.exited.push(state.name); };
    });
  }
  
  beforeEach(module('ct.ui.router.extras', function() {
    "use strict";
    resetLog();
    makeStates();
    addCallbacks();
  }));
  
  // Load and capture $stickyStateProvider
  beforeEach(module(function ($stickyStateProvider, $stateProvider) {
    _stickyStateProvider = $stickyStateProvider;
    angular.forEach(states, function(value, key) {
      $stateProvider.state(key, value);
    });
  }));

  // Capture $injector.get, $state, and $q
  beforeEach(inject(function($injector) {
    $get = $injector.get;
    $state = $get('$state');
    $q = $get('$q');
  }));

//  function initStateTo(state, optionalParams) {
//    $state = $get('$state'), $q = $get('$q');
//    $state.transitionTo(state, optionalParams || {});
//    $q.flush();
//    expect($state.current.name).toBe(state);
//  }
  
  describe('.go()', function () {
    it ('should transition normally between non-sticky states', function () {
      $state.go('main');
      $q.flush();
      expect($state.current.name).toBe('main');
      $state.go('tabs');
      $q.flush();
      expect($state.current.name).toBe('tabs');
    });
    
    it ('should transition between non-sticky and sticky states', function () {
      $state.go('tabs');
      $q.flush();
      expect($state.current.name).toBe('tabs');
      
      var expected = angular.extend(new TransitionDelta(), { entered: ['tabs'] });
      expect(tLog.toString()).toBe(expected.toString());

      $state.go('tabs._tab1');
      $q.flush();
      expected.entered.push('tabs._tab1');
      expect(tLog.toString()).toBe(expected.toString());
      
      $state.go('tabs');
      $q.flush();
      expected.inactivated.push('tabs._tab1');
      expect(tLog.toString()).toBe(expected.toString());
    });
  });

});
