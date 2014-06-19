"use strict";
var iframeStateFactory = function($q, futureState) {
  var state = {
    name: futureState.stateName,
    template: "<iframe src='" + futureState.url + "'></iframe>",
    url: futureState.pathFragment
  };
  return $q.when(state);
};