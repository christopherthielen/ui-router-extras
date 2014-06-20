define(['angularAMD'], function() {
  var app = angular.module("module1", ['ui.router']);
  
  var mainState = {
    name: 'module1',
    url: '/module1',
    template: '<h1>Module1</h1><h4>This state was dynamically loaded from module1.js</h4>' +
        '<div>module1.js defines 3 nested states</div>' +
        '<div><a ui-sref=".state1">go to state1</a></div><div ui-view></div>'
  };
  
  var state1 = {
    name: 'module1.state1',
    url: "/state1",
    controller: function($scope) {
      console.log("Entered module1.state1 controller");
    },
    template: "<h3>module1.state1</h3><div><a ui-sref='.nested'>go to nested</a></div><div ui-view></div>"
  };
  
  var nestedState = {
    name: "module1.state1.nested",
    url: "/nested",
    controller: function($scope) {
      console.log("Entered module1.state1.nested controller");
    },
    template: "<h5>module1.state1.nested</h5>"
  };
  
  app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state(mainState)
        .state(state1)
        .state(nestedState);
  }]);
  
  return { mainState: mainState, module: app };
});
