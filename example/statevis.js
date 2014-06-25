(function () {
  "use strict";
//  var app = angular.module("ct.ui.router.extras.statevis", []);
  angular.module("ct.ui.router.extras").directive('stateVis', [ '$state', function ($state) {
    return {
      scope: {
        width: '@',
        height: '@'
      },
      restrict: 'AE',
      template: '<svg></svg>',
      link: function (_scope, _elem, _attrs) {
        var stateMap = {};
        var stateTree = [];
        
        var tree = d3.layout.tree()
            .size([height, width]);
        
        root = stateTree[0];

        // Compute the tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        function addStates(data) {
          // *********** Convert flat data into a nice tree ***************
          data = data.map(function(node) { return angular.copy(node); });
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
            } else {
              stateTree.push(node); // parent is null or missing
            }
          });
        }
        
        addStates($state.get());
        
        var margin = {top: 20, right: 20, bottom: 20, left: 20},
            width = _scope.width - margin.right - margin.left,
            height = _scope.height - margin.top - margin.bottom;

        var i = 0;
        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.x, d.y]; });

        var svg = d3.select(_elem.find("svg")[0])
            .attr("width", _scope.width + margin.right + margin.left)
            .attr("height", _scope.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Declare the nodes and map by node.name
        var node = svg.selectAll("g.node");
        node.data(nodes, function(d) { return d.name; });

        // Declare the links…
        var link = svg.selectAll("path.link");
        node.data(links, function(d) { return d.target.name; });

        update(root);
        
        function update(source) {
          // Normalize for fixed-depth.
          // Multiply the node's tree depth buy 60 to get the y position.
          node = node.data(tree.nodes(root), function(d) { return d.name; });
          link = link.data(tree.links(nodes), function(d) { return d.target.name; });

          nodes.forEach(function(d) { d.y = d.depth * 60; });

          // Enter the nodes.
          var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"; });

          var circleColors = { active: '#f00', entered: '#955', inactive: '#999', future: '#009' };
          nodeEnter.append("circle")
              .attr("r", 7)
              .style("fill", function(d) { 
                console.log("fill status " + d.status + "; d: ", d);
                return circleColors[d.status] || "#FFF"
              });

          nodeEnter.append("text")
              .attr("x", function(d) { return 0; })
              .attr("y", function(d) { return 23; })
              .attr("text-anchor", function(d) { return "middle"; })
              .text(function(d) { return d.name.split(".").pop(); })
              .style("fill-opacity", 1);

          // Enter the links.
          link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", diagonal);
          
          var t = svg.transition()
              .duration(100);

//          var force = d3.layout.force()
//              .nodes(nodes)
//              .links(links)
//              .on("tick", tick)
//              .start();
//
//          function tick() {
//            Update positions of circle elements.
//            node.attr("cx", function(d) { return d.x; })
//                .attr("cy", function(d) { return d.y; });
//          }
        }
        
        window.setTimeout(function() {
          addStates([{ name: 'top3' }]);
          root.status = 'active';
          update(root);
          
        }, 500);


//        function update() {
//          "use strict";
//          var tree = d3.layout.tree();
          
//          var node = svg.selectAll("circle")
//              .data(json.nodes, nodename);
//          node.exit().remove();
//          node.enter().append("svg:circle")
//              .attr("r", r - .75)
//              .style("fill", function (d) {
//                return fill(d.group);
//              })
//              .style("stroke", function (d) {
//                return d3.rgb(fill(d.group)).darker();
//              })
//              .call(force.drag);
//
//          var text = svg.selectAll("text")
//              .data(json.nodes, nodename);
//          text.exit().remove();
//          text.enter().append("svg:text")
//              .attr("x", function (d) {
//                return d.cx;
//              })
//              .attr("y", function (d) {
//                return d.cy;
//              })
//              .text(function (d) {
//                return d.name;
//              })
//              .attr("font-family", "sans-serif")
//              .attr("font-size", "10px");
//
//          var link = svg.selectAll("line")
//              .data(json.links, nodename);
//          link.exit().remove();
//          link.enter().append("svg:line");


//          force.nodes(json.nodes)
//              .links(json.links)
//              .on("tick", tick)
//              .start();

//          function tick(e) {
//            Push sources up and targets down to form a weak tree.
//            var k = 6 * e.alpha;
//            json.links.forEach(function (d, i) {
//              d.source.y -= k;
//              d.target.y += k;
//            });
//
//            node.attr("cx", function (d) { return d.x; })
//                .attr("cy", function (d) { return d.y; });
//
//            text.attr("x", function (d) { return d.x + 10; })
//                .attr("y", function (d) { return d.y - 10; });
//
//            link.attr("x1", function (d) { return d.source.x; })
//                .attr("y1", function (d) { return d.source.y; })
//                .attr("x2", function (d) { return d.target.x; })
//                .attr("y2", function (d) { return d.target.y; });
//          }
//        }
//
//        update();
      }
    };
  }]);

})();


//
//window.setTimeout(function() {
//  json.nodes.pop();
//  json.links.pop();
//  update();
//}, 4000);

