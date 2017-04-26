/* Create a treemap of country level measures. Inspiration drawn from https://bl.ocks.org/mbostock/4063582.
 */
$(function() {
    // Read in your data. On success, run the rest of your code
    d3.csv('data/AusOpen-all-2013-round1.csv', function(error, data) {
        var gender = 'M';
        var round = '1';
        var unforced = '0';
        var fsp = '1';

        // Setting defaults
        var margin = {
                top: 40,
                right:50,
                bottom: 100,
                left: 40
            },
            width = 1100,
            height = 540,
            drawWidth = width - margin.left - margin.right,
            drawHeight = height - margin.top - margin.bottom;


        // Append a wrapper div for the chart
        var div = d3.select('#vis')
            .append("div")
            .attr('height', height)
            .attr('width', width)
            // .style("left", margin.left + "px")
            // .style("top", margin.top + "px");

        var svg = div.append('svg')
                     .attr('width', width)
                     .attr('height', height + 100);


        var g = svg.append('g')
                   .attr('width', drawWidth)
                   .attr('height', drawHeight)
                   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        var xAxisLabel = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (drawHeight + margin.top ) + ')')
            .attr('class', 'axis');

        // Append a yaxis label to your SVG, specifying the 'transform' attribute to position it (don't call the axis function yet)
        var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')');

        // Append text to label the y axis (don't specify the text yet)
        var xAxisText = svg.append('text')
            .attr('transform', 'translate(' + ((margin.left + drawWidth) /  2) + ',' + (drawHeight + margin.top + 150) + ')')
            .attr('class', 'title');

        // Append text to label the y axis (don't specify the text yet)
        var yAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left - 25) + ',' + (margin.top + drawHeight / 2) + ') rotate(-90)')
            .attr('class', 'title');

        // Define xAxis using d3.axisBottom(). Scale will be set in the setAxes function.
        var xAxis = d3.axisBottom();

        // Define yAxis using d3.axisLeft(). Scale will be set in the setAxes function.
        var yAxis = d3.axisLeft()
            .tickFormat(d3.format('.2s'));

        // Define an xScale with d3.scaleBand. Domain/rage will be set in the setScales function.
        var xScale = d3.scaleBand();
        var x1 = d3.scaleBand();

        // Define a yScale with d3.scaleLinear. Domain/rage will be set in the setScales function.
        var yScale = d3.scaleLinear();
        
         var setScales = function(data) {
             // Get the unique values of states for the domain of your x scale
            var match = data.map(function(d) {
                return d.mf;
            });
            // console.log(match);
            // Set the domain/range of your xScale
            xScale.range([0, drawWidth])
                .padding(0.1)
                .domain(match);

            if (fsp == '1') {
                var yMax = d3.max(data, function(d) {
                    return +d.FSP1;
                });
             } else {
                   var yMax = d3.max(data, function(d) {
                    if (d.UFE1 > d.UFE2) {
                        return +d.UFE1;
                    } else {
                        return +d.UFE2;
                    }
                });
             }
            //  console.log(yMax);
            // Set the domain/range of your yScale
            yScale.range([drawHeight, 0])
                .domain([0, yMax]);
        }
        
        var setAxis = function(data) {

         // Set the scale of your xAxis object
            xAxis.scale(xScale);

            // Set the scale of your yAxis object
            yAxis.scale(yScale);

            // Render (call) your xAxis in your xAxisLabel
            xAxisLabel.transition().duration(1000).call(xAxis)
                      .selectAll("text")
                      .attr('transform', 'translate(' + (margin.left - 52) + ',' + (margin.top + 30 )+ ') rotate(-90)')

            // Render (call) your yAxis in your yAxisLabel
            yAxisLabel.transition().duration(1000).call(yAxis);

            // Update xAxisText and yAxisText labels
            xAxisText.text('Tennis matches');
            if (unforced == '0')
                 yAxisText.text('Percent of First Serves in (%)');
            else {
                 yAxisText.text('Number of unforced errors');

            }
        }
     
        // Add tip
        sortItems = function (a, b) {
                    return a.FSP1 - b.FSP1;
           };


        var draw = function(data) {
            // Store the data-join in a function: make sure to set the scales and update the axes in your function.
            // Select all rects and bind data
            setScales(data);
            setAxis();
  
            var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
                    if(fsp == '1') {
                        var player1AndFSP1 = d.Player1 + " " + d.FSP1 + " ";
                        var player2AndFSP2 = d.Player2 + " " + d.FSP2;
                        return player1AndFSP1 + player2AndFSP2;
                    } else {
                        var player1AndUFE1 = d.Player1 + " " + d.UFE1 + " ";
                        var player2AndUFE2 = d.Player2 + " " + d.UFE2;
                        return player1AndUFE1 + player2AndUFE2;
                    }

                });
                g.call(tip);

            var bars = g.selectAll('rect').data(data);
        
            // Use the .enter() method to get your entering elements, and assign initial positions
            bars.enter().append('rect')
                .attr('x', function(d) {
                    return xScale(d.mf);
                })
                .attr('class', 'bar')
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .attr('width', xScale.bandwidth())
                .attr('height', 0)
                .attr('y', drawHeight)
                .merge(bars)
                // .transition()
                // .delay(function(d,i) {
                //     return i*100
                // })
                .attr('y', function(d) {  
                    if(fsp == '1') {
                        return yScale(d.FSP1);
                    } else {
                        return yScale(d.UFE1);
                    }
                })
                .attr('x', function(d) {
                    return xScale(d.mf);
                })
                .attr('width', xScale.bandwidth())
                .attr('height', function(d) {
                    if(fsp == '1') {
                        return (drawHeight - yScale(d.FSP1));
                    } else {
                        return (drawHeight - yScale(d.UFE1));
                    }
                })
                .attr('fill', function(d) {
                    if(d.Result == 1) {
                        return 'green';
                    } else { 
                        return 'red'
                    }
                });
             bars.exit().remove();

        }
       
        var filterData = function() {      
            var sex = data.filter(function(d) {
                    return d.G == gender;
            });
            var filteredData = sex.filter(function(d) {
                    return d.Round == round;
            });
            return filteredData;
        }

        $('input').on('change', function() {
            var input = $(this).val();
            if ($(this).hasClass('gender')) {
                gender = input;
            } 
            else if ($(this).hasClass('round')) {
                round = input;
            } 
            else if ($(this).hasClass('unforced')) {
                unforced = '1';
                fsp = '0'
            } else {
                unforced = '0';
                fsp = '1'
            }
            // console.log(input);
            filteredData = filterData(data)
            draw(filteredData);
        });
        filteredData = filterData();
        draw(filteredData);
        

    });
});