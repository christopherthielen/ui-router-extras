"use strict";
var $get, $state, $futureState, $q, _futureStateProvider, _stateProvider, _urlRouterProvider, $location, $rootScope;

function futureState(stateName, urlPrefix, url, type, parent) {
  return {
    name: stateName,       // Fully qualified name of future state
    urlPrefix: urlPrefix,       // Deprecated; Placeholder URL prefix used to indicate a future state lives at or below here
    url: url,                   // The url portion used to indicate a future state lives at, or below here.
                                // Concat'd with the parent state's url similar to a regular state.url definition
    type: type,                 // Type of future state, used to build the real state definition
    parent: parent              // The parent state or parent state name, (used to build the UrlMatcher)
  };
}

describe('futureState', function () {
  beforeEach(module('ct.ui.router.extras.future', function ($futureStateProvider, $stateProvider, $urlRouterProvider) {
    // Load and capture $stickyStateProvider and $stateProvider
    _futureStateProvider = $futureStateProvider;
    _stateProvider = $stateProvider;
    _urlRouterProvider = $urlRouterProvider;
    _stateProvider.state("top", { url: '/' });
    _stateProvider.state("other", { url: '/other/:param' });
    _stateProvider.state("top.abstract", { abstract: true });
    _stateProvider.state("nourl", { abstract: true });

    $futureStateProvider.futureState(futureState("top.foo", "/foo/", null, "iframe"));
    $futureStateProvider.futureState(futureState("top.bar", "/bar/", null, "doesntwork"));
    $futureStateProvider.futureState(futureState("top.baz", null, "baz/", "iframeWithParam"));
    $futureStateProvider.futureState(futureState("qux", null, "/qux", "iframe", "other")); // has a parent 'other'
    $futureStateProvider.futureState(futureState("other.hey", null, "/hey", "iframe"));
    $futureStateProvider.futureState(futureState("hwat", null, "/hwat", "iframe", "other.hey")); // has a parent 'other.hey'
    $futureStateProvider.futureState(futureState("top.abstract.boom", null, "boom", "iframe")); // future state as child of abstract state
    $futureStateProvider.futureState(futureState("issue124", null, "/issue124", "iframe")); // url is '/issue124'
    $futureStateProvider.stateFactory('ngload', ngloadStateFactory);
    $futureStateProvider.stateFactory('iframe', iframeStateFactory);
    $futureStateProvider.stateFactory('iframeWithParam', function(futureState) {
      var state = {
        name: futureState.name,
        template: "<h1>{{header}}</h1><iframe src='" + futureState.src + "'></iframe>",
        controller: function($scope, $stateParams) { $scope.header = $stateParams.header; },
        url: futureState.url + ":header"
      };
      return $q.when(state);
    });
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

    it("should async load via relative sref .foo", function() {
      $state.go("top");
      $q.flush();
      expect($state.current.name).toBe("top");
      $state.go(".foo");
      $q.flush();
      expect($state.current.name).toBe("top.foo");
      expect($location.path()).toBe("/foo/")
    });

    it("should work by changing url", function() {
      expect($location.path()).toBe("");
      $location.path("/foo/");
      $q.flush();
      expect($location.path()).toBe("/foo/");
      expect($state.current.name).toBe("top.foo");
    });

    it("should respect $urp.otherwise() if the state/futurestate is not found", function() {
      expect($location.path()).toBe("");
      _urlRouterProvider.otherwise("/foo/");
      $location.path("/badpath");
      $q.flush();
      expect($location.path()).toBe("/foo/");
      expect($state.current.name).toBe("top.foo");
    });

    // Test for issue #129
    it("should allow future states as children of abstract states (url)", function() {
      $location.path("/boom");
      $q.flush();
      expect($location.path()).toBe("/boom");
      expect($state.current.name).toBe("top.abstract.boom");
    });

    it("should allow future states as children of abstract states (go)", function() {
      $state.go("top.abstract.boom");
      $q.flush();
      expect($location.path()).toBe("/boom");
      expect($state.current.name).toBe("top.abstract.boom");
    });

    it("should respect $urp.otherwise() if a futurestate was found, but could not be loaded", function() {
      expect($location.path()).toBe("");
      _urlRouterProvider.otherwise("/foo/");
      $location.path("/bar/");
      $q.flush();
      expect($location.path()).toBe("/foo/");
      expect($state.current.name).toBe("top.foo");
    });

    it("should match futurestates urls using regexp", function() {
      expect($location.path()).toBe("");
      $location.path("/baz/123");
      $q.flush();
      expect($location.path()).toBe("/baz/123");
      expect($state.current.name).toBe("top.baz");
    });

    it("should lazy load futurestates that have parent futurestates", function() {
      expect($location.path()).toBe("");
      $location.path("/other/123/hey");
      $q.flush();
      expect($location.path()).toBe("/other/123/hey");
      expect($state.current.name).toBe("other.hey");
    });

    it("should lazy load futurestates that have parent futurestates2", function() {
      expect($location.path()).toBe("");
      $location.path("/other/123/hey/hwat");
      $q.flush();
      expect($location.path()).toBe("/other/123/hey/hwat");
      expect($state.current.name).toBe("hwat");
    });

    it("should build futurestates urls using parent reference", function() {
      expect($location.path()).toBe("");
      $location.path("/other/123/qux");
      $q.flush();
      expect($location.path()).toBe("/other/123/qux");
      expect($state.current.name).toBe("qux");
    });


    it("should match futurestates urls using wildcard regexp", function() {
      expect($location.path()).toBe("");
      $location.path("/baz/This+is+the+title");

      $rootScope.$apply();
      $q.flush();
      expect($location.path()).toBe("/baz/This+is+the+title");
      expect($state.current.name).toBe("top.baz");
    });

    // Failing test for issue #124
    it("should execute .otherwise() if the unfound url matches a futurestate's prefix but not the full url", function() {
      expect($location.path()).toBe("");
      _urlRouterProvider.otherwise("/");
      $location.path("/issue124/404notfound");
      $q.flush();
      expect($location.path()).toBe("/");
      expect($state.current.name).toBe("top");
    });

    // Failing test case for issue #129
    it ("should allow future states to be registered without either a url or name", function() {
      _futureStateProvider.futureState(futureState("issue129", undefined, undefined, "iframe")); // no url
      testGo("issue129");
    });

    // Failing test case for issue #167
    it ("should allow future states to be registered as a substate of an abstract state with no url ", function() {
      _futureStateProvider.futureState(futureState("nourl.issue167", undefined, undefined, "iframe")); // no url
      testGo("nourl.issue167");
    });

    // Test 1 for enhancement issue #196
    it("should remove future states that properly load", function() {
      var name = "top.foo";

      expect($futureState.get()[name]).toBeDefined();

      $state.go(name);
      $q.flush();

      expect($state.current.name).toBe(name);
      expect($futureState.get()[name]).toBeUndefined();
    });

    // Test 2 for enhancement issue #196
    it("should remove future states that failed to load, if no policy is set", function() {
      var name = "top.bar";

      expect($futureState.get()[name]).toBeDefined();

      $state.go(name);
      $q.flush();

      expect($state.current.name).toBe("");
      expect($futureState.get()[name]).toBeUndefined();
    });

    // Test 3 for enhancement issue #196
    it("should remove future states that failed to load, if no policy is set", function() {
      var name = "top.bar";

      var factory = function (futureState) { return $q.reject("doesntwork"); };
      factory.$options = { failedLazyLoadPolicy: "retain" };
      _futureStateProvider.stateFactory('doesntwork', factory);

      expect($futureState.get()[name]).toBeDefined();

      $state.go(name);
      $q.flush();

      expect($state.current.name).toBe("");
      expect($futureState.get()[name]).toBeDefined();
    })
  });
});
