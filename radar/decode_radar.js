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
		});
	});

})
