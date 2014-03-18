/*
 * Voice Activity Detection (VAD) Library
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.0.1
 * Date: 18th March 2014
 */

var vad = (function() {

	var private_vars = 1;

	var vad = function(analyser, options) {
		this.analyser = analyser;
		// The default options
		this.options = {
			pt_E: 40, // Energy_PrimeThresh
			pt_F: 185, // F_PrimeThresh (Hz)
			pt_SF: 5, // SF_PrimeThresh
			// fftSize: 512,
			sampleRate: 48000
		};
		// Read in instancing options.
		for(var option in options) {
			if(options.hasOwnProperty(option)) {
				this.options[option] = options[option];
			}
		}
	};
	vad.prototype = {
		getEnergy: function() {
			// energy = SUM n=-inf->inf |x(n)|^2

			var value, energy = 0;
			var waveform = new Uint8Array(this.analyser.fftSize);
			this.analyser.getByteTimeDomainData(waveform);

			for(var i = 0, iLen = waveform.length; i < iLen; i++) {
				value = (waveform[i] - 128) / 128;
				energy += value * value;
			}

			// console.log("energy: " + energy);

			return energy;
		},
		getFrequency: function() {
			var dominantBin = 0, maxBin = 0;
			var binHz = this.options.sampleRate / this.analyser.fftSize;

			var fft = new Uint8Array(this.analyser.frequencyBinCount);
			this.analyser.getByteFrequencyData(fft);

			for(var i = 0, iLen = fft.length; i < iLen; i++) {
				if(fft[i] > maxBin) {
					dominantBin = i;
					maxBin = fft[i];
				}
			}

			var frequency = (dominantBin * binHz) + (binHz / 2);
			// console.log("frequency: " + frequency);
			return frequency;
		},
		getSFM: function() {

			var geometric = 0;
			var arithmetic = 0;

			var bin;
			var empty = 0;

			var fft = new Uint8Array(this.analyser.frequencyBinCount);
			this.analyser.getByteFrequencyData(fft);

			// var fft = new Float32Array(this.analyser.frequencyBinCount);
			// this.analyser.getFloatFrequencyData(fft);

			for(var i = 0, iLen = fft.length; i < iLen; i++) {
				bin = (fft[i] + 1) / 256; // So it is never zero
				// console.log("fft[" + i + "]: " + fft[i]);
				if(true || fft[i] > 0) {
					// bin = fft[i] / 255;
					// bin = fft[i];
					geometric += Math.log(bin);
					arithmetic += bin;
				} else {
					// empty++;
				}
			}

			var bins = fft.length - empty;

			geometric = Math.exp(geometric / bins);
			arithmetic = arithmetic / bins;

			var SF = geometric / arithmetic;
			var SFM = 10 * Math.log(SF) / Math.log(10);

			if(arithmetic > 0) {
				// console.log("geometric: " + geometric + " | arithmetic: " + arithmetic + " | SF: " + SF + " | SFM: " + SFM);
			}
			return SFM;
		}
	};
	return vad;
}());
