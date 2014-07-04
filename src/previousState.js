angular.module('ct.ui.router.extras').service("$previousState", 
    [ '$rootScope', '$state', 
function($rootScope, $state) {
  var previous = null;
  var memos = {};

  var lastPrevious = null;

  $rootScope.$on("$stateChangeStart", function(evt, toState, toStateParams, fromState, fromStateParams) {
    lastPrevious = previous;
    previous = { state: fromState, params: fromStateParams };
  });

  $rootScope.$on("$stateChangeError", function() {
    previous = lastPrevious;
    lastPrevious = null;
  });

  $rootScope.$on("$stateChangeSuccess", function() {
    lastPrevious = null;
  });

  var $previousState = {
    get: function(memoName) {
      return memoName ? memos[memoName] : previous; },
    go: function(memoName) {
      var to = $previousState.get(memoName);
      return $state.go(to.state, to.params)},
    remember: function(memoName) {
      memos[memoName] = previous; }
  };

  return $previousState;
}]);
