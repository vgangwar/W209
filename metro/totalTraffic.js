queue()
    .defer(d3.json, "totalTraffic.json")
    .await(ready);

function ready(error, totalTraffic) {
	// Sorting data
	totalTraffic = totalTraffic.sort(function(a, b) {return d3.ascending(a.name, b.name);})

	// Creating SVG
	var svgTotalTraffic = d3.select("#divTotalTraffic").append("svg")
						.attr("width", 720)
						.attr("height", 1870);

	// Intial code for Radio Selection items
	var firstLayerItems  = { layerData		: [ "Weekday",
												"Saturday",
												"Sunday",
												"Late Night"],
						     layerClassName	:   "radioFirstLayerTT",
						     gTransform		:   "translate(100, 20)",
						     idPrepend		: 	"" };

	var secondLayerItems = { layerData		: [ "AM Peak = opening to 9:30am",
		 										"Midday = 9:30am to 3:00pm",
		 										"PM Peak = 3:00pm to 7:00pm",
		 										"Evening = 7:00pm to midnight" ],
						     layerClassName	:   "radioSecondLayerTT",
						     gTransform		:   "translate(200, 20)",
						     idPrepend		: 	"" };

	var firstLayerItemsGroup = svgTotalTraffic
										.append("g")
										.attr("transform", firstLayerItems.gTransform);

		var secondLayerItemsGroup = svgTotalTraffic
										.append("g")
										.attr("transform", secondLayerItems.gTransform);
	
		showSelectionItemsTT(firstLayerItemsGroup, firstLayerItems);

		// Update on click for 1st layer
		d3.selectAll(".radioFirstLayerTT")
			.on("click", function() {
				d3.selectAll(".radioFirstLayerTT").attr("fill", "rgba(0, 0, 255, 0.15)");
				d3.select(this).attr("fill", "rgba(0, 0, 255, 0.8)");

				// Setting id Prepend for 2nd Layer id
				var firstLayerId = d3.select(this).attr("id");
				secondLayerItems.idPrepend = firstLayerId;

				// Rendering 2nd layer
				secondLayerItemsGroup.selectAll("*").remove();		// Removing 2nd layer options
				showSelectionItemsTT(secondLayerItemsGroup, secondLayerItems);

				// Update on Click and id for 2nd Layer
				d3.selectAll(".radioSecondLayerTT")
				.on("click", function() {
					d3.selectAll(".radioSecondLayerTT").attr("fill", "rgba(0, 0, 255, 0.15)");
					d3.select(this).attr("fill", "rgba(0, 0, 255, 0.8)");
					var dataSlice = d3.select(this).attr("id");
					renderBarChartPerStationTT(totalTraffic, dataSlice, svgTotalTraffic);
				});

				// Actions if clicked on Late Night
				if (d3.select(this).attr("id") == 'Late') {
					secondLayerItemsGroup.selectAll("*").remove();		// Removing 2nd layer options
					renderBarChartPerStationTT(totalTraffic, "Late", svgTotalTraffic);
				}
			});
	// End of inital code for Radio Selection items

	// Displaying Weekday AM data as default
	renderBarChartPerStationTT(totalTraffic, "WeekdayAM", svgTotalTraffic);

	// Adding Outgoing and Incoming Traffic headings
	// Outgoing
	svgTotalTraffic
		.append("text")
		.text("Total Outgoing Traffic")
		.attr("x", 50)
		.attr("y", 120)
		.attr("font-family", "sans-serif")
		.attr("font-weight", "bold");

	// Incoming
	svgTotalTraffic
		.append("text")
		.text("Total Incoming Traffic")
		.attr("x", 360)
		.attr("y", 120)
		.attr("font-family", "sans-serif")
		.attr("font-weight", "bold");

}

// Function to Render bar chart
function renderBarChartPerStationTT(data, slice, svg) {
	var barHeight = 20,			// Height of bar
		textHeight = "13px",	// Height of text
		textOffsetInBar = 3,	// Lifts text from bottom of bar and pushes text from start of bar
		innerWidth = 300;

	var outin = [["outgoing", "translate(50, 130)"],
				 ["incoming", "translate(360, 130)"]];

	// Getting maxValue for use in xScale
	var outgoingMax = d3.max(data, function(d) {return d[slice].outgoing});
	var incomingMax = d3.max(data, function(d) {return d[slice].incoming});
	var maxValue = d3.max([outgoingMax, incomingMax]);
	// I will use Global max manually here and comment out these lines in case I need them
	maxValue = 16753.1;

	// Deleting previous groups DOM elements
	d3.selectAll(".totalTrafficSVG").remove();

	outin.forEach(function(outinItem) {
		// xScale to determine length bars
		var xScale = d3.scale.linear()
						.domain([0, maxValue])
						.rangeRound([0, innerWidth]);

		// Creating SVG group
		var svgBar = svg
						.append("g")
						.attr("class", "totalTrafficSVG")
						.attr("transform", outinItem[1]);

		// Creating Bars
		var rects = svgBar
						.selectAll("rect")
						.data(data);

		// Enter phase
		rects
			.enter()
			.append("rect")
		.attr("height", barHeight)
		.attr("fill", "rgba(0, 255, 255, 0.35)");

		// Update phase
		rects
		.attr("y", function(d, i) {return i*barHeight;})
		.attr("width", function(d) {return xScale(d[slice][outinItem[0]]);});

	// Exit phase
	rects
		.exit()
		.remove();

	// Writing Station names
	var texts = svgBar
					.selectAll("text")
					.data(data);
	// Enter Phase
	texts
		.enter()
		.append("text")
		.attr("x", textOffsetInBar);

	// Update Phase
	texts
		.attr("y", function(d, i) {return i*barHeight + (barHeight-textOffsetInBar);})
		.text(function(d) {
			t = d.name + ": " + d[slice][outinItem[0]];
			return t;
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", textHeight)
		.attr("text-anchor", "start");

	// Exit Phase
	texts
		.exit()
		.remove();
	});		
}

// Function to render Radio selection items
function showSelectionItemsTT(svgGroup, data) {
	var radioRadius = 5;
	var textHeight = "13px";
	var textOffsetInBar = 3;

	var radioCircles = svgGroup
						.selectAll("circle")
						.data(data.layerData);

	// Radio buttons
	// Enter Phase Circles
	radioCircles
		.enter()
		.append("circle")
	.attr("class", data.layerClassName)
	.attr("id", function(d) {return data.idPrepend + d.split(" ")[0];})
	.attr("stroke", "black")
		.attr("stroke-width", 2)
		.attr("r", radioRadius);

	// Update phase
	radioCircles
		.attr("fill", "rgba(0, 0, 255, 0.15)")
		.attr("cy", function(d, i) { return i*20; });

	// Exit phase
	radioCircles
		.exit()
		.remove();

	// Radio Labels
	var radioLabels = svgGroup
						.selectAll("text")
						.data(data.layerData);

	// Enter phase
	radioLabels
		.enter()
		.append("text")
		.attr("x", 20)
		.attr("y", function(d, i) { return i*20 + radioRadius; })
		.attr("font-family", "sans-serif")
	.attr("font-size", textHeight)
	.attr("text-anchor", "start");

// Update phase
radioLabels
	.text(function(d) { return d; });

// Exit phase
radioLabels
	.exit()
	.remove();
}