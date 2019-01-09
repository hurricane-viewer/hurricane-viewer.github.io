'use strict'

//Marges
var margin = {top: 20, right: 20, bottom: 110, left: 40},
	margin2 = {top: 420, right: 30, bottom: 30, left: 40},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom,
	height2 = 500 - margin2.top - margin2.bottom;
	
//Couleurs pour les cercles (Blind frendly ; photocopy, LCD et print friendly)
var red = "#de2d26";
var green = "#31a354";


/**/


//Fonctions pour le parsage/formatage des dates/valeurs
var parseDate = d3.timeParse("%Y-%m-%d");
var displayYear = d3.timeFormat("%Y");
var displayValue = d3.format(",.0f");

//Echelle temporelle en X (temps)
var x = d3.scaleTime().range([0, width - margin.right]);
var xc = d3.scaleTime().range([0, width - margin.right]);
var xAxis = d3.axisBottom().scale(x);
var xcAxis = d3.axisBottom().scale(xc);
	
//Echelle linéaire en Y (température)
var y = d3.scaleLinear().range([height, 0]);
var yc = d3.scaleLinear().range([height2, 0]);
var yAxis = d3.axisLeft().scale(y);

//Echelle ordinale en X et linéaire en Y (nombre d'ouragans)
var xtorn =  d3.scaleBand().range([0, width - margin.right]);
var ytorn =  d3.scaleLinear().range([0, height]);


/**/


//Préparation de la courbe joignant les données
var line = d3.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return y(d.value); })
	.curve(d3.curveBasis);
	
var lineContext = d3.line()
	.x(function(d) { return xc(d.date); })
	.y(function(d) { return yc(d.value); })
	.curve(d3.curveBasis);


//Préparation pour zoom et déplacement

var brush = d3.brushX()
	.extent([[0, 0], [width - margin.right, height2]])
	.on("brush end", brushed);
	
var zoom = d3.zoom()
	.scaleExtent([1, Infinity])
	.translateExtent([[0, 0], [width, height]])
	.extent([[0, 0], [width, height]])
	.on("zoom", zoomed);


/**/


var svg;
var context;
var focus;
var line_chart;
var bars_chart;

var clip;

var torn;


function PlanetHeating(svg_param) {
	
    //Canvas SVG dans lequel dessiner les graphiques
    svg = svg_param
		.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top / 2) + ")");
	
	
	//Séparation de l'espace svg en deux (context = partie inférieure, focus = zone principale)
	context = svg.append("g")
		.attr("transform", "translate(" + 0 + "," + margin2.top + ")")
		.attr("id", "context");
	focus = svg.append("g").attr("id", "focus");
	line_chart = focus.append("g").attr("clip-path", "url(#clip)");
	bars_chart = svg.append("g").attr("id", "bars");
	
	
    //Noms des axes
    focus.append("text")
      .attr("x", 15)
      .attr("y", 10)
	  .attr("class", "axis_title")
	  .text("Écart par rapport à la température moyenne");
    focus.append("text")
      .attr("x", 15)
      .attr("y", 30)
	  .attr("class", "axis_title")
	  .text("de référence (1951-1980) en °C");
    focus.append("text")
      .attr("x", width - 70)
      .attr("y", height - 15)
	  .attr("class", "axis_title")
      .text("Années");
    
		
	clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width - margin.right)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);
	
	
	//Attend le chargement des jeux de données avant exécution de la suite
	d3.queue()
	  .defer(d3.csv, "./json/monthly_csv.csv")
	  .defer(d3.csv, "./json/storms.csv")
	  .await(createChart);
}



	
function createChart(error, temperatures, tornadoes) {
  if (error) { console.log(error); }
  
  tornadoes.forEach(dat => {
	dat.timestamp = new Date(dat.time)
	dat.lat = +dat.lat
	dat.lon = +dat.lon
	dat.wind = +dat.wind
	dat.pres = +dat.pres
	dat.year = +dat.year
  })
  tornadoes = nestById(tornadoes);
  
  //Filtre des données
  var temperatures = temperatures.filter(function (d){
		return d.Source == "GISTEMP";
	  });
	  
  //Parsage des dates
  temperatures.forEach(function(d) {
	d.date = parseDate(d.Date);
	d.value = +d.Mean;
  });
  //Parsage des dates et formatage pour affichage
  tornadoes.forEach(function(d) {
	d.date_start = d3.min(d.values, function(da) { return da.timestamp });
	d.date_end = d3.max(d.values, function(da) { return da.timestamp });
	
	d.year_start = displayYear(d.date_start);
	d.year_end = displayYear(d.date_end);
  });
  
  //Calcul du nombre d'ouragans par an
  var nb_tornadoes = computeNbTornadoes(tornadoes);
  
  //Ajustement des échelles
  x.domain(d3.extent(temperatures, function(d) { return d.date; }));
  y.domain(d3.extent(temperatures, function(d) { return d.value; }));
  
  xc.domain(x.domain());
  yc.domain(y.domain());
  
  xtorn.domain(nb_tornadoes.map(function(d) { return d.date; }));
  ytorn.domain([0, d3.max(nb_tornadoes, function(d) { return d.nb; })]);
  
  torn = nb_tornadoes;
  
  //Contenu du graphique
  displayTemp(temperatures);
  displayTorn(nb_tornadoes);
  
  //Mise à jour des axes
  focus.append("g")
	.attr("class", "axis axis--x")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);
  focus.append("g")
	.attr("class", "axis axis--y")
	.attr("transform", "translate(0,0)")
	.call(yAxis);
  context.append("g")
	.attr("class", "axis axis--x")
	.attr("transform", "translate(0," + height2 + ")")
	.call(xcAxis);
}



//Gestion des données de températures
function displayTemp(data) {
  
  //Préparation de la coloration des courbes
  focus.append("linearGradient")
	  .attr("id", "temperature-gradient")
	  .attr("gradientUnits", "userSpaceOnUse")
	  .attr("x1", 0).attr("y1", y(-0.2))
	  .attr("x2", 0).attr("y2", y(+0.2))
	.selectAll("stop")
	  .data([
			  {offset: "0%", color: "green"},
			  {offset: "50%", color: "green"},
			  {offset: "50%", color: "red"},
			  {offset: "100%", color: "red"}
			])
	  .enter().append("stop")
		  .attr("offset", function(d) { return d.offset; })
		  .attr("stop-color", function(d) { return d.color; });

  context.append("linearGradient")
	  .attr("id", "temperature-gradient-context")
	  .attr("gradientUnits", "userSpaceOnUse")
	  .attr("x1", 0).attr("y1", yc(-0.2))
	  .attr("x2", 0).attr("y2", yc(+0.2))
	.selectAll("stop")
	  .data([
			  {offset: "0%", color: "green"},
			  {offset: "50%", color: "green"},
			  {offset: "50%", color: "red"},
			  {offset: "100%", color: "red"}
			])
	  .enter().append("stop")
		  .attr("offset", function(d) { return d.offset; })
		  .attr("stop-color", function(d) { return d.color; });
  
  //Affichage de la ligne des températures
  line_chart.selectAll("path").data([data]).enter().append("path")
	.attr("class", "line")
	.attr("d", line);

  //Placement de la ligne de température moyenne
  focus.append("g")
	.attr("id", "mean_line")
	.attr("transform", "translate(0, " + y(0) + ")")
	.append("line")
	.attr("x2", width - margin.right);
	
  //Affichage de la ligne des températures (partie context)
  context.append("path")
	.datum(data)
	.attr("class", "line_context")
	.attr("d", lineContext);
	
  //Fenêtre sur laquelle la sélection d'un intervalle est possible (context)
  context.append("g")
	.attr("class", "brush")
	.call(brush)
	.call(brush.move, x.range());
  
  //Fenêtre sur laquelle l'action de zoom est possible (focus)
  svg.append("rect")
	.attr("class", "zoom")
	.attr("width", width - margin.right)
	.attr("height", height)
	.call(zoom);
}



//Gestion des données relatives aux ouragans, tornades...
function displayTorn(data) {
  //Remonte la zone au premier plan (par-dessus rect.zoom) pour permettre les event mouse
  bars_chart.raise();

  //Affichage de l'histogramme
  addTorn(data);
}

//Calcule le nombre d'ouragans, tornades, etc. par année
function computeNbTornadoes(data) {

  //Calcul du nombre par année
  var nb_tornadoes = new Object();
  data.forEach(function(d) {
	if (d.year_start != d.year_end) {
		if (Object.keys(nb_tornadoes).includes(d.year_end))
			nb_tornadoes[d.year_end] += 1;
		else 
			nb_tornadoes[d.year_end] = 1;
	}
	
	if (Object.keys(nb_tornadoes).includes(d.year_start))
		nb_tornadoes[d.year_start] += 1;
	else
		nb_tornadoes[d.year_start] = 1;
  });
  
  //Transformation de l'objet
  var tornadoes = [];
  for (var key in nb_tornadoes){
	var t = new Object();
	t["date"] = key;
	t["nb"] = nb_tornadoes[key];
	tornadoes.push(t);
  }
  
  return tornadoes;
}

function updateTorn(data) {
  //Suppression des anciennes marques
  bars_chart.selectAll("rect").remove();
  
  //Réajustement de l'échelle avant ajout des nouvelles marques
  xtorn.domain(data.map(function(d) { return d.date; }));
  addTorn(data);
}

function addTorn(data) {

  //Affichage des rectangles
  bars_chart.selectAll("rect").data(data)
	.enter().append("rect")
	.style("fill", "none")
	.style("stroke", "black")
	.attr("width", function(d) { return xtorn.bandwidth(); })
	.attr("height", function(d) { return ytorn(d.nb); })
	.attr("x", function(d) { return xtorn(d.date); })
	.attr("y",  function(d) { return height - ytorn(d.nb); });

}



//Gestion des actions de déplacement/redimensionnement de la fenêtre de la partie basse
function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  
  //Définition du nouveau domain en X
  var s = d3.event.selection || xc.range();
  x.domain(s.map(xc.invert, xc));
  
  //Mise-à-jour du linechart, de l'axe et du cadre
  line_chart.select(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
	  .scale((width - margin.right) / (s[1] - s[0]))
	  .translate(-s[0], 0));
	  
  //Filtrage des tornades selon les dates du nouvel intervalle pour affichage
  var newXExtent = s.map(xc.invert, xc);
  var newTornadoes = filterByDates(torn, newXExtent[0], newXExtent[1]);
  updateTorn(newTornadoes);
}

//Gestion des actions de zoom sur le graphique
function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  
  //Définition du nouveau domain en X
  var t = d3.event.transform;
  x.domain(t.rescaleX(xc).domain());
  
  //Mise-à-jour du linechart, de l'axe et du cadre
  line_chart.select(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
  
  //Filtrage des tornades selon les dates du nouvel intervalle pour affichage
  var newXExtent = t.rescaleX(xc).domain();
  var newTornadoes = filterByDates(torn, newXExtent[0], newXExtent[1]);
  updateTorn(newTornadoes);
}

//Filtre les données de manière à ne conserver que celles comprises entre deux dates
function filterByDates(data, date_start, date_end) {
  var newData = data.filter(function (d){
	  let date = new Date(d.date);
	  return date >= date_start && date <= date_end;
	});
  return newData;
}