var forEach = angular.forEach;

var map = function (collection, callback) {
  "use strict";
  var result = [];
  forEach(collection, function (item, index) {
    result.push(callback(item, index));
  });
  return result;
};

var keys = function(collection) {
  "use strict";
  return map(collection, function(collection, key) {
    return key;
  });
};

var filter = function(collection, callback) {
  "use strict";
  var result = [];
  forEach(collection, function(item, index) {
    if (callback(item, index)) {
      result.push(item);
    }
  });
  return result;
};

var filterObj = function(collection, callback) {
  "use strict";
  var result = {};
  forEach(collection, function(item, index) {
    if (callback(item, index)) {
      result[index] = item;
    }
  });
  return result;
};

var DEBUG = false;