function bhmie(X,REFREL,NANG) {
// Declare parameters:
// Note: important that MXNANG be consistent with dimension of S1 and S2
//       in calling routine!
//      PARAMETER(MXNANG=1000,NMXX=15000)
var MXNANG=10000,NMXX=150000;
// Arguments:
//var NANG;
//var GSCA,QBACK,QEXT,QSCA,X;
//var REFREL;
// S1(2*MXNANG-1),S2(2*MXNANG-1);
// Local variables:
var J,JJ,N,NSTOP,NMX,NN;
var CHI,CHI0,CHI1,DANG,DX,EN,FN,P,PII,PSI,PSI0,PSI1,THETA,XSTOP,YMOD;
var AMU=new Array(),PI=new Array(),PI0=new Array(),PI1=new Array(),TAU=new Array();
var AN,AN1,BN,BN1,DREFRL,XI,XI1,Y,ENY;
var D=new Array();
//***********************************************************************
// Subroutine BHMIE is the Bohren-Huffman Mie scattering subroutine
//    to calculate scattering and absorption by a homogenous isotropic
//    sphere.
// Given:
//    X = 2*pi*a/lambda
//    REFREL = (complex refr. index of sphere)/(real index of medium)
//    NANG = number of angles between 0 and 90 degrees
//           (will calculate 2*NANG-1 directions from 0 to 180 deg.)
//           if called with NANG<2, will set NANG=2 and will compute
//           scattering for theta=0,90,180.
// Returns:
//    S1(1 - 2*NANG-1) = -i*f_22 (incid. E perp. to scatt. plane,
//                                scatt. E perp. to scatt. plane)
//    S2(1 - 2*NANG-1) = -i*f_11 (incid. E parr. to scatt. plane,
//                                scatt. E parr. to scatt. plane)
//    QEXT = C_ext/pi*a**2 = efficiency factor for extinction
//    QSCA = C_sca/pi*a**2 = efficiency factor for scattering
//    QBACK = (dC_sca/domega)/pi*a**2
//          = backscattering efficiency [NB: this is (1/4*pi) smaller
//            than the "radar backscattering efficiency"; see Bohren &
//            Huffman 1983 pp. 120-123]
//    GSCA = <cos(theta)> for scattering
//
// Original program taken from Bohren and Huffman (1983), Appendix A
// Modified by B.T.Draine, Princeton Univ. Obs., 90/10/26
// in order to compute <cos(theta)>
// 91/05/07 (BTD): Modified to allow NANG=1
// 91/08/15 (BTD): Corrected error (failure to initialize P)
// 91/08/15 (BTD): Modified to enhance vectorizability.
// 91/08/15 (BTD): Modified to make NANG=2 if called with NANG=1
// 91/08/15 (BTD): Changed definition of QBACK.
// 92/01/08 (BTD): Converted to full double precision and double complex
//                 eliminated 2 unneed lines of code
//                 eliminated redundant variables (e.g. APSI,APSI0)
//                 renamed RN -> EN = double precision N
//                 Note that DOUBLE COMPLEX and DCMPLX are not part
//                 of f77 standard, so this version may not be fully
//                 portable.  In event that portable version is
//                 needed, use src/bhmie_f77.f
// 93/06/01 (BTD): Changed AMAX1 to generic function MAX
//***********************************************************************
//*** Safety checks
if (NANG>MXNANG) {
  alert('***Error: NANG > MXNANG in bhmie');
  return;
}
if(NANG<2) NANG=2;
//*** Obtain pi:
PII=Math.PI;
DX=X;
DREFRL=REFREL;
Y=DREFRL.mult(X,0);
YMOD=Y.mod();
//
//*** Series expansion terminated after NSTOP terms
//    Logarithmic derivatives calculated from NMX on down
XSTOP=X+4*Math.pow(X,1/3)+2;
NMX=Math.round(Math.max(XSTOP,YMOD)+15);
// BTD experiment 91/1/15: add one more term to series and compare results
//      NMX=AMAX1(XSTOP,YMOD)+16
// test: compute 7001 wavelengths between .0001 and 1000 micron
// for a=1.0micron SiC grain.  When NMX increased by 1, only a single
// computed number changed (out of 4*7001) and it only changed by 1/8387
// conclusion: we are indeed retaining enough terms in series!
NSTOP=XSTOP;
//
if (NMX>NMXX) {
  alert('Error: NMX > NMXX='+NMXX+' for |m|x='+YMOD);
  return;
}
//*** Require NANG.GE.1 in order to calculate scattering intensities
DANG=0.;
if (NANG>1) DANG=.5*PII/(NANG-1);
for (J=1;J<=NANG;J++) {
  THETA=(J-1)*DANG;
  AMU[J]=Math.cos(THETA);
}
for (J=1;J<=NANG;J++) {
          PI0[J]=0;
          PI1[J]=1;
}
NN=2*NANG-1;
for (J=1;J<=NN;J++) {
          S1[J]=new ComplexNumber(0,0);
          S2[J]=new ComplexNumber(0,0);
}
//
//*** Logarithmic derivative D(J) calculated by downward recurrence
//    beginning with initial value (0.,0.) at J=NMX
//
D[NMX]=new ComplexNumber(0.,0.);
NN=NMX-1;
for (N=1;N<=NN;N++) {
          EN=NMX-N+1;
	  ENY=new ComplexNumber(EN,0).div(Y);
          D[NMX-N]=ENY.sub(new ComplexNumber(1,0).div(D[NMX-N+1].add(ENY)));
}
//
//*** Riccati-Bessel functions with real argument X
//    calculated by upward recurrence
//
      PSI0=Math.cos(DX);
      PSI1=Math.sin(DX);
      CHI0=-Math.sin(DX);
      CHI1=Math.cos(DX);
      XI1=new ComplexNumber(PSI1,-CHI1);
      QSCA=0;
      GSCA=0;
      P=-1;
for (N=1;N<=NSTOP;N++) {
          EN=N;
          FN=(2*EN+1)/(EN*(EN+1));
		// for given N, PSI  = psi_n        CHI  = chi_n
		//              PSI1 = psi_{n-1}    CHI1 = chi_{n-1}
		//              PSI0 = psi_{n-2}    CHI0 = chi_{n-2}
		// Calculate psi_n and chi_n
				  PSI=(2*EN-1)*PSI1/DX-PSI0;
				  CHI=(2*EN-1)*CHI1/DX-CHI0;
				  XI=new ComplexNumber(PSI,-CHI);
		//
		//*** Store previous values of AN and BN for use
		//    in computation of g=<cos(theta)>
		if (N>1) {
					  AN1=AN;
					  BN1=BN;
		}
		//
		//*** Compute AN and BN:
				  AN=D[N].div(DREFRL).add(EN/DX,0).mult(PSI,0).sub(PSI1,0);
				  AN=AN.div(D[N].div(DREFRL).add(EN/DX,0).mult(XI).sub(XI1));
				  BN=DREFRL.mult(D[N]).add(EN/DX,0).mult(PSI,0).sub(PSI1,0);
				  BN=BN.div(DREFRL.mult(D[N]).add(EN/DX,0).mult(XI).sub(XI1));
		//
		//*** Augment sums for Qsca and g=<cos(theta)>
				  QSCA=QSCA+(2*EN+1)*(Math.pow(AN.mod(),2)+Math.pow(BN.mod(),2));
				  GSCA=GSCA+((2*EN+1)/(EN*(EN+1)))*(AN.real*BN.real+AN.imaginary*BN.imaginary);
		if (N>1) {
					  GSCA=GSCA+((EN-1)*(EN+1)/EN)*
				(AN1.real*AN.real+AN1.imaginary*AN.imaginary+
					BN1.real*BN.real+BN1.imaginary*BN.imaginary);
		}
		//
		//*** Now calculate scattering intensity pattern
		//    First do angles from 0 to 90
		for (J=1;J<=NANG;J++) {
					  JJ=2*NANG-J;
					  PI[J]=PI1[J];
					  TAU[J]=EN*AMU[J]*PI[J]-(EN+1)*PI0[J];
					  S1[J]=S1[J].add(AN.mult(FN*PI[J],0)).add(BN.mult(FN*TAU[J],0));
					  S2[J]=S2[J].add(AN.mult(FN*TAU[J],0)).add(BN.mult(FN*PI[J],0));
		}
		//
		//*** Now do angles greater than 90 using PI and TAU from
		//    angles less than 90.
		//    P=1 for N=1,3,...; P=-1 for N=2,4,...
				  P=-P;
		for (J=1;J<=NANG-1;J++) {
					  JJ=2*NANG-J;
					  S1[JJ]=S1[JJ].add(AN.mult(FN*P*PI[J],0).sub(BN.mult(FN*P*TAU[J],0)));
					  S2[JJ]=S2[JJ].add(AN.mult(FN*P*TAU[J],0).sub(BN.mult(FN*P*PI[J],0)));
		}
				  PSI0=PSI1;
				  PSI1=PSI;
				  CHI0=CHI1;
				  CHI1=CHI;
				  XI1=new ComplexNumber(PSI1,-CHI1);
		//
		//*** Compute pi_n for next value of n
		//    For each angle J, compute pi_n+1
		//    from PI = pi_n , PI0 = pi_n-1
		for (J=1;J<=NANG;J++) {
					  PI1[J]=((2*EN+1)*AMU[J]*PI[J]-(EN+1)*PI0[J])/EN;
					  PI0[J]=PI[J];
		}
}
//
//*** Have summed sufficient terms.
//    Now compute QSCA,QEXT,QBACK,and GSCA
      GSCA=2.*GSCA/QSCA;
      QSCA=(2./(DX*DX))*QSCA;
      QEXT=(4./(DX*DX))*S1[1].real;
      QBACK=Math.pow(S1[2*NANG-1].mod()/DX,2)/PII;
      var QABS=QEXT-QSCA;
//  document.write('<p>bhmie:'+QEXT+' '+QSCA+' '+QABS+' '+GSCA+' '+QBACK+'</p>');
      //return [QEXT,QSCA];
	  var S = {};
	  S.S1=S1;
	  S.S2=S2;
	  return S;
}

function mie (REFMED,REFRELN,REFRELK,RAD,WAVEL,NANG) {
  var REFREL=new ComplexNumber(REFRELN,REFRELK).div(REFMED,0);
  var X=REFMED*2*Math.PI*RAD/WAVEL;
//  document.write('<p>mie '+REFMED+' '+REFRELN+' '+REFRELK+' '+RAD+' '+WAVEL+' '+NANG+'</p>');
  
  return bhmie(X,REFREL,NANG);
}

S1=new Array();
S2=new Array();
QEXT=0;
QSCA=0;
QBACK=0;
GSCA=0;
