require.config({
  waitSeconds: 100,
  paths: {
    "angularAMD": "../../lib/angularAMD",
    "ngload": "../../lib/ngload",
    "angular": "../../lib/angular",
    "angular-ui-router": "../../lib/angular-ui-router",
    "ui-router-extras": "../../lib/ct-ui-router-extras",
    "ui-router-extras-statevis": "../statevis"
  },
  shim: {
    "angular": { exports: "angular" },
    "angularAMD": ["angular"],
    "ngload": ["angularAMD"],
    "angular-ui-router": ["angular"],
    "ui-router-extras": ["angular"],
    "ui-router-extras-statevis": ["angular"]
  },
  deps: ["app"]
});
