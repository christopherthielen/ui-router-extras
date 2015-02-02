require.config({
  waitSeconds: 100,
  paths: {
    "angularAMD": "../../lib/angularAMD",
    "ngload": "../../lib/ngload",
    "angular": "../../lib/angular",
    "angular-ui-router": "../../lib/angular-ui-router",
    "ui-router-extras-core": "../../lib/modular/ct-ui-router-extras.core",
    "ui-router-extras-statevis": "../../lib/modular/ct-ui-router-extras.statevis",
    "ui-router-extras-sticky": "../../lib/modular/ct-ui-router-extras.sticky",
    "ui-router-extras-future": "../../lib/modular/ct-ui-router-extras.future"
  },
  shim: {
    "angular": { exports: "angular" },
    "angularAMD": ["angular"],
    "ngload": ["angularAMD"],
    "angular-ui-router": ["angular"],
    "ui-router-extras-core": ["angular"],
    "ui-router-extras-statevis": ["angular", "ui-router-extras-sticky"],
    "ui-router-extras-sticky": ["angular", "ui-router-extras-core"],
    "ui-router-extras-future": ["angular", "ui-router-extras-core"]
  },
  deps: ["app"]
});
