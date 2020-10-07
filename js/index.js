init();

function init() {
    loadCSV();
    fetchData();
}

function fetchData() {
    d3.csv("./data/restaurants.csv", function(error, data) {
        if (error) throw error;
        data.forEach(function(d) {
            d.Value = +d.Value;
        })
        restaurantData = data;
        createMap(restaurantData);
        createCharts();
    });
};

var test;

/*Function to create the map*/
function createMap(data) {

    var restaurants = data;
    var map = L.map("map");
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);
    map.setView([33.4225106, -111.936653], 15.5);
    var myRenderer = L.canvas({
        padding: 0.5
    });

    var geojsonMarkerOptions = {
        radius: 5,
        fillColor: "#FF8033",
        color: "#FAC3A2",
        weight: 2,
        opacity: 1,
        fillOpacity: 1
    };

    var bounds = L.latLng(33.4225106, -111.936653).toBounds(300);
    var inRangeRestaurants = [],
    latlng_a = new L.LatLng(33.4225106, -111.936653),
    latlng_b;

    data.forEach(function(location) {
        latlng_b = new L.LatLng(location["latitude"], location["longitude"]);
        if (latlng_a.distanceTo(latlng_b) == 0) {
                    test = location["business_id"]
        }
        if (latlng_a.distanceTo(latlng_b) < 300) {
            inRangeRestaurants.push(location);
        }
    });

    for (var i = 0; i < restaurants.length; i += 1) {

        L.circleMarker([restaurants[i]["latitude"], restaurants[i]["longitude"]], geojsonMarkerOptions).bindPopup(restaurants[i]["name"], {
            renderer: myRenderer,
            radius: 1
        }).addTo(map).bindPopup(restaurants[i]["name"]).on('click', function(e) {

            inRangeRestaurants = [],
                latlng_a = new L.LatLng(e.latlng.lat, e.latlng.lng),
                latlng_b;

            data.forEach(function(location) {

                latlng_b = new L.LatLng(location["latitude"], location["longitude"]);
                if (latlng_a.distanceTo(latlng_b) == 0) {
                    test = location["business_id"]
                }
                if (latlng_a.distanceTo(latlng_b) < 300) {
                    inRangeRestaurants.push(location);
                }
            });
            d3.select(".chart").remove();
            d3.select(".cuisineChart").remove();
            d3.select(".checkins").remove();
            d3.select(".reviews").remove();
            d3.select(".rating").remove();
            d3.select(".ratings").remove();
            d3.select(".tornado").remove();

            //insertTitles();
            createCharts();
            drawPieChart(test);
            createWordBubble(test);

        });
    }
}

function createCharts(){

    d3.csv("./data/ratings_and_reviews_yearwise.csv", function(data1) {

        var chart_data = [];

        data1.forEach(function(d) {
            var input_business = d.business_id;

            if (test == input_business) {
              var parseDate = d3.timeParse("%Y");
              var record = {"year":parseDate(d.year.toString()), "rating": Number(d.stars), "reviews": Number(d.review_count)}
              chart_data.push(record);
            }
        });

        // Defining the margin for the chart
        var margin = {top: 60, right: 20, bottom: 50, left: 70},
            width = 340
            height = 200

        // Scaling the x-axis
        var xScale = d3.scaleTime()
                       .rangeRound([0, width]); 
        xScale.domain(d3.extent(chart_data, function(d){ return d.year;}))

        // Scaling the y-axis
        var yScale = d3.scaleLinear()
                        .domain([0, 5]) // input
                        .range([height, 0]); // output

        // d3 line generator
        var line = d3.line()
                      .x(function(d) { return xScale(d.year); }) // x values for the line generator
                      .y(function(d) { return yScale(d.rating); }) // y values for the line generator

        // Selecting the HTML div and adding a new SVG element for the line chart
        var svg = d3.select("#charts").append("svg").attr("class", "ratings").style("display", "inline")
                    .attr("width", 500)
                    .attr("height", 350)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Creating the x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)) // Create an axis component with d3.axisBottom

        svg.append("text")
              .attr("transform",
                    "translate(" + (width/2) + " ," +
                                   (height + margin.top - 15) + ")")
              .style("text-anchor", "middle")
              .text("Year of Review");

        // Creating the y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale)) 

        svg.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 20 - margin.left)
              .attr("x",0 - (height / 2))
              .attr("dy", "1em")
              .style("text-anchor", "middle")
              .text("Average Rating");

        // Adding chart title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 5 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("text-decoration", "underline")
            .text("Annual Average Rating of the Restaurant");


        // Appending a path to draw the line, bind the data, and call the line generator
        svg.append("path")
            .datum(chart_data) // Bind data to the line
            .attr("class", "line") 
            .attr("d", line); 

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Adding a circle for each datapoint
        svg.selectAll(".dot")
            .data(chart_data)
            .enter()
            .append("circle") 
            .attr("class", "dot") 
            .attr("cx", function(d) { return xScale(d.year) })
            .attr("cy", function(d) { return yScale(d.rating) })
            .attr("r", 5)
            .on("mouseover", function(d) {

              var matrix = this.getScreenCTM().translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));

              div.style("width","110px");
              div.style("height","20px");
              div.transition()
                        .duration(200)
                        .style("opacity", 1);
              div.html("Average Rating: " + Math.round(d.rating * 100) / 100)
                        .style("left", (window.pageXOffset + matrix.e - 55) + "px")
                        .style("top", (window.pageYOffset + matrix.f - 45) + "px");
             d3.select(this).attr("r", 10)

            }).on("mouseout", function(d) {
              div.transition()
                        .duration(500)
                        .style("opacity", 0);
              d3.select(this).attr("r", 5)
            });


// Constructing the bar chart

      // Selection 

      // append the svg object to the body of the page
      // append a 'group' element to 'svg'
      // moves the 'group' element to the top left margin
      var svg = d3.select("#charts")
                  .append("svg")
                  .attr("class", "reviews")
                  .style("display", "inline")
                  .attr("width", 500)
                  .attr("height", 350)
                  .append("g")
                  .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

      var parseDate = d3.timeParse("%Y");

      // Defining the x and y axes
      var x = d3.scaleBand()
                .range([0, width])
                .padding(0.1);
                
      var y = d3.scaleLinear()
                .range([height, 0]);

      // get the data
      // format the data
      // Scale the range of the data in the domains
      x.domain(chart_data.map(function(d) { return d.year; }));
      y.domain([0, d3.max(chart_data, function(d) { return d.reviews; })]);


      var div = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

      // Data Visualization

      // append the rectangles for the bar chart
      svg.selectAll(".bar")
        .data(chart_data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.year); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.reviews); })
        .attr("height", function(d) { return height - y(d.reviews); })

        .on("mouseover", function(d) {
              var matrix = this.getScreenCTM()
                  .translate(+ this.getAttribute("x"), + this.getAttribute("y"));
              div.style("height", "20px")
              div.style("width", "60px")
              div.transition()
                  .duration(200)
                  .style("opacity", 1);
              div.html("Count:" + d.reviews)
                  .style("left", (window.pageXOffset + matrix.e) + "px")
                  .style("top", (window.pageYOffset + matrix.f - 30) + "px");
              })
        .on("mouseout", function(d) {
              div.transition()
                  .duration(500)
                  .style("opacity", 0);
          });

      // Adding the y-axis

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Reviews");
      svg.append("g")
        .call(d3.axisLeft(y));

      // Adding the x-axis

      svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.top - 15) + ")")
        .style("text-anchor", "middle")
        .text("Year of Review");
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

      // Adding the chart title
      svg.append("text")
          .attr("x", (width / 2))
          .attr("y", 5 - (margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "18px")
          .style("text-decoration", "underline")
          .text("Annual Number of Reviews");

    });


// Constructing the vertical bar chart

    d3.csv("./data/final.csv", function(data) {
      data.forEach(function(d) {
        var player = d.business_id;
        if (test == player) {
          var dat = [{"weekday":"Monday", "checkins":Number(d.Monday)}, {"weekday":"Tuesday", "checkins":Number(d.Tuesday)},{"weekday":"Wednesday", "checkins":Number(d.Wednesday)},{"weekday":"Thursday", "checkins":Number(d.Thursday)},{"weekday":"Friday", "checkins": Number(d.Friday)}, {"weekday":"Saturday", "checkins":Number(d.Saturday)},{"weekday":"Sunday", "checkins":Number(d.Sunday)}]
          var margin = {top: 60, right: 30, bottom: 50, left: 70},
          width = 390//960 - margin.left - margin.right,
          height = 200//500 - margin.top - margin.bottom;
          var svg = d3.select("#charts")
                      .append("svg")
                      .attr("class", "checkins")
                      .style("display", "inline")
                      .attr("width", 500)
                      .attr("height", 350)
                      .append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          var x = d3.scaleLinear().range([0, width]).domain([0, d3.max(dat, function(d) {
              return d.checkins;
          })]);
          var y = d3.scaleBand().rangeRound([0, height]).padding(0.1).domain(dat.map(function(d) {
              return d.weekday;
          }));
          var xAxis = d3.axisBottom().scale(x);
          var yAxis = d3.axisLeft().scale(y);
          var gy = svg.append("g").attr("class", "y axis").call(yAxis)
          var bars = svg.selectAll(".bar").data(dat).enter().append("g")
          //append rects
          bars.append("rect").attr("class", "bar").attr("y", function(d) {
              return y(d.weekday);
          }).attr("height", y.bandwidth()).attr("x", 0).attr("width", function(d) {
              return x(d.checkins);
          });
          bars.append("text").attr("class", "label").attr("y", function(d) {
              return y(d.weekday) + y.bandwidth() / 2 + 4;
          }).attr("x", function(d) {
              return x(d.checkins) + 3;
          }).text(function(d) {
              return d.checkins;
          });
          
          svg.append("text")
              .attr("x", (width / 2))
              .attr("y", 5 - (margin.top / 2))
              .attr("text-anchor", "middle")
              .style("font-size", "18px")
              .style("text-decoration", "underline")
              .text("Weekly Check-In Distribution");

        }

      });
    });
}

function drawPieChart(business_id) {

    // Ensure that the SVG is empty
    d3.select("#pie-chart").remove();

    // Loading data from CSV file
    var pieData = d3.csv("./data/review_count_per_sentiment.csv", function(error, pieData) {

    var positive = 0;
    var negative = 0;
    var neutral = 0;

    // Reading the data values (reviews) from the CSV file
    pieData.forEach(function(d) {
      if (d.business_id === business_id) {
        positive = parseInt(d.positive_review_count)
        negative = parseInt(d.negative_review_count)
        neutral = parseInt(d.neutral_review_count)
      }
    });

    total = positive + negative + neutral
    var data = [(positive * 100 / total).toFixed(2), (neutral * 100 / total).toFixed(2), (negative * 100 / total).toFixed(2)];
    var labels = []
    var margin = {top: 0, right: 20, bottom: 50, left: 70}

    var width = 500,
      height = 500,
      radius = Math.min(width, height) / 2;

    // Defining the colors of the pie sectors
    var color = d3.scaleOrdinal()
      .range(["#34cbcb", "#FF8080", "#C2C9D1"]);

    // Defining the arcs
    var arc = d3.arc()
              .outerRadius(radius - 10)
              .innerRadius(0);

    var labelArc = d3.arc()
                  .outerRadius(radius - 40)
                  .innerRadius(radius - 40);

    // Defining the pie
    var pie = d3.pie()
              .sort(null)
              .value(function(d) { return d; });


    // Defining the SVG element that would contain the pie chart
    var svg = d3.select("#sentiment").append("svg")
              .attr("id","pie-chart")
              .attr("height", 600)
              .style("display", "inline")
              .style("float", "left")
              .style("width", "50%")
              .append("g")
              .attr("transform", "translate(" + window.innerWidth / 4 + "," + 300 + ")")

    // Adding legend to the pie chart
    d3.select("#pie-chart")
        .append("circle")
        .attr("cx", 100)
        .attr("cy", 130)
        .attr("r", 6)
        .style("fill", "#34cbcb")
    d3.select("#pie-chart")
        .append("text")
        .attr("x", 110)
        .attr("y", 130)
        .text("Positive")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")

    d3.select("#pie-chart")
        .append("circle")
        .attr("cx",100)
        .attr("cy",160)
        .attr("r", 6)
        .style("fill", "#C2C9D1")
    d3.select("#pie-chart")
        .append("text")
        .attr("x", 110)
        .attr("y", 160)
        .text("Neutral")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")

    d3.select("#pie-chart")
        .append("circle")
        .attr("cx",100)
        .attr("cy",190)
        .attr("r", 6)
        .style("fill", "#FF8080")
    d3.select("#pie-chart")
        .append("text")
        .attr("x", 110)
        .attr("y", 190)
        .text("Negative")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")

    // Adding chart title
    svg.append("text")
        .attr("x", 0)             
        .attr("y", -260)
        .attr("text-anchor", "middle")  
        .style("font-size", "18") 
        .style("text-decoration", "underline")  
        .text("Sentiment Split across Customer Reviews");

    // Generating the groups/sectors and binding data to the same
    var g = svg.selectAll(".arc")
               .data(pie(data))
               .enter().append("g")
               .attr("class", "arc");

    // Drawing the arcs
    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data); });

    // Adding labels to each sector
    g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("font-size", "1.5em")
        .text(function(d) { return d.data + "%"; });


  });
}


var data1 = [];
var flag = true;

// Function to load data for the word bubble chart
function loadCSV(){
    d3.csv('./data/word_bubble_data.csv', function(error, data) {
        if (error) throw error;
        data.forEach(function(d){
             var record = {"business_id": d.business_id, "stars": Number(d.stars), "keys": (d.keys), "dict":(d.dict)}
             data1.push(record)
        });
    });

};

function createWordBubble(business_id){

    // Ensure that the SVG is empty    
    d3.select('.starts').remove();
    d3.select('#word-bubble').remove();
    d3.selectAll('.star.rating').remove();


    var rating = 5;
    var size = 600
    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    // Defining the SVG element to contain the word bubble chart
    var chart = d3.select("#sentiment")
                .append('svg')
                .attr("id","word-bubble")
                .attr("width", size)
                .attr("height", size + 200)
                .style("display", "inline")
                .style("float", "right")
                .style("width", "50%");

    // Chart title
    d3.select("#word-bubble").append("text")
            .attr("x", size / 2)             
            .attr("y", 20)
            .attr("text-anchor", "middle")  
            .style("font-size", "20") 
            .style("text-decoration", "underline")  
            .text("Frequently used words in customer reviews");

    // Defining a pack to lay out the hierarchy of nodes
    var pack = d3.pack()
      .size([size, size])
      .padding(size*0.005);


    data1.forEach(function(d){
        var restaurant = d.business_id
        var input_rating = d.stars
        if (test == restaurant && input_rating == rating) {

            // Reading word counts from a JSON object 
            keys = JSON.parse(d.keys)
            counts = JSON.parse(d.dict)

            // Sort the words by their counts
            keys.sort(function(a,b) {
                return counts[b] - counts[a];
            });

            // Only keep words that occur 10 or more times
            keys = keys.filter(function(key) {
                return counts[key] >= 5 ? key : '';
            });

            var root = d3.hierarchy({children: keys})
                        .sum(function(d) { return counts[d]; });

            // Defining the nodes for each word found in the hierarchy
            var node = chart.selectAll(".node")
                            .data(pack(root)
                            .leaves())
                            .enter()
                            .append("g")
                            .attr("class", "node")
                            .attr("transform", function(d) { return "translate(" + d.x + "," + (d.y + 30)  + ")"; });

            // Drawing a circle for each node
            node.append("circle")
               .attr("id", function(d) { return d.data; })
               .attr("r", function(d) { return d.r; })
               .style("fill", function(d) { return color(d.data); });

            node.append("clipPath")
                .attr("id", function(d) { return "clip-" + d.data; })
                .append("use")
                .attr("xlink:href", function(d) { return "#" + d.data; });

            // Displaying the word inside each bubble
            node.append("text").attr("class", "bubbleText")
                .attr("clip-path", function(d) { return "url(#clip-" + d.data + ")"; })
                .append("tspan")
                .attr("x", 0)
                .attr("y", function(d) { return d.r/8; })
                .attr("font-size", function(d) { return d.r/2; })
                .text(function(d) { return d.data; });

            // Displaying the word count inside each bubble
            node.append("text").attr("class", "bubbleText")
                .attr("clip-path", function(d) { return "url(#clip-" + d.data + ")"; })
                .append("tspan")
                .attr("x", 0)
                .attr("y", function(d) { return d.r/8+d.r/2; })
                .attr("font-size", function(d) { return d.r/2; })
                .text(function(d) { return counts[d.data]; });
        }


    });

}
