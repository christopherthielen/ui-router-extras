"use strict";
function ngloadStateFactory($q, futureState) {
  var ngloadDeferred = $q.defer();
  
  require([ "ngload!" + futureState.url , 'ngload', 'angularAMD'],  function ngloadCallback(module, ngload, angularAMD) {
    angularAMD.processQueue();
    ngloadDeferred.resolve(module);
  });
  
  var state = {
    name: futureState.stateName,
    template: "<div ui-view></div>",
    url: futureState.pathFragment + "/",
    resolve: { 
      ngapp: function() { return ngloadDeferred.promise } 
    }
  };

  return $q.when(state);
}