
var map = new L.Map("map", {center: new L.LatLng(37.892, 137.571), zoom: 6, zoomControl: false});

var google = L.tileLayer(
		'http://mt0.google.com/vt/lyrs=m@121&hl=ja&x={x}&y={y}&z={z}'
	).addTo(map);

var date = new Date(Date.now() - 5*60*1000); // 5 minutes before
var refTime = date.getUTCFullYear() + pad(date.getUTCMonth()+1) + pad(date.getUTCDate()) + pad(date.getUTCHours()) + pad(Math.floor(date.getUTCMinutes()/5)*5);

map.attributionControl.setPrefix(false);
map.attributionControl.addAttribution("<a href='http://www.jma.go.jp/jp/highresorad/'>High-resolution Precipitation Nowcasts</a> at " + refTime + " UTC");

var nowcast = L.tileLayer.JMANowcast(
		"http://www.jma.go.jp/jp/highresorad/highresorad_tile/HRKSNC/" + refTime + "/" + refTime + "/"
	).addTo(map);

function pad(d){
	return ("0" + d).slice(-2);
}
