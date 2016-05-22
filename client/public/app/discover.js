//@todo: masquer le système de connexion
var userID = null;
if (!!window.localStorage) {
	if (!!localStorage.userID) {
		userID = localStorage.userID;
	}
}

var sio = io.connect('http://localhost:8080', {query: 'userID='+userID});

sio.on('update:connect', function(user) {
    localStorage.userID = user.id;
    $('#disp_hov').html(user.hov);
    $('#disp_disc').html(user.disc);
    $('#disp_mdisc').html(user.mdisc);
});

sio.on('update:hovered', function(data) {
    $('#disp_hov').html(data);
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
		this.is4ms = timeCheckFactory(4);
	}
	if (this.lastPos === undefined) {
		this.lastPos = {};
	}

	if (this.is4ms()) {
		var pos = relativePosition(this, absolutePosition(event));
		if (( pos.x != this.lastPos.x ) || ( pos.y != this.lastPos.y )) {
			this.lastPos = pos;

			sio.emit('cmd:move', pos);
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
