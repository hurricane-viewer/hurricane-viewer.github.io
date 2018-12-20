
var context = document.getElementById('content').getContext('2d');

var width = window.innerWidth;
var height = window.innerHeight;
var size = d3.min([width, height]);

var landGeojson;

// , riversGeojson, lakesGeojson;

d3.select('#content')
  .attr('width', width + 'px')
  .attr('height', height + 'px');

var projection = d3.geoNaturalEarth1()
  .rotate([216, 0, 0]);

var geoGenerator = d3.geoPath()
  .projection(projection)
  .context(context);


function drawFeatures(features, fill) {
  context.beginPath();
  geoGenerator({ type: 'FeatureCollection', features: features });
  fill ? context.fill() : context.stroke();
}

function draw() {

  context.clearRect(0, 0, width, height);

  context.lineWidth = 1;
  context.strokeStyle = 'black';
  drawFeatures(landGeojson.features, false);

}

function update(t) {

  projection.rotate([-t / 1000 - 40])

  draw();

  //   context.strokeStyle = '#3882bc';
  //   context.lineWidth = 0.5;
  //   drawFeatures(riversGeojson.features, false);

  //   context.fillStyle = '#3882bc';
  //   drawFeatures(lakesGeojson.features, true);

  window.requestAnimationFrame(update);
}

function dragged() {

  d = d3.event.x;

  projection.rotate([d])

  draw();


}

// REQUEST DATA
d3.json('ne.json', function (err, json) {
  landGeojson = topojson.feature(json, json.objects.ne_50m_admin_0_countries)
  //   riversGeojson = topojson.feature(json, json.objects.ne_10m_rivers_lake_centerlines)  
  //   lakesGeojson = topojson.feature(json, json.objects.ne_10m_lakes)


  draw();

  d3.select("#content").call(d3.drag().on("drag", dragged));

  // var drag = d3.drag(d3.select('#content'))
  //   .on("drag", dragged);

  // window.requestAnimationFrame(update);
})

