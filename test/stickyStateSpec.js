"use strict";
var $get, $state, $q, _stickyStateProvider, _stateProvider;
var  tLog;

function ssReset(newStates, $stateProvider) {
  tLog = new TransitionAudit();
  addCallbacks(newStates);
  angular.forEach(newStates, function(s, name) {$stateProvider.state(name, s)});
}

describe('stickyState', function () {
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
      ssReset(getSimpleStates(), _stateProvider);
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
      newStates['tabsA'] = {sticky: true, deepStateRedirect: true};
      newStates['tabsA._tab1'] = {sticky: true, deepStateRedirect: true};
      newStates['tabsA._tab2'] = {sticky: true, deepStateRedirect: true};
      newStates['tabsA._tab3'] = {sticky: true, deepStateRedirect: true};
      newStates['tabsA._tab1.substate'] = {};
      newStates['tabsA._tab1.substate.tabsB'] = {};
      newStates['tabsA._tab1.substate.tabsB.__tab1'] = {sticky: true};
      newStates['tabsA._tab1.substate.tabsB.__tab2'] = {sticky: true};
      newStates['tabsA._tab1.substate.tabsB.__tab3'] = {sticky: true};

      return newStates;
    }
    beforeEach(function() {
      ssReset(getNestedStickyStates(), _stateProvider);
    });
    
    it ('should inactivate sticky state tabs_tab1 when transitioning back to tabsA', function () {
      var transitions = new TransitionAudit();
      testGo('main', transitions, { entered: ['main']});
      testGo('tabsA._tab1.substate.tabsB.__tab1', transitions, {
            exited: ['main'],
            entered: [
              'tabsA',
              'tabsA._tab1',
              'tabsA._tab1.substate',
              'tabsA._tab1.substate.tabsB',
              'tabsA._tab1.substate.tabsB.__tab1'
            ]}
      );
      testGo('tabsA._tab1.substate.tabsB.__tab2', transitions, {
        inactivated: ['tabsA._tab1.substate.tabsB.__tab1'],
        entered: ['tabsA._tab1.substate.tabsB.__tab2']
      });
    });
    
    it ('should reactivate child-of-sticky state __tab1 when transitioning back to tabsA', function () {
      var transitions = new TransitionAudit();
      testGo('main', transitions, { entered: ['main']});
      testGo('tabsA._tab1.substate.tabsB.__tab1', transitions, {
        exited: ['main'],
        entered: [ 'tabsA', 'tabsA._tab1', 'tabsA._tab1.substate', 'tabsA._tab1.substate.tabsB', 'tabsA._tab1.substate.tabsB.__tab1' ]}
      );
      testGo('tabsA._tab1.substate.tabsB.__tab2', transitions, {
        inactivated: ['tabsA._tab1.substate.tabsB.__tab1'],
        entered: ['tabsA._tab1.substate.tabsB.__tab2']
      });
      testGo('tabsA._tab1.substate.tabsB.__tab3', transitions, {
        inactivated: ['tabsA._tab1.substate.tabsB.__tab2'],
        entered: ['tabsA._tab1.substate.tabsB.__tab3']
      });
          
      // reset transition log
      tLog = new TransitionAudit();
      transitions = new TransitionAudit();
      
      testGo('main', transitions, {
        entered: ['main'],
        inactivated: ['tabsA._tab1.substate.tabsB.__tab3','tabsA._tab1.substate.tabsB','tabsA._tab1.substate','tabsA._tab1','tabsA']
      });

      // Here.
      testGo('tabsA', transitions, {
        exited: ['main'],
        reactivated: ['tabsA','tabsA._tab1','tabsA._tab1.substate','tabsA._tab1.substate.tabsB','tabsA._tab1.substate.tabsB.__tab3']
      }, { redirect: true });

      testGo('tabsA._tab1.substate.tabsB.__tab2', transitions, {
        inactivated: ['tabsA._tab1.substate.tabsB.__tab3'],
        reactivated: ['tabsA._tab1.substate.tabsB.__tab2']
      });
    });
  });
});
