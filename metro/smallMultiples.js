
queue()
	.defer(d3.json, "smallMultiples.json")
	.await(ready);

function ready(error, matrix) {
	// Generating Check Box
	var searchLines = [];		// Stores selected lines for display via check boxes
		var textList = [
						"Red Line",
						"Orange Line",
						"Silver Line",
						"Blue Line",
						"Yellow Line",
						"Green Line"
						];
		var svgTextList = d3.select("#divSmallMultiplesCheckBox").append("svg")
	 							.attr("width", 720)
	 							.attr("height", 160);

		renderSelectionItems(svgTextList, textList, searchLines, matrix);
		// Initially displaying data for all stations
		prepareBarchartAndCallRenderer(matrix, searchLines);
}

function prepareBarchartAndCallRenderer(matrix, searchLines) {
	// Subsetting matrix
	if (searchLines.length == 0) {
		searchLines = ["Yellow"];
	}

	var subsetMatrix = [];
	matrix.forEach(function(element, idx, arr) {
		if (isLine(searchLines, element.lines)) {subsetMatrix.push(element);}
	});

	// Important variables for Generating Small Multiples
	var hSpacing = 30,	// Horizontal spacing between bar charts
		vSpacing = 50,	// Vertical spacing between bar chart rows
		innerWidth = 200,	// Width of barCharts
		barHeight = 14,		// Height of bars
		numOfDataElements = subsetMatrix[0].data.length;		// Number of data elements per bar Chart

	// Deleting old svg
	d3.select("#divSmallMultiples").selectAll("*").remove();
	// Creating svg
	svgSMHeight = vSpacing + Math.ceil(subsetMatrix.length/5)*(barHeight*numOfDataElements + vSpacing);
		var svgSmallMultiples = d3.select("#divSmallMultiples").append("svg")
	 							.attr("width", 1190)
	 							.attr("height", svgSMHeight);

	 	var svgSM = svgSmallMultiples.append("g").attr("transform", "scale(1)");
	// Sorting subsetMatrix by total Traffic
	subsetMatrix.sort(function(a, b) {
		totalA = a.data.reduce(function(x,y) {return x+y;})
		totalB = b.data.reduce(function(x,y) {return x+y;})
		if (totalA < totalB) {return 1} else {return -1};
	});

	// Looping through the subsetMatrix
	for (i=0; i<subsetMatrix.length; i++) {
		var xTranslate = hSpacing + (i%5)*(innerWidth+hSpacing),
			yTranslate = vSpacing + Math.floor(i/5)*(barHeight*numOfDataElements + vSpacing);

		var barGroup = svgSM.append("g")
						.attr("class", "sm")
						.attr("transform", "translate(" + xTranslate + "," + yTranslate + ")");

		renderBarChart(barGroup, subsetMatrix[i]);
	}
}
	


function renderBarChart(barGroup, stationData) {
	var barHeight = 14,			// Height of bar
			textHeight = "10px",	// Height of text
			stationNameTextHeight = "13px",	// Height of text
			textOffsetInBar = 3,	// Lifts text from bottom of bar and pushes text from start of bar
			innerWidth = 200,
			maxTrafficValue = 25000,
			lineRadius = 10,		// Radius of line color circles
			centerDist = 25;		// Distance between line color circle centers

		var linesColorMap = {
							"Red":    "rgba(255,0,0,1)",
							"Green":  "rgba(0,255,0,1)",
							"Blue":   "rgba(0,0,255,1)",
							"Yellow": "rgba(255,255,0,1)",
							"Orange": "rgba(255,127,80,1)",
							"Silver": "rgba(192,192,192,1)" 
		};

	var colorMap = {0: "rgba(255,255,0,0.5)",
					1: "rgba(255,255,0,0.5)",
					2: "rgba(255,255,0,0.5)",
					3: "rgba(255,255,0,0.5)",
					4: "rgba(255,0,0,0.5)",
					5: "rgba(255,0,0,0.5)",
					6: "rgba(255,0,0,0.5)",
					7: "rgba(255,0,0,0.5)",
					8: "rgba(0,255,0,0.5)",
					9: "rgba(0,255,0,0.5)",
					10: "rgba(0,255,0,0.5)",
					11: "rgba(0,255,0,0.5)",
					12: "rgba(0,0,255,0.5)"};

		// xScale to determine length bars
		var xScale = d3.scale.linear()
						.domain([0, maxTrafficValue])
						.rangeRound([0, innerWidth]);

	// Creating Bars
		var rects = barGroup
						.selectAll("rect")
						.data(stationData.data);

		// Enter phase
		rects
			.enter().append("rect")
		.attr("height", barHeight)
		.attr("fill", function(d, i) {return colorMap[i];})
		.attr("stroke", "black");

		// Update phase
		rects
		.attr("y", function(d, i) {return i*barHeight;})
		.attr("width", function(d) {return xScale(d);});

	// Exit phase
	rects
		.exit()
		.remove();

	// Adding Bar Text
	var texts = barGroup
					.selectAll("text")
					.data(stationData.data);
	// Enter Phase
	texts
		.enter()
		.append("text")

	// Update Phase
	texts
		.attr("x", function(d) {return xScale(d)+textOffsetInBar;})
		.attr("y", function(d, i) {return i*barHeight + (barHeight-textOffsetInBar);})
		.text(function(d) {
			return d.toFixed(0);
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", textHeight)
		.attr("text-anchor", "start");

	// Exit Phase
	texts
		.exit()
		.remove();

	// Display Station name
	barGroup.append("text")
	.attr("x", innerWidth/2)
	.attr("y", stationData.data.length*barHeight + 20)
	.text(stationData.name)
	.attr("font-family", "sans-serif")
	.attr("font-size", stationNameTextHeight)
	.attr("text-anchor", "middle");

	// Adding x axis
	var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.tickValues([0, 25000]);

    barGroup.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0, " + (stationData.data.length*barHeight) + ")")
		.call(xAxis);

	// Adding Line circles
	var lineCircleGroup = barGroup.append("g").attr("transform", "translate(" + (innerWidth-lineRadius) + "," + (stationData.data.length*barHeight-20) + ")");

	var lineCircles = lineCircleGroup
						.selectAll("circle")
						.data(stationData.lines);

	// Line color circles
	// Enter Phase
		lineCircles
			.enter()
			.append("circle")

		// Update phase
		lineCircles
			.attr("cy", function(d, i) { return -i*centerDist; })
			.attr("r", lineRadius)
			.attr("fill", function(d) {
				return linesColorMap[d];
			});

		// Exit phase
		lineCircles
			.exit()
			.remove();
}

// Render to render Radio selection items
	function renderSelectionItems(svgTextList, textList, searchLines, matrix) {
		var rectSide = 10,
			textHeight = "13px",
			itemHeight = 20,
			barHeight = 9,			// Height of bar
		legendTextHeight = "9px",	// Height of text
		textOffsetInBar = 1,	// Lifts text from bottom of bar and pushes text from start of bar
		rectWidth = 100;

	// Bar Text
	var legendTextColorMap = [ 
					["Weekday AM", 		"rgba(255,255,0,0.5)"],
					["Weekday Midday", 	"rgba(255,255,0,0.5)"],
					["Weekday PM", 		"rgba(255,255,0,0.5)"],
					["Weekday Evening", "rgba(255,255,0,0.5)"],
					["Saturday AM",		"rgba(255,0,0,0.5)"],
					["Saturday Midday",	"rgba(255,0,0,0.5)"],
					["Saturday PM",		"rgba(255,0,0,0.5)"],
					["Saturday Evening","rgba(255,0,0,0.5)"],
					["Sunday AM",		"rgba(0,255,0,0.5)"],
					["Sunday Midday",	"rgba(0,255,0,0.5)"],
					["Sunday PM",		"rgba(0,255,0,0.5)"],
					["Sunday Evening",	"rgba(0,255,0,0.5)"],
					["Late Night", 		"rgba(0,0,255,0.5)"]
				  ];

	var GroupTextList = svgTextList
										.append("g")
										.attr("transform", "translate(30, 30)");

		var checkBoxes = GroupTextList
							.selectAll("rect")
							.data(textList);

		// Check boxes
		// Enter Phase
		checkBoxes
			.enter()
			.append("rect")
			.attr("id", function(d) {return d.split(" ")[0];})
		.attr("stroke", "black")
			.attr("stroke-width", 2)
			.on("click", function() {
					currLine = d3.select(this).attr("id");
					currColor = d3.select(this).attr("fill");
					if (currColor == "rgba(0, 0, 255, 0.15)") {
						d3.select(this).attr("fill", "rgba(0, 0, 255, 0.8)");
						searchLines.push(currLine);
						prepareBarchartAndCallRenderer(matrix, searchLines)
					} else {
						d3.select(this).attr("fill", "rgba(0, 0, 255, 0.15)");
						searchLines.splice(searchLines.indexOf(currLine), 1);
						prepareBarchartAndCallRenderer(matrix, searchLines)
					}
				});

		// Update phase
		checkBoxes
			.attr("y", function(d, i) { return i*itemHeight; })
			.attr("width", rectSide)
			.attr("height", rectSide)
			.attr("fill", "rgba(0, 0, 255, 0.15)")

		// Exit phase
		checkBoxes
			.exit()
			.remove();

		// Adding Check box labels
		var checkBoxLabels = GroupTextList
							.selectAll("text")
							.data(textList);

		// Enter phase
		checkBoxLabels
			.enter()
			.append("text")
			.attr("x", 20)
			.attr("y", function(d, i) { return i*20 + 10; })
			.attr("font-family", "sans-serif")
		.attr("font-size", textHeight)
		.attr("text-anchor", "start");

	// Update phase
	checkBoxLabels
		.text(function(d) { return d; });

	// Exit phase
	checkBoxLabels
		.exit()
		.remove();

	// Rendering Legend
	var legendTextColorGroup = svgTextList.append("g").attr("transform", "translate(260, 25)");

	var LegendRects = legendTextColorGroup
						.selectAll("rect")
						.data(legendTextColorMap);

	// Enter phase
	LegendRects
		.enter().append("rect")
		.attr("height", barHeight)
		.attr("fill", function(d) {return d[1];});

	// Update phase
	LegendRects
		.attr("y", function(d, i) {return i*barHeight;})
		.attr("width", rectWidth);

	// Exit phase
	LegendRects
		.exit()
		.remove();

	// Adding Legend Text
	var legendTexts = legendTextColorGroup
					.selectAll("text")
					.data(legendTextColorMap);
	// Enter Phase
	legendTexts
		.enter()
		.append("text")

	// Update Phase
	legendTexts
		.attr("x", function(d) {return textOffsetInBar;})
		.attr("y", function(d, i) {return i*barHeight + (barHeight-textOffsetInBar);})
		.text(function(d) {
			return d[0];
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", legendTextHeight)
		.attr("text-anchor", "start");

	// Exit Phase
	legendTexts
		.exit()
		.remove();
	}

// Function to search if a station is part of the selected lines
function isLine(searchLines, stationLines) {
	var retval = 0;
	searchLines.forEach(function(element, idx, arr) {
		if (stationLines.indexOf(element) > -1) {retval = 1;}
	});
	return retval;
}	
