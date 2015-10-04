var fs = require("fs");
var Grib2 = require("./grib2js/lib/grib/Grib2.js");
var rle = require("./runlength.js");

Grib2.index(process.argv[2], function(err, index){
	if(err) throw err;
	console.log(JSON.stringify(index, null, 2));
	
	// data
	var data_start = index.section7.stats.start + 5;
	var data_length = index.section7.stats.length - 5;

	fs.open(process.argv[2], "r", function(err, fd) {
		if(err) throw err;
		fs.read(fd, new Buffer(data_length), 0, data_length, data_start, function(err, bytesRead, buffer) {
			if(err) throw err;
			var bin_data = rle.decode_with_level_packing(buffer, 8, index.section5.maxv, index.section5.levelValues);
			fs.open("radar.bin", "w", function(err, out){
				fs.write(out, bin_data, 0, bin_data.length, 0, function(err){
					if(err) throw err;
				});
			});
			makeTiles(bin_data);
		});
	});

});



var tile_prefix = "data/tiles";

function makeTiles(bin_data) {

	for(var lat = 48; lat > 20; lat--){
		for(var lon = 118; lon < 150; lon++){
			var tile_name = tile_prefix + "/" + lat + "_" + lon + ".bin";
			var fd = fs.openSync(tile_name, "w");

			for(var l = 0; l < 120; l++){
				var offset = 2560 * (120 * (48 - lat) + l) + 80 * (lon - 118);
				var length = 80;
				var position = 80 * l;
				fs.writeSync(fd, bin_data, offset*2, length*2, position*2);
			}

			fs.closeSync(fd);
		}
	}
}
