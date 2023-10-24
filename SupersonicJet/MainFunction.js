var WorkingFluids = ["Air", "Nitrogen", "Oxygen", "Helium"];
var Rvalues = [287.05, 296.8, 259.84, 2077.1];
var gammaValues = [1.4, 1.4, 1.4, 1.6666];

var M; var R; var gamma; var T0; var Pamb; var dThroat; var D0;
var P0; var rho0; var NPR; var NTR; var densityRatio; 
var TTR; var TPR; var densityRatioThroat; var areaRatio;
var Tthroat; var Pthroat; var rhothroat; var athroat;
var Texit; var Pexit; var rhoexit; var aexit; var vexit;
var mdot; var Areathroat; var Areaexit;
var ainlet; var vinlet; var Minlet;
var Thrust; var CompressorPower; var FlowPower;



function init(){
	//Fills the form with the default values
	document.getElementById("Mach").value="1.5";
	document.getElementById("WorkingFluid").value="Air";
	document.getElementById("T0").value="25";
	document.getElementById("Pamb").value="103250";
	document.getElementById("dThroat").value="25";
	document.getElementById("D0").value="63";
	
	
	
	//Tries to review if the form has cookies and loads them
	loadFormFromCookies();
	Recalculate();
}

function expo(x, f) {
  //return Number.parseFloat(x).toExponential(f);
  var x2;
  
  if (x<1e-12){
	  return Number.parseFloat(x).toExponential(f);
  }else if(x<1e-9){
	  x2=x/1e-12;
	  return x2.toFixed(f) + "p"
  }else if(x<1e-6){
	  x2=x/1e-9;
	  return x2.toFixed(f) + "n"
  }else if(x<1e-3){
	  x2=x/1e-6;
	  return x2.toFixed(f) + "μ"
  }else if(x<1){
	  x2=x/1e-3;
	  return x2.toFixed(f) + "m"
  }else if(x<1e3){
	  x2=x;
	  return x2.toFixed(f)
  }else if(x<1e6){
	  x2=x/1e3;
	  return x2.toFixed(f) + "k"
  }else if(x<1e9){
	  x2=x/1e6;
	  return x2.toFixed(f) + "M"
  }else if(x<1e12){
	  x2=x/1e9;
	  return x2.toFixed(f) + "G"
  }else if(x<1e15){
	  x2=x/1e12;
	  return x2.toFixed(f) + "T"
  }else{
	  return Number.parseFloat(x).toExponential(f);
  }
  
  
}


function Recalculate(){
	//Recalculates the whole page.
	
	//Finds working fluid and updates text boxes R and gamma
	ThisFluid=document.getElementById("WorkingFluid").value;
	if (ThisFluid === "Custom"){
		document.getElementById("gamma").disabled = false;
		document.getElementById("R").disabled = false;
	}else{	
		document.getElementById("gamma").disabled = true;
		document.getElementById("R").disabled = true;		
		for (var i=0; i<WorkingFluids.length; i++){
			if (ThisFluid === WorkingFluids[i]){
				document.getElementById("R").value = Rvalues[i];
				document.getElementById("gamma").value = gammaValues[i];
			}
		}
	}
	
	//Recalulates the Form
	//Inputs
	M = Number(document.getElementById("Mach").value);
	R = Number(document.getElementById("R").value);
	gamma = Number(document.getElementById("gamma").value);
	T0 = Number(document.getElementById("T0").value);
	Pamb = Number(document.getElementById("Pamb").value);
	dThroat = Number(document.getElementById("dThroat").value);
	D0 = Number(document.getElementById("D0").value);
	
	//Outputs
	NPR =1/((1+((gamma-1)/2)*(M**2))**(-gamma/(gamma-1)));
	NTR=(1+((gamma-1)/2)*(M**2));
	densityRatio=1/((1+((gamma-1)/2)*(M**2))**(-1/(gamma-1)));
	
	TPR=1/(((gamma+1)/(2*(1+((gamma-1)/2)*(M**2))))**(gamma/(gamma-1)));
	densityRatioThroat=TPR**(1/gamma);
	TTR=TPR/densityRatioThroat;
	areaRatio=(((gamma+1)/2)**(-(gamma+1)/(2*(gamma-1))))*(((1+(M**2)*(gamma-1)/2)**((gamma+1)/(2*(gamma-1))))/M);
	
	P0=Pamb*NPR;
	rho0=P0/((T0+273)*R);
	
	Tthroat=(T0+273)*TTR/NTR - 273;
	Pthroat=TPR*Pamb;
	rhothroat=rho0*densityRatioThroat/densityRatio;
	athroat=Math.sqrt(gamma*R*(Tthroat+273));
	
	Texit=(T0+273)/NTR - 273;
	Pexit=Pthroat/TPR;
	rhoexit=rhothroat/densityRatioThroat;
	aexit=Math.sqrt(gamma*R*(Texit+273));
	vexit=aexit*M;
	
	Areathroat=Math.PI*(dThroat**2)/4;
	Areaexit=Areathroat*areaRatio;
	Dexit=Math.sqrt(Areaexit*4/Math.PI);	
	
	ainlet=Math.sqrt(gamma*R*(T0+273));
	mdot=(rhoexit*vexit*(Areaexit/1000000))*1000; //g/s
	vinlet=((mdot/1000)/rho0)/(((D0**2)*Math.PI/4)/1000000);
	Minlet=vinlet/ainlet;
	
	Thrust=(mdot/1000)*vexit;
	CompressorPower=(mdot/1000)*(R/(1-1/gamma))*(((273+T0)*NPR**((gamma-1)/gamma))-(T0+273));
	FlowPower=(mdot/1000)*(athroat**2)/2;
	
	updateTextBoxes();
	saveFormAsCookie();
}

function updateTextBoxes(){
	document.getElementById("NPR").value=NPR.toFixed(2);
	document.getElementById("NTR").value=NTR.toFixed(3);
	document.getElementById("densityRatio").value=densityRatio.toFixed(3);
	document.getElementById("TPR").value=TPR.toFixed(3);
	document.getElementById("TTR").value=TTR.toFixed(3);
	document.getElementById("densityRatioThroat").value=densityRatioThroat.toFixed(3);
	document.getElementById("P0").value=expo(P0,2);
	document.getElementById("rho0").value=rho0.toFixed(3);
	document.getElementById("areaRatio").value=areaRatio.toFixed(3);
	
	document.getElementById("Tthroat").value=Tthroat.toFixed(1);
	document.getElementById("Pthroat").value=expo(Pthroat,2);
	document.getElementById("rhothroat").value=rhothroat.toFixed(2);
	document.getElementById("athroat").value=athroat.toFixed(1);
	
	document.getElementById("Texit").value=Texit.toFixed(1);
	document.getElementById("Pexit").value=expo(Pexit,2);
	document.getElementById("rhoexit").value=rhoexit.toFixed(2);
	document.getElementById("aexit").value=aexit.toFixed(1);
	document.getElementById("vexit").value=vexit.toFixed(1);
	
	document.getElementById("Tinlet").value=T0.toFixed(1);
	document.getElementById("Pinlet").value=expo(P0,2);
	document.getElementById("rhoinlet").value=rho0.toFixed(2);
	document.getElementById("ainlet").value=ainlet.toFixed(1);
	document.getElementById("vinlet").value=vinlet.toFixed(1);
	document.getElementById("Minlet").value=Minlet.toFixed(3);
	
	document.getElementById("Areathroat").value=Areathroat.toFixed(2);
	document.getElementById("Areaexit").value=Areaexit.toFixed(2);
	document.getElementById("Dexit").value=Dexit.toFixed(3);
	
	document.getElementById("mdot").value=expo(mdot,2);
	document.getElementById("Thrust").value=expo(Thrust,2);
	document.getElementById("CompressorPower").value=expo(CompressorPower,2);
	document.getElementById("FlowPower").value=expo(FlowPower,2);
	
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