"use strict";
var $get, $state, $futureState, $q, _futureStateProvider, _stateProvider;

function futureState(stateName, pathFragment, urlPrefix, url, type) {
  return {
    stateName: stateName,       // Fully qualified name of future state
    pathFragment: pathFragment, // URL path fragment (used to build the real state.url)
    urlPrefix: urlPrefix,       // Placeholder URL prefix used to indicate a future state lives at or below here
    url: url,                   // The url that the state definition lives at
    type: type                  // Type of future state, used to build the real state definition
  };
}

function getSingleFuture () {
  return [ futureState("top.foo", "foo/", "/foo/", "hmmm", "iframe") ];
}

describe('futureState', function () {
  beforeEach(module('ct.ui.router.extras', function ($futureStateProvider, $stateProvider, $urlRouterProvider) {
    // Load and capture $stickyStateProvider and $stateProvider
    _futureStateProvider = $futureStateProvider;
    _stateProvider = $stateProvider;
    _stateProvider.state("top", { url: '/' });
    $urlRouterProvider.otherwise("/");

    $futureStateProvider.addResolve(function ($q) {
      return $q.when(getSingleFuture());
    });
    
    $futureStateProvider.stateFactory('ngload', ngloadStateFactory);
    $futureStateProvider.stateFactory('iframe', iframeStateFactory);
  }));

  // Capture $injector.get, $state, and $q
  beforeEach(inject(function($injector) {
    $get = $injector.get;
    $state = $get('$state');
    $futureState = $get('$futureState');
    $q = $get('$q');
  }));

  describe('futureState', function () {
    it("should async load state top.foo", function() {
      $state.go("top");
      $q.flush();
      expect($state.current.name).toBe("top");
      $state.go("top.foo");
      $q.flush();
      expect($state.current.name).toBe("top.foo");
    })

  });
});
