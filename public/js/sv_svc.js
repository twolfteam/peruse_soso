/*
** Copyright 2014 Google Inc.
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

define(['sosomaps','jquery'], function(QMaps,$) {
  // provide StreetViewService as a singleton in this module
  var sv_svc = new QMaps.PanoramaService();

  // extensions to getPanoramaByLocation:
  // optional expansion to max_radius
  // pass original search latlng to the callback
  function getPanoramaByLocation(latlng, radius, cb, max_radius) {
    var search_opts = {
      latlng: latlng,
      radius: radius,
      max_radius: max_radius || radius,
      cb: cb
    };

    sv_svc.getPano(
      latlng,
      radius,
      expandingCB.bind(search_opts)
    );
  }

  // recursive callback for expanding search
  function expandingCB(data) {
    if (data !== null) {
      // success
      this.cb(data, this.latlng);

    } else if (this.radius < this.max_radius) {
      // expand the search
      this.radius *= 2;
      if (this.radius > this.max_radius)
        this.radius = this.max_radius;

      getPanoramaByLocation(
        this.latlng,
        this.radius,
        this.cb,
        this.max_radius
      );

    } else {
      // failure
      this.cb(data, this.latlng);
    }
    // explicit cleanup
    delete this;
  }
  
  function getPanoramaById(panoid,cb)
  {
	  var data = null;
	  if (panoid.match(/^\d+$/))
	  {
	  $.getJSON("http://apis.map.qq.com/ws/streetview/v1/getpano?id="+panoid+"&radius=100&key=S5PBZ-MX53W-2AHRY-R7Y5S-WTCW6-OLFRF&output=jsonp&callback=?",
	  function(ret) {
		if(ret.status == 0)
		{
			
			data = {svid:ret.detail.id,latlng:new QMaps.LatLng(ret.detail.location.lat,ret.detail.location.lng),description:ret.detail.description};
		}	 
		  cb(data);
	  });	
	  }
  }
 
  // make StreetViewPanoramaData friendlier
  /*function serializePanoData(panoData) {
    panoData.location.latLng = {
      lat: panoData.location.latLng.lat(),
      lng: panoData.location.latLng.lng()
    };
  }*/
  function getPanoramaByOffset(from, distance, heading, maxDis, cb, panoid, dir)
  {
    var nextLoc = QMaps.geometry.spherical.computeOffset(from, dir*distance, heading);  
	var search_opts = {
        latlng: nextLoc,           //update data
        distance: distance,        //update data
        maxDis: maxDis || distance, //constant data
        cb: cb,
		heading: heading,        //constant data
		from: from,              //constant data
		panoid: panoid,       //constant data
		dir: dir             //constant data
        }; 
		 
	sv_svc.getPano(
      nextLoc,
      distance,
      expandingOB.bind(search_opts)
    );	 
	
  }
  
  function expandingOB(data) {
    if(data != null&&data.svid != this.panoid) {
			this.cb(data);
		} 	
	else if (this.distance < this.maxDis) {
		this.distance = this.distance*2;
		if (this.distance > this.maxDis)
		    this.distance = this.maxDis;
		getPanoramaByOffset(
			this.from, 
			this.distance, 
			this.heading, 
			this.maxDis, 
			this.cb, 
			this.panoid, 
			this.dir )
		}
	else {
           // failure
		  this.cb(data);
		}
		   // explicit cleanup
         delete this;
	  }

  return {
    //no getPanoramaById for soso
	// passthrough ID search
	getPanoramaById: getPanoramaById,
    // use our wrapped location search
    getPanoramaByLocation: getPanoramaByLocation,
    //no need for soso
    //serializePanoData: serializePanoData
    //given source position, heading ,distance, solve destination position
	getPanoramaByOffset: getPanoramaByOffset,
  }
});
