# Voice Detection

## Goal

To use the microphone to detect when someone has spoken.


## Resources

* [MediaStream Integration](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/webrtc-integration.html)
* [Media Capture and Streams](http://www.w3.org/TR/mediacapture-streams/)
* [Web Audio API](http://www.w3.org/TR/webaudio/)
* [WebRTC 1.0: Real-time Communication Between Browsers](http://www.w3.org/TR/webrtc/)
* [MediaStream Processing API](https://dvcs.w3.org/hg/audio/raw-file/tip/streams/StreamProcessing.html)
* [Examples of spectrum analyser](https://github.com/josdirksen/smartjava/tree/master/webaudio)


## Analyser FFT Bin Frequency

fftSize / 2 = frequencyBinCount
sampleRate / 2 = Nyquist Frequency
Nyquist Frequency / frequencyBinCount = Hz/Bin

**sampleRate / frequencyBinCount = Hz/Bin**

For example:
* fftSize = 512
* sampleRate = 48,000Hz

48,000 / 512 = 93.75 Hz/Bin
