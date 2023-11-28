var ISO_Speed; var Exposure_H18; var Exposure_H100; var Exposure_H100e; var Exposure_H100ph; 
var lambda; var phEfficiency; var Qlaser; var t_ns; var wbeam_mm; var lbeam_mm; var Abeam_m2; var E_laser;
var particleRadius_m; var radFlux; var lumFlux; var focaldist; var particledist; var lensdist; var fnumber; var pixelsize;
var exposureParticle; var particlegraylevel; var graylevel; var solidAngle; var photonEnergy; var IOR_Re; var IOR_Im; var IOR_Medium;
var particleImageStdPx; var particleGaussian; var gaussianTotal; var gaussianMax; var camAngle; var photonsPerPixelPar; var photonsPerPixelPerp;

var ScatteringPlotDataPerp = [];  var ScatteringPlotDataPar = []; var ScatteringPlotSaturationPhotons = []; 
var xyValues = [
  {x:0, y:1},
  {x:180, y:1}
];


const ScatteringPlot = new Chart("ScatteringPlot", {
  type: "scatter",
  data: {
	datasets: [{
		label: "Perpendicular",
		fill: false,
		pointRadius: 1,
		borderColor: "rgba(0,0,255,.75)",
		data: xyValues,
		showLine: true 
	},
	{
		label: "Parallel",
		fill: false,
		pointRadius: 1,
		borderColor: "rgba(255,0,0,.75)",
		data: xyValues,
		showLine: true 
	},
	{
		label: "Saturation",
		fill: false,
		pointRadius: 1,
		borderColor: "rgba(50,50,50,.5)",
		data: xyValues,
		showLine: true 
	}]
  },
  options: {
		title: {
			display: true,
			text: 'Photons Detected per Pixel'
		},
		tooltips: {
			callbacks: {
				label: function(tooltipItem, data) {
					var x=Math.round(Number(tooltipItem.xLabel)*10)/10;
					var y=Math.round(Number(tooltipItem.yLabel));
					var sat=Math.round(100*(Number(tooltipItem.yLabel)/Exposure_H100ph)*10)/10;
					return x.toString() + "deg; " + y.toString() + " photons (" + sat.toString() + "% of sat.)";
				}
			}
		},
		scales: {
			yAxes: [{
				ticks: {
                  callback: (val, index) => {
					if (!val) return 0;
					if (val >= 1){
						if (index % 3 == 0){
							const units = ['', 'k', 'M', 'B', 'T', 'Q'];
							const k = 1000;
							const magnitude = Math.floor(Math.log(val) / Math.log(k));
							return (
							  val / Math.pow(k, magnitude) + units[magnitude]
							);
						}else{
							return undefined;
						}
					}else{
						return undefined;
					}
				  },
				}
			}]
		}
  }
});

function init(){
	//Fills the form with the default values
	document.getElementById("ISOtext").value="400";
	document.getElementById("lambda").value="532";
	document.getElementById("Qlaser").value="0.2";
	document.getElementById("time").value="20";
	document.getElementById("wbeam").value="2";
	document.getElementById("lbeam").value="40";
	document.getElementById("particleradius").value="1";
	document.getElementById("focaldist").value="105";
	document.getElementById("particledist").value="1000";
	document.getElementById("fnumber").value="8";
	document.getElementById("pixelsize").value="5.5";
	document.getElementById("fstd").value="1.5";
	document.getElementById("IOR_Re").value="1.333";
	document.getElementById("IOR_Im").value="0";
	document.getElementById("IOR_Medium").value="1";
	document.getElementById("camAngle").value="60";
		
	document.getElementById("lambdaQE").value="532";
	document.getElementById("qeff").value="70";	
	document.getElementById("eSat").value="40000";

	document.getElementById("lambda_Direct").value="532";
	document.getElementById("H100ph_Direct").value="60000";
	
	
	
	//Tries to review if the form has cookies and loads them
	loadFormFromCookies();
	Recalculate();
}

function expo(x, f) {
  return Number.parseFloat(x).toExponential(f);
}

function photopicEfficiency(l){
	//Computes the photopic efficiency function according to this approximation
	//https://physics.stackexchange.com/questions/51957/spectral-luminous-efficiency-as-a-function-of-wavelength
	var exponent = Math.pow((l-559)/(41.9),2);
	return Math.exp(-0.5*exponent);
}

function Recalculate(){
	//Recalculates the whole page.
	
	//Gets the inputs
	pixelsize=document.getElementById("pixelsize").value/1e6;
	focaldist=document.getElementById("focaldist").value/1e3;
	particledist=document.getElementById("particledist").value/1e3;
	fnumber=document.getElementById("fnumber").value;	
	
	Qlaser=document.getElementById("Qlaser").value;
	t_ns=document.getElementById("time").value;
	wbeam_mm=document.getElementById("wbeam").value;
	lbeam_mm=document.getElementById("lbeam").value;
	
	IOR_Re=document.getElementById("IOR_Re").value;	
	IOR_Im=document.getElementById("IOR_Im").value;	
	IOR_Medium=document.getElementById("IOR_Medium").value;	
	
	camAngle=document.getElementById("camAngle").value;	
	particleRadius_m=document.getElementById("particleradius").value/1e6;	
	particleImageStdPx=document.getElementById("fstd").value;
	
	
	//First finds which tab is active
	if (document.getElementById("ISO").style.display == 'block') {
		//ISO provided
		ISO_Speed=document.getElementById("ISOtext").value;
		Exposure_H18=10.0/ISO_Speed; 
		Exposure_H100=Exposure_H18*100.0/18.0; //lux-s = lumen.s/m2
		lambda=document.getElementById("lambda").value;
		phEfficiency=photopicEfficiency(lambda);
		Exposure_H100e=(pixelsize*pixelsize)*Exposure_H100/(683.002*phEfficiency); //m2 * (lumen.s/m2) / (lumen/W) = W.s=J
		var h_times_c=1.989e-25; //Planck constant * speed of light [J/m]
		photonEnergy = h_times_c/(lambda*1e-9); //photon energy in J
		Exposure_H100ph=Exposure_H100e/photonEnergy; //photon count for saturation		
	}else if(document.getElementById("Quantum").style.display == 'block'){
		//Quantum efficiency provided
		lambda=Number(document.getElementById("lambdaQE").value);
		var SensorQE=Number(document.getElementById("qeff").value);
		var SatElectrons=Number(document.getElementById("eSat").value);
				
		Exposure_H100ph=SatElectrons/(SensorQE/100);
		
		var h_times_c=1.989e-25; //Planck constant * speed of light [J/m]
		photonEnergy = h_times_c/(lambda*1e-9); //photon energy in J
		Exposure_H100e=Exposure_H100ph*photonEnergy; //Energy for saturation	
	}else if(document.getElementById("SatPhotons").style.display == 'block'){
		//Saturation photons input directly
		lambda=Number(document.getElementById("lambda_Direct").value);
		Exposure_H100ph=Number(document.getElementById("H100ph_Direct").value);
		
		var h_times_c=1.989e-25; //Planck constant * speed of light [J/m]
		photonEnergy = h_times_c/(lambda*1e-9); //photon energy in J
		Exposure_H100e=Exposure_H100ph*photonEnergy; //Energy for saturation	
	}else{
		return;
	}
	
	//Does the remainder calculations
	lensdist=(focaldist*particledist)/(particledist-focaldist);	
		
	
	Abeam_m2=wbeam_mm*lbeam_mm/1e6;
	E_laser=Qlaser/((t_ns*1e-9)*Abeam_m2);	

	radFlux=Math.PI*particleRadius_m*particleRadius_m*E_laser;	//Energy scattered by the particle (without considering scattering cross section) [W]
	
	
	updateCanvas();	
	updateMieScatteringPlot();
	updateTextBoxes();	
	
	saveFormAsCookie();
}

function updateTextBoxes(){
	document.getElementById("ISOtext").value=ISO_Speed;
	document.getElementById("H18").value=expo(Exposure_H18, 3);
	document.getElementById("H100").value=expo(Exposure_H100, 3);
	document.getElementById("H100e").value=expo(Exposure_H100e, 3);
	document.getElementById("H100ph").value=Exposure_H100ph.toFixed(0);
	document.getElementById("phEff").value=phEfficiency.toFixed(4);
	document.getElementById("photonEnergy").value=expo(photonEnergy, 4);
	document.getElementById("irradiance").value=expo(E_laser,3);
	document.getElementById("radflux").value=expo(radFlux,3);
	document.getElementById("photonsPerPixelPerp").value=photonsPerPixelPerp.toFixed(0) + ' (' + (100*photonsPerPixelPerp/Exposure_H100ph).toFixed(1) + '%)';
	document.getElementById("photonsPerPixelPar").value=photonsPerPixelPar.toFixed(0) + ' (' + (100*photonsPerPixelPar/Exposure_H100ph).toFixed(1) + '%)';
		
	document.getElementById("photonEnergyQE").value=expo(photonEnergy, 4);
	document.getElementById("H100e_QE").value=expo(Exposure_H100e, 3);
	document.getElementById("H100ph_QE").value=Exposure_H100ph.toFixed(0);
	
	document.getElementById("photonEnergy_Direct").value=expo(photonEnergy, 4);
	document.getElementById("H100e_Direct").value=expo(Exposure_H100e, 3);
}

function updateMieScatteringPlot(){
	//Computes the Mie Scattering
	var nAngles = 500;
	var X=2*Math.PI*particleRadius_m/(lambda*1e-9);
	var RefRel = new ComplexNumber(IOR_Re/IOR_Medium,IOR_Im/IOR_Medium);
	var bhOut=bhmie(X,RefRel,nAngles);
	var Aparticle=2*particleRadius_m*particleRadius_m; //Particle area
	
	//Now we have the scattering coefficients we just need to compute and graph out the intensities as seen by the camera
	var n; var theta; var dtheta; var IrradianceAtLens; var EnergyCollected; var minAngleFromCamera = 1e6;
	var scatteringMultiplier;
	ScatteringPlotDataPerp=[];
	ScatteringPlotDataPar=[];
	
	dtheta=Math.PI/(2*nAngles-1);
	var kr = 2*Math.PI*particledist/(lambda*1e-9);
	var gaussianPeakRatio = gaussianMax / gaussianTotal;
	for (n=1;n<=(2*nAngles-1);n++) {
		theta=180 * (n-1)/(2*nAngles-1);
		
		//Computes the luminous flux by the particle given the scattering parameters [Perpendicular]		
		IrradianceAtLens=E_laser * bhOut.S1[n].modSquared() / (2*kr*kr); //Irradiance at the lens (W/m2)
		EnergyCollected=(t_ns*1e-9)*IrradianceAtLens*(Math.pow(focaldist/fnumber,2)*Math.PI/4); //Energy collected by lens, J
		PhotonsCollectedPerp=gaussianPeakRatio * EnergyCollected/photonEnergy; //Photons collected [number of photons]			
		ScatteringPlotDataPerp.push({x: theta,y:PhotonsCollectedPerp});
		
		//Computes the luminous flux by the particle given the scattering parameters [Parallel]	
		IrradianceAtLens=E_laser * bhOut.S2[n].modSquared() / (2*kr*kr); //Irradiance at the lens (W/m2)
		EnergyCollected=(t_ns*1e-9)*IrradianceAtLens*(Math.pow(focaldist/fnumber,2)*Math.PI/4); //Energy collected by lens, J
		PhotonsCollectedPar=gaussianPeakRatio * EnergyCollected/photonEnergy; //Photons collected [number of photons]			
		ScatteringPlotDataPar.push({x: theta,y:PhotonsCollectedPar});
		
		//Sees if this is the closest we can get from the camera
		if (Math.abs(theta-camAngle)<minAngleFromCamera){
			minAngleFromCamera=Math.abs(theta-camAngle);
			photonsPerPixelPerp=PhotonsCollectedPerp;
			photonsPerPixelPar=PhotonsCollectedPar;
		}
	}
	//Populates the saturation line
	ScatteringPlotSaturationPhotons=[];
	ScatteringPlotSaturationPhotons.push({x: 0,y:Exposure_H100ph});
	ScatteringPlotSaturationPhotons.push({x: 180,y:Exposure_H100ph});
	
	ScatteringPlot.options.scales.yAxes[0].type='logarithmic';
	ScatteringPlot.options.scales.xAxes[0].type='linear';
	ScatteringPlot.data.datasets[0].data = ScatteringPlotDataPerp;
	ScatteringPlot.data.datasets[1].data = ScatteringPlotDataPar;
	ScatteringPlot.data.datasets[2].data = ScatteringPlotSaturationPhotons;
    
	ScatteringPlot.update();
}

function updateCanvas(){
	//Makes a little image of the particle as a gaussian
	var nstd=2;
	var arrSize = 1+2*nstd*Math.ceil(particleImageStdPx);
	particleGaussian = [...Array(arrSize)].map(e => Array(arrSize).fill(0));
	gaussianTotal = 0;
	gaussianMax = 0;	
	for (i=0; i<arrSize; i++){
		for (j=0; j<arrSize; j++){
			var x= i - nstd*Math.ceil(particleImageStdPx);
			var y= j - nstd*Math.ceil(particleImageStdPx);
			particleGaussian[i][j] = Math.exp(-(x*x+y*y)/(particleImageStdPx*particleImageStdPx));
			gaussianTotal+=particleGaussian[i][j];
			gaussianMax = Math.max(gaussianMax, particleGaussian[i][j]);
		}
	}
	
	//Normalizes and draws
	const canvas = document.getElementById('PixelPlot');
	const ctx = canvas.getContext('2d');
	var dx=0; var dy=25;
	var tilesize = canvas.width / arrSize;
	var thickness = 1;
	for (i=0; i<arrSize; i++){
		for (j=0; j<arrSize; j++){
			particleGaussian[i][j] /= gaussianMax;
			var grayLevel = Math.floor(particleGaussian[i][j] * 256);
			ctx.fillStyle = 'rgb(180, 180, 180)';
			ctx.fillRect(i * tilesize+dx, j * tilesize+dy, tilesize+dx, tilesize+dy);
			ctx.fillStyle = 'rgb(' + grayLevel + ',' + grayLevel + ',' + grayLevel + ')';
			ctx.fillRect(i * tilesize + thickness+dx, j * tilesize + thickness+dy, tilesize - (2*thickness)+dx, tilesize - (2*thickness)+dy);
		}
	}	
	ctx.font = "14px serif";
	ctx.textAlign = "center"; 
	ctx.fillText("Particle Shape on Pixels", canvas.width/ 2, dy/2);
	
	
}

function saveFormAsCookie(){
	//This function saves the form contents as a cookie so when you close the page it will reload with the same values
	const form = document.querySelectorAll('input');
	
	for (i=0; i<form.length; i++){
		if(!form[i].disabled){
			var ID = form[i].id;
			var value = form[i].value;
			setCookie(ID, value, 30);
			//console.log("Saved Cookie: " + ID + "=" + value);
		}
	}
}

function loadFormFromCookies(){
	//This function loads the cookies into the form
	const form = document.querySelectorAll('input');
	
	for (i=0; i<form.length; i++){
		if(!form[i].disabled){
			var ID = form[i].id;
			var cookie = getCookie(ID);			
			if (cookie!=""){
				form[i].value=cookie;		
				//console.log("Loaded Cookie" + ID + "=" + cookie);				
			}				
		}
	}
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}