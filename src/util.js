var forEach = angular.forEach;

var map = function (collection, callback) {
  var result = [];
  angular.forEach(collection, function (item) {
    result.push(callback(item));
  });
  return result;
};
