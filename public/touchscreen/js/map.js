/*
** Copyright 2013 Google Inc.
**
** Licensed under the Apache License, Version 2.0 (the "License");
** you may not use this file except in compliance with the License.
** You may obtain a copy of the License at
**
**    http://www.apache.org/licenses/LICENSE-2.0
**
** Unless required by applicable law or agreed to in writing, software
** distributed under the License is distributed on an "AS IS" BASIS,
** WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
** See the License for the specific language governing permissions and
** limitations under the License.
*/

define(
[
  'config', 'bigl', 'stapes', 'mapstyle', 'sosomaps', 'sv_svc',
  // map submodules
  'map/coverage', 'map/svmarker', 'map/clicksearch', 'map/poimarkers',
  'map/earthpos'
],
function(
  config, L, Stapes, PeruseMapStyles, QMaps, sv_svc,
  // map submodules
  SVCoverageModule, SVMarkerModule, ClickSearchModule, POIMarkerModule,
  EarthPosModule
) {

  var MapModule = Stapes.subclass({
    constructor: function($canvas) {
      this.$canvas = $canvas;
      this.map = null;
    },

    init: function() {
      console.debug('Map: init');

      var self = this;
      this.index = 0;
      if (typeof QMaps === 'undefined') L.error('Maps API not loaded!');

      this.default_center = new QMaps.LatLng(
        config.touchscreen.default_center[0],
        config.touchscreen.default_center[1]
      );

      // use the improved visuals from the maps preview
      //QMaps.visualRefresh = true;

      var mapOptions = {
        backgroundColor: "black",
        center: this.default_center,
        zoom: 14,
        navigationControl: false,
		scaleControl: false,
		panControl: false,
		zoomControl: false,
        mapTypeControl: config.touchscreen.show_maptypectl,
        mapTypeControlOptions: {
          mapTypeIds: [ QMaps.MapTypeId.ROADMAP, QMaps.MapTypeId.HYBRID ],
          position: QMaps.ControlPosition.TOP_LEFT
        },
        mapTypeId: QMaps.MapTypeId.ROADMAP
      };

      this.map = new QMaps.Map(
        this.$canvas,
        mapOptions
      );

      //this.map.setOptions({styles: PeruseMapStyles});

      // instantiate map modules
      this.sv_coverage = new SVCoverageModule(this.map);
      this.sv_marker = new SVMarkerModule(this.map);
      this.poi_markers = new POIMarkerModule(this.map);
      this.click_search = new ClickSearchModule(this.map);
      this.earth_pos = new EarthPosModule(this.map);

      // handler for marker clicks
      this.poi_markers.on('marker_selected', function(panodata) {
        var latlng = panodata.latlng;
        var panoid = panodata.svid;

        self._broadcast_pano(panoid,panodata);
        self._pan_map(latlng);
        self.sv_marker.hide();
      });

      // handler for click search result
      this.click_search.on('search_result', function(panodata) {
        var latlng = panodata.latlng;
        var panoid = panodata.svid;

        self._broadcast_pano(panoid,panodata);
        self._pan_map(latlng);
        self.sv_marker.move(latlng);
      });

      // handler for earth position report
      this.earth_pos.on('found_location', function(panodata) {
        var latlng = panodata.latlng;
        var panoid = panodata.svid;

        self._broadcast_pano(panoid,panodata);
        self._pan_map(latlng);
        self.sv_marker.move(latlng);
      });

      // disable all <a> tags on the map canvas
      QMaps.event.addListenerOnce(this.map, 'idle', function() {
        var links = self.$canvas.getElementsByTagName("a");
        var len = links.length;
        for (var i = 0; i < len; i++) {
          links[i].style.display = 'none';
          links[i].onclick = function() {return(false);};
        }
      });

      // signal that the map is ready
      QMaps.event.addListenerOnce(this.map, 'idle', function() {
        console.debug('Map: ready');
        self.emit('ready');
      });
    },

    zoom_in: function() {
      this.map.setZoom(this.map.getZoom() + 1);
    },

    zoom_out: function() {
      this.map.setZoom(this.map.getZoom() - 1);
    },

    _pan_map: function(latlng) {
      this.map.panTo(latlng);
    },

    _broadcast_pano: function(panoid,data) {
      this.emit('pano', panoid);
	  if (data != null) {
            //sv_svc.serializePanoData(data);
            this.emit('meta', data);
	  }
    },

    add_location_by_id: function(panoid) {
      this.poi_markers.add_location_by_id(panoid);
    },

    // select is called when the streetview location is selected from the local
    // interface (poi).  it should pan the map, move the marker, and broadcast
    // the location to displays.
    select_pano_by_id: function(panoid) {
      var self = this;

      sv_svc.getPanoramaById(
        panoid,
        function (data) {
          if(data != null) {
            var result_latlng = data.latlng;
            var result_panoid = data.svid;

            self._broadcast_pano(result_panoid,data);
            self._pan_map(result_latlng);
            self.sv_marker.hide();
          } else {
            L.error('Map: select query failed!');
          }
        }
      );
    },

    // update is called when the streetview location is changed by display
    // clients.  it should pan the map and move the marker to the new location.
    update_pano_by_id: function(panoid) {
      var self = this;

      sv_svc.getPanoramaById(
        panoid,
        function (data) {
          if(data != null) {
			var result_latlng = data.latlng;
			var result_panoid = data.svid;

            self._pan_map(result_latlng);
            self.sv_marker.move(result_latlng);
          } else {
            L.error('Map: update query failed!');
          }
        }
      );
    },
	
	  update_marker_heading: function(heading) {
		  var self = this;	 
		  //var nindex = parseInt(heading/22.5)%16;
		  var nindex = parseInt(heading/30)%12;
          if(self.index!=nindex)  
		  {
			self.index = nindex;
			//self.sv_marker.setHdgIcon(nindex);
			self.sv_marker.setSosoHdgIcon(nindex);
		  }
	  },
  });

  return MapModule;
});