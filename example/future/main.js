require.config({
  waitSeconds: 100,
  paths: {
    "angularAMD": "../../lib/angularAMD",
    "ngload": "../../lib/ngload",
    "angular": "../../lib/angular",
    "angular-ui-router": "../../lib/angular-ui-router",
    "ui-router-extras": "../../lib/ct-ui-router-extras"
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
