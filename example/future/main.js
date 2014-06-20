require.config({
  waitSeconds: 100,
  paths: {
    "angularAMD": "//cdn.jsdelivr.net/angular.amd/0.1.1/angularAMD.min",
    "ngload": "//cdn.jsdelivr.net/angular.amd/0.1.1/ngload.min",
    "angular": "//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.16/angular",
    "angular-ui-router": "//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.10/angular-ui-router",
    "ui-router-extras": "../../bower_components/ui-router-extras/release/ct-ui-router-extras"
  },
  shim: {
    "angular": { exports: "angular" },
    "angularAMD": ["angular"],
    "ngload": ["angularAMD"],
    "angular-ui-router": ["angular"],
    "ui-router-extras": ["angular"]
  },
  deps: ["app"]
});
