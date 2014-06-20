define(['angularAMD'], function(angularAMD) {
  var app = angular.module("module2", ['ui.router']);
  var mainState = {
    name: 'module2',
    url: '/module2',
    template: '<h1>Module2</h1><h5>This state was dynamically loaded from module2.js</h5>' +
        '<div>module2.js defines 3 nested states</div>' +
        '<div><a ui-sref=".state2">go to state2</a></div><div ui-view></div>'
  };
  
  var state1 = {
    name: "module2.state2",
    url: "/state2",
    controller: function($scope) {
      console.log("Entered module2.state2 controller");
    },
    template: "<h3>module2.state2</h3><div><a ui-sref='.nested'>go to nested</a></div><div ui-view></div>"
  };
  
  var nested = {
    name: "module2.state2.nested",
    url: "/nested",
    controller: function($scope) {
      console.log("Entered module2.state2.nested controller");
    },
    template: "<h5>module2.state2.nested</h5>"
  };
  
  app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state(mainState);
    $stateProvider.state(state1);
    $stateProvider.state(nested);
  }]);
  return { mainState: mainState, module: app };
});
