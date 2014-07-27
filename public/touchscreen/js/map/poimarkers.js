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
['config', 'bigl', 'stapes', 'sosomaps', 'sv_svc'],
function(config, L, Stapes, QMaps, sv_svc) {

  var POIModule = Stapes.subclass({
    constructor: function(map) {
      this.map = map;
    },

    _add_location_marker: function(panodata) {
      var self = this;

      var latlng = panodata.latlng;
      var name   = panodata.description;
      var panoid = panodata.svid;

      var marker = new QMaps.Marker({
        position  : latlng,
        title     : name,
        clickable : true,
        map       : this.map
      });

      QMaps.event.addListener(marker, 'click', function(mev) {
        self.emit('marker_selected', panodata);
      });
    },

    add_location_by_id: function(panoid) {
      var self = this;

      sv_svc.getPanoramaById(
        panoid,
        function (panodata) {
          if(panodata != null) {
            self._add_location_marker(panodata);
          } else {
            L.error('POIMarker: location query failed!');
          }
        }
      );
    }
  });

  return POIModule;
});
