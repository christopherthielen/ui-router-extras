"use strict";
var $get, $state, $stickyState, $q, _stickyStateProvider, _stateProvider;
var tLog, tExpected;

function resetTransitionLog() {
  tLog = new TransitionAudit();
  tExpected = new TransitionAudit();
}

function ssReset(newStates, $stateProvider) {
  resetTransitionLog();
  addCallbacks(newStates);
  angular.forEach(newStates, function(s, name) {$stateProvider.state(name, s)});
}

function pathFrom(start, end) {
  var startNodes = start.split(".");
  var endNodes = end.split(".");
  var reverse = startNodes.length > endNodes.length;
  if (reverse) {
    var tmp = startNodes;
    startNodes = endNodes;
    endNodes = tmp;
  }
  
  var common = _.intersection(endNodes, startNodes);
  var difference = _.difference(endNodes, startNodes);
  difference.splice(0, 0, common.pop());
  
  var name = common.join(".");
  var path = _.map(difference, function(segment) {
    name = (name ? name + "." : "") + segment;
    return name;
  });
  if (reverse) path.reverse();
  return path;
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
    $stickyState = $get('$stickyState');
    $q = $get('$q');
  }));

  describe('simple sticky .go() transitions', function () {
    // Set up base state heirarchy
    function getSimpleStates () {
      var newStates = {};
      newStates['main'] = {};
      newStates['A'] = {};
      newStates['A._1'] = {sticky: true, views: { '_1@A': {} } };
      newStates['A._2'] = {sticky: true, views: { '_2@A': {} } };
      newStates['A._3'] = {sticky: true, views: { '_3@A': {} } };

      return newStates;
    }

    beforeEach(function() {
      ssReset(getSimpleStates(), _stateProvider);
    });

    it ('should transition normally between non-sticky states', function () {
      testGo('main');
      testGo('A');
    });

    it ('should transition normally between non-sticky and sticky states', function () {
      testGo('A', { entered: ['A'] });
      testGo('A._1', { entered: ['A._1'] });
    });

    it ('should inactivate sticky state tabs_tab1 when transitioning back to A', function () {
      var transitions = new TransitionAudit();
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A', {inactivated: ['A._1']});
    });

    it ('should reactivate sticky state tabs_tab1 when transitioning back from A', function () {
      var transitions = new TransitionAudit();
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A', {inactivated: ['A._1']});
      testGo('A._1', {reactivated: ['A._1']});
    });

    it ('should inactivate and reactivate A._1 and A._2 when transitioning back and forth', function () {
      var transitions = new TransitionAudit();
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], entered: ['A._2']});
      testGo('A._1', {inactivated: ['A._2'], reactivated: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], reactivated: ['A._2']});
    });

    it ('should inactivate and reactivate A._1 and A._2 and A._3 when transitioning back and forth', function () {
      var transitions = new TransitionAudit();
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], entered: ['A._2']});
      testGo('A._3', {inactivated: ['A._2'], entered: ['A._3']});
      testGo('A._1', {inactivated: ['A._3'], reactivated: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], reactivated: ['A._2']});
      testGo('A._3', {inactivated: ['A._2'], reactivated: ['A._3']});
    });

    it ('should inactivate (not exit) A._1 and A._2 and A._3 when transitioning back to A', function () {
      var transitions = new TransitionAudit();
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], entered: ['A._2']});
      testGo('A._3', {inactivated: ['A._2'], entered: ['A._3']});
      testGo('A', {inactivated: ['A._3']});
    });

    it ('should exit A._1 and A._2 and A._3 when transitioning back to main', function () {
      var transitions = new TransitionAudit();
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], entered: ['A._2']});
      testGo('A._3', {inactivated: ['A._2'], entered: ['A._3']});
      testGo('A', {inactivated: ['A._3']});
      testGo('main', {
        entered: ['main'],
        exited: ['A._1', 'A._2', 'A._3', 'A']
      });
    });

  });
  
  describe('nested sticky .go() transitions', function () {
    beforeEach(function() {
      ssReset(getNestedStickyStates(), _stateProvider);
    });
    
    function getNestedStickyStates() {
      var newStates = {};
      newStates['aside'] = {};
      newStates['A'] = {sticky: true, deepStateRedirect: true, views: { 'A@': {} }};
      
      newStates['A._1'] = {sticky: true, deepStateRedirect: true, views: { '_1@A': {} }};
      newStates['A._2'] = {sticky: true, deepStateRedirect: true, views: { '_2@A': {} }};
      newStates['A._3'] = {sticky: true, deepStateRedirect: true, views: { '_3@A': {} }};
      
      newStates['A._1.__1'] = {};
      newStates['A._2.__2'] = {};
      
      newStates['A._1.__1.B'] = {};
      newStates['A._1.__1.B.___1'] = {sticky: true, views: { '___1@A._1.__1.B': {} }};
      newStates['A._1.__1.B.___2'] = {sticky: true, views: { '___2@A._1.__1.B': {} }};
      newStates['A._1.__1.B.___3'] = {sticky: true, views: { '___3@A._1.__1.B': {} }};

      return newStates;
    }
    
    it ('should inactivate sticky state tabs_tab1 when transitioning back to A', function () {
      var transitions = new TransitionAudit();
      testGo('aside', { entered: ['aside'] });
      testGo('A._1.__1.B.___1', { exited: ['aside'],                entered: pathFrom('A', 'A._1.__1.B.___1') });
      testGo('A._1.__1.B.___2', { inactivated: ['A._1.__1.B.___1'], entered:     ['A._1.__1.B.___2'] });
    });
    
    it ('should reactivate child-of-sticky state ___1 when transitioning back to A', function () {
      testGo('aside', { entered: ['aside']});
      testGo('A._1.__1', { exited: ['aside'],                         entered: pathFrom('A', 'A._1.__1') });
      testGo('A._2.__2', { inactivated: pathFrom('A._1.__1', 'A._1'), entered: pathFrom('A._2', 'A._2.__2') });
      testGo('aside', { inactivated: pathFrom('A._2.__2', 'A') ,      entered: ['aside'] });
      testGo('A._2', { exited: ['aside'],                             reactivated: pathFrom('A', 'A._2.__2') }, { redirect: 'A._2.__2' });
      resetTransitionLog();
      testGo('A._1', { inactivated: pathFrom('A._2.__2', 'A._2'), reactivated: pathFrom('A._1', 'A._1.__1') }, { redirect: 'A._1.__1' });
    });
  });
});
