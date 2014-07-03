var forEach = angular.forEach;

var map = function (collection, callback) {
  var result = [];
  angular.forEach(collection, function (item, index) {
    result.push(callback(item, index));
  });
  return result;
};

var DEBUG = false;