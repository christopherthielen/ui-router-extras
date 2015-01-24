describe('state-vis', function () {
  beforeEach(module('ct.ui.router.extras.statevis', function($stateProvider) {
  }));

  it('1 === 1', inject(function($state) {
    expect(1).toBe(1);
  }));
});