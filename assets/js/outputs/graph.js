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
					type: 'bar', // bar, line
					curve: false,
					pitch: 5,
					width: 3
				},
				gradient: [
					[1,'#336633'],
					[0.75,'#33cc33'],
					[0.5,'#cccc33'],
					[0.1,'#ff3333']
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

				if(this.options.chart.type === 'bar') {

					for(var i = 0, iLen = array.length; i < iLen; i++ ){
						var value = array[i];
						this.ctx.fillRect(
							i * this.options.chart.pitch,
							this.options.canvas.height - value,
							this.options.chart.width,
							value
						);
					}

				} else {

					this.ctx.beginPath();
					this.ctx.moveTo(0, this.options.canvas.height);

					if(this.options.chart.curve) {

						for(var i = 0, iLen = array.length; i < iLen; i++ ){

							var middle = (this.options.chart.pitch / 2);
							var column = (i * this.options.chart.pitch);

							this.ctx.bezierCurveTo(
								column,
								this.options.canvas.height - (i > 0 ? array[i-1] : 0),
								column,
								this.options.canvas.height - array[i],
								column + middle,
								this.options.canvas.height - array[i]
							);

						}
					} else {
						for(var i = 0, iLen = array.length; i < iLen; i++ ){
							var value = array[i];
							this.ctx.lineTo(
								(i * this.options.chart.pitch) + (this.options.chart.pitch / 2),
								this.options.canvas.height - value
							);
						}
					}
					// Correct the end point
					this.ctx.lineTo(array.length * this.options.chart.pitch, this.options.canvas.height);

					this.ctx.closePath();
					this.ctx.fill();

					this.ctx.strokeStyle = this.gradient;
					// this.ctx.strokeStyle = '#ccc';
					this.ctx.stroke();
				}


/*
				var context = this.ctx;
				for (var x = 0.5; x < 500; x += 10) {
					context.moveTo(x, 0);
					context.lineTo(x, 375);
				}
				for (var y = 0.5; y < 375; y += 10) {
					context.moveTo(0, y);
					context.lineTo(500, y);
				}
				context.strokeStyle = "#eee";
				context.stroke();
*/
			}
		}
	}
}(window.PM));
