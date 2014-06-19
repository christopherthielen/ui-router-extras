angular.module('ngMock').config(function ($provide) {
  $provide.decorator('$q', function ($delegate, $rootScope) {
    $delegate.flush = function() {
      $rootScope.$digest();
    };

    // Add callbacks to the promise that expose the resolved value/error
    function expose(promise) {
      // Don't add hooks to the same promise twice (shouldn't happen anyway)
      if (!promise.hasOwnProperty('$$resolved')) {
        promise.$$resolved = false;
        promise.then(function (value) {
          promise.$$resolved = { success: true, value: value };
        }, function (error) {
          promise.$$resolved = { success: false, error: error };
        });

        // We need to expose() any then()ed promises recursively
        var qThen = promise.then;
        promise.then = function () {
          return expose(qThen.apply(this, arguments));
        };
      }
      return promise;
    }

    // Wrap functions that return a promise
    angular.forEach([ 'when', 'all', 'reject'], function (name) {
      var qFunc = $delegate[name];
      $delegate[name] = function () {
        return expose(qFunc.apply(this, arguments));
      };
    });

    // Wrap defer()
    var qDefer = $delegate.defer;
    $delegate.defer = function () {
      var deferred = qDefer();
      expose(deferred.promise);
      return deferred;
    };

    return $delegate;
  });
});


function testablePromise(promise) {
  if (!promise || !promise.then) throw new Error('Expected a promise, but got ' + jasmine.pp(promise) + '.');
  if (!angular.isDefined(promise.$$resolved)) throw new Error('Promise has not been augmented by ngMock');
  return promise;
}

function resolvedPromise(promise) {
  var result = testablePromise(promise).$$resolved;
  if (!result) throw new Error('Promise is not resolved yet');
  return result;
}

function resolvedValue(promise) {
  var result = resolvedPromise(promise);
  if (!result.success) throw result.error;
  return result.value;
}

// Add callbacks to each 
function addCallbacks (basicStates) {
  angular.forEach(basicStates, function (state) {
    state.onInactivate = function () { tLog.inactivated.push(state.name); };
    state.onReactivate = function () { tLog.reactivated.push(state.name); };
    state.onEnter =      function () { tLog.entered.push(state.name); };
    state.onExit =       function () { tLog.exited.push(state.name); };
  });
}

var TransitionAudit = function () {
  this.entered = [];
  this.exited = [];
  this.reactivated = [];
  this.inactivated = [];

  this.toString = angular.bind(this,
      function toString() {
        var copy = {};
        angular.forEach(this, function(value, key) {
          if (key === 'inactivated' || key === 'reactivated' ||
              key === 'entered' || key === 'exited') {
            copy[key] = value;
          }
        });
        return angular.toJson(copy);
      }
  );
};

function testGo(state, tCurrent, tAdditional, options) {
  $state.go(state);
  $q.flush();
  var expectRedirect = options && options.redirect;
  if (!expectRedirect)
    expect($state.current.name).toBe(state);

  if (tCurrent !== undefined && tAdditional !== undefined) {
    // append all arrays in tAdditional to arrays in tCurrent
    angular.forEach(tAdditional, function (value, key) {
      tCurrent[key] = tCurrent[key].concat(tAdditional[key]);
    });

    angular.forEach(tCurrent, function(value, key) {
      var left = key + ": " + angular.toJson(tLog[key]);
      var right = key + ": " + angular.toJson(tCurrent[key]);
      expect(left).toBe(right);
    });
  }
}

