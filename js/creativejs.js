// canvas augmentation!

var p = CanvasRenderingContext2D.prototype;
p.circle = function(x, y, radius) { 
	this.beginPath(); 
	this.arc(x, y, radius, 0, Math.PI*2, true); 
};
p.fillCircle = function(x, y, radius) { 
	this.circle(x, y, radius); 
	this.fill(); 
};
p.strokeCircle = function(x, y, radius) { 
	this.circle(x, y, radius); 
	this.stroke(); 
};
p.ellipse = function(x, y, width, height) { 
	this.beginPath(); 
	for(var i=0;i<Math.PI*2;i+=Math.PI/16) { 
		this.lineTo(x+(Math.cos(i)*width/2), y+(Math.sin(i)*height/2));
		
	}
	this.closePath(); 
};
p.fillEllipse = function(x, y, width, height) { 
	this.ellipse(x,y,width, height); 
	this.fill(); 
};
p.strokeEllipse = function(x, y, width, height) { 
	this.ellipse(x,y,width, height); 
	this.stroke(); 
};

p.line = function (x1, y1, x2, y2){
	this.beginPath(); 
	this.moveTo(x1,y1); 
	this.lineTo(x2,y2); 
	this.stroke(); 
};

// requestAnimationFrame 
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


// global variables
var CJS = new (function() { 

	this.radians = window.radians = function (deg) {return deg*Math.PI/180;}; 
	this.degrees = window.degrees = function(rad) {return rad*180/Math.PI;};


	//var mouseX, mouseY, lastMouseX, lastMouseY, framerate, lastUpdate;
	this.mouseX = window.mouseX = 0; 
	this.mouseY = window.mouseY = 0; 
	this.lastMouseX = window.lastMouseX = 0; 
	this.lastMouseY = window.lastMouseY = 0; 
	this.mouseDown = window.mouseDown = false; 
	this.frameRate = 60; 
	this.lastUpdate = Date.now(); 
	var canvases = this.canvases = []; 
	var that = this; 


	this.cjsloop = function() {
		//console.log("cjsloop",this); 
		var now = Date.now(); 
		var elapsedMils = now - this.lastUpdate; 
		
		requestAnimationFrame(function() { CJS.cjsloop.apply(CJS);});
		//console.log(this.frameRate); 
		//console.log(this); 
		if((typeof window.draw == 'function') && (elapsedMils>=(1000/this.frameRate))) {
			window.draw.call(window); 
			
			this.lastUpdate = now; 
			window.lastMouseX = this.lastMouseX = this.mouseX; 
			window.lastMouseY = this.lastMouseY = this.mouseY; 
			
			for(var i =0; i<canvases.length;i++) { 
				var c = canvases[i]; 
				c.lastMouseX = c.context.lastMouseX = c.mouseX; 
				c.lastMouseY = c.context.lastMouseY = c.mouseY; 
			}
			
		}
		

	};

	document.body.addEventListener('mousemove', function(e){onMouseMove.call(that,e);});
	function onMouseMove(e) { 
	 	if (this == CJS) { 
			CJS.mouseX = window.mouseX = e.clientX; 
		 	CJS.mouseY = window.mouseY = e.clientY;	
			
		} else if(typeof this=='object') { 
			this.mouseX = this.context.mouseX = e.clientX - this.offsetLeft; 
			this.mouseY = this.context.mouseY = e.clientY - this.offsetTop; 
			
		} 
	} 
	
	document.body.addEventListener('mousedown', function(e){CJS.mouseDown = window.mouseDown = true; if(typeof window.onMouseDown == 'function') window.onMouseDown() ;});
	document.body.addEventListener('mouseup', function(e){CJS.mouseDown = window.mouseDown = false;if(typeof window.onMouseUp == 'function') window.onMouseDown()  ;});
	document.body.addEventListener('keydown', function(e){if(typeof window.onKeyDown == 'function') window.onKeyDown(e)  ;});
	
	

	window.addEventListener('load', function(){onLoad.call(that);});
	function onLoad() { 
		//console.log('loaded', this); 
		this.cjsloop.call(this) ;
		
	}
	
	this.initCanvas = function (canvas, fullscreen) { 
		
		if(fullscreen) { 
			window.width = canvas.width = window.innerWidth; 
			window.height = canvas.height = window.innerHeight; 
			document.body.style.margin = '0'; 
			document.body.style.overflow = 'hidden'; 
					
		} else { 
			window.width = canvas.width; 
			window.height = canvas.height;
		}		
				
				
		if(this.canvases.indexOf(canvas)!=-1) return; 
		
		canvas.addEventListener("mousemove", function(e) { onMouseMove.call(canvas,e);}); 
		canvas.context = canvas.getContext('2d'); 
		canvas.mouseX = canvas.context.mouseX = CJS.mouseX - canvas.offsetLeft; 
		canvas.mouseY = canvas.context.mouseY = CJS.mouseY - canvas.offsetTop;
		canvas.lastMouseX = canvas.context.lastMouseX =  CJS.lastMouseX - canvas.offsetLeft; 
		canvas.lastMouseY = canvas.context.lastMouseY =  CJS.lastMouseY - canvas.offsetTop; 
		
		canvases.push(canvas); 
		
	};
	
	this.randomInteger = window.randomInteger = function(min, max) {
		if(max===undefined) {
			max = min; 
			min = 0; 
		}
		return Math.floor(Math.random() * (max+1-min)) +min;
	};
	this.random = window.random = function (min, max) { 
		if(min===undefined) { 
			min = 0; 
			max = 1; 
		} else if(max=== undefined) { 
			max = min; 
			min = 0; 
		}
		return (Math.random() * (max-min)) + min;
		
	};
	
	this.map = window.map = function(value, min1, max1, min2, max2, clamp) { 
		var returnvalue = ((value-min1) / (max1 - min1) * (max2-min2)) + min2; 
		if(clamp) return Math.max(min2, Math.min(returnvalue, max2)); 
		else return returnvalue; 
	};
	
	this.clamp = window.clamp = function (value, min, max) { 
		return Math.max(min, Math.min(value, max)); 
	};
	
})();