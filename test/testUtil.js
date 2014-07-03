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

var TransitionAudit = function () {
  this.entered = [];
  this.exited = [];
  this.reactivated = [];
  this.inactivated = [];
  this.views = [];

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

// Add callbacks to each 
function addCallbacks (basicStates) {
  angular.forEach(basicStates, function (state) {
    function deregisterView(state, cause) {
      var views = _.keys(state.$$state().views);
      tLog.views = _.difference(tLog.views, views);
//      console.log(cause + ":Deregistered Inactive view " + views + " for state " + state.name + ": ", tLog.views);
    }
    function registerView(state, cause) {
      var views = _.keys(state.$$state().views);
      tLog.views = _.union(tLog.views, views);
//      console.log(cause  + ":  Registered Inactive view " + views + " for state " + state.name + ": ", tLog.views);
    }

    state.onInactivate = function () { tLog.inactivated.push(state.name); registerView(state,  'Inactivate');};
    state.onReactivate = function () { tLog.reactivated.push(state.name); deregisterView(state,'Reactivate');};
    state.onEnter =      function () { tLog.entered.push(state.name);     deregisterView(state,'Enter     ');};
    state.onExit =       function () { tLog.exited.push(state.name);      deregisterView(state,'Exit      ');};
  });
}

function testGo(state, tAdditional, options) {
  $state.go(state);
  $q.flush();
  var expectRedirect = options && options.redirect;
  if (!expectRedirect)
    expect($state.current.name).toBe(state);
  else
    expect($state.current.name).toBe(expectRedirect);
  
  var __inactiveViews = _.without(_.keys($state.$current.path[0].locals), "resolve", "globals");
  var extra = _.difference(__inactiveViews, tLog.views);
  var missing = _.difference(tLog.views, __inactiveViews);
  
  expect(extra).toEqual([]);
  expect(missing).toEqual([]);
  
  if (tExpected !== undefined && tAdditional !== undefined) {
    // append all arrays in tAdditional to arrays in tExpected
    angular.forEach(tAdditional, function (value, key) {
      tExpected[key] = tExpected[key].concat(tAdditional[key]);
    });

    angular.forEach(_.without(_.keys(tLog), 'views'), function(key) {
      var left = key + ": " + angular.toJson(tLog[key]);
      var right = key + ": " + angular.toJson(tExpected[key]);
      expect(left).toBe(right);
    });
  }
}

