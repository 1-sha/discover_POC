var userID = null;
if (!!window.localStorage) {
	if (!!localStorage.userID) {
		userID = localStorage.userID;
	}
}

var imgSize = {w:0,h:0};
var ctx = document.getElementById('gamewindow').getContext('2d');
var pxl = ctx.createImageData(1,1);

var sio = io.connect('http://localhost:8080', {query: 'userID='+userID+'&lbID='+window.location.pathname.substr(1)});

sio.on('update:connect', function(data) {
    if (!!window.localStorage) {
    	localStorage.userID = data.user.id;
	} 
	userID = data.user.id;

    $('#disp_hov').html(data.user.hov);
    $('#disp_disc').html(data.user.disc);
    $('#disp_mdisc').html(data.user.mdisc);

    imgSize.w = data.img.w;
    imgSize.h = data.img.h;

    $('#gamewindow').prop('width',imgSize.w).prop('height',imgSize.h);

    pxl.data[3] = 255;
    for (var j,i=0;i<imgSize.w;i++)
    	for (j=0;j<imgSize.h;j++) 
    		if (data.img.map[i][j]) {
	    		pxl.data[0] = data.img.map[i][j].r;
		    	pxl.data[1] = data.img.map[i][j].g;
		    	pxl.data[2] = data.img.map[i][j].b;
	    		ctx.putImageData(pxl, i, j);
    }
});


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


sio.on('update:change', function(data) {
    for (var i = 0; i < data.length; i++)
    	if (data[i].uid != userID) {
			pxl.data[0] = data[i].pxl.r;
			pxl.data[1] = data[i].pxl.g;
			pxl.data[2] = data[i].pxl.b;
			pxl.data[3] = 255;

			ctx.putImageData(pxl, data[i].x, data[i].y);
    }
});


$('#gamewindow').mousemove(discover);

function relativePosition(elem,pos) {
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

function discover(event) {
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

			this.lastPos = pos;
			sio.emit('cmd:hover', pos);
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
