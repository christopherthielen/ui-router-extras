describe('$$state()', function () {
  beforeEach(module('ct.ui.router.extras.core', function($stateProvider) {
    $stateProvider.state({ name: 'test' })
  }));

  it('should return the internal state representation', inject(function($state) {
    var test = $state.get('test');
    expect(test.name).toBe('test');
    expect(test.$$state().name).toBe('test');
    expect(test.$$state().includes).toBeDefined();
  }));
});