/*
 angularAMD v0.1.1
 (c) 2013-2014 Marcos Lin https://github.com/marcoslin/
 License: MIT
*/
/*jslint node: true, vars: true, nomen: true */
/*globals define, angular */

define(function () {
    var orig_angular,
        alt_angular,
        alternate_queue = [],
        app_name,
        app_injector,
        app_cached_providers = {},
        config_injector; // store the captured providerInjector (config-time injector)
    
    // Private method to check if angularAMD has been initialized
    function checkAngularAMDInitialized() {
        if ( typeof orig_angular === 'undefined' ) {
            throw Error("angularAMD not initialized.  Need to call angularAMD.bootstrap(app) first.");
        }
    }

    /**
     * Create an alternate angular so that subsequent call to angular.module will queue up
     * the module created for later processing via the .processQueue method. 
     * 
     * This delaying processing is needed as angular does not recognize any newly created
     * module after angular.bootstrap has ran.  The only way to add new objects to angular
     * post bootstrap is using cached provider.
     * 
     * Once the modules has been queued, processQueue would then use each module's _invokeQueue
     * and _runBlock to recreate object using cached $provider.  In essence, creating a duplicate
     * object into the current ng-app.  As result, if there are subsequent call to retrieve the
     * module post processQueue, it would retrieve a module that is not integrated into the ng-app.
     * 
     * Therefore, any subsequent angular.module call to retrieve the module created with alternate
     * angular will return undefined.
     * 
     */
    function setAlternateAngular() {
        var alternateModules = {};
        
        // This method cannot be called more than once
        if (alt_angular) {
            throw Error("setAlternateAngular can only be called once.");
        } else {
            alt_angular = {};
        }
        
        // Make sure that bootstrap has been called
        checkAngularAMDInitialized();

        // Createa a copy of orig_angular
        orig_angular.extend(alt_angular, orig_angular);
        
        // Custom version of angular.module used as cache
        alt_angular.module = function (name, requires) {
            
            if (typeof requires === "undefined") {
                // Return undefined if module was created using the alt_angular
                if (alternateModules.hasOwnProperty(name)) {
                    return undefined;
                } else {
                    return orig_angular.module(name);
                }
            } else {
                //console.log("alt_angular.module START for '" + name + "': ", arguments);
                var orig_mod = orig_angular.module.apply(null, arguments),
                    item = { name: name, module: orig_mod};
                alternate_queue.push(item);
                alternateModules[name] = orig_mod;
                return orig_mod;
            }
        };
                
        window.angular = alt_angular;
    };
    
    
    // Constructor
    function angularAMD() {}
    
    
    /**
     * Helper function to generate angular's $routeProvider.route.  'config' input param must be an object.
     * 
     * Populate the resolve attribute using either 'controllerUrl' or 'controller'.  If 'controllerUrl'
     * is passed, it will attempt to load the Url using requirejs and remove the attribute from the config
     * object.  Otherwise, it will attempt to populate resolve by loading what's been passed in 'controller'.
     * If neither is passed, resolve is not populated.
     *
     * This function works as a pass-through, meaning what ever is passed in as 'config' will be returned,
     * except for 'controllerUrl' attribute.
     *
     */
    angularAMD.prototype.route = function (config) {
        // Initialization not necessary to call this method.
        var load_controller;

        /*
        If controllerUrl is provided, load the provided Url using requirejs. Otherwise,
        attempt to load the controller using the controller name.  In the later case,
        controller name is expected to be defined as one of 'paths' in main.js. 
        */
        if ( config.hasOwnProperty("controllerUrl") ) {
            load_controller = config.controllerUrl;
            delete config.controllerUrl;
        } else if (typeof config.controller === 'string') {
            load_controller = config.controller;
        }
        
        // If controller needs to be loaded, append to the resolve property
        if (load_controller) {
            var resolve = config.resolve || {};
            resolve['__load'] = ['$q', '$rootScope', function ($q, $rootScope) {
                var defer = $q.defer();
                require([load_controller], function () {
                    defer.resolve();
                    $rootScope.$apply();
                });
                return defer.promise;
            }]
            config.resolve = resolve;
        }
        
        
        return config;
    };
    
    
    /**
     * Expose name of the app that has been bootstraped
     */
    angularAMD.prototype.appname = function () {
        checkAngularAMDInitialized();
        return app_name;
    };
    
    
    /**
     * Recreate the modules created by alternate angular in ng-app using cached $provider.
     * As AMD loader does not guarantee the order of dependency in a require([...],...)
     * clause, user must make sure that dependecies are clearly setup in shim in order
     * for this to work.
     *
     * HACK ALERT:
     * This method relay on inner working of angular.module code, and access _invokeQueue
     * and _runBlock private variable.  Must test carefully with each release of angular.
     */
    angularAMD.prototype.processQueue = function () {
        checkAngularAMDInitialized();
        
        if (typeof alt_angular === 'undefined') {
            throw Error("Alternate angular not set.  Make sure that `enable_ngload` option has been set when calling angularAMD.bootstrap");
        }
        
        // Process alternate queue in FIFO fashion
        while (alternate_queue.length) {
            var item = alternate_queue.shift(),
                invokeQueue = item.module._invokeQueue,
                y;
        
            // Setup the providers define in the module
            for (y = 0; y < invokeQueue.length; y += 1) {
                var q = invokeQueue[y],
                    provider = q[0],
                    method = q[1],
                    args = q[2];
                
                if (app_cached_providers.hasOwnProperty(provider)) {
                    var cachedProvider;
                    if (provider === "$injector" && method === "invoke") {
                        cachedProvider = config_injector;
                    } else {
                        cachedProvider = app_cached_providers[provider];
                    }
                    //console.log("'" + item.name + "': applying " + provider + "." + method + " for args: ", args);
                    cachedProvider[method].apply(null, args);
                } else {
                    console.error("'" + provider + "' not found!!!");
                }

            }
            
            // Execute the run block of the module
            if (item.module._runBlocks) {
                angular.forEach(item.module._runBlocks, function processRunBlock(block) {
                    //console.log("'" + item.name + "': executing run block: ", run_block);
                    app_injector.invoke(block);
                });
            }
            
            // How to remove the module??? 
            orig_angular.module(item.name, [], orig_angular.noop);
        }

    };
    
    
    /**
     * Return cached app provider
     */
    angularAMD.prototype.getCachedProvider = function (provider_name) {
        checkAngularAMDInitialized();
        // Hack used for unit testing that orig_angular has been captured
        if (provider_name === "__orig_angular") {
            return orig_angular;
        } else if (provider_name === "__alt_angular") {
            return alt_angular;
        } else {
            return app_cached_providers[provider_name];
        }
    };
    
    /**
     * Create inject function that uses cached $injector.
     * Designed primarly to be used during unit testing.
     */
    angularAMD.prototype.inject = function () {
        checkAngularAMDInitialized();
        return app_injector.invoke.apply(null, arguments);
    };
    
    /**
     * Reset angularAMD for resuse
     */
    angularAMD.prototype.reset = function () {
        if (typeof orig_angular === 'undefined') {
            return;
        }
        
        // Restore original angular instance
        window.angular = orig_angular;
        
        // Clear private variables
        alt_angular = undefined;
        alternate_queue = [];
        app_name = undefined;
        app_injector = undefined;
        app_cached_providers = {};
        
        // Clear original angular
        orig_angular = undefined;
    }
    
    /**
     * Initialization of angularAMD that bootstraps AngularJS.  The objective is to cache the
     * $provider and $injector from the app to be used later.
     *
     * enable_ngload: 
     */
    angularAMD.prototype.bootstrap = function (app, enable_ngload, elem) {
        // Prevent bootstrap from being called multiple times
        if (typeof orig_angular !== 'undefined') {
            throw Error("bootstrap can only be called once.");
        }
        
        // Store reference to original angular which also used to check if bootstrap has take place.
        orig_angular = angular;
        if (typeof enable_ngload === 'undefined') {
            enable_ngload = true;
        }
        elem = elem || document.documentElement;
        
        // Cache provider needed
        app.config(
            ['$controllerProvider', '$compileProvider', '$filterProvider', '$animateProvider', '$provide', '$injector', function (controllerProvider, compileProvider, filterProvider, animateProvider, provide, injector) {
                // Cache Providers
                config_injector = injector;
                app_cached_providers = {
                    $controllerProvider: controllerProvider,
                    $compileProvider: compileProvider,
                    $filterProvider: filterProvider,
                    $animateProvider: animateProvider,
                    $provide: provide
                };
                
                // Create a app.register object
                app.register = {
                    controller: controllerProvider.register,
                    directive: compileProvider.directive,
                    filter: filterProvider.register,
                    factory: provide.factory,
                    service: provide.service,
                    constant: provide.constant,
                    value: provide.value,
                    animation: angular.bind(animateProvider, animateProvider.register)
                };
            
            }]
        );
        
        // Get the injector for the app
        app.run(['$injector', function ($injector) {
            // $injector must be obtained in .run instead of .config
            app_injector = $injector;
            app_cached_providers.$injector = app_injector;
        }]);
        
        // Store the app name needed by .bootstrap function.
        app_name = app.name;
        
        // Bootstrap Angular
        orig_angular.element(document).ready(function () {
            orig_angular.bootstrap(elem, [app_name]); 
        });
        
        // Replace angular.module
        if (enable_ngload) {
            //console.log("Setting alternate angular");
            setAlternateAngular();
        }
    };  
    
    // Create a new instance and return
    return new angularAMD();
    
});
