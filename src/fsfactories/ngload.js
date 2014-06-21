"use strict";
function ngloadStateFactory($q, futureState) {
  var ngloadDeferred = $q.defer();
  require([ "ngload!" + futureState.src , 'ngload', 'angularAMD'],
      function ngloadCallback(result, ngload, angularAMD) {
        angularAMD.processQueue();
        ngloadDeferred.resolve(result.entryState);
      });
  return ngloadDeferred.promise;
}