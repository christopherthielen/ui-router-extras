"use strict";
var $get, $state, $stickyState, $compile, $rootScope, $q, _stickyStateProvider, _stateProvider;

function ssReset(newStates, $stateProvider) {
  resetTransitionLog();
  addCallbacks(newStates);
  angular.forEach(newStates, function(s, name) {$stateProvider.state(name, s)});
}

describe('stickyState', function () {
  var controllerInvokeCount = 0, resolveCount = 0, Xvalue = undefined;
  function resetXResolve() {
    controllerInvokeCount = resolveCount = 0; Xvalue = undefined;
  }

  // Set up base state heirarchy
  function getSimpleStates() {
    var newStates = {};
    newStates['main'] = {};
    newStates['A'] = { template: '<div ui-view="_1"></div><div ui-view="_2"></div><div ui-view="_3"></div>'};
    newStates['A._1'] = {sticky: true, views: { '_1@A': {} } };
    newStates['A._2'] = {sticky: true, views: { '_2@A': {} } };
    newStates['A._2.__1'] = { };
    newStates['A._3'] = {
      sticky: true,
      views: { '_3@A': { controller: function ($scope, X) {
        controllerInvokeCount++; Xvalue = X; } } },
      resolve: { X: function () { return $q.when(++resolveCount); }}
    };

    return newStates;
  }

  beforeEach(module('ct.ui.router.extras.sticky', function ($stateProvider, $stickyStateProvider) {
    _stateProvider = $stateProvider;
    _stickyStateProvider = $stickyStateProvider;
  }));

  // Capture $injector.get, $state, and $q
  beforeEach(inject(['$injector', '$state', '$q', '$compile', '$stickyState',
    function ($injector, _state, _q, _compile, _stickyState) {
      $state = _state;
      $q = _q;
      $compile = _compile;
      $stickyState = _stickyState;
  }]));

  describe('setup: ', function() {
    beforeEach(function() {
      ssReset(getSimpleStates(), _stateProvider);
    });

    it('parent state of "main" should be called ""', function() {
      var root = $state.get("main").$$state().parent;
      expect(root.name).toBe("");
    });

    it('parent.parent state of "main" should be surrogateType "__inactives"', function() {
      var root = $state.get("main").$$state().parent;
      var __inactives = root.parent;
      expect(__inactives.surrogateType).toBe("__inactives");
    });

    it('__inactive.locals should hold inactive views', function() {
      var root = $state.get("main").$$state().parent;
      var __inactives = root.parent;
      testGo("A._1", { entered: [ "A", "A._1" ]});
      testGo("A._2", { inactivated: "A._1", entered: "A._2" });
      var views = Object.keys(__inactives.locals);
      expect(views.length).toBe(1);
      var view = views[0];
      expect(view).toBe("_1@A");
    });

    it('root.locals should mirror __inactive.locals (prototypally)', function() {
      var root = $state.get("main").$$state().parent;
      var __inactives = root.parent;
      testGo("A._1", { entered: [ "A", "A._1" ]});
      testGo("A._2", { inactivated: "A._1", entered: "A._2" });
      var views = Object.keys(__inactives.locals);
      expect(views.length).toBe(1);
      expect(root.locals[views[0]]).toBeDefined();
      expect(root.locals[views[0]]).toBe(__inactives.locals[views[0]]);
    });
  });

  describe('simple sticky .go() transitions', function () {
    beforeEach(function() {
      resetXResolve();
      ssReset(getSimpleStates(), _stateProvider);
    });

    it ('should transition normally between non-sticky states', function () {
      testGo('main');
      testGo('A');
    });

    it('should transition normally between non-sticky and sticky states', function () {
      testGo('A', { entered: ['A'] });
      testGo('A._1', { entered: ['A._1'] });
    });

    it('should inactivate sticky state tabs_tab1 when transitioning to parent-to-sticky A', function () {
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A', {inactivated: ['A._1']});
    });

    it ('should reactivate sticky state tabs_tab1 when transitioning back from A', function () {
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A', {inactivated: ['A._1']});
      testGo('A._1', {reactivated: ['A._1']});
    });

    it ('should inactivate and reactivate A._1 and A._2 when transitioning back and forth', function () {
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], entered: ['A._2']});
      testGo('A._1', {inactivated: ['A._2'], reactivated: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], reactivated: ['A._2']});
    });

    it ('should inactivate and reactivate A._1 and A._2 and A._3 when transitioning back and forth', function () {
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], entered: ['A._2']});
      testGo('A._3', {inactivated: ['A._2'], entered: ['A._3']});
      testGo('A._1', {inactivated: ['A._3'], reactivated: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], reactivated: ['A._2']});
      testGo('A._3', {inactivated: ['A._2'], reactivated: ['A._3']});
    });

    it ('should inactivate (not exit) A._1 and A._2 and A._3 when transitioning back to A', function () {
      testGo('A', {entered: ['A']});
      testGo('A._1', {entered: ['A._1']});
      testGo('A._2', {inactivated: ['A._1'], entered: ['A._2']});
      testGo('A._3', {inactivated: ['A._2'], entered: ['A._3']});
      testGo('A', {inactivated: ['A._3']});
    });

    it ('should exit A._1 and A._2 and A._3 when transitioning back to main', function () {
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

  describe('resolve/controller function', function () {
    beforeEach(function () {
      resetXResolve();
      ssReset(getSimpleStates(), _stateProvider);
    });

    beforeEach(inject(function($compile, $rootScope) {
      var el = angular.element('<div ui-view></div>');
      $compile(el)($rootScope);
      $rootScope.$digest();
    }));

    it('should resolve when the sticky state is entered', function () {
      testGo('main');
      testGo('A._3');
      expect(Xvalue).toBe(1);
      expect(resolveCount).toBe(1);
    });

    // Test for issue #22
    it('should not re-resolve when the sticky state is reactivated', function () {
      testGo('main', { entered: 'main' });
      testGo('A._3', { exited: 'main', entered: [ 'A', 'A._3' ]});
      testGo('A._1', { inactivated: 'A._3', entered: 'A._1' });
      testGo('A._3', { reactivated: 'A._3', inactivated: 'A._1'});
      expect(Xvalue).toBe(1);
      expect(resolveCount).toBe(1);
    });

    it('(controller) should be called when the sticky state is entered', function () {
      testGo('main');
      testGo('A._3');
      expect(controllerInvokeCount).toBe(1);
    });

    it('(controller) should not be called when the sticky state is reactivated', function () {
      testGo('main', { entered: 'main' });
      testGo('A._3', { exited: 'main', entered: [ 'A', 'A._3' ]});
      expect(controllerInvokeCount).toBe(1);
      testGo('A._1', { inactivated: 'A._3', entered: 'A._1' });
      testGo('A._3', { reactivated: 'A._3', inactivated: 'A._1'});
      expect(controllerInvokeCount).toBe(1);
    });

    it('should re-resolve when the sticky state is reactivated/exited/reentered', function () {
      testGo('main', { entered: 'main' });
      testGo('A._3', { exited: 'main', entered: [ 'A', 'A._3' ]});
      testGo('A._1', { inactivated: 'A._3', entered: 'A._1' });
      testGo('A._3', { reactivated: 'A._3', inactivated: 'A._1'});
      expect(Xvalue).toBe(1);
      expect(resolveCount).toBe(1);
      testGo('main', { entered: 'main', exited: [ 'A._3', 'A._1', 'A' ] });
      testGo('A._3', { entered: [ 'A', 'A._3' ], exited: 'main'});
      expect(Xvalue).toBe(2);
      expect(resolveCount).toBe(2);
    });
  });

  function getIssue24States() {
    return {
      'main': { },
      'main.product': { url: '/products/:product_id' },
      'main.product.something': {},
      'main.product.something.tab1': { sticky: true, views: { 'tab1@main.product.something': {} } },
      'main.product.something.tab2': { sticky: true, views: { 'tab2@main.product.something': {} } }
    };
  }

  describe('with params in parent', function() {
    beforeEach(function() {
      ssReset(getIssue24States(), _stateProvider);
    });

    it("should reactivate", function() {
      testGo('main');
      $state.go('main.product', { 'product_id': 12345 }); $q.flush();

      resetTransitionLog();
      testGo('main.product.something.tab1', { entered: ['main.product.something', 'main.product.something.tab1' ]} );
      testGo('main.product.something.tab2', { entered: 'main.product.something.tab2', inactivated: 'main.product.something.tab1' });
      testGo('main.product.something.tab1', { reactivated: 'main.product.something.tab1', inactivated: 'main.product.something.tab2' });
    });
  });

  function getParameterizedStates() {
    return {
      'main': {},
      'main.other': { sticky: true, views: { 'other@main': {} } },
      'main.product': { sticky: true, views: { 'product@main': {} }, url: '/:product_id' },
      'main.product.something': {}
    };
  }

  describe('with params in sticky state', function() {
    beforeEach(function() {
      ssReset(getParameterizedStates(), _stateProvider);
    });

    it("should reload when params change", function() {
      testGo('main');
      var options = { params: { 'product_id': 12345 } };
      testGo('main.product.something', { entered: pathFrom('main', 'main.product.something') }, options);
      testGo('main.other', { entered: 'main.other', inactivated: [ 'main.product.something', 'main.product'] });
      testGo('main.product.something', { reactivated: ['main.product', 'main.product.something'], inactivated: 'main.other' }, options);
      _stickyStateProvider.enableDebug(true);
      testGo('main.other', { reactivated: 'main.other', inactivated: [ 'main.product.something', 'main.product'] });
      options.params.product_id = 54321;
      resetTransitionLog();
      testGo('main.product.something', {
        exited: ['main.product.something', 'main.product'],
        entered: ['main.product', 'main.product.something'],
        inactivated: 'main.other' }, options);
      _stickyStateProvider.enableDebug(false);
    });
  });

  describe('nested sticky .go() transitions', function () {
    beforeEach(function() {
      ssReset(getNestedStickyStates(), _stateProvider);
    });

    function getNestedStickyStates() {
      var newStates = {};
      newStates['aside'] = {};
      newStates['A'] =    {sticky: true, deepStateRedirect: true, views: { 'A@': {} }};

      newStates['A._1'] = {sticky: true, deepStateRedirect: true, views: { '_1@A': {} }};
      newStates['A._2'] = {sticky: true, deepStateRedirect: true, views: { '_2@A': {} }};
      newStates['A._3'] = {sticky: true, views: { '_3@A': {} }};

      newStates['A._1.__1'] = {};
      newStates['A._2.__2'] = {};
      newStates['A._3.__1'] = { views: { '__1@A._3': {} } };
      newStates['A._3.__2'] = { views: { '__2@A._3': {} } };

      newStates['A._1.__1.B'] = {};
      newStates['A._1.__1.B.___1'] = {sticky: true, views: { '___1@A._1.__1.B': {} }};
      newStates['A._1.__1.B.___2'] = {sticky: true, views: { '___2@A._1.__1.B': {} }};
      newStates['A._1.__1.B.___3'] = {sticky: true, views: { '___3@A._1.__1.B': {} }};

      return newStates;
    }

    it ('should inactivate sticky state tabs_tab1 when transitioning back to A', function () {
      testGo('aside', { entered: ['aside'] });
      testGo('A._1.__1.B.___1', { exited: ['aside'],                entered: pathFrom('A', 'A._1.__1.B.___1') });
      testGo('A._1.__1.B.___2', { inactivated: ['A._1.__1.B.___1'], entered:     ['A._1.__1.B.___2'] });
    });

    it ('should reactivate child-of-sticky state ___1 when transitioning back to A._1.__1', function () {
      testGo('aside', { entered: ['aside']});
      testGo('A._1.__1', { exited: ['aside'],                         entered: pathFrom('A', 'A._1.__1') });
      testGo('A._2.__2', { inactivated: pathFrom('A._1.__1', 'A._1'), entered: pathFrom('A._2', 'A._2.__2') });
      testGo('aside',    { inactivated: pathFrom('A._2.__2', 'A') ,   entered: ['aside'] });
      testGo('A._2.__2', { exited: ['aside'],                         reactivated: pathFrom('A', 'A._2.__2') }, { redirect: 'A._2.__2' });
      resetTransitionLog();
      testGo('A._1.__1', { inactivated: pathFrom('A._2.__2', 'A._2'), reactivated: pathFrom('A._1', 'A._1.__1') }, { redirect: 'A._1.__1' });
    });


    describe("to an inactive state with inactive children", function() {
      it("should exit inactive child states", function () {
        testGo('A._3.__1', { entered: pathFrom('A', 'A._3.__1') });
        testGo('A._2', { inactivated: pathFrom('A._3.__1', 'A._3'), entered: "A._2" });
        testGo('A._3', { reactivated: "A._3", inactivated: "A._2", exited: "A._3.__1" });
      });
    });

    describe("to an exited substate of an inactive state with inactive children", function() {
      // Test for issue #131
      it("should not exit inactive child states", function() {
        testGo('A._3.__1', { entered: pathFrom('A', 'A._3.__1') });
        testGo('A._2', { inactivated: pathFrom('A._3.__1', 'A._3'), entered: "A._2" });
        testGo('A._3.__2', { reactivated: "A._3", inactivated: "A._2", entered: "A._3.__2" });
      });
    })
  });

  describe('nested .go() transitions with parent attributes', function () {
    beforeEach(function() {
      ssReset(getNestedStickyStates(), _stateProvider);
    });

    function getNestedStickyStates() {
      var newStates = {};

      newStates['aside'] = {};
      newStates['A'] =    {views: { 'A@': {} }};

      newStates['A._1'] = {sticky: true, views: { '_1@A': {} }};
      newStates['_2'] = {sticky: true, views: { '_2@A': {} }, parent: 'A'};

      newStates['A._1.__1'] = {};
      newStates['__2'] = {parent: '_2'};

      return newStates;
    }

    it ('should have states attributes correctly set', function() {
      var A = $state.get('A');
      var A_1 = $state.get('A._1');
      var A_1__1 = $state.get('A._1.__1');
      var A_2 = $state.get('_2');
      var A_2__2 = $state.get('__2');

      // Check includes
      expect(A.$$state().includes).toEqual({'' : true, 'A': true});
      expect(A_1.$$state().includes).toEqual({'' : true, 'A': true, 'A._1': true});

      expect(A_2.$$state().includes).toEqual({'' : true, 'A': true, '_2': true});
      expect(A_2__2.$$state().includes).toEqual({'' : true, 'A': true, '_2': true, '__2': true});

      // Check name attribute
      expect(A.$$state().name).toEqual('A');
      expect(A_1.$$state().name).toEqual('A._1');
      expect(A_1__1.$$state().name).toEqual('A._1.__1');

      expect(A_2.$$state().name).toEqual('_2');
      expect(A_2__2.$$state().name).toEqual('__2');

      // Check parent attribute
      expect(A.$$state().parent.name).toBe('');
      expect(A_1.$$state().parent.self).toBe(A);
      expect(A_1__1.$$state().parent.self).toBe(A_1);

      expect(A_2.$$state().parent.self).toBe(A);
      expect(A_2__2.$$state().parent.self).toBe(A_2);
    });

    it ('should set transition attributes correctly', function() {
      // Test some transitions
      testGo('aside', { entered: ['aside'] });
      testGo('_2', { exited: ['aside'],  entered: ['A', '_2'] });
      testGo('__2', { entered: ['__2'] });
      testGo('A._1.__1', { inactivated: ['__2', '_2'], entered: ['A._1', 'A._1.__1'] });
//      resetTransitionLog();
      testGo('_2', { reactivated: ['_2'], inactivated: ['A._1.__1', 'A._1'], exited: '__2' });
      testGo('A', { inactivated: ['_2'] });
      testGo('aside', { exited: ['A._1.__1', 'A._1', '_2', 'A'], entered: ['aside'] });
    });
  });

  // test cases for issue #139
  describe('ui-router option reload: true', function() {
    beforeEach(function() {
      ssReset(getSimpleStates(), _stateProvider);
    });

    it('should be respected', function() {
      testGo('A._1', { entered: ['A', 'A._1' ] });
      testGo('A._2', { inactivated: [ 'A._1' ],  entered: 'A._2' });
      testGo('A._1', { reactivated: 'A._1', inactivated: 'A._2' });
//      resetTransitionLog();
      testGo('A._2', { exited: [ 'A._1', 'A._2', 'A' ], entered: [ 'A', 'A._2' ] }, { reload: true });
    });
  });

  describe('ui-router option reload: [state ref]', function() {
    beforeEach(function() {
      ssReset(getSimpleStates(), _stateProvider);
    });

    it('should reload a partial tree of sticky states', function() {
      testGo('A._1', { entered: ['A', 'A._1' ] });
      testGo('A._2', { inactivated: [ 'A._1' ],  entered: 'A._2' });
      testGo('A._1', { reactivated: 'A._1', inactivated: 'A._2' });
//      resetTransitionLog();
      testGo('A._2', { inactivated: 'A._1', exited: 'A._2', entered: 'A._2' }, { reload: "A._2" });
    });

    it('should reload a partial tree of non-sticky states', function() {
      testGo('A._1', { entered: ['A', 'A._1' ] });
      testGo('A._2.__1', { inactivated: 'A._1', entered: [ 'A._2', 'A._2.__1' ] });
      testGo('A._1', { reactivated: 'A._1', inactivated: [ 'A._2.__1', 'A._2' ] });
      testGo('A._2.__1', {
        inactivated: 'A._1', reactivated: 'A._2',
        exited: [ 'A._2.__1' ], entered: [ 'A._2.__1' ]
      }, { reload: "A._2.__1" });
      testGo('A._2.__1', { exited: [ 'A._2.__1' ], entered: [ 'A._2.__1' ] }, { reload: "A._2.__1" });
    });
  });

  describe("reset()", function() {
    beforeEach(function() {
      ssReset(getSimpleStates(), _stateProvider);
      testGo('A._1');
      testGo('A._2');
    });

    it("should exit the states being reset()", function() {
      $stickyState.reset("A._1");
      $q.flush();
      expect(tLog.exited).toEqual(['A._1']);
    });

    it("should remove the reset state from the inactive list", function() {
      expect($stickyState.getInactiveStates().length).toBe(1);
      $stickyState.reset("A._1");
      $q.flush();
      expect($stickyState.getInactiveStates().length).toBe(0);
    });

    it("should return false for an unknown state", function() {
      var result = $stickyState.reset("A.DOESNTEXIST");
      expect(result).toBe(false);
      expect($stickyState.getInactiveStates().length).toBe(1);
    });

    it("should reset all inactive states if passed '*'", function() {
      expect($stickyState.getInactiveStates().length).toBe(1);
      testGo('A._3');
      expect($stickyState.getInactiveStates().length).toBe(2);
      $stickyState.reset("*");
      expect($stickyState.getInactiveStates().length).toBe(0);
    });
  });
});

describe('stickyState+ui-sref-active', function () {
  var document;

  beforeEach(module('ct.ui.router.extras.sticky', function($stickyStateProvider, $stateProvider) {
    // Load and capture $stickyStateProvider and $stateProvider
    _stickyStateProvider = $stickyStateProvider;
    _stateProvider = $stateProvider;
  }));

  beforeEach(inject(function($document) {
    document = $document[0];
  }));

  // Capture $injector.get, $state, and $q
  beforeEach(inject(function($injector) {
    $get = $injector.get;
    $state = $get('$state');
    $stickyState = $get('$stickyState');
    $q = $get('$q');
  }));
  var el, template;

  var version = uiRouterVersion();
  console.log("UI-Router version " + version);
  if (!version || version >= 208) {
    describe('ui-sref-active', function () {
      beforeEach(function () {
        ssReset(getStatesForUiSref(), _stateProvider);
      });

      // Set up base state heirarchy
      function getStatesForUiSref() {
        var newStates = {};
        newStates['main'] = { };
        newStates['A'] = { };
        newStates['A._1'] = {sticky: true, views: { '_1@A': {} } };

        return newStates;
      }

      it('should transition normally between non-sticky states', function () {
        testGo('main');
        testGo('A');
      });

      it('should have "active" class on div when state A._1 is active', inject(function ($rootScope, $q, $compile, $state) {
        el = angular.element('' +
            '<div>' +
            '  <a class="" id="foo" ui-sref="A._1" ui-sref-active="active">Go to A._1</a>' +
            '  <a class="" id="bar" ui-sref="main" ui-sref-active="active">Go to main</a>' +
            '</div>');
        template = $compile(el)($rootScope);
        $rootScope.$digest();

        expect(el.find("#foo").length).toBe(1);
        expect(el.find("#bar").length).toBe(1);
        expect(el.find("#baz").length).toBe(0);

        expect(el.find("#bar").attr('class')).toBe('');
        expect(el.find("#foo").attr('class')).toBe('');

        testGo('main');
        expect(el.find("#bar").attr('class')).toBe('active');
        expect(el.find("#foo").attr('class')).toBe('');

        testGo('A');
        expect(el.find("#bar").attr('class')).toBe('');
        expect(el.find("#foo").attr('class')).toBe('');

        testGo('A._1');
        expect(el.find("#bar").attr('class')).toBe('');
        expect(el.find("#foo").attr('class')).toBe('active');
      }));
    });
  }
});