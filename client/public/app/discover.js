var sio = io.connect('http://localhost:8080');

sio.on('update:connect', function(msg) {
    console.log(msg);
});

$('#gamewindow').mousemove(scrub);

function relativePosition(elem,pos) {
	var elemRect = elem.getBoundingClientRect();
	var bodyRect = document.body.getBoundingClientRect();
	var offset = {
		left: Math.round(elemRect.left - bodyRect.left),
		top: Math.round(elemRect.top - bodyRect.top)
	};

	return {
		x: pos.x - offset.left,
		y: pos.y - offset.top
	};
}

function absolutePosition(event) {
	return {
		x: event.pageX,
		y: event.pageY
	};
}

function scrub(event) {
	if (this.is4ms === undefined) {
		this.is4ms = timeCheckFactory(16);
	}
	if (this.lastPos === undefined) {
		this.lastPos = {};
	}

	if (this.is4ms()) {
		var pos = relativePosition(this, absolutePosition(event));
		if (( pos.x != this.lastPos.x ) || ( pos.y != this.lastPos.y )) {
			this.lastPos = pos;

			sio.emit('cmd:move',"x: " + pos.x + " y: " + pos.y);
		}
	}
}

function timeCheckFactory(timespan) {
	var lastTimestamp = 0;
	return function() {
		var currentTimestamp = Date.now();
		if ((currentTimestamp - lastTimestamp) >= timespan) {
			lastTimestamp = currentTimestamp;
			return true;
		} else {
			return false;
		}
	};
}
