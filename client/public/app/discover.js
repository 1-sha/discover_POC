//@todo: masquer le système de connexion
var userID = null;
if (!!window.localStorage) {
	if (!!localStorage.userID) {
		userID = localStorage.userID;
	}
}

var imgSize = {w:0,h:0};

var sio = io.connect('http://localhost:8080', {query: 'userID='+userID+'&lbID='+window.location.pathname.substr(1)});

sio.on('update:connect', function(data) {
    localStorage.userID = data.user.id;
    $('#disp_hov').html(data.user.hov);
    $('#disp_disc').html(data.user.disc);
    $('#disp_mdisc').html(data.user.mdisc);

    imgSize.w = data.img.w;
    imgSize.h = data.img.h;

    $('#gamewindow').prop('width',imgSize.w).prop('height',imgSize.h);
});

var ctx = document.getElementById('gamewindow').getContext('2d');
var pxl = ctx.createImageData(1,1);

sio.on('update:hovered', function(data) {
    if (!!data.hover) $('#disp_hov').html(data.hover);
    if (!!data.scrub) $('#disp_disc').html(data.scrub);
    if (!!data.scrubM) $('#disp_mdisc').html(data.scrubM);

    if (!!data.color) {
    	pxl.data[0] = data.color.r;
    	pxl.data[1] = data.color.g;
    	pxl.data[2] = data.color.b;
    	pxl.data[3] = 255;

    	ctx.putImageData(pxl, data.pos.x, data.pos.y);
    }
});

$('#gamewindow').mousemove(scrub);

function relativePosition(elem,pos) {
	// var elemRect = elem.getBoundingClientRect();
	// var bodyRect = document.body.getBoundingClientRect();
	// var offset = {
	// 	left: Math.round(elemRect.left - bodyRect.left),
	// 	top: Math.round(elemRect.top - bodyRect.top)
	// };

	// return {
	// 	x: pos.x - offset.left,
	// 	y: pos.y - offset.top
	// };
	var offset = $(elem).offset();
	return {
		x: pos.x - Math.round(offset.left),
		y: pos.y - Math.round(offset.top)
	};
}

function mousePosition(event) {
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
		var pos = relativePosition(this, mousePosition(event));

		if ( (( pos.x != this.lastPos.x ) || ( pos.y != this.lastPos.y ))
			&& (pos.x >= 0) && (pos.x < imgSize.w)
			&& (pos.x >= 0) && (pos.x < imgSize.h) ) {
			pos.x++;
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
