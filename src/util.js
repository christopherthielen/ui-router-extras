var DEBUG = false;

var forEach = angular.forEach;
var extend = angular.extend;
var isArray = angular.isArray;

var map = function (collection, callback) {
  "use strict";
  var result = [];
  forEach(collection, function (item, index) {
    result.push(callback(item, index));
  });
  return result;
};

var keys = function (collection) {
  "use strict";
  return map(collection, function (collection, key) {
    return key;
  });
};

var filter = function (collection, callback) {
  "use strict";
  var result = [];
  forEach(collection, function (item, index) {
    if (callback(item, index)) {
      result.push(item);
    }
  });
  return result;
};

var filterObj = function (collection, callback) {
  "use strict";
  var result = {};
  forEach(collection, function (item, index) {
    if (callback(item, index)) {
      result[index] = item;
    }
  });
  return result;
};

// Duplicates code in UI-Router common.js
function ancestors(first, second) {
  var path = [];

  for (var n in first.path) {
    if (first.path[n] !== second.path[n]) break;
    path.push(first.path[n]);
  }
  return path;
}

// Duplicates code in UI-Router common.js
function objectKeys(object) {
  if (Object.keys) {
    return Object.keys(object);
  }
  var result = [];

  angular.forEach(object, function (val, key) {
    result.push(key);
  });
  return result;
}

// Duplicates code in UI-Router common.js
function arraySearch(array, value) {
  if (Array.prototype.indexOf) {
    return array.indexOf(value, Number(arguments[2]) || 0);
  }
  var len = array.length >>> 0, from = Number(arguments[2]) || 0;
  from = (from < 0) ? Math.ceil(from) : Math.floor(from);

  if (from < 0) from += len;

  for (; from < len; from++) {
    if (from in array && array[from] === value) return from;
  }
  return -1;
}

// Duplicates code in UI-Router common.js
// Added compatibility code  (isArray check) to support both 0.2.x and 0.3.x series of UI-Router.
function inheritParams(currentParams, newParams, $current, $to) {
  var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];

  for (var i in parents) {
    if (!parents[i].params) continue;
    // This test allows compatibility with 0.2.x and 0.3.x (optional and object params)
    parentParams = isArray(parents[i].params) ? parents[i].params : objectKeys(parents[i].params);
    if (!parentParams.length) continue;

    for (var j in parentParams) {
      if (arraySearch(inheritList, parentParams[j]) >= 0) continue;
      inheritList.push(parentParams[j]);
      inherited[parentParams[j]] = currentParams[parentParams[j]];
    }
  }
  return extend({}, inherited, newParams);
}

function inherit(parent, extra) {
  return extend(new (extend(function () { }, {prototype: parent}))(), extra);
}
