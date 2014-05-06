/*
 * The Core Perceptive Media (PM) Library
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.1.0
 * Date: 4th May 2014
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
		},

		hasClass: function(e, c) {
			if ( !e ) return false;

			var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
			return re.test(e.className);
		},
		addClass: function(e, c) {
			if ( this.hasClass(e, c) ) {
				return;
			}

			e.className += ' ' + c;
		},
		removeClass: function (e, c) {
			if ( !this.hasClass(e, c) ) {
				return;
			}

			var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
			e.className = e.className.replace(re, ' ').replace(/\s{2,}/g, ' ');
		},
		toggleClass: function (e, c) {
			if ( this.hasClass(e, c) ) {
				this.removeClass(e, c);
			} else {
				this.addClass(e, c);
			}
		}
	};

	window.PM = core;

}(window));
