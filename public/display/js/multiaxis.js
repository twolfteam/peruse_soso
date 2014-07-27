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
['config', 'bigl', 'stapes', 'socketio'],
function(config, L, Stapes, io) {

  var NAV_SENSITIVITY = 0.0032;
  var NAV_GUTTER_VALUE = 8;
  var MOVEMENT_THRESHOLD = 1.0;
  var MOVEMENT_COUNT = 10;

  var MultiAxisModule = Stapes.subclass({
    constructor: function() {
      this.forward_push_count = 0;
	  this.backward_push_count = 0;
      this.forwardMoving = false;
	  this.backwardMoving = false;
	  
    },

    init: function() {
      var self = this;

      console.debug('MultiAxis: initializing');

      this.socket = io.connect('/multiaxis');

      this.socket.once('connect',function() {
        console.debug('MultiAxis: connected');
        self.emit( 'ready' );
      });

      this.socket.on('button',function(state) {
        if (Number(state.value) > 0)
		{
		     if (Number(state.code) == 256)
			   self.moveForward();
			 else if(Number(state.code) == 257)
			   self.moveBackward();
		}  
      });

      this.socket.on('state',function(data) {
        //console.log('multiaxis abs:', data.abs);
        var yaw = 0;
		var pitch = 0;
        var forwardzoom = 0;
		var backwardzoom = 0;
        var value;
        var dirty = false;
        for( var axis in data.abs ) {
          switch(axis) {
            case '3':
			  value = data.abs[axis];
              if( Math.abs( value ) > NAV_GUTTER_VALUE ) {
                pitch = value * NAV_SENSITIVITY;
                dirty = true;
              }
              break;
            case '5':
              value = data.abs[axis];
              if( Math.abs( value ) > NAV_GUTTER_VALUE ) {
                yaw = value * NAV_SENSITIVITY;
                dirty = true;
              }
              break;
            case '1':
              value = data.abs[axis];
              if( Math.abs( value ) > NAV_GUTTER_VALUE) {
			   if(value < 0)
                 forwardzoom += value * NAV_SENSITIVITY;
			   else
			     backwardzoom += value * NAV_SENSITIVITY;
                dirty = true;
              }
              break;
          }
        }
        if (dirty) {
          self.emit('abs', {yaw: yaw, pitch: pitch});
          if (-forwardzoom >= MOVEMENT_THRESHOLD) {
            self.addPush(1);
          } else {
			self.subtractPush(1);
			self.forwardMoving = false;
          }
		  if (backwardzoom >= MOVEMENT_THRESHOLD) {
            self.addPush(2);
          } else {
            self.subtractPush(2);
			self.backwardMoving = false;
          }
        }
      });

      this.socket.on('connect_failed',function() {
        L.error('MultiAxis: connect failed!');
      });
      this.socket.on('disconnect',function() {
        L.error('MultiAxis: disconnected');
      });
      this.socket.on('reconnect',function() {
        console.debug('MultiAxis: reconnected');
      });
    },

    clearPush: function(mode) {
	  if(mode==1)
      this.forward_push_count = 0;
	  if(mode==2)
	  this.backward_push_count = 0;
    },

    addPush: function(mode) {
	  if(mode==1&&!this.forwardMoving)
	  {
        this.forward_push_count++;
        if (this.forward_push_count > MOVEMENT_COUNT) {
          this.moveForward();
          this.clearPush(mode);
        }
	  }
	  if(mode==2&&!this.backwardMoving)
	  {
        this.backward_push_count++;
        if (this.backward_push_count > MOVEMENT_COUNT) {
          this.moveBackward();
          this.clearPush(mode);
        }
	  }
    },

    subtractPush: function(mode) {
	  if(mode==1)
	  {
		this.forward_push_count--;
        if (this.forward_push_count < 0) {
          this.clearPush(mode);
        }
	  }
	  if(mode==2)
	  {
		this.backward_push_count--;
        if (this.backward_push_count < 0) {
          this.clearPush(mode);
        }
	  }
    },
	

     moveForward: function() {
      this.forwardMoving = true;
      this.emit('move_forward');
    },
	
	 moveBackward: function() {
      this.backwardMoving = true;
      this.emit('move_backward');
    }
  });

  return MultiAxisModule;
});
