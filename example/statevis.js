(function () {
  "use strict";
  var app = angular.module("ct.ui.router.extras.examples.statevis", ['ct.ui.router.extras']);
  angular.module("ct.ui.router.extras.examples.statevis").directive('stateVis', 
      [ '$state', '$timeout', '$interval', 
        function ($state, $timeout, $interval) {
    return {
      scope: {
        width: '@',
        height: '@'
      },
      restrict: 'AE',
      template: '<svg></svg>',
      link: function (_scope, _elem, _attrs) {
        var stateMap = {};
        var width = _scope.width || 400,
            height = _scope.height || 400;

        var tree = d3.layout.tree()
            .size([width - 20, height - 20]);

        var root = angular.copy($state.get("")),
            nodes = tree(root);

        root.parent = root;
        root.px = root.x = width / 2;
        root.py = root.y = height / 2;

        var diagonal = d3.svg.diagonal();

        var svg = d3.select(_elem.find("svg")[0])
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(10, 10)");

        var node = svg.selectAll(".node"),
            link = svg.selectAll(".link")
            ;

        var duration = 300,
            timer = setInterval(update, duration);

        function addStates(data) {
          // *********** Convert flat data into a nice tree ***************
          data = data.map(function(node) { return node.name == "" ? root : angular.copy(node); });
          _.extend(stateMap, data.reduce(function (map, node) {
            map[node.name] = node;
            return map;
          }, {}));

          data.forEach(function (node) {
            // add to parent
            var parentName = node.name.split(/\./).slice(0, -1).join(".");
            var parent = node.name != parentName && stateMap[parentName];
            if (parent) {
              (parent.children || (parent.children = [])).push(node); // create child array if it doesn't exist
              node.px = parent.px; node.py = parent.py;
              nodes.push(node);
            }
          });
        }


        $interval(function () {
          _scope.states = $state.get();
        }, 50);

        var stateActive = function (event, toState) {
          inner();
          function inner() {
            _.each(nodes, function (n) { n.status = 'inactive'; });
            if (stateMap[toState.name]) 
              stateMap[toState.name].status = 'active';
            else
              $timeout(inner, 100);
          }
        };
        
        _scope.$on("$stateChangeSuccess", stateActive);
        
        _scope.$watchCollection("states", function(newval, oldval) {
          var oldstates = _.map(oldval, function(s) { return s.name; });
          addStates(_.reject(newval, function(state) { 
            return _.contains(oldstates, state.name);
          }));
        });

//        addStates($state.get());
        update(duration);
        
        function update() {
          if (nodes.length >= 50) return clearInterval(timer);

          // Recompute the layout and data join.
          node = node.data(tree.nodes(root), function(d) { return d.name;  });
          link = link.data(tree.links(nodes), function(d) { return d.target.name; });

          // Add entering nodes in the parent’s old position.
          var nodeEnter = node.enter();
          
          nodeEnter.append("circle")
              .attr("class", "node")
              .attr("r", 9)
              .attr("cx", function(d) { return d.parent.px; })
              .attr("cy", function(d) { return d.parent.py; })
          
          nodeEnter.append("text")
              .attr("class", "label")
              .attr("x", function(d) { return d.parent.px; })
              .attr("y", function(d) { return d.parent.py; })
              .attr("text-anchor", function(d) { return "middle"; })
              .text(function(d) { return d.name.split(".").pop(); })
              .style("fill-opacity", 1);
          
          
          // Add entering links in the parent’s old position.
          link.enter().insert("path", ".node")
              .attr("class", "link")
              .attr("d", function(d) {
                var o = {x: d.source.px, y: d.source.py};
                return diagonal({source: o, target: o});
              });

          // Transition nodes and links to their new positions.
          var t = svg.transition()
              .duration(duration);

          t.selectAll(".link")
              .attr("d", diagonal);

          var circleColors = { active: '#f00', entered: '#955', inactive: '#999', future: '#009' };
          t.selectAll(".node")
              .attr("cx", function(d) { return d.px = d.x; })
              .attr("cy", function(d) { return d.py = d.y; })
              .style("fill", function(d) {
                return circleColors[d.status] || "#FFF"
              });
          
          t.selectAll(".label")
              .attr("x", function(d) { return d.px = d.x; })
              .attr("y", function(d) { return d.py = d.y - 15; });
        }
      }
    };
  }]);
})();

