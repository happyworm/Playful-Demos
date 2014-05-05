
	var tangye = {
		list: {}, // where the parsed results are stored.
		// story: '', // default
		ignore: '27 51 61 65 73 78 84 98 103 108 111 113 130 140 144 151 190 210 223 237 238 255', // ignore these numbers.
		bgm: '1 26 70 115 135 143 156 201 217 243 261', // music
		sfx: '0 12 13 32 34 37 39 40 41 43 179' // sound effect
	};

	tangye.list.ignore = tangye.ignore.split(/\s+/g);
	tangye.list.bgm = tangye.bgm.split(/\s+/g);
	tangye.list.sfx = tangye.sfx.split(/\s+/g);

	var checklist = function(check, list) {
		for(var i = 0, iLen = list.length; i < iLen; i++) {
			if(check == list[i]) {
				return true;
			}
		}
		return false;
	};

	var autoTrack = {
			story: [],
			bgm: [],
			sfx: []
		},
		autoAudio = {},
		autoURL = '';
	for(var aa=0, aaLen = 266; aa < aaLen; aa++) {

		if(checklist(aa, tangye.list.ignore)) {
			continue; // Jump to next loop
		}

		if(aa < 10) {
			autoURL = '00';
		} else if(aa < 100) {
			autoURL = '0';
		} else {
			autoURL = '';
		}
		autoAudio = {
			mp3: 'assets/audio/tangye/00' + autoURL + aa + '.mp3'
		};

		if(checklist(aa, tangye.list.bgm)) {
			autoAudio.vol = 0.1; // Set all bgm to 10% volume.
			autoTrack['bgm'].push(autoAudio);
		} else if(checklist(aa, tangye.list.sfx)) {
			autoTrack['sfx'].push(autoAudio);
		} else {
			autoTrack['story'].push(autoAudio);
		}
	}

	var myStory = PM.Story({
		wrapper: {
			id: 'story'
		},
		track: autoTrack,
		context: context
	});
