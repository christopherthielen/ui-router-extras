(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['angular'], function (angular) {
            factory(angular);
        });
    } else if (typeof exports === 'object') {
        factory(require('angular'));
    } else {
        factory(root.angular);
    }
}(this, function (angular, undefined) {
    <%= contents %>
}));