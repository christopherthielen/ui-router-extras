var $get;
describe('stickyState', function () {
  beforeEach(module('ct.ui.router.extras'));
  beforeEach(module(function ($stickyStateProvider, $stateProvider) {
    $stateProvider.state('main', {});
    $stateProvider.state('tabs', {});
    
    $stateProvider.state('tabs._tab1', { sticky: true });
    $stateProvider.state('tabs._tab2', { sticky: true });
    $stateProvider.state('tabs._tab3', { sticky: true });
  }));
  beforeEach(inject(function($injector) {
    $get = $injector.get;
  }));

  function initStateTo(state, optionalParams) {
    var $state = $get('$state'), $q = $get('$q');
    $state.transitionTo(state, optionalParams || {});
    $q.flush();
    expect($state.current.name).toBe(state);
  }
  
  describe('.go()', function () {
    it ('should transition normally between non-sticky states', function () {
      initStateTo('main');
      var $state = $get('$state');
      var promise;
      expect(function() { promise = $state.go('main'); }).not.toThrow();
      promise.then(function() {
        expect($state.current.name).toBe('main');
      });
    });
  });

});
