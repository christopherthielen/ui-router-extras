"use strict";
var $get, $state, $q, _stickyStateProvider, _stateProvider;
var suiteStates, tLog;

var TransitionAudit = function () {
  this.entered = [];
  this.exited = [];
  this.reactivated = [];
  this.inactivated = [];
  
  this.toString = angular.bind(this,
      function toString() {
        var copy = {};
        angular.forEach(this, function(value, key) {
          if (key === 'inactivated' || key === 'reactivated' ||
              key === 'entered' || key === 'exited') {
            copy[key] = value;
          }
        });
        return angular.toJson(copy);
      }
  );
};

function testGo(state, tCurrent, tAdditional) {
  $state.go(state);
  $q.flush();
  expect($state.current.name).toBe(state);
  
  if (tCurrent !== undefined && tAdditional !== undefined) {
    // append all arrays in tAdditional to arrays in tCurrent
    angular.forEach(tAdditional, function (value, key) {
      tCurrent[key] = tCurrent[key].concat(tAdditional[key]); 
    });
    
    expect(tLog.toString()).toBe(tCurrent.toString());
  }
}

// Add callbacks to each 
function addCallbacks (basicStates) {
  angular.forEach(basicStates, function (state, key) {
    state.onInactivate = function () { tLog.inactivated.push(state.name); };
    state.onReactivate = function () { tLog.reactivated.push(state.name); };
    state.onEnter =      function () { tLog.entered.push(state.name); };
    state.onExit =       function () { tLog.exited.push(state.name); };
  });
}

function registerStates(states) {
  "use strict";
  angular.forEach(states, function(value, key) {
    _stateProvider.state(key, value);
  });
}

function resetLog() { tLog = new TransitionAudit(); }
function reset(newStates) {
  resetLog();
  suiteStates = newStates;
  addCallbacks(suiteStates);
  registerStates(suiteStates);
}

describe('stickyState', function () {
  // Reset Transition Log 
  
  beforeEach(module('ct.ui.router.extras', function($stickyStateProvider, $stateProvider) {
    "use strict";
    // Load and capture $stickyStateProvider and $stateProvider
    _stickyStateProvider = $stickyStateProvider;
    _stateProvider = $stateProvider;
  }));
  
  // Capture $injector.get, $state, and $q
  beforeEach(inject(function($injector) {
    $get = $injector.get;
    $state = $get('$state');
    $q = $get('$q');
  }));

  describe('simple sticky .go() transitions', function () {
    // Set up base state heirarchy
    function getSimpleStates () {
      var newStates = {};
      newStates['main'] = {};
      newStates['tabs'] = {};
      newStates['tabs._tab1'] = {sticky: true};
      newStates['tabs._tab2'] = {sticky: true};
      newStates['tabs._tab3'] = {sticky: true};

      return newStates;
    }

    beforeEach(function() {
      reset(getSimpleStates());
    });

    it ('should transition normally between non-sticky states', function () {
      testGo('main');
      testGo('tabs');
    });

    it ('should transition normally between non-sticky and sticky states', function () {
      var transitions = new TransitionAudit();
      testGo('tabs', transitions, { entered: ['tabs'] });
      testGo('tabs._tab1', transitions, { entered: ['tabs._tab1'] });
    });

    it ('should inactivate sticky state tabs_tab1 when transitioning back to tabs', function () {
      var transitions = new TransitionAudit();
      testGo('tabs', transitions, {entered: ['tabs']});
      testGo('tabs._tab1', transitions, {entered: ['tabs._tab1']});
      testGo('tabs', transitions, {inactivated: ['tabs._tab1']});
    });

    it ('should reactivate sticky state tabs_tab1 when transitioning back from tabs', function () {
      var transitions = new TransitionAudit();
      testGo('tabs', transitions, {entered: ['tabs']});
      testGo('tabs._tab1', transitions, {entered: ['tabs._tab1']});
      testGo('tabs', transitions, {inactivated: ['tabs._tab1']});
      testGo('tabs._tab1', transitions, {reactivated: ['tabs._tab1']});
    });

    it ('should inactivate and reactivate tabs._tab1 and tabs._tab2 when transitioning back and forth', function () {
      var transitions = new TransitionAudit();
      testGo('tabs', transitions, {entered: ['tabs']});
      testGo('tabs._tab1', transitions, {entered: ['tabs._tab1']});
      testGo('tabs._tab2', transitions, {inactivated: ['tabs._tab1'], entered: ['tabs._tab2']});
      testGo('tabs._tab1', transitions, {inactivated: ['tabs._tab2'], reactivated: ['tabs._tab1']});
      testGo('tabs._tab2', transitions, {inactivated: ['tabs._tab1'], reactivated: ['tabs._tab2']});
    });

    it ('should inactivate and reactivate tabs._tab1 and tabs._tab2 and tabs._tab3 when transitioning back and forth', function () {
      var transitions = new TransitionAudit();
      testGo('tabs', transitions, {entered: ['tabs']});
      testGo('tabs._tab1', transitions, {entered: ['tabs._tab1']});
      testGo('tabs._tab2', transitions, {inactivated: ['tabs._tab1'], entered: ['tabs._tab2']});
      testGo('tabs._tab3', transitions, {inactivated: ['tabs._tab2'], entered: ['tabs._tab3']});
      testGo('tabs._tab1', transitions, {inactivated: ['tabs._tab3'], reactivated: ['tabs._tab1']});
      testGo('tabs._tab2', transitions, {inactivated: ['tabs._tab1'], reactivated: ['tabs._tab2']});
      testGo('tabs._tab3', transitions, {inactivated: ['tabs._tab2'], reactivated: ['tabs._tab3']});
    });

    it ('should inactivate (not exit) tabs._tab1 and tabs._tab2 and tabs._tab3 when transitioning back to tabs', function () {
      var transitions = new TransitionAudit();
      testGo('tabs', transitions, {entered: ['tabs']});
      testGo('tabs._tab1', transitions, {entered: ['tabs._tab1']});
      testGo('tabs._tab2', transitions, {inactivated: ['tabs._tab1'], entered: ['tabs._tab2']});
      testGo('tabs._tab3', transitions, {inactivated: ['tabs._tab2'], entered: ['tabs._tab3']});
      testGo('tabs', transitions, {inactivated: ['tabs._tab3']});
    });

    it ('should exit tabs._tab1 and tabs._tab2 and tabs._tab3 when transitioning back to main', function () {
      var transitions = new TransitionAudit();
      testGo('tabs', transitions, {entered: ['tabs']});
      testGo('tabs._tab1', transitions, {entered: ['tabs._tab1']});
      testGo('tabs._tab2', transitions, {inactivated: ['tabs._tab1'], entered: ['tabs._tab2']});
      testGo('tabs._tab3', transitions, {inactivated: ['tabs._tab2'], entered: ['tabs._tab3']});
      testGo('tabs', transitions, {inactivated: ['tabs._tab3']});
      testGo('main', transitions, {
        entered: ['main'],
        exited: ['tabs._tab1', 'tabs._tab2', 'tabs._tab3', 'tabs']
      });
    });

  });
  
  describe('nested sticky .go() transitions', function () {
    function getNestedStickyStates() {
      var newStates = {};
      newStates['main'] = {};
      newStates['tabsA'] = {};
      newStates['tabsA._tab1'] = {sticky: true};
      newStates['tabsA._tab2'] = {sticky: true};
      newStates['tabsA._tab3'] = {sticky: true};
      newStates['tabsA._tab1.substate'] = {};
      newStates['tabsA._tab1.substate.tabsB'] = {};
      newStates['tabsA._tab1.substate.tabsB.__tab1'] = {sticky: true};
      newStates['tabsA._tab1.substate.tabsB.__tab2'] = {sticky: true};
      newStates['tabsA._tab1.substate.tabsB.__tab3'] = {sticky: true};

      return newStates;
    }
    beforeEach(function() {
      reset(getNestedStickyStates());
    });
    
    it ('should transition normally between non-sticky states', function () {
      testGo('main');
      testGo('tabsA');
    });

    it ('should transition normally between non-sticky and sticky states', function () {
      var transitions = new TransitionAudit();
      testGo('tabsA', transitions, { entered: ['tabsA'] });
      testGo('tabsA._tab1', transitions, { entered: ['tabsA._tab1'] });
    });

    it ('should inactivate sticky state tabs_tab1 when transitioning back to tabsA', function () {
      var transitions = new TransitionAudit();
      testGo('tabsA', transitions, {entered: ['tabsA']});
      testGo('tabsA._tab1', transitions, {entered: ['tabsA._tab1']});
      testGo('tabsA', transitions, {inactivated: ['tabsA._tab1']});
    });

    it ('should reactivate sticky state tabs_tab1 when transitioning back from tabsA', function () {
      var transitions = new TransitionAudit();
      testGo('tabsA', transitions, {entered: ['tabsA']});
      testGo('tabsA._tab1', transitions, {entered: ['tabsA._tab1']});
      testGo('tabsA', transitions, {inactivated: ['tabsA._tab1']});
      testGo('tabsA._tab1', transitions, {reactivated: ['tabsA._tab1']});
    });

    it ('should inactivate and reactivate tabsA._tab1 and tabsA._tab2 when transitioning back and forth', function () {
      var transitions = new TransitionAudit();
      testGo('tabsA', transitions, {entered: ['tabsA']});
      testGo('tabsA._tab1', transitions, {entered: ['tabsA._tab1']});
      testGo('tabsA._tab2', transitions, {inactivated: ['tabsA._tab1'], entered: ['tabsA._tab2']});
      testGo('tabsA._tab1', transitions, {inactivated: ['tabsA._tab2'], reactivated: ['tabsA._tab1']});
      testGo('tabsA._tab2', transitions, {inactivated: ['tabsA._tab1'], reactivated: ['tabsA._tab2']});
    });

    it ('should inactivate and reactivate tabsA._tab1 and tabsA._tab2 and tabsA._tab3 when transitioning back and forth', function () {
      var transitions = new TransitionAudit();
      testGo('tabsA', transitions, {entered: ['tabsA']});
      testGo('tabsA._tab1', transitions, {entered: ['tabsA._tab1']});
      testGo('tabsA._tab2', transitions, {inactivated: ['tabsA._tab1'], entered: ['tabsA._tab2']});
      testGo('tabsA._tab3', transitions, {inactivated: ['tabsA._tab2'], entered: ['tabsA._tab3']});
      testGo('tabsA._tab1', transitions, {inactivated: ['tabsA._tab3'], reactivated: ['tabsA._tab1']});
      testGo('tabsA._tab2', transitions, {inactivated: ['tabsA._tab1'], reactivated: ['tabsA._tab2']});
      testGo('tabsA._tab3', transitions, {inactivated: ['tabsA._tab2'], reactivated: ['tabsA._tab3']});
    });
    
    it ('should inactivate tabsA._tab1 and tabsA._tab2 and tabsA._tab3 when transitioning back to tabsA', function () {
      var transitions = new TransitionAudit();
      testGo('tabsA', transitions, {entered: ['tabsA']});
      testGo('tabsA._tab1', transitions, {entered: ['tabsA._tab1']});
      testGo('tabsA._tab2', transitions, {inactivated: ['tabsA._tab1'], entered: ['tabsA._tab2']});
      testGo('tabsA._tab3', transitions, {inactivated: ['tabsA._tab2'], entered: ['tabsA._tab3']});
      testGo('tabsA', transitions, {inactivated: ['tabsA._tab3']});
    });
    
  });

});
