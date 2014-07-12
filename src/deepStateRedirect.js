//define(['angularAMD'], function (angularAMD) {

  var app = angular.module("ct.ui.router.extras");
  app.service("$deepStateRedirect", function ($rootScope, $state) {
    var lastSubstate = {};
    var lastParams = {};
    var deepStateRedirectsByName = {};

    var REDIRECT = "Redirect", ANCESTOR_REDIRECT = "AncestorRedirect";

    function computeDeepStateStatus(state) {
      var name = state.name;
      if (deepStateRedirectsByName.hasOwnProperty(name))
        return deepStateRedirectsByName[name];
      recordDeepStateRedirectStatus(name);
    }

    function recordDeepStateRedirectStatus(stateName) {
      var state = $state.get(stateName);
      if (state && state.deepStateRedirect === true) {
        deepStateRedirectsByName[stateName] = REDIRECT;
        if (lastSubstate[stateName] === undefined)
          lastSubstate[stateName] = stateName;
      }

      var lastDot = stateName.lastIndexOf(".");
      if (lastDot != -1) {
        var parentStatus = recordDeepStateRedirectStatus(stateName.substr(0, lastDot));
        if (parentStatus && deepStateRedirectsByName[stateName] === undefined) {
          deepStateRedirectsByName[stateName] = ANCESTOR_REDIRECT;
        }
      }
      return deepStateRedirectsByName[stateName] || false;
    }

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
      function shouldRedirect() {
        var deepStateStatus = computeDeepStateStatus(toState);
        var substate = lastSubstate[toState.name];
        // We're changing directly to one of the redirect (tab) states and we have a last substate recorded 
        return deepStateStatus === REDIRECT && substate && substate != toState.name ? true : false;
      }

      if (shouldRedirect()) { // send them to the last known state for that tab 
        event.preventDefault();
        $state.go(lastSubstate[toState.name], lastParams[toState.name]);
      }
    });

    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
      var deepStateStatus = computeDeepStateStatus(toState);
      if (deepStateStatus) {
        angular.forEach(lastSubstate, function (deepState, redirectState) {
          if (toState.name == deepState || toState.name.indexOf(redirectState + ".") != -1) {
            lastSubstate[redirectState] = toState.name;
            lastParams[redirectState] = angular.copy(toParams);
          }
        });
      }
    });
  });

  app.run(['$deepStateRedirect', function ($deepStateRedirect) {
    // Make sure $deepStateRedirect is instantiated
  }]);

//  return app;
//});
