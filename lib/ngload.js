/*
 angularAMD v0.1.1
 (c) 2013-2014 Marcos Lin https://github.com/marcoslin/
 License: MIT
*/
/*jslint node: true, vars: true, nomen: true */
/*globals define */

'use strict';
define({
    load: function (name, req, onload, config) {
        //console.log("ngamd loaded: ", req.toUrl(name));
        req(['angularAMD', name], function (angularAMD, value) {
            //console.log("Processing queues.");
            angularAMD.processQueue();
            onload(value);
        });
    }
});
