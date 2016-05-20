// c:\dashboard\public\status_codes_chart.js
(function() {
  var chartId = '#status_codes_chart'
  var margin = {top: 60, right: 50, bottom: 20, left: 20}
  var width = parseInt(d3.select(chartId).style('width')) - margin.left - margin.right
  var height = parseInt(d3.select(chartId).style('height')) - margin.top - margin.bottom
  //var width = 600;
  //var height = 300;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width]);

  var y = d3.scale.linear()
      .rangeRound([height, 0]);

  var z = d3.scale.category10();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.time.format("%I:%M"))

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("right")

  var svg = d3.select(chartId).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var categories = ["200", "301", "302", "404", "500"]

  drawChart()

  function drawChart() {
    d3.json('/sdk_status_codes.json', function(error, json) {
      if (error) return console.warn(error)
      var data = []
      for(var i = 0; i < json.rows.length; i++) {
        data.push({
          "date": new Date(json.rows[i][0]),
          "200": parseInt(json.rows[i][1]),
          "301": parseInt(json.rows[i][2]),
          "302": parseInt(json.rows[i][3]),
          "404": parseInt(json.rows[i][4]),
          "500": parseInt(json.rows[i][5])
        })
      }

      var layers = d3.layout.stack()(categories.map(function(c) {
        return data.map(function(d) {
          return {x: d.date, y: d[c]}
        })
      }))

      x.domain(layers[0].map(function(d) { return d.x; }));
      y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();

      xAxis.tickValues(x.domain().filter(function(d, i) { return !(i % 3); }))

      var layer = svg.selectAll(".layer")
          .data(layers)
        .enter().append("g")
          .attr("class", "layer")
          .style("fill", function(d, i) { return z(i); })

      layer.selectAll("rect")
          .data(function(d) { return d; })
        .enter().append("rect")
          .transition()
          .delay(function(d, i) {
            return i * 20
          })
          .duration(200)
          .attr("x", function(d) { return x(d.x); })
          .attr("y", function(d) { return y(d.y + d.y0); })
          .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
          .attr("width", x.rangeBand() - 1)

      layer.selectAll("text")
          .data(function(d) { return d; })
        .enter().append("text")
          .text(function(d) { if (d.y > 50) { return d.y }; } )
          .attr({
            'text-anchor': 'middle',
            x: function(d, i) { return x(d.x) + x.rangeBand() / 2 },
            y: function(d) { return y(d.y + d.y0) + 12 },
            'font-family': 'sans-serif',
            'font-size': '9px',
            fill: '#fff'
          })

      var legend = svg.selectAll(".legend")
          .data(categories)
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(" + i * -120 + ", 15)"; } )

      legend.append("rect")
          .attr({
            "x": width - 18,
            "y": -50,
            "width": 18,
            "height": 18,
          })
          .style("fill", function(d, i) { return z(i); } )

      legend.append("text")
          .attr({
            "x": width - 24,
            "y": -41,
            "dy": ".35em",
            "font-size": "11px",
            "font-face": "sans-serif",
            "fill": "#999"
          })
          .style("text-anchor", "end")
          .text(function(d) { return d; })

      svg.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .attr("fill", "#999")
          .transition()
          .delay(function(d, i) {
            return i * 50
          })
          .duration(500)
          .call(xAxis);

      svg.append("g")
          .attr("class", "axis axis--y")
          .attr("transform", "translate(" + width + ",0)")
          .attr("fill", "#999")
          .transition()
          .delay(function(d, i) {
            return i * 50
          })
          .duration(500)
          .call(yAxis);

    });
  }
})()
