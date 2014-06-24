var w = 300,
    h = 500,
    r = 6,
    fill = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([w, h]);

var divtag = d3.select("#statevis");
var svg = divtag.append("svg:svg")
    .attr("width", w)
    .attr("height", h);

var json =
{
  "nodes": [
    {"name": "d3", "title": "foobar"},
    {"name": "d3.svg"},
    {"name": "d3.svg.area"},
    {"name": "d3.svg.line"},
    {"name": "d3.scale"},
    {"name": "d3.scale.linear"},
    {"name": "d3.scale.ordinal"}
  ],
  "links": [
    {"name": 0, "source": 0, "target": 1},
    {"name": 1, "source": 1, "target": 2},
    {"name": 2, "source": 1, "target": 3},
    {"name": 3, "source": 0, "target": 4},
    {"name": 4, "source": 4, "target": 5},
    {"name": 5, "source": 4, "target": 6}
  ]
};

window.setTimeout(function() {
  json.nodes.push({name: "d3.svg.line.foo"});
  json.links.push({source: 3, target: 7});
  update();
}, 2000);

window.setTimeout(function() {
  json.nodes.pop();
  json.links.pop();
  update();
}, 4000);

function nodename(node) {
  "use strict";
  return node.name;
}

function update() {
  "use strict";
  var node = svg.selectAll("circle")
      .data(json.nodes, nodename);
  node.exit().remove();
  node.enter().append("svg:circle")
      .attr("r", r - .75)
      .style("fill", function (d) { return fill(d.group); })
      .style("stroke", function (d) { return d3.rgb(fill(d.group)).darker(); })
      .call(force.drag);

  var text = svg.selectAll("text")
          .data(json.nodes, nodename);
  text.exit().remove();
  text.enter().append("svg:text")
      .attr("x", function (d) { return d.cx; })
      .attr("y", function (d) { return d.cy; })
      .text(function (d) { return d.name; })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px");
  
  var link = svg.selectAll("line")
      .data(json.links, nodename);
  link.exit().remove();
  link.enter().append("svg:line");

  
  force.nodes(json.nodes)
      .links(json.links)
      .on("tick", tick)
      .start();

  function tick(e) {

    // Push sources up and targets down to form a weak tree.
    var k = 6 * e.alpha;
    json.links.forEach(function(d, i) {
      d.source.y -= k;
      d.target.y += k;
    });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    text.attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; });

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  }
}
update();
