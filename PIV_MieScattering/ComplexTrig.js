function cosh(x) {
  return (Math.exp(x) + Math.exp(-x)) / 2;
}
function sinh(x) {
  return (Math.exp(x) - Math.exp(-x)) / 2;
}
function cos(z) {
  return new ComplexNumber(Math.cos(z.real)*cosh(z.imaginary),-Math.sin(z.real)*sinh(z.imaginary));
}
function sin(z) {
  return new ComplexNumber(Math.sin(z.real)*cosh(z.imaginary),Math.cos(z.real)*sinh(z.imaginary));
}
function div(z1,z2) {
  return z1.mult(z2.real,-z2.imaginary).mult(1/Math.pow(z2.mod(),2),0);
}
function pow(z,n) {
  var result=new ComplexNumber(1,0);
  for (var i=0;i<n;i++)
    result=result.mult(z);
  return result;
}

function csqrt(z) {
// See https://en.wikipedia.org/wiki/Complex_number#Square_root
  var a=z.real,b=z.imaginary,gamma,delta;
  gamma=Math.sqrt((a+Math.sqrt(a*a+b*b))/2);
  delta= (b>0?1:(b<0?-1:0))*Math.sqrt((-a+Math.sqrt(a*a+b*b))/2);
  return new ComplexNumber (gamma,delta);
}
