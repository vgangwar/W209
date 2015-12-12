// RiderShip comparison
var placeholderDiv = document.getElementById("divTotalTraffic");
var url = "https://public.tableau.com/shared/4Q75KWXF7?:display_count=yes";
var options = {
   hideTabs: true,
   width: "1050px",
   height: "700px",
   onFirstInteractive: function() {
     // The viz is now ready and can be safely used.
   }
};
var viz = new tableau.Viz(placeholderDiv, url, options);


// Rail Map
var placeholderDiv = document.getElementById("divTableauRailMap");
var url = "https://public.tableau.com/views/stations-map/Stations?:embed=y&:display_count=yes&:showTabs=y";
var options = {
   hideTabs: true,
   width: "1000px",
   height: "700px",
   onFirstInteractive: function() {
     // The viz is now ready and can be safely used.
   }
};
var viz = new tableau.Viz(placeholderDiv, url, options);

//Revenue
var placeholderDiv = document.getElementById("divTableauRevenueMap");
var url = "https://public.tableau.com/views/w209final-metrorail-revenue/RevenueHeatmap?:embed=y&:display_count=yes&:showTabs=y";
var options = {
   hideTabs: true,
   width: "1000px",
   height: "700px",
   onFirstInteractive: function() {
     // The viz is now ready and can be safely used.
   }
};
var viz = new tableau.Viz(placeholderDiv, url, options);

//Heat map
var placeholderDiv = document.getElementById("divTableauMigrationsMap");
var url = "https://public.tableau.com/views/w209-final-reports-v1/Heatmap-Migration?:embed=y&:display_count=yes&:showTabs=y";
var options = {
   hideTabs: true,
   width: "1000px",
   height: "900px",
   onFirstInteractive: function() {
     // The viz is now ready and can be safely used.
   }
};
var viz = new tableau.Viz(placeholderDiv, url, options);