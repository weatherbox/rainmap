/*
 * run-length compressed data
 *
 *  JMA styled run-length encoding
 *    LNGU = s ^ NBIT - MAXV - 1
 *    RL_n = LNGU ^ (n-1) * (data_n - NAXV - 1)
 *    RL = ΣRL_i + 1
 *  ref. http://www.data.jma.go.jp/add/suishin/jyouhou/pdf/108.pdf
 *
 *  2015.09.09 Yuta Tachibana
 **/
function decode_runlength_compress(buffer, nbit, maxv){
	var bin_data = new Buffer(2560*3360);
	var lngu = Math.pow(2, nbit) - 1 - maxv;
	var ninb = buffer.length;
	var i = 0;
	var p = -1;
	var m = 1;
	var n = 0;
	var k = 0;
	var v, j;

	while(i < ninb) {
		v = buffer.readUInt8(i);
		i++;
	//	console.log(i+"/"+ninb);
		if(v <= maxv) {
			if(p >= 0) {
				for(j = 0; j < m; j++) {
					bin_data.writeUInt8(p, k);
					k++;
				}
			}
			p = v;
			m = 1;
			n = 0;
		}else{
			m += Math.pow(lngu, n) * (v - maxv - 1);
			n++;
		}
	}
	
//	console.log(k+"/"+bin_data.length+":"+p);
	for(j = 0; j < m; j++) {
		if(k >= bin_data.length) break;
		bin_data.writeUInt8(p, k);
		k++;
	}
console.log("!!");
console.log(k+"/"+bin_data.length);
console.log(bin_data);
	return bin_data;
}


/*
 * Run Length Packing With Level Values Packing (GRIB2 template 5.200)
 *
 *	ref. http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_temp5-200.shtml
 *
 **/
function decode_with_level_packing(buffer, nbit, maxv, level_values){
	var bin_data = new Buffer(2*2560*3360);
	var lngu = Math.pow(2, nbit) - 1 - maxv;
	var ninb = buffer.length;
	var i = 0;
	var p = -1;
	var pv = 0;
	var m = 1;
	var n = 0;
	var k = 0;
	var v, j;

	while(i < ninb) {
		v = buffer.readUInt8(i);
		i++;
	//	console.log(k+"/"+ninb);
		if(v <= maxv) {
			if(p >= 0) {
				for(j = 0; j < m; j++) {
					bin_data.writeUInt16BE(pv, k);
					k += 2;
				}
			}
			p = v;
			pv = level_values[v];
			m = 1;
			n = 0;
		}else{
			m += Math.pow(lngu, n) * (v - maxv - 1);
			n++;
		}
	}
	
//	console.log(k+"/"+bin_data.length+":"+p);
	for(j = 0; j < m; j++) {
		if(k >= bin_data.length) break;
		bin_data.writeUInt16BE(pv, k);
		k += 2;
	}
console.log("!!");
console.log(k+"/"+bin_data.length);
console.log(bin_data);
	return bin_data;
}


module.exports = {
	decode: decode_runlength_compress,
	decode_with_level_packing: decode_with_level_packing
}
