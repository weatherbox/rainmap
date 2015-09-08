/*
 * decode run-length compressed data
 *
 * 	JMA styled run-length encoding
 *		LNGU = s ^ NBIT - MAXV - 1
 *		RL_n = LNGU ^ (n-1) * (data_n - NAXV - 1)
 *		RL = ΣRL_i + 1
 *	ref. http://www.data.jma.go.jp/add/suishin/jyouhou/pdf/108.pdf
 *
 **/
function decode_runlength_compress(buffer, nbit, maxv){
	var bin_data = new Unit8Array(2560*3360);
	var lngu = Math.pow(2, nbit) - 1 - maxv;
	var ninb = buffer.length();
	var i = 0;
	var p = -1;
	var m = 1;
	var n = 0;
	var k = 0;
	var v, j;

	while(i <= ninb) {
		v = buffer.readInt8(i);
	   if(v <= maxv) {
			if(p >= 0) {
				for(j = 0; j < m; j++) {
					bin_data[k] = p;
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
	
	for(j = 0; j < m; j++) {
		bin_data[k] = p;
		k++;
	}

	return bin_data;
}
