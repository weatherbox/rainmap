var Grib2 = require("./grib2js/lib/grib/Grib2.js")

Grib2.index(process.argv[2], function(err, index){
	if(err) throw err
	console.log(JSON.stringify(index, null, 2))
})
