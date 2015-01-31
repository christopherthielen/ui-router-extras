angular.module('ct.ui.router.extras.previous', [ 'ct.ui.router.extras.core', 'ct.ui.router.extras.transition' ]).service("$previousState",
  [ '$rootScope', '$state',
    function ($rootScope, $state) {
      var previous = null, lastPrevious = null, memos = {};

      $rootScope.$on("$transitionStart", function(evt, $transition$) {
        lastPrevious = previous;
        previous = $transition$.from;

        $transition$.promise.then(commit).catch(revert);
        function commit() { lastPrevious = null; }
        function revert() { previous = lastPrevious; }
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

angular.module('ct.ui.router.extras.previous').run(['$previousState', function ($previousState) {
  // Inject $previousState so it can register $rootScope events
}]);
