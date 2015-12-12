queue()
  .defer(d3.csv, "c2.csv")
  .defer(d3.json, "chordMatrix.json")
  .await(ready);

function ready(error, cities, matrix) {
  // Creating SVG
  var width = 720,
      height = 2610;

  var svgChordDiagram = d3.select("#divChordDiagram")
                            .append("svg")
                            .attr("width", width)
                            .attr("height", height);

  // Intial code for Radio Selection items
  var firstLayerItems  = { layerData    : [ "Weekday",
                                            "Saturday",
                                            "Sunday",
                                            "Late Night"],
                         layerClassName :   "radioFirstLayer",
                         gTransform     :   "translate(100, 20)",
                         idPrepend      :   "" };

  var secondLayerItems = { layerData    : [ "AM Peak = opening to 9:30am",
                                            "Midday = 9:30am to 3:00pm",
                                            "PM Peak = 3:00pm to 7:00pm",
                                            "Evening = 7:00pm to midnight" ],
                         layerClassName :   "radioSecondLayer",
                         gTransform     :   "translate(200, 20)",
                         idPrepend      :   "" };

  var firstLayerItemsGroup = svgChordDiagram
                              .append("g")
                              .attr("transform", firstLayerItems.gTransform);

  var secondLayerItemsGroup = svgChordDiagram
                                .append("g")
                                .attr("transform", secondLayerItems.gTransform);
  
  showSelectionItems(firstLayerItemsGroup, firstLayerItems);

  // Update on click for 1st layer
  d3.selectAll(".radioFirstLayer")
    .on("click", function() {
      d3.selectAll(".radioFirstLayer").attr("fill", "rgba(0, 0, 255, 0.15)");
      d3.select(this).attr("fill", "rgba(0, 0, 255, 0.8)");

      // Setting id Prepend for 2nd Layer id
      var firstLayerId = d3.select(this).attr("id");
      secondLayerItems.idPrepend = firstLayerId;

      // Rendering 2nd layer
      secondLayerItemsGroup.selectAll("*").remove();    // Removing 2nd layer options
      showSelectionItems(secondLayerItemsGroup, secondLayerItems);

      // Update on Click and id for 2nd Layer
      d3.selectAll(".radioSecondLayer")
      .on("click", function() {
        d3.selectAll(".radioSecondLayer").attr("fill", "rgba(0, 0, 255, 0.15)");
        d3.select(this).attr("fill", "rgba(0, 0, 255, 0.8)");
        var dataSlice = d3.select(this).attr("id");
        renderChordDiagram(width, height, svgChordDiagram, cities, matrix, dataSlice);
      });

      // Actions if clicked on Late Night
      if (d3.select(this).attr("id") == 'Late') {
        secondLayerItemsGroup.selectAll("*").remove();    // Removing 2nd layer options
        renderChordDiagram(width, height, svgChordDiagram, cities, matrix, "Late");
      }
    });
  // Calling function to generate Chord Diagram
  renderChordDiagram(width, height, svgChordDiagram, cities, matrix, "WeekdayAM");      
}

// Function to generate Chord Diagram
function renderChordDiagram(width, height, svgChordDiagram, cities, matrices, dataSlice) {
  // Selecting matrix
  var matrix = matrices[dataSlice];

  // Removing all DOM elements
  svgChordDiagram.selectAll("#circle").remove();

  // Code for creating Chord Diagram
  var outerRadius = Math.min(width, height) / 2 - 10,
      innerRadius = outerRadius - 24;

  var formatPercent = d3.format("0.1%");

  var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  var layout = d3.layout.chord()
      .padding(.01)
      .sortGroups(d3.descending)
      .sortSubgroups(d3.descending)
      .sortChords(d3.ascending);

  var path = d3.svg.chord()
      .radius(innerRadius);

  var svgChordDiagramGroup = svgChordDiagram
              .append("g")
                .attr("id", "circle")
                .attr("transform", "translate(" + width / 2 + "," + ((width / 2)+100) + ")");

  svgChordDiagramGroup.append("circle")
    .attr("r", outerRadius);

  // Compute the chord layout.
  layout.matrix(matrix);

  // Add a group per neighborhood.
  var group = svgChordDiagramGroup.selectAll(".group")
                  .data(layout.groups)
                .enter().append("g")
                  .attr("class", "group")
                  .on("mouseover", mouseover);

  // Add a mouseover title.
  group.append("title").text(function(d, i) {
    return cities[i].name + ": Total Outgoing Traffic = " + Math.round(d.value*10)/10;
  });

  // Add the group arc.
  var groupPath = group.append("path")
      .attr("id", function(d, i) { return "group" + i; })
      .attr("d", arc)
      .style("fill", function(d, i) { return cities[i].color; });

  // Add the chords.
  var chord = svgChordDiagramGroup.selectAll(".chord")
      .data(layout.chords)
    .enter().append("path")
      .attr("class", "chord")
      .style("fill", function(d) { return cities[d.source.index].color; })
      .attr("d", path);

  // Add an elaborate mouseover title for each chord.
  chord.append("title").text(function(d) {
    return cities[d.source.index].name
        + " → " + cities[d.target.index].name
        + ": " + d.source.value
        + "\n" + cities[d.target.index].name
        + " → " + cities[d.source.index].name
        + ": " + d.target.value;
  });

  function mouseover(d, i) {
    renderLabels(cities[i].name);
    //console.log(cities[i].name, i);
    prepareBarChartDataAndCallRendered(i, cities, matrix, svgChordDiagram);
    chord.classed("fade", function(p) {
      return p.source.index != i
          && p.target.index != i;
    });
  }

  function renderLabels(stationName) {
    // Removing labels
    svgChordDiagram.selectAll(".legendLabels").remove();
    // Writing station name label
    svgChordDiagram.append("text")
          .attr("class", "legendLabels")
          .text("Station Name: " + stationName)
          .attr("x",360)
          .attr("y",830)
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-weight", "bold");

    // Adding Outgoing label
    svgChordDiagram.append("text")
          .attr("class", "legendLabels")
          .text("Traffic to:")
          .attr("x",140)
          .attr("y",850)
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-weight", "bold")
          .attr("font-size", "14px");

    // Adding incoming label
    svgChordDiagram.append("text")
          .attr("class", "legendLabels")
          .text("Traffic from:")
          .attr("x",510)
          .attr("y",850)
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-weight", "bold")
          .attr("font-size", "14px");

  }

  // Rendering bar charts for initial view
  prepareBarChartDataAndCallRendered(75, cities, matrix, svgChordDiagram);
  renderLabels("Union Station");

}

// Function to render Radio selection items
function showSelectionItems(svgGroup, data) {
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

// Prepare data for bar chart and then call bar chart renderer
function prepareBarChartDataAndCallRendered(indexOfStation, stations, matrix, svgChordDiagram) {
  // Preparing group elements
  var translateStrOutgoing = "translate(100, 860)";
  var translateStrIncoming = "translate(460, 860)";

  // Deleting old Bar Chart Group elements
  d3.selectAll("#barOutgoing").remove();
  d3.selectAll("#barIncoming").remove();


  barGroupOutgoing = svgChordDiagram.append("g")
                                    .attr("transform", translateStrOutgoing)
                                    .attr("id", "barOutgoing");
  barGroupIncoming = svgChordDiagram
                                    .append("g").attr("transform", translateStrIncoming)
                                    .attr("id", "barIncoming");

  currentStationName = stations[indexOfStation].name;
  outgoingRidership = matrix[indexOfStation];
  incomingRidership = matrix.map(function(d) { return d[indexOfStation]; });
  stationNames = stations.map(function(d) { return d.name; });
  stationColors = stations.map(function(d) { return d.color; });

  // Creating bar chart Outgoing dataset
  var barChartOutgoingDataset = new Array();
  for (i=0; i<stationNames.length; ++ i) {
    barChartOutgoingDataset.push([stationNames[i], outgoingRidership[i], stationColors[i]]);
  }
  
  // Sorting Outgoing data
  barChartOutgoingDataset.sort(function(a, b) {
    if (a[1] > b[1]) { return -1; }
    if (a[1] < b[1]) { return 1; }
    return 0;
  })

  // Creating bar chart Incoming dataset
  var barChartIncomingDataset = new Array();
  for (i=0; i<stationNames.length; ++ i) {
    barChartIncomingDataset.push([stationNames[i], incomingRidership[i], stationColors[i]]);
  }

  // Sorting Incoming data
  barChartIncomingDataset.sort(function(a, b) {
    if (a[1] > b[1]) { return -1; }
    if (a[1] < b[1]) { return 1; }
    return 0;
  })

  // Getting Max value in Matrix
  maxMatrixValue = getMax(matrix);

  // Calling function to render Bar Chartfor Outgoing traffic
  renderBarChartPerStation(barChartOutgoingDataset, barGroupOutgoing, maxMatrixValue);

  // Calling function to render Bar Chartfor Incoming traffic
  renderBarChartPerStation(barChartIncomingDataset, barGroupIncoming, maxMatrixValue);
}

// Function to Render bar chart
function renderBarChartPerStation(data, barGroup, maxMatrixValue) {
  // Deleting old DOM elements
  barGroup.selectAll("*").remove();

  var barHeight = 20,     // Height of bar
      textHeight = "13px",  // Height of text
      textOffsetInBar = 3,  // Lifts text from bottom of bar and pushes text from start of bar
      innerWidth = 200;

  // xScale to determine length bars
  var xScale = d3.scale.linear()
          .domain([0, maxMatrixValue])
          .rangeRound([0, innerWidth]);

  // Creating Bars
  var rects = barGroup
          .selectAll("rect").data(data);

  // Enter phase
  rects
    .enter().append("rect")
    .attr("height", barHeight);

  // Update phase
  rects
    .attr("y", function(d, i) {return i*barHeight;})
    .attr("width", function(d) {return xScale(d[1]);})
    .attr("fill", function(d) {
      r = parseInt("0x" + d[2].substring(1,3));
      g = parseInt("0x" + d[2].substring(3,5));
      b = parseInt("0x" + d[2].substring(5,7));
      rgbaStr = "rgba(" + r +","+ g +","+ b +","+ 0.5 +")"
      return rgbaStr;
    });

  // Exit phase
  rects
    .exit()
    .remove();

  // Writing Station names
  var texts = barGroup
          .selectAll("text").data(data);
  // Enter Phase
  texts
    .enter().append("text")
    .attr("x", textOffsetInBar);

  // Update Phase
  texts
    .attr("y", function(d, i) {return i*barHeight + (barHeight-textOffsetInBar);})
    .text(function(d) {
      t = d[0] + ": " + d[1];
      return t;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", textHeight)
    .attr("text-anchor", "start");

  // Exit Phase
  texts
    .exit()
    .remove();
}

function getMax(matrix) {
  flatArray = new Array();
  matrix.forEach(function(d) {
    flatArray = flatArray.concat(d);
  });
  return d3.max(flatArray);
}