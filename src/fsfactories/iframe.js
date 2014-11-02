"use strict";
var iframeStateFactory = function($q, futureState) {
  var state = {
    name: futureState.name,
    template: "<iframe src='" + futureState.src + "'></iframe>",
    url: futureState.url,
    parent: futureState.parent
  };
  return $q.when(state);
};