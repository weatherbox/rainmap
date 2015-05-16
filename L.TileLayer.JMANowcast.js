/**
 * L.TileLayer.JMANowCast
 *
 *
 */


L.TileLayer.JMANowcast = L.TileLayer.extend({
	options: {


	},

	getTileUrl: function(tilePoint){
		console.log(tilePoint);
		return "http://www.jma.go.jp/jp/highresorad/highresorad_tile/HRKSNC/201505131635/201505131635/zoom2/2_1.png";
	}
	
});


L.tileLayer.JMANowcast = function (url, options) {
	return new L.TileLayer.JMANowcast(url, options);
};
