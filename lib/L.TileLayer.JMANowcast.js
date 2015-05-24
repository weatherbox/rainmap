/**
 * L.TileLayer.JMANowcast - display JMA Nowcast tiles
 *   for leaflet.js v0.7.3
 *
 * 2015.05.17 Yuta Tachibana
 */


L.TileLayer.JMANowcast = L.TileLayer.extend({
	options: {
		bounds: L.latLngBounds([7, 100], [61, 170]),
		zoom: [2, 4, 6],
		correspondedZoom: function(zoom) {
			return (zoom <= 4) ? 2
		         : (zoom <= 6) ? 4
		                       : 6;
		},
		opacity: 0.7
	},
	
	initialize: function (url, options) {
		this.options.url = url;
		options = L.setOptions(this, options);
	},

	getTileUrl: function(tilePoint){
		return this.options.url + "zoom" + tilePoint.z + "/" + tilePoint.x + "_" + tilePoint.y + ".png";
	},
	

	/**
	 *  Override functions
	 *
	 *  equirectangular projection -> spherical mercator
	 */
	_update: function () {
		if (!this._map) { return; }

		var map = this._map,
		    bounds = map.getBounds(),
		    zoom = map.getZoom();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		this._correspondedZoom = this.options.correspondedZoom(zoom);
		var box = this.options.bounds,
			num_tiles = Math.pow(2, this._correspondedZoom);

		this._tile_lat = (box.getNorth() - box.getSouth()) / num_tiles,
		this._tile_lon = (box.getEast() - box.getWest()) / num_tiles;

		var p1 = L.point(
			Math.max(0, Math.floor((bounds.getWest() - box.getWest()) / this._tile_lon )),
			Math.max(0, Math.floor((box.getNorth() - bounds.getNorth()) / this._tile_lat ))
		);
		var p2 = L.point(
			Math.min(num_tiles-1, Math.floor((bounds.getEast() - box.getWest()) / this._tile_lon )),
			Math.min(num_tiles-1, Math.floor((box.getNorth() - bounds.getSouth()) / this._tile_lat ))
		);
		var tileBounds = L.bounds(p1, p2);


		this._addTilesFromCenterOut(tileBounds);

		if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
			this._removeOtherTiles(tileBounds);
		}
	},

	_tileShouldBeLoaded: function (tilePoint) {
		if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
			return false; // already loaded
		}
		return true;
	},

	_addTile: function (tilePoint, container) {
		tilePoint.z  = this._correspondedZoom;
		var tilePosNW = this._getTilePos(tilePoint.x, tilePoint.y);
		var tilePosSE = this._getTilePos(tilePoint.x + 1, tilePoint.y + 1);

		var origin = this._map.getPixelOrigin();
		var tilePos = tilePosNW.subtract(origin);

		// does not fixed tile size
		var width = tilePosSE.x - tilePosNW.x;
		var height = tilePosSE.y - tilePosNW.y;
		var tile = this._createTile(width, height);

		/*
		Chrome 20 layouts much faster with top/left (verify with timeline, frames)
		Android 4 browser has display issues with top/left and requires transform instead
		(other browsers don't currently care) - see debug/hacks/jitter.html for an example
		*/
		L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome);

		this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;

		this._loadTile(tile, tilePoint);

		if (tile.parentNode !== this._tileContainer) {
			container.appendChild(tile);
		}
	},

	_getTilePos: function (x, y) {
		// top left point of the tile
		var map = this._map,
			box = this.options.bounds,
			lat = box.getNorth() - this._tile_lat * y,
			lon = box.getWest() + this._tile_lon * x;

		return map.project([lat, lon]);
	},

	_createTile: function (width, height) {
		var tile = L.DomUtil.create('img', 'leaflet-tile');
		tile.style.width = width + "px"; 
		tile.style.height = height + "px";
		tile.galleryimg = 'no';

		tile.onselectstart = tile.onmousemove = L.Util.falseFn;

		if (L.Browser.ielt9 && this.options.opacity !== undefined) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}
		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.mobileWebkit3d) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer  = this;
		tile.onload  = this._tileOnLoad;
		tile.onerror = this._tileOnError;
		tile.src     = this.getTileUrl(tilePoint);

		this.fire('tileloadstart', {
			tile: tile,
			url: tile.src
		});
	}

});


L.tileLayer.JMANowcast = function (url, options) {
	return new L.TileLayer.JMANowcast(url, options);
};
