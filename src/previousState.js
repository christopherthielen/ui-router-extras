angular.module('ct.ui.router.extras').service("$previousState",
  [ '$rootScope', '$state',
    function ($rootScope, $state) {
      var previous = null;
      var memos = {};

      var lastPrevious = null;

      $rootScope.$on("$stateChangeStart", function (evt, toState, toStateParams, fromState, fromStateParams) {
        // State change is starting.  Keep track of the CURRENT previous state in case we have to restore it
        lastPrevious = previous;
        previous = { state: fromState, params: fromStateParams };
      });

      $rootScope.$on("$stateChangeError", function () {
        // State change did not occur due to an error.  Restore the previous previous state.
        previous = lastPrevious;
        lastPrevious = null;
      });

      $rootScope.$on("$stateChangeSuccess", function () {
        lastPrevious = null;
      });

      var $previousState = {
        get: function (memoName) {
          return memoName ? memos[memoName] : previous;
        },
        go: function (memoName, options) {
          var to = $previousState.get(memoName);
          return $state.go(to.state, to.params, options);
        },
        memo: function (memoName, defaultStateName, defaultStateParams) {
          memos[memoName] = previous || { state: $state.get(defaultStateName), params: defaultStateParams };
        },
        forget: function (memoName) {
          delete memos[memoName];
        }
      };

      return $previousState;
    }
  ]
);

angular.module('ct.ui.router.extras').run(['$previousState', function ($previousState) {
  // Inject $previousState so it can register $rootScope events
}]);
