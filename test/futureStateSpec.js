"use strict";
var $get, $state, $futureState, $q, _futureStateProvider, _stateProvider, _urlRouterProvider, $location, $rootScope;

function futureState(stateName, pathFragment, urlPrefix, url, type) {
  return {
    stateName: stateName,       // Fully qualified name of future state
    pathFragment: pathFragment, // URL path fragment (used to build the real state.url)
    urlPrefix: urlPrefix,       // Placeholder URL prefix used to indicate a future state lives at or below here
    url: url,                   // The url that the state definition lives at
    type: type                  // Type of future state, used to build the real state definition
  };
}

describe('futureState', function () {
  beforeEach(module('ct.ui.router.extras', function ($futureStateProvider, $stateProvider, $urlRouterProvider) {
    // Load and capture $stickyStateProvider and $stateProvider
    _futureStateProvider = $futureStateProvider;
    _stateProvider = $stateProvider;
    _urlRouterProvider = $urlRouterProvider;
    _stateProvider.state("top", { url: '/' });

    $futureStateProvider.futureState(futureState("top.foo", "foo/", "/foo/", "hmmm", "iframe"));
    $futureStateProvider.futureState(futureState("top.bar", "bar/", "/bar/", "404.js", "doesntwork"));
    $futureStateProvider.stateFactory('ngload', ngloadStateFactory);
    $futureStateProvider.stateFactory('iframe', iframeStateFactory);
    $futureStateProvider.stateFactory('doesntwork', function(futureState) { return $q.reject("doesntwork"); });
  }));

  // Capture $injector.get, $state, and $q
  beforeEach(inject(function($injector) {
    $get = $injector.get;
    $state = $get('$state');
    $futureState = $get('$futureState');
    $q = $get('$q');
    $location = $get("$location");
    $rootScope = $get("$rootScope");
  }));

  describe('futureState', function () {
    it("should async load state top.foo", function() {
      $state.go("top");
      $q.flush();
      expect($state.current.name).toBe("top");
      $state.go("top.foo");
      $q.flush();
      expect($state.current.name).toBe("top.foo");
      expect($location.path()).toBe("/foo/")
    });

    it("should work by changing url", function() {
      expect($location.path()).toBe("");
      $location.path("/foo/");

      $rootScope.$broadcast("$locationChangeSuccess");
      $rootScope.$apply();
      $q.flush();
      expect($location.path()).toBe("/foo/");
      expect($state.current.name).toBe("top.foo");
    });

    it("should respect $urp.otherwise() if the state/futurestate is not found", function() {
      expect($location.path()).toBe("");
      _urlRouterProvider.otherwise("/foo/");
      $location.path("/badpath");

      $rootScope.$broadcast("$locationChangeSuccess");
      $rootScope.$apply();
      $q.flush();
      expect($location.path()).toBe("/foo/");
      expect($state.current.name).toBe("top.foo");
    });

    it("should respect $urp.otherwise() if a futurestate was found, but could not be loaded", function() {
      expect($location.path()).toBe("");
      _urlRouterProvider.otherwise("/foo/");
      $location.path("/bar/");

      $rootScope.$broadcast("$locationChangeSuccess");
      $rootScope.$apply();
      $q.flush();
      expect($location.path()).toBe("/foo/");
      expect($state.current.name).toBe("top.foo");
    });

  });
});
