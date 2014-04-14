/*
 * The Core Perceptive Media (PM) Library
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.0.1
 * Date: 14th April 2014
 */

(function(window) {

	var DEBUG = true;

	var listeners = {};

	var core = {
		context: new (window.AudioContext || window.webkitAudioContext)(),
		listen: function(type, callback) {
			// type: The type of message to listen for
			// callback: The message handler
			listeners[type] = listeners[type] || [];
			listeners[type].push({callback: callback});
		},
		broadcast: function(type, data, callback) {
			// type: The type of message to broadcast
			// data: (optional) The message data
			// callback: (optional) Called when complete
			if(typeof type === 'string' && listeners[type]) {
				for(var i = 0, iLen = listeners[type].length; i < iLen; i++) {
					listeners[type][i].callback(data);
				}
			}
			if(typeof callback === 'function') {
				callback();
			}
		}
	};

	window.PM = core;

}(window));
