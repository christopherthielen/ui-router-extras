"use strict";
var $get, $state, $q, _futureStateProvider, _stateProvider;
var suiteStates, tLog;

function registerStates(states) {
  "use strict";
  angular.forEach(states, function(value, key) {
    _stateProvider.state(key, value);
  });
}

function futureState(stateName, pathFragment, urlPrefix, url, type) {
  var futureState = {
    stateName: stateName,       // Fully qualified name of future state
    pathFragment: pathFragment, // URL path fragment (used to build the real state.url)
    urlPrefix: urlPrefix,       // Placeholder URL prefix used to indicate a future state lives at or below here
    url: url,                   // The url that the state definition lives at
    type: type                  // Type of future state, used to build the real state definition
  };
  return futureState;
}

describe('futureState', function () {
  beforeEach(module('ct.ui.router.extras', function ($futureStateProvider, $stateProvider, $urlRouterProvider) {
    // Load and capture $stickyStateProvider and $stateProvider
    _futureStateProvider = $futureStateProvider;
    _stateProvider = $stateProvider;
    
    _stateProvider.state("top", { url: '/' });
    $urlRouterProvider.otherwise("/");
    
    $futureStateProvider.futureStates(
        function ($q, $timeout) {
          var d = $q.defer();
          $timeout(function () {
            return [ futureState("top.foo", "foo/", "/foo/", "hmmm", "ngload") ];
          });
          return d.promise;
        }
    );
  }));

  // Capture $injector.get, $state, and $q
  beforeEach(inject(function($injector) {
    $get = $injector.get;
    $state = $get('$state');
    $q = $get('$q');
  }));

  describe('futureState', function () {
    // Set up base state heirarchy
    function getSimpleStates () {
      var newStates = {};
      newStates['main'] = {};
      newStates['tabs'] = {};
      newStates['tabs._tab1'] = {sticky: true};
      newStates['tabs._tab2'] = {sticky: true};
      newStates['tabs._tab3'] = {sticky: true};

      return newStates;
    }

    beforeEach(function() {
      reset(getSimpleStates());
    });
    
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
