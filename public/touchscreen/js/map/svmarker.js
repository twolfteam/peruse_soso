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
['config', 'bigl', 'stapes', 'sosomaps'],
function(config, L, Stapes, QMaps) {

  var MIN_COVERAGE_ZOOM_LEVEL = 14;
  
  var SVMarkerModule = Stapes.subclass({
    constructor: function(map) {
      this.map = map;
      
      this.sv_marker = new QMaps.Marker({
        //position: this.default_center,
		position:new QMaps.LatLng(39.882326, 116.336088),
        title: 'Street View',
        //icon: 'icons/sv_sprite_bk.png',
        clickable: false
      });
	  this.sv_marker.setMap(this.map);
	  //this.setHdgIcon(0);
	  this.setSosoHdgIcon(0);
    },

    move: function(latlng) {
      this.sv_marker.setPosition(latlng);
      this.sv_marker.setMap(this.map);
    },

    hide: function() {
      this.sv_marker.setMap(null);
    },
	
	setHdgIcon: function(headingIndex) {
		var sWidth = 56.75*parseInt(headingIndex%4);
		var sHeight = 56.75*parseInt(headingIndex/4);
		var markerIcon = new QMaps.MarkerImage(
		"icons/sv_markers.png",
		new QMaps.Size(56.75,56.75),
		new QMaps.Point(sWidth,sHeight),
		new QMaps.Point(56.75/2,40)
		);
		this.sv_marker.setIcon(markerIcon);
	},
	
	setSosoHdgIcon: function(headingIndex) {
		var sWidth = 56.67*parseInt(headingIndex%3);
		var sHeight = 56.75*parseInt(headingIndex/3);
		var markerIcon = new QMaps.MarkerImage(
		"icons/sv_soso_markers.png",
		new QMaps.Size(56.67,56.75),
		new QMaps.Point(sWidth,sHeight),
		new QMaps.Point(56.67/2,32)
		);
		this.sv_marker.setIcon(markerIcon);
	}
  });

  return SVMarkerModule;
});
