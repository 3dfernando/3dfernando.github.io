

var c;
var ctx;

//The rectangle should have x,y,width,height properties
var rect;
var rect2;
var rect3;
var rect4;
var graphArea;

//slider variables
var sliderFreq; var sliderFreqArea;
var sliderAmp; var sliderAmpArea;
var minFreq=0.5;
var maxFreq=10;
var currFreq=3;
var minAmp=0;
var maxAmp=2;
var currAmp=1;


//Array for the asymmetric wave
let NiceWaveT = [0,0.125,0.25,1];
let NiceWaveV = [-1,1,1,-1];
let WaveT = [];
let WaveV = [];
var nWavePoints = 512;
var j;
var t=0;
var lastMousePos={x:0, y:0};

niceWaveform(NiceWaveT,NiceWaveV);

//Variables for drawing waveform
var paint=false;
var dragFreq=false;
var dragAmp=false;



//============================================================
//Program
//============================================================

function initCanvas(){
	c = document.getElementById("DemoInterface");
	ctx = c.getContext('2d');
	rect= {x:50,y:100,width:100,height:100};
	rect2= {x:50,y:225,width:100,height:100};
	rect3= {x:50,y:350,width:100,height:100};
	rect4= {x:50,y:475,width:100,height:100};
	graphArea= {x:215,y:70,height:560,width:720};
	sliderFreq= {x:1100,y:100,height:50,width:25};
	sliderAmp= {x:1100,y:250,height:50,width:25};
	sliderFreqArea= {x:1000,y:100,height:50,width:250};
	sliderAmpArea= {x:1000,y:250,height:50,	width:250};
	
	//Paint functions
	c.addEventListener('mousedown', mouseTouchDown, false);
	c.addEventListener('touchstart', mouseTouchDown, false);
	c.addEventListener('mouseup', mouseTouchUp, false);
	c.addEventListener('touchend', mouseTouchUp, false);
	c.addEventListener('mouseleave', mouseTouchLeave, false);
	c.addEventListener('mousemove', mouseTouchMove, false);
	c.addEventListener('touchmove', mouseTouchMove, false);
	
	//draws buttons
	drawButton(ctx, rect, "sine");
	drawButton(ctx, rect2, "triangle");
	drawButton(ctx, rect3, "square");
	drawButton(ctx, rect4, "niceWave");
	
	//text above buttons
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "20px Trueno";
	ctx.fillText("Default", 60, 50);
	ctx.fillText("Waveforms", 40, 80);
	
	//Graph
	redrawGraph();
	changeFreq(1065);
	changeAmp(1065);
	redrawAmp();
	redrawFreq();
}

//Mouse/touch events
function mouseTouchDown(evt) {
		var mousePos = getMousePos(c, evt);
			
		if (isInside(mousePos,graphArea)){
			paint = true;
			lastMousePos=mousePos;
			redrawGraph();
		}else if(isInside(mousePos,sliderFreq)){
			dragFreq=true;
			redrawFreq();
		}else if(isInside(mousePos,sliderAmp)){
			dragAmp=true;
			redrawAmp();
		}
	}
	
function mouseTouchUp(evt) {			
	paint = false;
	dragFreq = false;	
	dragAmp = false;
	var mousePos = getMousePos(c, evt);

	if (isInside(mousePos,rect)) {
		for(i=0;i<=nWavePoints;i++){
			t=i/nWavePoints;
			WaveV[i]=Math.sin(t*2*Math.PI);
		}	
	}else if(isInside(mousePos,rect2)){
		niceWaveform([0, 0.25, 0.75, 1],[0, 1, -1, 0]);
	}else if(isInside(mousePos,rect3)){
		niceWaveform([0, 0.499, 0.501, 1],[1, 1, -1, -1]);
	}else if(isInside(mousePos,rect4)){
		niceWaveform(NiceWaveT,NiceWaveV);
	}
	redrawGraph();
	redrawAmp();
	redrawFreq();
}

function mouseTouchMove(evt) {
		var mousePos = getMousePos(c, evt);
		
		if (isInside(mousePos,graphArea)){
			if(paint){
				changeWaveform(mousePos.x,mousePos.y);
				redrawGraph();
				lastMousePos=mousePos;
			}
		}else{
			if(paint){
				//creates a point at the boundary to allow for better UX
				if (mousePos.x<graphArea.x){
					mousePos.x=graphArea.x;
				}else if(mousePos.x>(graphArea.x+graphArea.width)){
					mousePos.x=graphArea.x+graphArea.width;
				}
				
				if (mousePos.y<graphArea.y){
					mousePos.y=graphArea.y;
				}else if(mousePos.y>(graphArea.y+graphArea.height)){
					mousePos.y=graphArea.y+graphArea.height;
				}
				changeWaveform(mousePos.x,mousePos.y);
				redrawGraph();
			}else if(dragFreq){
				changeFreq(mousePos.x);
				redrawFreq();
			}else if(dragAmp){
				changeAmp(mousePos.x);
				redrawAmp();
			}
			
			paint=false;
		}
		
	}

function mouseTouchLeave(evt) {			
	paint = false;	
	dragFreq = false;	
	dragAmp = false;
}

//Function to get the mouse position
function getMousePos(canvas, event) {
    var r = canvas.getBoundingClientRect();
	var mp={x:0, y:0};
	
	if((event.type.localeCompare("mousedown")==0) || (event.type.localeCompare("mouseup")==0) || (event.type.localeCompare("mousemove")==0)){		
		mp.x=event.clientX - r.left;
		mp.y=event.clientY - r.top;
	} else if((event.type.localeCompare("touchstart")==0) || (event.type.localeCompare("touchmove")==0)){
		mp.x=event.touches[0].clientX - r.left;
		mp.y=event.touches[0].clientY - r.top;
	} else if((event.type.localeCompare("touchend")==0)){
		mp.x=event.changedTouches[0].clientX - r.left;
		mp.y=event.changedTouches[0].clientY - r.top;
	}
	
	
	
    return mp;
}

//Function to check whether a point is inside a rectangle
function isInside(pos, r){
    return pos.x > r.x && pos.x < r.x+r.width && pos.y < r.y+r.height && pos.y > r.y
}

//draw the rectangle
function drawButton(cc, r, type){
	cc.beginPath();
	cc.moveTo(r.x, r.y);
	cc.lineTo(r.x+r.width, r.y);
	cc.lineTo(r.x+r.width, r.y+r.height);
	cc.lineTo(r.x, r.y+r.height);
	cc.lineTo(r.x, r.y);
	cc.lineWidth = 2.5;
	cc.strokeStyle = "#888888";
	cc.fillStyle = "#555555";
	cc.stroke();
	cc.fill();

	var w=rect.width-20;
	var h=rect.height-20;
	var npts=20;
	var t;
	if(type.localeCompare("sine")==0){		
		cc.beginPath();
		cc.moveTo(r.x+10, r.y+r.height/2);
		for(i=1;i<=npts;i++){
			t=i/npts;
			cc.lineTo(r.x+w*t+10, r.y+r.height/2-(h/2)*Math.sin(t*2*Math.PI));
		}		
		cc.lineWidth = 4;
		cc.strokeStyle = "#FFFFFF";
		cc.stroke();
	}else if(type.localeCompare("triangle")==0){		
		cc.beginPath();
		cc.moveTo(r.x+10, r.y+r.height/2);
		cc.lineTo(r.x+10+w/4, r.y+r.height/2-h/2);
		cc.lineTo(r.x+10+3*w/4, r.y+r.height/2+h/2);
		cc.lineTo(r.x+10+w, r.y+r.height/2);
		cc.lineWidth = 4;
		cc.strokeStyle = "#FFFFFF";
		cc.stroke();
	}else if(type.localeCompare("square")==0){
		cc.beginPath();
		cc.moveTo(r.x+10, r.y+r.height/2);
		cc.lineTo(r.x+10, r.y+r.height/2-h/2);
		cc.lineTo(r.x+10+w/2, r.y+r.height/2-h/2);
		cc.lineTo(r.x+10+w/2, r.y+r.height/2+h/2);
		cc.lineTo(r.x+10+w, r.y+r.height/2+h/2);
		cc.lineTo(r.x+10+w, r.y+r.height/2);
		cc.lineWidth = 4;
		cc.strokeStyle = "#FFFFFF";
		cc.stroke();
	}else if(type.localeCompare("niceWave")==0){
		cc.beginPath();
		cc.moveTo(r.x+10+w*NiceWaveT[0], r.y+r.height/2-NiceWaveV[0]*h/2);
		cc.lineTo(r.x+10+w*NiceWaveT[1], r.y+r.height/2-NiceWaveV[1]*h/2);
		cc.lineTo(r.x+10+w*NiceWaveT[2], r.y+r.height/2-NiceWaveV[2]*h/2);
		cc.lineTo(r.x+10+w*NiceWaveT[3], r.y+r.height/2-NiceWaveV[3]*h/2);
		cc.lineWidth = 4;
		cc.strokeStyle = "#FFFFFF";
		cc.stroke();
	}
	
}

//changes a point in the waveform
function changeWaveform(x, y)
{
	var graphCoords={x:0, y:0};
	var waveCoordsStart;
	var waveCoordsEnd;
		
	graphCoords.x=x;
	graphCoords.y=y;	
	waveCoordsStart=graphAreaToWave_VT(lastMousePos);	
	waveCoordsEnd=graphAreaToWave_VT(graphCoords);
	
	var t_idx_start=waveCoordsStart.T*nWavePoints;
	var t_idx_end=waveCoordsEnd.T*nWavePoints;
		
	if (Math.abs(t_idx_end-t_idx_start)<=0.5){
		WaveV[Math.round(t_idx_end)]=waveCoordsEnd.V;
	} else {
		var i1=Math.round(t_idx_start);
		var i2=Math.round(t_idx_end);
		for(var i=Math.min(i1,i2); i<=Math.max(i1,i2);i++){
			WaveV[i]=waveCoordsStart.V+(waveCoordsEnd.V-waveCoordsStart.V)*(i-t_idx_start)/(t_idx_end-t_idx_start);
		}
	}
}

function graphAreaToWave_VT(graphCoords){
	//Converts coordinate systems
	var WaveVT={V:0, T:0};
	WaveVT.V=-(graphCoords.y-(graphArea.y+graphArea.height/2))/(graphArea.height/2);
	WaveVT.T=(graphCoords.x-graphArea.x)/graphArea.width;
	
	return WaveVT;	
}

function Wave_VTtoGraphArea(WaveVT){
	//Converts coordinate systems
	var graphCoords={x:0, y:0};
	graphCoords.x=graphArea.width*WaveVT.T+graphArea.x;
	graphCoords.y=(graphArea.y+graphArea.height/2)-(WaveVT.V*graphArea.height/2);
	
	return graphCoords;	
}

function redrawGraph(){
	//draws the graph in the canvas
	var VT={V:0, T:0}; var GA;
	ctx.clearRect(graphArea.x-50,graphArea.y-50,graphArea.width+100,graphArea.height+100);
	
	drawChartAxes();
	
	
	//draws lines from 0 to V
	var VT0={V:0, T:0}; var GA0;
	GA0 = Wave_VTtoGraphArea(VT0);
	
	ctx.beginPath();
	VT.T=WaveT[0]; VT.V=WaveV[0];
	GA = Wave_VTtoGraphArea(VT);
	ctx.moveTo(GA.x,GA0.y);
	ctx.lineTo(GA.x,GA.y);
	ctx.lineWidth = 1.5;
	ctx.strokeStyle = "#222222";
	ctx.stroke();
	
	for(var i=1; i<nWavePoints; i++){
		ctx.beginPath();
		VT.T=WaveT[i]; VT.V=WaveV[i];
		GA = Wave_VTtoGraphArea(VT);
		ctx.moveTo(GA.x,GA0.y);
		ctx.lineTo(GA.x,GA.y);	
		ctx.stroke();
	}
	
	
	//Draw lines of the chart
	ctx.beginPath();
	VT.T=WaveT[0]; VT.V=WaveV[0];
	GA = Wave_VTtoGraphArea(VT);
	ctx.moveTo(GA.x,GA.y);
	for(var i=1; i<nWavePoints; i++){
		VT.T=WaveT[i]; VT.V=WaveV[i];
		GA = Wave_VTtoGraphArea(VT);
		ctx.lineTo(GA.x,GA.y);		
	}
	
	ctx.lineWidth = 4;
	ctx.strokeStyle = "#FFFFFF";
	ctx.stroke();
}

function drawChartAxes(){
	//Just draws the axes of the chart
	//axes
	ctx.beginPath();
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#999999";
	
	ctx.moveTo(graphArea.x-1,graphArea.y+graphArea.height+15);
	ctx.lineTo(graphArea.x-1,graphArea.y-30);	
	ctx.stroke();
	
	ctx.moveTo(graphArea.x-8,graphArea.y+graphArea.height/2);
	ctx.lineTo(graphArea.x+graphArea.width+30,graphArea.y+graphArea.height/2);	
	ctx.stroke();
	
	//axis arrows
	var arrowWidth=4;
	var arrowHeight=20;
	ctx.moveTo(graphArea.x-1-arrowWidth,graphArea.y-30+arrowHeight);	
	ctx.lineTo(graphArea.x-1,graphArea.y-30);	
	ctx.lineTo(graphArea.x-1+arrowWidth,graphArea.y-30+arrowHeight);	
	ctx.stroke();
	
	ctx.moveTo(graphArea.x+graphArea.width+30-arrowHeight,graphArea.y+graphArea.height/2+arrowWidth);	
	ctx.lineTo(graphArea.x+graphArea.width+30,graphArea.y+graphArea.height/2);	
	ctx.lineTo(graphArea.x+graphArea.width+30-arrowHeight,graphArea.y+graphArea.height/2-arrowWidth);	
	ctx.stroke();
	
	//dashed lines
	ctx.lineWidth = 1.5;
	ctx.strokeStyle = "#666666";
	ctx.setLineDash([3,3]);
	
	ctx.beginPath();
	ctx.moveTo(graphArea.x-8,graphArea.y);
	ctx.lineTo(graphArea.x+graphArea.width+20,graphArea.y);	
	ctx.stroke();
	
	ctx.moveTo(graphArea.x-8,graphArea.y+graphArea.height/4);
	ctx.lineTo(graphArea.x+graphArea.width+20,graphArea.y+graphArea.height/4);	
	ctx.stroke();
	
	ctx.moveTo(graphArea.x-8,graphArea.y+3*graphArea.height/4);
	ctx.lineTo(graphArea.x+graphArea.width+20,graphArea.y+3*graphArea.height/4);	
	ctx.stroke();
	
	ctx.moveTo(graphArea.x-8,graphArea.y+graphArea.height);
	ctx.lineTo(graphArea.x+graphArea.width+20,graphArea.y+graphArea.height);	
	ctx.stroke();
	
	ctx.moveTo(graphArea.x+graphArea.width/4,graphArea.y);
	ctx.lineTo(graphArea.x+graphArea.width/4,graphArea.y+graphArea.height);	
	ctx.stroke();
	
	ctx.moveTo(graphArea.x+graphArea.width/2,graphArea.y);
	ctx.lineTo(graphArea.x+graphArea.width/2,graphArea.y+graphArea.height);	
	ctx.stroke();
	
	ctx.moveTo(graphArea.x+3*graphArea.width/4,graphArea.y);
	ctx.lineTo(graphArea.x+3*graphArea.width/4,graphArea.y+graphArea.height);	
	ctx.stroke();
	
	ctx.moveTo(graphArea.x+graphArea.width,graphArea.y);
	ctx.lineTo(graphArea.x+graphArea.width,graphArea.y+graphArea.height);	
	ctx.stroke();
	
	ctx.setLineDash([]);
		
	//text above axes
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "16px Trueno";
	ctx.fillText("Voltage", graphArea.x+5, graphArea.y-18);
	ctx.fillText("Time", graphArea.x+graphArea.width+10, graphArea.y+graphArea.height/2-10);
	
}



function niceWaveform(WaveTvals,WaveVvals){	
	WaveT=new Array();
	WaveV=new Array();
	
	var b=WaveVvals[0];
	t=0;
	for(j=0;j<nWavePoints;j++){
		if (j>0){
			WaveT.push(j/nWavePoints);
			if ((j/nWavePoints)>WaveTvals[t]){
				t=t+1;
			}
			b=((j/nWavePoints)-WaveTvals[t-1])/(WaveTvals[t]-WaveTvals[t-1]);
			b=b*(WaveVvals[t]-WaveVvals[t-1])+WaveVvals[t-1];
		}
		WaveV.push(b);
	}
}

function redrawFreq(){
	//redraws the frequency bar
	ctx.clearRect(sliderFreqArea.x-25, sliderFreqArea.y-50, sliderFreqArea.width+50, sliderFreqArea.height+60);
	
	ctx.beginPath();
	ctx.lineWidth = 8;
	ctx.strokeStyle = "#666666";
	ctx.moveTo(sliderFreqArea.x,sliderFreqArea.y+sliderFreqArea.height/2);
	ctx.lineTo(sliderFreqArea.x+sliderFreqArea.width,sliderFreqArea.y+sliderFreqArea.height/2);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#888888";
	ctx.fillStyle = "#555555";
	ctx.moveTo(sliderFreq.x,sliderFreq.y);
	ctx.lineTo(sliderFreq.x+sliderFreq.width,sliderFreq.y);
	ctx.lineTo(sliderFreq.x+sliderFreq.width,sliderFreq.y+sliderFreq.height);
	ctx.lineTo(sliderFreq.x,sliderFreq.y+sliderFreq.height);
	ctx.lineTo(sliderFreq.x,sliderFreq.y);
	ctx.stroke();
	ctx.fill();
	
	//text above axes
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "16px Trueno";
	var freqRounded=currFreq.toFixed(1);
	ctx.fillText("Frequency: " + freqRounded.toString() + " cycles/sec", sliderFreqArea.x+5, sliderFreqArea.y-18);
	
	
}

function changeFreq(mx){	
	//changes the frequency given the mouse x position
	var fraction=(mx-sliderFreqArea.x)/(sliderFreqArea.width);
	
	if (fraction<0){
		fraction=0;
	}else if(fraction>1){
		fraction=1;
	}	
	currFreq = minFreq + (maxFreq-minFreq)*fraction;	
	
	var newmx = fraction*sliderFreqArea.width + sliderFreqArea.x;
	sliderFreq.x=newmx-sliderFreq.width/2;
}

function redrawAmp(){
	//redraws the amplitude bar
	ctx.clearRect(sliderAmpArea.x-25, sliderAmpArea.y-50, sliderAmpArea.width+50, sliderAmpArea.height+60);
	
	ctx.beginPath();
	ctx.lineWidth = 8;
	ctx.strokeStyle = "#666666";
	ctx.moveTo(sliderAmpArea.x,sliderAmpArea.y+sliderAmpArea.height/2);
	ctx.lineTo(sliderAmpArea.x+sliderAmpArea.width,sliderAmpArea.y+sliderAmpArea.height/2);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#888888";
	ctx.fillStyle = "#555555";
	ctx.moveTo(sliderAmp.x,sliderAmp.y);
	ctx.lineTo(sliderAmp.x+sliderAmp.width,sliderAmp.y);
	ctx.lineTo(sliderAmp.x+sliderAmp.width,sliderAmp.y+sliderAmp.height);
	ctx.lineTo(sliderAmp.x,sliderAmp.y+sliderAmp.height);
	ctx.lineTo(sliderAmp.x,sliderAmp.y);
	ctx.stroke();
	ctx.fill();
	
	//text above axes
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "16px Trueno";
	var ampRounded=currAmp.toFixed(1);
	ctx.fillText("Amplitude: " + ampRounded.toString() + " Volts", sliderAmpArea.x+5, sliderAmpArea.y-18);
	
}

function changeAmp(mx){
	//changes the amplitude given the mouse x position
	var fraction=(mx-sliderAmpArea.x)/(sliderAmpArea.width);
	
	if (fraction<0){
		fraction=0;
	}else if(fraction>1){
		fraction=1;
	}	
	currAmp = minAmp + (maxAmp-minAmp)*fraction;	
	
	var newmx = fraction*sliderAmpArea.width + sliderAmpArea.x;
	sliderAmp.x=newmx-sliderAmp.width/2;
}













