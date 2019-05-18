
// ***** Clear chart and resize to match browser window size *****
//set svg dimensions
var svgWidth = 960;
var svgHeight = 620;

//set borders in svg
var margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100
};
  
    // Determine chart height and width
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

// ***** Import Data *****      
    // Read CSV
    d3.csv("./assets/data/data.csv").then(function(ACSData) {
        // Verify using 
        console.log(ACSData);
        //parse data
        ACSData.forEach(function(data) {
              data.obesity = +data.obesity;
              data.income = +data.income;
              data.smokes = +data.smokes;
              data.age = +data.age;
              data.healthcare = +data.healthcare;
              data.poverty = +data.poverty;
            });

// ***** Start the charting process *****
            

    // Tell the chart to use the scatter element
    var chart = d3.select("#scatter").append("div").classed("chart", true);    
    
    // Append SVG element
    var svg = chart.append("svg")
      .attr("height", svgHeight)
      .attr("width", svgWidth)
       
  
    // Append group element
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Default choice for axis
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // FUNCTION - change chart data values when a different label on X or Y axis is selected
    function xScale(ACSData, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(ACSData, d => d[chosenXAxis]) * .8,
            d3.max(ACSData, d => d[chosenXAxis]) * 1.2])
            .range([0,width]);
            return xLinearScale;
    }

    function yScale(ACSData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(ACSData, d => d[chosenYAxis]) * .8,
            d3.max(ACSData, d => d[chosenYAxis]) * 1.2])
            .range([height, 0]);
            return yLinearScale;
    }

    // FUNCTION - change chart axis scaling values when different X or Y axis lablel is selected
    function renderAxisX(newxScale, xAxis) {
        var bottomAxis = d3.axisBottom(newxScale);
            xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
            return xAxis;
    } 
    
    function renderAxisY(newyScale, yAxis) {
        var leftAxis = d3.axisLeft(newyScale);
            yAxis.transition()
            .duration(1000)
            .call(leftAxis);
            return yAxis;
    } 
     
    // FUNCTION - change circle values when axis is changed
    function renderCircles(circlesGroup, newxScale, chosenXAxis, newyScale, chosenYAxis) {
        circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => newxScale(data[chosenXAxis]))
        .attr("cy", data => newyScale(data[chosenYAxis]));
        return circlesGroup;
    }

    // Function - change the state abbreviation inside bubble when change is detected
    function renderText(textGroup, newxScale, chosenXAxis, newyScale, chosenYAxis) {
        textGroup.transition()
        .duration(1000)
        .attr("x", d => newxScale(d[chosenXAxis]))
        .attr("y", d=> newyScale(d[chosenYAxis]));
        return textGroup;
    }

    // FUNCTION -  xAxis tooltip values 
    function styleX(value, chosenXAxis) {
        if(chosenXAxis === 'poverty') {
            return `${value}`;
        }
        else if (chosenXAxis === 'income') {
            return `$${value}`;
        }
        else {
            return `${value}`;
        }
        
    }
    // FUNCTION - circle tooltip values 
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
        if (chosenXAxis === 'poverty') {
            var xLable = "Poverty:" ;
        }
        else if (chosenXAxis === 'income') {
            var xLabel = "Median Income:" ;
        }
        else {
            var xLabel = "Age:" ;
        }
    
        if (chosenYAxis === 'healthcare') {
            var yLabel = "No Healthcare:"
        }
        else if (chosenYAxis === 'obesity') {
            var yLabel = "Obesity:"
        }
        else {
            var yLabel = "Smokers:"
        }
        var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
        });

        circlesGroup.call(toolTip);
        circlesGroup.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);
        return circlesGroup;
    }

// Create first linear scales
    var xLinearScale = xScale(ACSData, chosenXAxis);
    var yLinearScale = yScale(ACSData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(ACSData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 12)
        .attr("opacity", ".5");

    // Append initial text
    var textGroup = chartGroup.selectAll(".stateText")
        .data(ACSData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function(d){return d.abbr});

// Create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    var povertyLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)")

    var incomeLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .text("Household Income (Median)")

// Create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

    var healthcareLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")
        .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 60)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity")
        .text("Obese (%)");

// UpdateToolTip function with data
var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

// X axis labels event listener
xLabelsGroup.selectAll("text")
.on("click", function() {
    //get value of selection
    var value = d3.select(this).attr("value");

    //check if value is same as current axis
    if (value != chosenXAxis) {

        //replace chosenXAxis with value
        chosenXAxis = value;

        //update x scale for new data
        xLinearScale = xScale(ACSData, chosenXAxis);

        //update x axis with transition
        xAxis = renderAxisX(xLinearScale, xAxis);

        //update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update text with new x values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //change classes to change bold text
        if (chosenXAxis === "poverty") {
            povertyLabel.classed("active", true).classed("inactive", false);
            ageLabel.classed("active", false).classed("inactive", true);
            incomeLabel.classed("active", false).classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
            povertyLabel.classed("active", false).classed("inactive", true);
            ageLabel.classed("active", true).classed("inactive", false);
            incomeLabel.classed("active", false).classed("inactive", true);
        }
        else {
            povertyLabel.classed("active", false).classed("inactive", true);
            ageLabel.classed("active", false).classed("inactive", true);
            incomeLabel.classed("active", true).classed("inactive", false);
        }
    }
});

// Y axis labels event listener
yLabelsGroup.selectAll("text")
.on("click", function() {
//get value of selection
    var value = d3.select(this).attr("value");

        //check if value is same as current axis
        if (value != chosenYAxis) {

        //replace chosenYAxis with value
        chosenYAxis = value;

        //update y scale for new data
        yLinearScale = yScale(ACSData, chosenYAxis);

        //update x axis with transition
        yAxis = renderAxisY(yLinearScale, yAxis);

        //update circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update text with new y values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

        //update tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //change classes to change bold text
        if (chosenYAxis === "obesity") {
            obesityLabel.classed("active", true).classed("inactive", false);
            smokesLabel.classed("active", false).classed("inactive", true);
            healthcareLabel.classed("active", false).classed("inactive", true);
    }
        else if (chosenYAxis === "smokes") {
            obesityLabel.classed("active", false).classed("inactive", true);
            smokesLabel.classed("active", true).classed("inactive", false);
            healthcareLabel.classed("active", false).classed("inactive", true);
    }
        else {
            obesityLabel.classed("active", false).classed("inactive", true);
            smokesLabel.classed("active", false).classed("inactive", true);
            healthcareLabel.classed("active", true).classed("inactive", false);
    }
    }
    });
});
