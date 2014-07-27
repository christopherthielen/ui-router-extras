(function () {
  var app = angular.module("ct.ui.router.extras.examples", []);
  
  app.directive("scopeAge", function () {
    return {
      template: '<div>This scope is {{age || 0}} seconds old</div>'
    }
  });
  
  app.service("timerService", function ($interval) {
    return {
      instrument: function instrument($scope) {
        var scopeCreated = Date.now();
        var computeAge = function () {
          var delta = Date.now() - scopeCreated;
          $scope.ageMs = delta;
          $scope.age = Math.floor(delta / 1000);
        };
        computeAge();
        var intervalPromise = $interval(computeAge, 1000);
        $scope.$on("$destroy", function () {
          $interval.cancel(intervalPromise);
        })
      }
    }
  });
})();

