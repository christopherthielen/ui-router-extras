var mod_previous = angular.module('ct.ui.router.extras.previous', [ 'ct.ui.router.extras.core', 'ct.ui.router.extras.transition' ]).service("$previousState",
  [ '$rootScope', '$state', '$q',
    function ($rootScope, $state, $q) {
      var previous = null, lastPrevious = null, memos = {};

      $rootScope.$on("$transitionStart", function(evt, $transition$) {
        var from = $transition$.from;
        // Check if the fromState is navigable before tracking it.
        // Root state doesn't get decorated with $$state().  Doh.
        var fromState = from.state && from.state.$$state && from.state.$$state();
        function commit() { lastPrevious = null; }
        function revert() { previous = lastPrevious; }
        if (fromState) {
          lastPrevious = previous;
          previous = $transition$.from;

          $transition$.promise.then(commit)['catch'](revert);
        }
      });

      var $previousState = {
        get: function (memoName) {
          return memoName ? memos[memoName] : previous;
        },
        set: function (memoName, previousState, previousParams) {
          memos[memoName] = { state: $state.get(previousState), params: previousParams };
        },
        go: function (memoName, options) {
          var to = $previousState.get(memoName);
          if (!to) {
            return $q.reject(new Error('no previous state ' + (memoName ? 'for memo: ' + memoName : '')));
          }
          return $state.go(to.state, to.params, options);
        },
        memo: function (memoName, defaultStateName, defaultStateParams) {
          memos[memoName] = previous || { state: $state.get(defaultStateName), params: defaultStateParams };
        },
        forget: function (memoName) {
          if (memoName) {
            delete memos[memoName];
          } else {
            previous = undefined;
          }
        }
      };

      return $previousState;
    }
  ]
);

mod_previous.run(['$previousState', function ($previousState) {
  // Inject $previousState so it can register $rootScope events
}]);

module.exports = mod_previous.name;
