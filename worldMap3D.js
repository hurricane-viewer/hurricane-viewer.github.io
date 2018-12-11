
var context = document.getElementById('content').getContext('2d');

var width = window.innerWidth;
var height = window.innerHeight;
var size = d3.min([width, height]);

var landGeojson;

// , riversGeojson, lakesGeojson;

d3.select('#content')
  .attr('width', width + 'px')
  .attr('height', height + 'px');

var projection = d3.geoOrthographic()
  .scale(0.45 * size)
  .translate([0.5 * width, 0.5 * height]);

var geoGenerator = d3.geoPath()
  .projection(projection)
  .context(context);


function drawFeatures(features, fill) {
  context.beginPath();
  geoGenerator({type: 'FeatureCollection', features: features});
  fill ? context.fill() : context.stroke();
}

function update(t) {
  context.clearRect(0, 0, width, height);

  projection.rotate([-t / 1000 - 40])

  context.lineWidth = 1;
  context.strokeStyle = 'black';
  drawFeatures(landGeojson.features, false);

//   context.strokeStyle = '#3882bc';
//   context.lineWidth = 0.5;
//   drawFeatures(riversGeojson.features, false);

//   context.fillStyle = '#3882bc';
//   drawFeatures(lakesGeojson.features, true);

  window.requestAnimationFrame(update);
}



// REQUEST DATA
d3.json('ne.json', function(err, json) {
  landGeojson = topojson.feature(json, json.objects.ne_50m_admin_0_countries)  
//   riversGeojson = topojson.feature(json, json.objects.ne_10m_rivers_lake_centerlines)  
//   lakesGeojson = topojson.feature(json, json.objects.ne_10m_lakes)

  window.requestAnimationFrame(update); 
})