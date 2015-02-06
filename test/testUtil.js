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

var tLog, tExpected;

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

    state.onInactivate = function () {
      tLog.inactivated.push(state.name); registerView(state,  'Inactivate');
    };
    state.onReactivate = function () {
      tLog.reactivated.push(state.name); deregisterView(state,'Reactivate');
    };
    state.onEnter = function () {
      tLog.entered.push(state.name);     deregisterView(state,'Enter     ');
    };
    state.onExit = function () {
      tLog.exited.push(state.name);      deregisterView(state,'Exit      ');
    };
  });
}

function pathFrom(start, end) {
  var startNodes = start.split(".");
  var endNodes = end.split(".");
  var reverse = startNodes.length > endNodes.length;
  if (reverse) {
    var tmp = startNodes;
    startNodes = endNodes;
    endNodes = tmp;
  }

  var common = _.intersection(endNodes, startNodes);
  var difference = _.difference(endNodes, startNodes);
  difference.splice(0, 0, common.pop());

  var name = common.join(".");
  var path = _.map(difference, function(segment) {
    name = (name ? name + "." : "") + segment;
    return name;
  });
  if (reverse) path.reverse();
  return path;
}

/**
 * This test function does the following:
 * - Go to a state `state`.
 * - Flush transition
 * - Expect the current state to be the target state, or the expected redirect state
 * - analyse the transition log and expect
 *   - The entered states to match tAdditional.entered
 *   - The exited states to match tAdditional.exited
 *   - The inactivated states to match tAdditional.inactivated
 *   - The reactivated states to match tAdditional.reactivated
 * - Expect the active+inactive states to match the active+inactive views
 *
 * @param state: The target state
 * @param tAdditional: An object with the expected transitions
 *    {
 *      entered:      statename or [ statenamearray ],
 *      exited:       statename or [ statenamearray ],
 *      inactivated:  statename or [ statenamearray ],
 *      reactivated:  statename or [ statenamearray ]
 *    }
 *    note: statenamearray may be built using the pathFrom helper function
 * @param options: options which modify the expected transition behavior
 *    { redirect: redirectstatename }
 */
function testGo(state, tAdditional, options) {
  $state.go(state, options && options.params, options);
  $q.flush();
  var expectRedirect = options && options.redirect;
  if (!expectRedirect)
    expect($state.current.name).toBe(state);
  else
    expect($state.current.name).toBe(expectRedirect);

  var root = $state.$current.path[0].parent;
  var __inactives = root.parent;

  // If ct.ui.router.extras.sticky module is included, then root.parent holds the inactive states/views
  if (__inactives) {
    var __inactiveViews = _.keys(__inactives.locals);
    var extra = _.difference(__inactiveViews, tLog.views);
    var missing = _.difference(tLog.views, __inactiveViews);

    expect("Extra Views: " + extra).toEqual("Extra Views: " + []);
    expect("Missing Views: " + missing).toEqual("Missing Views: " + []);
  }

  if (tExpected && tAdditional) {
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

function uiRouterVersion() { 
  var found = undefined;
  _.each(__karma__.files, function(file, key) {
    var matcher = /ui-router-versions\/(\d+)\.(\d+)\.(\d+)\/angular-ui-router.js/;
    if (!found) found = matcher.exec(key);
  });
  if (!found) return undefined;

  return (parseInt(found[1]) * 1000) + (parseInt(found[2]) * 100) + parseInt(found[3]);
}

function resetTransitionLog() {
  tLog = new TransitionAudit();
  tExpected = new TransitionAudit();
}