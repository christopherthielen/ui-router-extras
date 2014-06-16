var $get, $state, $q;
var _stickyStateProvider;
var states = {};
describe('stickyState', function () {
  beforeEach(module('ct.ui.router.extras', function() {
    states['main'] = {};
    states['tabs'] = {};
    states['tabs._tab1'] = {sticky: true};
    states['tabs._tab2'] = {sticky: true};
    states['tabs._tab3'] = {sticky: true};
  }));

  beforeEach(module(function ($stickyStateProvider, $stateProvider) {
    angular.forEach(states, function(value, key) {
      $stateProvider.state(key, value);
    });
  }));

  beforeEach(inject(function($injector) {
    $get = $injector.get;
    $state = $get('$state');
    $q = $get('$q');
  }));

  function initStateTo(state, optionalParams) {
    $state = $get('$state'), $q = $get('$q');
    $state.transitionTo(state, optionalParams || {});
    $q.flush();
    expect($state.current.name).toBe(state);
  }
  
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
      
      $state.go('tabs._tab1');
      $q.flush();
      expect($state.current.name).toBe('tabs._tab1');
    });
  });

});
