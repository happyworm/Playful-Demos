/*
 * Graph Display
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.0.1
 * Date: 5th April 2014
 */

(function(PM) {

	var Graph = function(options) {
		this.init(options);
	};

	if(typeof PM === 'undefined') {
		window.Graph = Graph; // 
	} else {
		PM.Graph = function(options) {
			return new Graph(options); // 
		};
	}

	Graph.prototype = {
		init: function(options) {
			// The default options
			this.options = {
				canvas: {
					id: 'spectrum',
					// auto: false, // [not implemented] Get the width and height from the canvas
					width: 1275, // 5 * 255
					height: 255
				},
				chart: {
					pitch: 5,
					width: 3
				},
				gradient: [
					[1,'#000000'],
					[0.75,'#00cc00'],
					[0.5,'#cccc00'],
					[0.1,'#ff0000']
				]
			};
			// Read in instancing options.
			for(var option in options) {
				if(options.hasOwnProperty(option)) {
					this.options[option] = options[option];
				}
			}
			// Setup the canvas context
			this.setCanvas();

			// Set the inital gradient.
			this.setGradient();
		},
		setCanvas: function(canvas) {
			if(typeof canvas === 'undefined') {
				canvas = this.options.canvas;
			} else {
				this.options.canvas = canvas;
			}
			// Setup the canvas context
			var elem = document.getElementById(canvas.id);
			if(elem) {
				this.ctx = elem.getContext("2d");
			} else {
				this.ctx = null;
			}
		},
		setGradient: function(gradient) {
			if(typeof gradient === 'undefined') {
				gradient = this.options.gradient;
			} else {
				this.options.gradient = gradient;
			}
			// Create a gradient for the fill.
			// Note the strange offset, since the gradient is calculated based on the canvas, not the specific element we draw.
			if(this.ctx) {
				this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.options.canvas.height);
				for(var g=0, gLen = gradient.length; g < gLen; g++) {
					this.gradient.addColorStop(gradient[g][0], gradient[g][1]);
				}
			}
		},
		draw: function(array) {
			if(this.ctx) {
				// clear the current state
				this.ctx.clearRect(0, 0, this.options.canvas.width, this.options.canvas.height);

				// set the fill style
				this.ctx.fillStyle = this.gradient;

				for(var i = 0, iLen = array.length; i < iLen; i++ ){
					var value = array[i];
					this.ctx.fillRect(
						i * this.options.chart.pitch,
						this.options.canvas.height - value,
						this.options.chart.width,
						value
					);
				}
			}
		}
	}
}(window.PM));
