(()=>{var od=0,Dc=1,ad=2;var Wh=1,ql=2,Un=3,ei=0,Ne=1,Fn=2,bn=0,Ji=1,Vr=2,Uc=3,Nc=4,ld=5,mi=100,cd=101,hd=102,ud=103,dd=104,fd=200,pd=201,md=202,gd=203,wa=204,Ta=205,_d=206,xd=207,vd=208,yd=209,Md=210,Sd=211,bd=212,Ed=213,wd=214,Aa=0,Ra=1,Ca=2,ts=3,Pa=4,Ia=5,La=6,Da=7,Xh=0,Td=1,Ad=2,ti=0,Zl=1,$l=2,Jl=3,js=4,Rd=5,Kl=6,Ql=7;var Yh=300,es=301,ns=302,Ua=303,Na=304,bo=306,ks=1e3,xi=1001,Vs=1002,$e=1003,Cd=1004;var ur=1005;var Mn=1006,qo=1007;var vi=1008;var zn=1009,qh=1010,Zh=1011,Gs=1012,jl=1013,yi=1014,Sn=1015,gn=1016,tc=1017,ec=1018,is=1020,$h=35902,Jh=1021,Kh=1022,fn=1023,Qh=1024,jh=1025,Ki=1026,ss=1027,nc=1028,ic=1029,tu=1030,sc=1031;var rc=1033,Or=33776,Br=33777,zr=33778,Hr=33779,Fa=35840,Oa=35841,Ba=35842,za=35843,Ha=36196,ka=37492,Va=37496,Ga=37808,Wa=37809,Xa=37810,Ya=37811,qa=37812,Za=37813,$a=37814,Ja=37815,Ka=37816,Qa=37817,ja=37818,tl=37819,el=37820,nl=37821,kr=36492,il=36494,sl=36495,eu=36283,rl=36284,ol=36285,al=36286;var Gr=2300,ll=2301,Zo=2302,Fc=2400,Oc=2401,Bc=2402;var Pd=3200,Id=3201;var nu=0,Ld=1,jn="",Ue="srgb",fs="srgb-linear",Eo="linear",ne="srgb";var Li=7680;var zc=519,Dd=512,Ud=513,Nd=514,iu=515,Fd=516,Od=517,Bd=518,zd=519,Hc=35044;var kc="300 es",On=2e3,Wr=2001,Hn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;let s=this._listeners[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;let n=this._listeners[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},Le=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Vc=1234567,Ns=Math.PI/180,Ws=180/Math.PI;function wi(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Le[i&255]+Le[i>>8&255]+Le[i>>16&255]+Le[i>>24&255]+"-"+Le[t&255]+Le[t>>8&255]+"-"+Le[t>>16&15|64]+Le[t>>24&255]+"-"+Le[e&63|128]+Le[e>>8&255]+"-"+Le[e>>16&255]+Le[e>>24&255]+Le[n&255]+Le[n>>8&255]+Le[n>>16&255]+Le[n>>24&255]).toLowerCase()}function Te(i,t,e){return Math.max(t,Math.min(e,i))}function oc(i,t){return(i%t+t)%t}function Hd(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function kd(i,t,e){return i!==t?(e-i)/(t-i):0}function Fs(i,t,e){return(1-e)*i+e*t}function Vd(i,t,e,n){return Fs(i,t,1-Math.exp(-e*n))}function Gd(i,t=1){return t-Math.abs(oc(i,t*2)-t)}function Wd(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function Xd(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function Yd(i,t){return i+Math.floor(Math.random()*(t-i+1))}function qd(i,t){return i+Math.random()*(t-i)}function Zd(i){return i*(.5-Math.random())}function $d(i){i!==void 0&&(Vc=i);let t=Vc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Jd(i){return i*Ns}function Kd(i){return i*Ws}function Qd(i){return(i&i-1)===0&&i!==0}function jd(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function tf(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function ef(i,t,e,n,s){let r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+n)/2),h=o((t+n)/2),f=r((t-n)/2),d=o((t-n)/2),u=r((n-t)/2),m=o((n-t)/2);switch(s){case"XYX":i.set(a*h,l*f,l*d,a*c);break;case"YZY":i.set(l*d,a*h,l*f,a*c);break;case"ZXZ":i.set(l*f,l*d,a*h,a*c);break;case"XZX":i.set(a*h,l*m,l*u,a*c);break;case"YXY":i.set(l*u,a*h,l*m,a*c);break;case"ZYZ":i.set(l*m,l*u,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function qi(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Fe(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var tr={DEG2RAD:Ns,RAD2DEG:Ws,generateUUID:wi,clamp:Te,euclideanModulo:oc,mapLinear:Hd,inverseLerp:kd,lerp:Fs,damp:Vd,pingpong:Gd,smoothstep:Wd,smootherstep:Xd,randInt:Yd,randFloat:qd,randFloatSpread:Zd,seededRandom:$d,degToRad:Jd,radToDeg:Kd,isPowerOfTwo:Qd,ceilPowerOfTwo:jd,floorPowerOfTwo:tf,setQuaternionFromProperEuler:ef,normalize:Fe,denormalize:qi},K=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Te(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Gt=class i{constructor(t,e,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],f=n[7],d=n[2],u=n[5],m=n[8],_=s[0],g=s[3],p=s[6],b=s[1],v=s[4],x=s[7],L=s[2],T=s[5],C=s[8];return r[0]=o*_+a*b+l*L,r[3]=o*g+a*v+l*T,r[6]=o*p+a*x+l*C,r[1]=c*_+h*b+f*L,r[4]=c*g+h*v+f*T,r[7]=c*p+h*x+f*C,r[2]=d*_+u*b+m*L,r[5]=d*g+u*v+m*T,r[8]=d*p+u*x+m*C,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],f=h*o-a*c,d=a*l-h*r,u=c*r-o*l,m=e*f+n*d+s*u;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/m;return t[0]=f*_,t[1]=(s*c-h*n)*_,t[2]=(a*n-s*o)*_,t[3]=d*_,t[4]=(h*e-s*l)*_,t[5]=(s*r-a*e)*_,t[6]=u*_,t[7]=(n*l-c*e)*_,t[8]=(o*e-n*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply($o.makeScale(t,e)),this}rotate(t){return this.premultiply($o.makeRotation(-t)),this}translate(t,e){return this.premultiply($o.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},$o=new Gt;function su(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Xr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function nf(){let i=Xr("canvas");return i.style.display="block",i}var Gc={};function Ds(i){i in Gc||(Gc[i]=!0,console.warn(i))}function sf(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function rf(i){let t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function of(i){let t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}var qt={enabled:!0,workingColorSpace:fs,spaces:{},convert:function(i,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===ne&&(i.r=Bn(i.r),i.g=Bn(i.g),i.b=Bn(i.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(i.applyMatrix3(this.spaces[t].toXYZ),i.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===ne&&(i.r=Qi(i.r),i.g=Qi(i.g),i.b=Qi(i.b))),i},fromWorkingColorSpace:function(i,t){return this.convert(i,this.workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===jn?Eo:this.spaces[i].transfer},getLuminanceCoefficients:function(i,t=this.workingColorSpace){return i.fromArray(this.spaces[t].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,t,e){return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function Bn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Qi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Wc=[.64,.33,.3,.6,.15,.06],Xc=[.2126,.7152,.0722],Yc=[.3127,.329],qc=new Gt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Zc=new Gt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);qt.define({[fs]:{primaries:Wc,whitePoint:Yc,transfer:Eo,toXYZ:qc,fromXYZ:Zc,luminanceCoefficients:Xc,workingColorSpaceConfig:{unpackColorSpace:Ue},outputColorSpaceConfig:{drawingBufferColorSpace:Ue}},[Ue]:{primaries:Wc,whitePoint:Yc,transfer:ne,toXYZ:qc,fromXYZ:Zc,luminanceCoefficients:Xc,outputColorSpaceConfig:{drawingBufferColorSpace:Ue}}});var Di,cl=class{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Di===void 0&&(Di=Xr("canvas")),Di.width=t.width,Di.height=t.height;let n=Di.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Di}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Xr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Bn(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Bn(e[n]/255)*255):e[n]=Bn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},af=0,Yr=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:af++}),this.uuid=wi(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Jo(s[o].image)):r.push(Jo(s[o]))}else r=Jo(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Jo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?cl.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var lf=0,Ge=class i extends Hn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=xi,s=xi,r=Mn,o=vi,a=fn,l=zn,c=i.DEFAULT_ANISOTROPY,h=jn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:lf++}),this.uuid=wi(),this.name="",this.source=new Yr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new K(0,0),this.repeat=new K(1,1),this.center=new K(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Gt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Yh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ks:t.x=t.x-Math.floor(t.x);break;case xi:t.x=t.x<0?0:1;break;case Vs:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ks:t.y=t.y-Math.floor(t.y);break;case xi:t.y=t.y<0?0:1;break;case Vs:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ge.DEFAULT_IMAGE=null;Ge.DEFAULT_MAPPING=Yh;Ge.DEFAULT_ANISOTROPY=1;var me=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],h=l[4],f=l[8],d=l[1],u=l[5],m=l[9],_=l[2],g=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(f-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(f+_)<.1&&Math.abs(m+g)<.1&&Math.abs(c+u+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let v=(c+1)/2,x=(u+1)/2,L=(p+1)/2,T=(h+d)/4,C=(f+_)/4,A=(m+g)/4;return v>x&&v>L?v<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(v),s=T/n,r=C/n):x>L?x<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),n=T/s,r=A/s):L<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(L),n=C/r,s=A/r),this.set(n,s,r,e),this}let b=Math.sqrt((g-m)*(g-m)+(f-_)*(f-_)+(d-h)*(d-h));return Math.abs(b)<.001&&(b=1),this.x=(g-m)/b,this.y=(f-_)/b,this.z=(d-h)/b,this.w=Math.acos((c+u+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},hl=class extends Hn{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new me(0,0,t,e),this.scissorTest=!1,this.viewport=new me(0,0,t,e);let s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Mn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let r=new Ge(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let e=Object.assign({},t.texture.image);return this.texture.source=new Yr(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},ze=class extends hl{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},qr=class extends Ge{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=$e,this.minFilter=$e,this.wrapR=xi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var ul=class extends Ge{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=$e,this.minFilter=$e,this.wrapR=xi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Je=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],f=n[s+3],d=r[o+0],u=r[o+1],m=r[o+2],_=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f;return}if(a===1){t[e+0]=d,t[e+1]=u,t[e+2]=m,t[e+3]=_;return}if(f!==_||l!==d||c!==u||h!==m){let g=1-a,p=l*d+c*u+h*m+f*_,b=p>=0?1:-1,v=1-p*p;if(v>Number.EPSILON){let L=Math.sqrt(v),T=Math.atan2(L,p*b);g=Math.sin(g*T)/L,a=Math.sin(a*T)/L}let x=a*b;if(l=l*g+d*x,c=c*g+u*x,h=h*g+m*x,f=f*g+_*x,g===1-a){let L=1/Math.sqrt(l*l+c*c+h*h+f*f);l*=L,c*=L,h*=L,f*=L}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],f=r[o],d=r[o+1],u=r[o+2],m=r[o+3];return t[e]=a*m+h*f+l*u-c*d,t[e+1]=l*m+h*d+c*f-a*u,t[e+2]=c*m+h*u+a*d-l*f,t[e+3]=h*m-a*f-l*d-c*u,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),f=a(r/2),d=l(n/2),u=l(s/2),m=l(r/2);switch(o){case"XYZ":this._x=d*h*f+c*u*m,this._y=c*u*f-d*h*m,this._z=c*h*m+d*u*f,this._w=c*h*f-d*u*m;break;case"YXZ":this._x=d*h*f+c*u*m,this._y=c*u*f-d*h*m,this._z=c*h*m-d*u*f,this._w=c*h*f+d*u*m;break;case"ZXY":this._x=d*h*f-c*u*m,this._y=c*u*f+d*h*m,this._z=c*h*m+d*u*f,this._w=c*h*f-d*u*m;break;case"ZYX":this._x=d*h*f-c*u*m,this._y=c*u*f+d*h*m,this._z=c*h*m-d*u*f,this._w=c*h*f+d*u*m;break;case"YZX":this._x=d*h*f+c*u*m,this._y=c*u*f+d*h*m,this._z=c*h*m-d*u*f,this._w=c*h*f-d*u*m;break;case"XZY":this._x=d*h*f-c*u*m,this._y=c*u*f-d*h*m,this._z=c*h*m+d*u*f,this._w=c*h*f+d*u*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],f=e[10],d=n+a+f;if(d>0){let u=.5/Math.sqrt(d+1);this._w=.25/u,this._x=(h-l)*u,this._y=(r-c)*u,this._z=(o-s)*u}else if(n>a&&n>f){let u=2*Math.sqrt(1+n-a-f);this._w=(h-l)/u,this._x=.25*u,this._y=(s+o)/u,this._z=(r+c)/u}else if(a>f){let u=2*Math.sqrt(1+a-n-f);this._w=(r-c)/u,this._x=(s+o)/u,this._y=.25*u,this._z=(l+h)/u}else{let u=2*Math.sqrt(1+f-n-a);this._w=(o-s)/u,this._x=(r+c)/u,this._y=(l+h)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Te(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let u=1-e;return this._w=u*o+e*this._w,this._x=u*n+e*this._x,this._y=u*s+e*this._y,this._z=u*r+e*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),f=Math.sin((1-e)*h)/c,d=Math.sin(e*h)/c;return this._w=o*f+this._w*d,this._x=n*f+this._x*d,this._y=s*f+this._y*d,this._z=r*f+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion($c.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion($c.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),h=2*(a*e-r*s),f=2*(r*n-o*e);return this.x=e+l*c+o*f-a*h,this.y=n+l*h+a*c-r*f,this.z=s+l*f+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Ko.copy(this).projectOnVector(t),this.sub(Ko)}reflect(t){return this.sub(Ko.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Te(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ko=new P,$c=new Je,pn=class{constructor(t=new P(1/0,1/0,1/0),e=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(hn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(hn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=hn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,hn):hn.fromBufferAttribute(r,o),hn.applyMatrix4(t.matrixWorld),this.expandByPoint(hn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),dr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),dr.copy(n.boundingBox)),dr.applyMatrix4(t.matrixWorld),this.union(dr)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,hn),hn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(As),fr.subVectors(this.max,As),Ui.subVectors(t.a,As),Ni.subVectors(t.b,As),Fi.subVectors(t.c,As),qn.subVectors(Ni,Ui),Zn.subVectors(Fi,Ni),li.subVectors(Ui,Fi);let e=[0,-qn.z,qn.y,0,-Zn.z,Zn.y,0,-li.z,li.y,qn.z,0,-qn.x,Zn.z,0,-Zn.x,li.z,0,-li.x,-qn.y,qn.x,0,-Zn.y,Zn.x,0,-li.y,li.x,0];return!Qo(e,Ui,Ni,Fi,fr)||(e=[1,0,0,0,1,0,0,0,1],!Qo(e,Ui,Ni,Fi,fr))?!1:(pr.crossVectors(qn,Zn),e=[pr.x,pr.y,pr.z],Qo(e,Ui,Ni,Fi,fr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,hn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(hn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Cn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Cn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Cn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Cn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Cn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Cn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Cn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Cn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Cn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},Cn=[new P,new P,new P,new P,new P,new P,new P,new P],hn=new P,dr=new pn,Ui=new P,Ni=new P,Fi=new P,qn=new P,Zn=new P,li=new P,As=new P,fr=new P,pr=new P,ci=new P;function Qo(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){ci.fromArray(i,r);let a=s.x*Math.abs(ci.x)+s.y*Math.abs(ci.y)+s.z*Math.abs(ci.z),l=t.dot(ci),c=e.dot(ci),h=n.dot(ci);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var cf=new pn,Rs=new P,jo=new P,kn=class{constructor(t=new P,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):cf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Rs.subVectors(t,this.center);let e=Rs.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Rs,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(jo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Rs.copy(t.center).add(jo)),this.expandByPoint(Rs.copy(t.center).sub(jo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}},Pn=new P,ta=new P,mr=new P,$n=new P,ea=new P,gr=new P,na=new P,Zr=class{constructor(t=new P,e=new P(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Pn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Pn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Pn.copy(this.origin).addScaledVector(this.direction,e),Pn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){ta.copy(t).add(e).multiplyScalar(.5),mr.copy(e).sub(t).normalize(),$n.copy(this.origin).sub(ta);let r=t.distanceTo(e)*.5,o=-this.direction.dot(mr),a=$n.dot(this.direction),l=-$n.dot(mr),c=$n.lengthSq(),h=Math.abs(1-o*o),f,d,u,m;if(h>0)if(f=o*l-a,d=o*a-l,m=r*h,f>=0)if(d>=-m)if(d<=m){let _=1/h;f*=_,d*=_,u=f*(f+o*d+2*a)+d*(o*f+d+2*l)+c}else d=r,f=Math.max(0,-(o*d+a)),u=-f*f+d*(d+2*l)+c;else d=-r,f=Math.max(0,-(o*d+a)),u=-f*f+d*(d+2*l)+c;else d<=-m?(f=Math.max(0,-(-o*r+a)),d=f>0?-r:Math.min(Math.max(-r,-l),r),u=-f*f+d*(d+2*l)+c):d<=m?(f=0,d=Math.min(Math.max(-r,-l),r),u=d*(d+2*l)+c):(f=Math.max(0,-(o*r+a)),d=f>0?r:Math.min(Math.max(-r,-l),r),u=-f*f+d*(d+2*l)+c);else d=o>0?-r:r,f=Math.max(0,-(o*d+a)),u=-f*f+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(ta).addScaledVector(mr,d),u}intersectSphere(t,e){Pn.subVectors(t.center,this.origin);let n=Pn.dot(this.direction),s=Pn.dot(Pn)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),f>=0?(a=(t.min.z-d.z)*f,l=(t.max.z-d.z)*f):(a=(t.max.z-d.z)*f,l=(t.min.z-d.z)*f),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Pn)!==null}intersectTriangle(t,e,n,s,r){ea.subVectors(e,t),gr.subVectors(n,t),na.crossVectors(ea,gr);let o=this.direction.dot(na),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;$n.subVectors(this.origin,t);let l=a*this.direction.dot(gr.crossVectors($n,gr));if(l<0)return null;let c=a*this.direction.dot(ea.cross($n));if(c<0||l+c>o)return null;let h=-a*$n.dot(na);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ot=class i{constructor(t,e,n,s,r,o,a,l,c,h,f,d,u,m,_,g){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,h,f,d,u,m,_,g)}set(t,e,n,s,r,o,a,l,c,h,f,d,u,m,_,g){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=f,p[14]=d,p[3]=u,p[7]=m,p[11]=_,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,s=1/Oi.setFromMatrixColumn(t,0).length(),r=1/Oi.setFromMatrixColumn(t,1).length(),o=1/Oi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){let d=o*h,u=o*f,m=a*h,_=a*f;e[0]=l*h,e[4]=-l*f,e[8]=c,e[1]=u+m*c,e[5]=d-_*c,e[9]=-a*l,e[2]=_-d*c,e[6]=m+u*c,e[10]=o*l}else if(t.order==="YXZ"){let d=l*h,u=l*f,m=c*h,_=c*f;e[0]=d+_*a,e[4]=m*a-u,e[8]=o*c,e[1]=o*f,e[5]=o*h,e[9]=-a,e[2]=u*a-m,e[6]=_+d*a,e[10]=o*l}else if(t.order==="ZXY"){let d=l*h,u=l*f,m=c*h,_=c*f;e[0]=d-_*a,e[4]=-o*f,e[8]=m+u*a,e[1]=u+m*a,e[5]=o*h,e[9]=_-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let d=o*h,u=o*f,m=a*h,_=a*f;e[0]=l*h,e[4]=m*c-u,e[8]=d*c+_,e[1]=l*f,e[5]=_*c+d,e[9]=u*c-m,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let d=o*l,u=o*c,m=a*l,_=a*c;e[0]=l*h,e[4]=_-d*f,e[8]=m*f+u,e[1]=f,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=u*f+m,e[10]=d-_*f}else if(t.order==="XZY"){let d=o*l,u=o*c,m=a*l,_=a*c;e[0]=l*h,e[4]=-f,e[8]=c*h,e[1]=d*f+_,e[5]=o*h,e[9]=u*f-m,e[2]=m*f-u,e[6]=a*h,e[10]=_*f+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(hf,t,uf)}lookAt(t,e,n){let s=this.elements;return qe.subVectors(t,e),qe.lengthSq()===0&&(qe.z=1),qe.normalize(),Jn.crossVectors(n,qe),Jn.lengthSq()===0&&(Math.abs(n.z)===1?qe.x+=1e-4:qe.z+=1e-4,qe.normalize(),Jn.crossVectors(n,qe)),Jn.normalize(),_r.crossVectors(qe,Jn),s[0]=Jn.x,s[4]=_r.x,s[8]=qe.x,s[1]=Jn.y,s[5]=_r.y,s[9]=qe.y,s[2]=Jn.z,s[6]=_r.z,s[10]=qe.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],f=n[5],d=n[9],u=n[13],m=n[2],_=n[6],g=n[10],p=n[14],b=n[3],v=n[7],x=n[11],L=n[15],T=s[0],C=s[4],A=s[8],S=s[12],y=s[1],I=s[5],z=s[9],O=s[13],k=s[2],Z=s[6],V=s[10],et=s[14],G=s[3],at=s[7],pt=s[11],yt=s[15];return r[0]=o*T+a*y+l*k+c*G,r[4]=o*C+a*I+l*Z+c*at,r[8]=o*A+a*z+l*V+c*pt,r[12]=o*S+a*O+l*et+c*yt,r[1]=h*T+f*y+d*k+u*G,r[5]=h*C+f*I+d*Z+u*at,r[9]=h*A+f*z+d*V+u*pt,r[13]=h*S+f*O+d*et+u*yt,r[2]=m*T+_*y+g*k+p*G,r[6]=m*C+_*I+g*Z+p*at,r[10]=m*A+_*z+g*V+p*pt,r[14]=m*S+_*O+g*et+p*yt,r[3]=b*T+v*y+x*k+L*G,r[7]=b*C+v*I+x*Z+L*at,r[11]=b*A+v*z+x*V+L*pt,r[15]=b*S+v*O+x*et+L*yt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],f=t[6],d=t[10],u=t[14],m=t[3],_=t[7],g=t[11],p=t[15];return m*(+r*l*f-s*c*f-r*a*d+n*c*d+s*a*u-n*l*u)+_*(+e*l*u-e*c*d+r*o*d-s*o*u+s*c*h-r*l*h)+g*(+e*c*f-e*a*u-r*o*f+n*o*u+r*a*h-n*c*h)+p*(-s*a*h-e*l*f+e*a*d+s*o*f-n*o*d+n*l*h)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],f=t[9],d=t[10],u=t[11],m=t[12],_=t[13],g=t[14],p=t[15],b=f*g*c-_*d*c+_*l*u-a*g*u-f*l*p+a*d*p,v=m*d*c-h*g*c-m*l*u+o*g*u+h*l*p-o*d*p,x=h*_*c-m*f*c+m*a*u-o*_*u-h*a*p+o*f*p,L=m*f*l-h*_*l-m*a*d+o*_*d+h*a*g-o*f*g,T=e*b+n*v+s*x+r*L;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/T;return t[0]=b*C,t[1]=(_*d*r-f*g*r-_*s*u+n*g*u+f*s*p-n*d*p)*C,t[2]=(a*g*r-_*l*r+_*s*c-n*g*c-a*s*p+n*l*p)*C,t[3]=(f*l*r-a*d*r-f*s*c+n*d*c+a*s*u-n*l*u)*C,t[4]=v*C,t[5]=(h*g*r-m*d*r+m*s*u-e*g*u-h*s*p+e*d*p)*C,t[6]=(m*l*r-o*g*r-m*s*c+e*g*c+o*s*p-e*l*p)*C,t[7]=(o*d*r-h*l*r+h*s*c-e*d*c-o*s*u+e*l*u)*C,t[8]=x*C,t[9]=(m*f*r-h*_*r-m*n*u+e*_*u+h*n*p-e*f*p)*C,t[10]=(o*_*r-m*a*r+m*n*c-e*_*c-o*n*p+e*a*p)*C,t[11]=(h*a*r-o*f*r-h*n*c+e*f*c+o*n*u-e*a*u)*C,t[12]=L*C,t[13]=(h*_*s-m*f*s+m*n*d-e*_*d-h*n*g+e*f*g)*C,t[14]=(m*a*s-o*_*s-m*n*l+e*_*l+o*n*g-e*a*g)*C,t[15]=(o*f*s-h*a*s+h*n*l-e*f*l-o*n*d+e*a*d)*C,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,f=a+a,d=r*c,u=r*h,m=r*f,_=o*h,g=o*f,p=a*f,b=l*c,v=l*h,x=l*f,L=n.x,T=n.y,C=n.z;return s[0]=(1-(_+p))*L,s[1]=(u+x)*L,s[2]=(m-v)*L,s[3]=0,s[4]=(u-x)*T,s[5]=(1-(d+p))*T,s[6]=(g+b)*T,s[7]=0,s[8]=(m+v)*C,s[9]=(g-b)*C,s[10]=(1-(d+_))*C,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements,r=Oi.set(s[0],s[1],s[2]).length(),o=Oi.set(s[4],s[5],s[6]).length(),a=Oi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],un.copy(this);let c=1/r,h=1/o,f=1/a;return un.elements[0]*=c,un.elements[1]*=c,un.elements[2]*=c,un.elements[4]*=h,un.elements[5]*=h,un.elements[6]*=h,un.elements[8]*=f,un.elements[9]*=f,un.elements[10]*=f,e.setFromRotationMatrix(un),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=On){let l=this.elements,c=2*r/(e-t),h=2*r/(n-s),f=(e+t)/(e-t),d=(n+s)/(n-s),u,m;if(a===On)u=-(o+r)/(o-r),m=-2*o*r/(o-r);else if(a===Wr)u=-o/(o-r),m=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=u,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=On){let l=this.elements,c=1/(e-t),h=1/(n-s),f=1/(o-r),d=(e+t)*c,u=(n+s)*h,m,_;if(a===On)m=(o+r)*f,_=-2*f;else if(a===Wr)m=r*f,_=-1*f;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-u,l[2]=0,l[6]=0,l[10]=_,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Oi=new P,un=new Ot,hf=new P(0,0,0),uf=new P(1,1,1),Jn=new P,_r=new P,qe=new P,Jc=new Ot,Kc=new Je,sn=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],f=s[2],d=s[6],u=s[10];switch(e){case"XYZ":this._y=Math.asin(Te(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,u),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Te(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,u),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Te(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-f,u),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Te(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(d,u),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Te(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,u));break;case"XZY":this._z=Math.asin(-Te(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,u),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Jc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Jc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Kc.setFromEuler(this),this.setFromQuaternion(Kc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};sn.DEFAULT_ORDER="XYZ";var Xs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},df=0,Qc=new P,Bi=new Je,In=new Ot,xr=new P,Cs=new P,ff=new P,pf=new Je,jc=new P(1,0,0),th=new P(0,1,0),eh=new P(0,0,1),nh={type:"added"},mf={type:"removed"},zi={type:"childadded",child:null},ia={type:"childremoved",child:null},He=class i extends Hn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:df++}),this.uuid=wi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new P,e=new sn,n=new Je,s=new P(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ot},normalMatrix:{value:new Gt}}),this.matrix=new Ot,this.matrixWorld=new Ot,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Xs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Bi.setFromAxisAngle(t,e),this.quaternion.multiply(Bi),this}rotateOnWorldAxis(t,e){return Bi.setFromAxisAngle(t,e),this.quaternion.premultiply(Bi),this}rotateX(t){return this.rotateOnAxis(jc,t)}rotateY(t){return this.rotateOnAxis(th,t)}rotateZ(t){return this.rotateOnAxis(eh,t)}translateOnAxis(t,e){return Qc.copy(t).applyQuaternion(this.quaternion),this.position.add(Qc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(jc,t)}translateY(t){return this.translateOnAxis(th,t)}translateZ(t){return this.translateOnAxis(eh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(In.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?xr.copy(t):xr.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Cs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?In.lookAt(Cs,xr,this.up):In.lookAt(xr,Cs,this.up),this.quaternion.setFromRotationMatrix(In),s&&(In.extractRotation(s.matrixWorld),Bi.setFromRotationMatrix(In),this.quaternion.premultiply(Bi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(nh),zi.child=t,this.dispatchEvent(zi),zi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(mf),ia.child=t,this.dispatchEvent(ia),ia.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),In.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),In.multiply(t.parent.matrixWorld)),t.applyMatrix4(In),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(nh),zi.child=t,this.dispatchEvent(zi),zi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Cs,t,ff),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Cs,pf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let f=l[c];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),f=o(t.shapes),d=o(t.skeletons),u=o(t.animations),m=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),f.length>0&&(n.shapes=f),d.length>0&&(n.skeletons=d),u.length>0&&(n.animations=u),m.length>0&&(n.nodes=m)}return n.object=s,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};He.DEFAULT_UP=new P(0,1,0);He.DEFAULT_MATRIX_AUTO_UPDATE=!0;He.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var dn=new P,Ln=new P,sa=new P,Dn=new P,Hi=new P,ki=new P,ih=new P,ra=new P,oa=new P,aa=new P,la=new me,ca=new me,ha=new me,gi=class i{constructor(t=new P,e=new P,n=new P){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),dn.subVectors(t,e),s.cross(dn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){dn.subVectors(s,e),Ln.subVectors(n,e),sa.subVectors(t,e);let o=dn.dot(dn),a=dn.dot(Ln),l=dn.dot(sa),c=Ln.dot(Ln),h=Ln.dot(sa),f=o*c-a*a;if(f===0)return r.set(0,0,0),null;let d=1/f,u=(c*l-a*h)*d,m=(o*h-a*l)*d;return r.set(1-u-m,m,u)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Dn)===null?!1:Dn.x>=0&&Dn.y>=0&&Dn.x+Dn.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,Dn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Dn.x),l.addScaledVector(o,Dn.y),l.addScaledVector(a,Dn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return la.setScalar(0),ca.setScalar(0),ha.setScalar(0),la.fromBufferAttribute(t,e),ca.fromBufferAttribute(t,n),ha.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(la,r.x),o.addScaledVector(ca,r.y),o.addScaledVector(ha,r.z),o}static isFrontFacing(t,e,n,s){return dn.subVectors(n,e),Ln.subVectors(t,e),dn.cross(Ln).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return dn.subVectors(this.c,this.b),Ln.subVectors(this.a,this.b),dn.cross(Ln).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;Hi.subVectors(s,n),ki.subVectors(r,n),ra.subVectors(t,n);let l=Hi.dot(ra),c=ki.dot(ra);if(l<=0&&c<=0)return e.copy(n);oa.subVectors(t,s);let h=Hi.dot(oa),f=ki.dot(oa);if(h>=0&&f<=h)return e.copy(s);let d=l*f-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(Hi,o);aa.subVectors(t,r);let u=Hi.dot(aa),m=ki.dot(aa);if(m>=0&&u<=m)return e.copy(r);let _=u*c-l*m;if(_<=0&&c>=0&&m<=0)return a=c/(c-m),e.copy(n).addScaledVector(ki,a);let g=h*m-u*f;if(g<=0&&f-h>=0&&u-m>=0)return ih.subVectors(r,s),a=(f-h)/(f-h+(u-m)),e.copy(s).addScaledVector(ih,a);let p=1/(g+_+d);return o=_*p,a=d*p,e.copy(n).addScaledVector(Hi,o).addScaledVector(ki,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},ru={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Kn={h:0,s:0,l:0},vr={h:0,s:0,l:0};function ua(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var At=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ue){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,qt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=qt.workingColorSpace){return this.r=t,this.g=e,this.b=n,qt.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=qt.workingColorSpace){if(t=oc(t,1),e=Te(e,0,1),n=Te(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=ua(o,r,t+1/3),this.g=ua(o,r,t),this.b=ua(o,r,t-1/3)}return qt.toWorkingColorSpace(this,s),this}setStyle(t,e=Ue){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ue){let n=ru[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Bn(t.r),this.g=Bn(t.g),this.b=Bn(t.b),this}copyLinearToSRGB(t){return this.r=Qi(t.r),this.g=Qi(t.g),this.b=Qi(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ue){return qt.fromWorkingColorSpace(De.copy(this),t),Math.round(Te(De.r*255,0,255))*65536+Math.round(Te(De.g*255,0,255))*256+Math.round(Te(De.b*255,0,255))}getHexString(t=Ue){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=qt.workingColorSpace){qt.fromWorkingColorSpace(De.copy(this),e);let n=De.r,s=De.g,r=De.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let f=o-a;switch(c=h<=.5?f/(o+a):f/(2-o-a),o){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=qt.workingColorSpace){return qt.fromWorkingColorSpace(De.copy(this),e),t.r=De.r,t.g=De.g,t.b=De.b,t}getStyle(t=Ue){qt.fromWorkingColorSpace(De.copy(this),t);let e=De.r,n=De.g,s=De.b;return t!==Ue?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Kn),this.setHSL(Kn.h+t,Kn.s+e,Kn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Kn),t.getHSL(vr);let n=Fs(Kn.h,vr.h,e),s=Fs(Kn.s,vr.s,e),r=Fs(Kn.l,vr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},De=new At;At.NAMES=ru;var gf=0,Mi=class extends Hn{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gf++}),this.uuid=wi(),this.name="",this.blending=Ji,this.side=ei,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=wa,this.blendDst=Ta,this.blendEquation=mi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new At(0,0,0),this.blendAlpha=0,this.depthFunc=ts,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=zc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Li,this.stencilZFail=Li,this.stencilZPass=Li,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ji&&(n.blending=this.blending),this.side!==ei&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==wa&&(n.blendSrc=this.blendSrc),this.blendDst!==Ta&&(n.blendDst=this.blendDst),this.blendEquation!==mi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ts&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==zc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Li&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Li&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Li&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},rs=class extends Mi{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new At(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.combine=Xh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var xe=new P,yr=new K,Re=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Hc,this.updateRanges=[],this.gpuType=Sn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)yr.fromBufferAttribute(this,e),yr.applyMatrix3(t),this.setXY(e,yr.x,yr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)xe.fromBufferAttribute(this,e),xe.applyMatrix3(t),this.setXYZ(e,xe.x,xe.y,xe.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)xe.fromBufferAttribute(this,e),xe.applyMatrix4(t),this.setXYZ(e,xe.x,xe.y,xe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)xe.fromBufferAttribute(this,e),xe.applyNormalMatrix(t),this.setXYZ(e,xe.x,xe.y,xe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)xe.fromBufferAttribute(this,e),xe.transformDirection(t),this.setXYZ(e,xe.x,xe.y,xe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=qi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Fe(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=qi(e,this.array)),e}setX(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=qi(e,this.array)),e}setY(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=qi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=qi(e,this.array)),e}setW(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array),s=Fe(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array),s=Fe(s,this.array),r=Fe(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Hc&&(t.usage=this.usage),t}};var $r=class extends Re{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Jr=class extends Re{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ie=class extends Re{constructor(t,e,n){super(new Float32Array(t),e,n)}},_f=0,nn=new Ot,da=new He,Vi=new P,Ze=new pn,Ps=new pn,we=new P,Ce=class i extends Hn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:_f++}),this.uuid=wi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(su(t)?Jr:$r)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Gt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return nn.makeRotationFromQuaternion(t),this.applyMatrix4(nn),this}rotateX(t){return nn.makeRotationX(t),this.applyMatrix4(nn),this}rotateY(t){return nn.makeRotationY(t),this.applyMatrix4(nn),this}rotateZ(t){return nn.makeRotationZ(t),this.applyMatrix4(nn),this}translate(t,e,n){return nn.makeTranslation(t,e,n),this.applyMatrix4(nn),this}scale(t,e,n){return nn.makeScale(t,e,n),this.applyMatrix4(nn),this}lookAt(t){return da.lookAt(t),da.updateMatrix(),this.applyMatrix4(da.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vi).negate(),this.translate(Vi.x,Vi.y,Vi.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ie(n,3))}else{for(let n=0,s=e.count;n<s;n++){let r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];Ze.setFromBufferAttribute(r),this.morphTargetsRelative?(we.addVectors(this.boundingBox.min,Ze.min),this.boundingBox.expandByPoint(we),we.addVectors(this.boundingBox.max,Ze.max),this.boundingBox.expandByPoint(we)):(this.boundingBox.expandByPoint(Ze.min),this.boundingBox.expandByPoint(Ze.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new kn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(t){let n=this.boundingSphere.center;if(Ze.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];Ps.setFromBufferAttribute(a),this.morphTargetsRelative?(we.addVectors(Ze.min,Ps.min),Ze.expandByPoint(we),we.addVectors(Ze.max,Ps.max),Ze.expandByPoint(we)):(Ze.expandByPoint(Ps.min),Ze.expandByPoint(Ps.max))}Ze.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)we.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(we));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)we.fromBufferAttribute(a,c),l&&(Vi.fromBufferAttribute(t,c),we.add(Vi)),s=Math.max(s,n.distanceToSquared(we))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Re(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let A=0;A<n.count;A++)a[A]=new P,l[A]=new P;let c=new P,h=new P,f=new P,d=new K,u=new K,m=new K,_=new P,g=new P;function p(A,S,y){c.fromBufferAttribute(n,A),h.fromBufferAttribute(n,S),f.fromBufferAttribute(n,y),d.fromBufferAttribute(r,A),u.fromBufferAttribute(r,S),m.fromBufferAttribute(r,y),h.sub(c),f.sub(c),u.sub(d),m.sub(d);let I=1/(u.x*m.y-m.x*u.y);isFinite(I)&&(_.copy(h).multiplyScalar(m.y).addScaledVector(f,-u.y).multiplyScalar(I),g.copy(f).multiplyScalar(u.x).addScaledVector(h,-m.x).multiplyScalar(I),a[A].add(_),a[S].add(_),a[y].add(_),l[A].add(g),l[S].add(g),l[y].add(g))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let A=0,S=b.length;A<S;++A){let y=b[A],I=y.start,z=y.count;for(let O=I,k=I+z;O<k;O+=3)p(t.getX(O+0),t.getX(O+1),t.getX(O+2))}let v=new P,x=new P,L=new P,T=new P;function C(A){L.fromBufferAttribute(s,A),T.copy(L);let S=a[A];v.copy(S),v.sub(L.multiplyScalar(L.dot(S))).normalize(),x.crossVectors(T,S);let I=x.dot(l[A])<0?-1:1;o.setXYZW(A,v.x,v.y,v.z,I)}for(let A=0,S=b.length;A<S;++A){let y=b[A],I=y.start,z=y.count;for(let O=I,k=I+z;O<k;O+=3)C(t.getX(O+0)),C(t.getX(O+1)),C(t.getX(O+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Re(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,u=n.count;d<u;d++)n.setXYZ(d,0,0,0);let s=new P,r=new P,o=new P,a=new P,l=new P,c=new P,h=new P,f=new P;if(t)for(let d=0,u=t.count;d<u;d+=3){let m=t.getX(d+0),_=t.getX(d+1),g=t.getX(d+2);s.fromBufferAttribute(e,m),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,g),h.subVectors(o,r),f.subVectors(s,r),h.cross(f),a.fromBufferAttribute(n,m),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,g),a.add(h),l.add(h),c.add(h),n.setXYZ(m,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,u=e.count;d<u;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,r),f.subVectors(s,r),h.cross(f),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)we.fromBufferAttribute(t,e),we.normalize(),t.setXYZ(e,we.x,we.y,we.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,f=a.normalized,d=new c.constructor(l.length*h),u=0,m=0;for(let _=0,g=l.length;_<g;_++){a.isInterleavedBufferAttribute?u=l[_]*a.data.stride+a.offset:u=l[_]*h;for(let p=0;p<h;p++)d[m++]=c[u++]}return new Re(d,h,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=t(l,n);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,f=c.length;h<f;h++){let d=c[h],u=t(d,n);l.push(u)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let f=0,d=c.length;f<d;f++){let u=c[f];h.push(u.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone(e));let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],f=r[c];for(let d=0,u=f.length;d<u;d++)h.push(f[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},sh=new Ot,hi=new Zr,Mr=new kn,rh=new P,Sr=new P,br=new P,Er=new P,fa=new P,wr=new P,oh=new P,Tr=new P,St=class extends He{constructor(t=new Ce,e=new rs){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){wr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],f=r[l];h!==0&&(fa.fromBufferAttribute(f,t),o?wr.addScaledVector(fa,h):wr.addScaledVector(fa.sub(e),h))}e.add(wr)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Mr.copy(n.boundingSphere),Mr.applyMatrix4(r),hi.copy(t.ray).recast(t.near),!(Mr.containsPoint(hi.origin)===!1&&(hi.intersectSphere(Mr,rh)===null||hi.origin.distanceToSquared(rh)>(t.far-t.near)**2))&&(sh.copy(r).invert(),hi.copy(t.ray).applyMatrix4(sh),!(n.boundingBox!==null&&hi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,hi)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,d=r.groups,u=r.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,_=d.length;m<_;m++){let g=d[m],p=o[g.materialIndex],b=Math.max(g.start,u.start),v=Math.min(a.count,Math.min(g.start+g.count,u.start+u.count));for(let x=b,L=v;x<L;x+=3){let T=a.getX(x),C=a.getX(x+1),A=a.getX(x+2);s=Ar(this,p,t,n,c,h,f,T,C,A),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let m=Math.max(0,u.start),_=Math.min(a.count,u.start+u.count);for(let g=m,p=_;g<p;g+=3){let b=a.getX(g),v=a.getX(g+1),x=a.getX(g+2);s=Ar(this,o,t,n,c,h,f,b,v,x),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,_=d.length;m<_;m++){let g=d[m],p=o[g.materialIndex],b=Math.max(g.start,u.start),v=Math.min(l.count,Math.min(g.start+g.count,u.start+u.count));for(let x=b,L=v;x<L;x+=3){let T=x,C=x+1,A=x+2;s=Ar(this,p,t,n,c,h,f,T,C,A),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let m=Math.max(0,u.start),_=Math.min(l.count,u.start+u.count);for(let g=m,p=_;g<p;g+=3){let b=g,v=g+1,x=g+2;s=Ar(this,o,t,n,c,h,f,b,v,x),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}}};function xf(i,t,e,n,s,r,o,a){let l;if(t.side===Ne?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===ei,a),l===null)return null;Tr.copy(a),Tr.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Tr);return c<e.near||c>e.far?null:{distance:c,point:Tr.clone(),object:i}}function Ar(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,Sr),i.getVertexPosition(l,br),i.getVertexPosition(c,Er);let h=xf(i,t,e,n,Sr,br,Er,oh);if(h){let f=new P;gi.getBarycoord(oh,Sr,br,Er,f),s&&(h.uv=gi.getInterpolatedAttribute(s,a,l,c,f,new K)),r&&(h.uv1=gi.getInterpolatedAttribute(r,a,l,c,f,new K)),o&&(h.normal=gi.getInterpolatedAttribute(o,a,l,c,f,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new P,materialIndex:0};gi.getNormal(Sr,br,Er,d.normal),h.face=d,h.barycoord=f}return h}var Pt=class i extends Ce{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],f=[],d=0,u=0;m("z","y","x",-1,-1,n,e,t,o,r,0),m("z","y","x",1,-1,n,e,-t,o,r,1),m("x","z","y",1,1,t,n,e,s,o,2),m("x","z","y",1,-1,t,n,-e,s,o,3),m("x","y","z",1,-1,t,e,n,s,r,4),m("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ie(c,3)),this.setAttribute("normal",new ie(h,3)),this.setAttribute("uv",new ie(f,2));function m(_,g,p,b,v,x,L,T,C,A,S){let y=x/C,I=L/A,z=x/2,O=L/2,k=T/2,Z=C+1,V=A+1,et=0,G=0,at=new P;for(let pt=0;pt<V;pt++){let yt=pt*I-O;for(let Ht=0;Ht<Z;Ht++){let jt=Ht*y-z;at[_]=jt*b,at[g]=yt*v,at[p]=k,c.push(at.x,at.y,at.z),at[_]=0,at[g]=0,at[p]=T>0?1:-1,h.push(at.x,at.y,at.z),f.push(Ht/C),f.push(1-pt/A),et+=1}}for(let pt=0;pt<A;pt++)for(let yt=0;yt<C;yt++){let Ht=d+yt+Z*pt,jt=d+yt+Z*(pt+1),q=d+(yt+1)+Z*(pt+1),it=d+(yt+1)+Z*pt;l.push(Ht,jt,it),l.push(jt,q,it),G+=6}a.addGroup(u,G,S),u+=G,d+=et}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function os(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Oe(i){let t={};for(let e=0;e<i.length;e++){let n=os(i[e]);for(let s in n)t[s]=n[s]}return t}function vf(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function ou(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:qt.workingColorSpace}var si={clone:os,merge:Oe},yf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Mf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,_e=class extends Mi{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=yf,this.fragmentShader=Mf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=os(t.uniforms),this.uniformsGroups=vf(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},Kr=class extends He{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ot,this.projectionMatrix=new Ot,this.projectionMatrixInverse=new Ot,this.coordinateSystem=On}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Qn=new P,ah=new K,lh=new K,Be=class extends Kr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Ws*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ns*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ws*2*Math.atan(Math.tan(Ns*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Qn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Qn.x,Qn.y).multiplyScalar(-t/Qn.z),Qn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Qn.x,Qn.y).multiplyScalar(-t/Qn.z)}getViewSize(t,e){return this.getViewBounds(t,ah,lh),e.subVectors(lh,ah)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ns*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Gi=-90,Wi=1,dl=class extends He{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Be(Gi,Wi,t,e);s.layers=this.layers,this.add(s);let r=new Be(Gi,Wi,t,e);r.layers=this.layers,this.add(r);let o=new Be(Gi,Wi,t,e);o.layers=this.layers,this.add(o);let a=new Be(Gi,Wi,t,e);a.layers=this.layers,this.add(a);let l=new Be(Gi,Wi,t,e);l.layers=this.layers,this.add(l);let c=new Be(Gi,Wi,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===On)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Wr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,f=t.getRenderTarget(),d=t.getActiveCubeFace(),u=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(f,d,u),t.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},Qr=class extends Ge{constructor(t,e,n,s,r,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:es,super(t,e,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},fl=class extends ze{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Qr(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Mn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Pt(5,5,5),r=new _e({name:"CubemapFromEquirect",uniforms:os(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ne,blending:bn});r.uniforms.tEquirect.value=e;let o=new St(s,r),a=e.minFilter;return e.minFilter===vi&&(e.minFilter=Mn),new dl(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,s){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}},pa=new P,Sf=new P,bf=new Gt,Nn=class{constructor(t=new P(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=pa.subVectors(n,e).cross(Sf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(pa),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||bf.getNormalMatrix(t),s=this.coplanarPoint(pa).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},ui=new kn,Rr=new P,Ys=class{constructor(t=new Nn,e=new Nn,n=new Nn,s=new Nn,r=new Nn,o=new Nn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=On){let n=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],f=s[6],d=s[7],u=s[8],m=s[9],_=s[10],g=s[11],p=s[12],b=s[13],v=s[14],x=s[15];if(n[0].setComponents(l-r,d-c,g-u,x-p).normalize(),n[1].setComponents(l+r,d+c,g+u,x+p).normalize(),n[2].setComponents(l+o,d+h,g+m,x+b).normalize(),n[3].setComponents(l-o,d-h,g-m,x-b).normalize(),n[4].setComponents(l-a,d-f,g-_,x-v).normalize(),e===On)n[5].setComponents(l+a,d+f,g+_,x+v).normalize();else if(e===Wr)n[5].setComponents(a,f,_,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ui.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ui.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ui)}intersectsSprite(t){return ui.center.set(0,0,0),ui.radius=.7071067811865476,ui.applyMatrix4(t.matrixWorld),this.intersectsSphere(ui)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(Rr.x=s.normal.x>0?t.max.x:t.min.x,Rr.y=s.normal.y>0?t.max.y:t.min.y,Rr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Rr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function au(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Ef(i){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,f=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),a.onUploadCallback();let u;if(c instanceof Float32Array)u=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?u=i.HALF_FLOAT:u=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)u=i.SHORT;else if(c instanceof Uint32Array)u=i.UNSIGNED_INT;else if(c instanceof Int32Array)u=i.INT;else if(c instanceof Int8Array)u=i.BYTE;else if(c instanceof Uint8Array)u=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)u=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:u,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function n(a,l,c){let h=l.array,f=l.updateRanges;if(i.bindBuffer(c,a),f.length===0)i.bufferSubData(c,0,h);else{f.sort((u,m)=>u.start-m.start);let d=0;for(let u=1;u<f.length;u++){let m=f[d],_=f[u];_.start<=m.start+m.count+1?m.count=Math.max(m.count,_.start+_.count-m.start):(++d,f[d]=_)}f.length=d+1;for(let u=0,m=f.length;u<m;u++){let _=f[u];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var ni=class i extends Ce{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,f=t/a,d=e/l,u=[],m=[],_=[],g=[];for(let p=0;p<h;p++){let b=p*d-o;for(let v=0;v<c;v++){let x=v*f-r;m.push(x,-b,0),_.push(0,0,1),g.push(v/a),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<a;b++){let v=b+c*p,x=b+c*(p+1),L=b+1+c*(p+1),T=b+1+c*p;u.push(v,x,T),u.push(x,L,T)}this.setIndex(u),this.setAttribute("position",new ie(m,3)),this.setAttribute("normal",new ie(_,3)),this.setAttribute("uv",new ie(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},wf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Tf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Af=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Rf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Cf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Pf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,If=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Lf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Df=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Uf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Nf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ff=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Of=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Bf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,zf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Hf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,kf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Vf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Gf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Wf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Xf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Yf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,qf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Zf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,$f=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Jf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Kf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Qf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,jf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,tp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ep="gl_FragColor = linearToOutputTexel( gl_FragColor );",np=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ip=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,sp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,rp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,op=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ap=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,lp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,cp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,hp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,up=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,dp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,fp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,pp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,mp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,gp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,_p=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,xp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,vp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,yp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Mp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Sp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,bp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ep=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,wp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Tp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ap=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Rp=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Cp=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Pp=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ip=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Lp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Dp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Up=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Np=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Fp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Op=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Bp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,zp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Hp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,kp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Vp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Gp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Wp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Xp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,qp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Zp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,$p=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Jp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Kp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Qp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,jp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,tm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,em=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,nm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,im=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,sm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,rm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,om=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,am=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,lm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,cm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,hm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,um=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,dm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,fm=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,pm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,mm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,gm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,_m=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,xm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,vm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,ym=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Mm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Sm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,bm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Em=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,wm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Am=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Rm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Cm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Pm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Im=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Lm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Dm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Um=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Nm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Fm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Om=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Bm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,zm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,km=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Gm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Xm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Ym=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,qm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,$m=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Km=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,jm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,tg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,eg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ng=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ig=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xt={alphahash_fragment:wf,alphahash_pars_fragment:Tf,alphamap_fragment:Af,alphamap_pars_fragment:Rf,alphatest_fragment:Cf,alphatest_pars_fragment:Pf,aomap_fragment:If,aomap_pars_fragment:Lf,batching_pars_vertex:Df,batching_vertex:Uf,begin_vertex:Nf,beginnormal_vertex:Ff,bsdfs:Of,iridescence_fragment:Bf,bumpmap_pars_fragment:zf,clipping_planes_fragment:Hf,clipping_planes_pars_fragment:kf,clipping_planes_pars_vertex:Vf,clipping_planes_vertex:Gf,color_fragment:Wf,color_pars_fragment:Xf,color_pars_vertex:Yf,color_vertex:qf,common:Zf,cube_uv_reflection_fragment:$f,defaultnormal_vertex:Jf,displacementmap_pars_vertex:Kf,displacementmap_vertex:Qf,emissivemap_fragment:jf,emissivemap_pars_fragment:tp,colorspace_fragment:ep,colorspace_pars_fragment:np,envmap_fragment:ip,envmap_common_pars_fragment:sp,envmap_pars_fragment:rp,envmap_pars_vertex:op,envmap_physical_pars_fragment:_p,envmap_vertex:ap,fog_vertex:lp,fog_pars_vertex:cp,fog_fragment:hp,fog_pars_fragment:up,gradientmap_pars_fragment:dp,lightmap_pars_fragment:fp,lights_lambert_fragment:pp,lights_lambert_pars_fragment:mp,lights_pars_begin:gp,lights_toon_fragment:xp,lights_toon_pars_fragment:vp,lights_phong_fragment:yp,lights_phong_pars_fragment:Mp,lights_physical_fragment:Sp,lights_physical_pars_fragment:bp,lights_fragment_begin:Ep,lights_fragment_maps:wp,lights_fragment_end:Tp,logdepthbuf_fragment:Ap,logdepthbuf_pars_fragment:Rp,logdepthbuf_pars_vertex:Cp,logdepthbuf_vertex:Pp,map_fragment:Ip,map_pars_fragment:Lp,map_particle_fragment:Dp,map_particle_pars_fragment:Up,metalnessmap_fragment:Np,metalnessmap_pars_fragment:Fp,morphinstance_vertex:Op,morphcolor_vertex:Bp,morphnormal_vertex:zp,morphtarget_pars_vertex:Hp,morphtarget_vertex:kp,normal_fragment_begin:Vp,normal_fragment_maps:Gp,normal_pars_fragment:Wp,normal_pars_vertex:Xp,normal_vertex:Yp,normalmap_pars_fragment:qp,clearcoat_normal_fragment_begin:Zp,clearcoat_normal_fragment_maps:$p,clearcoat_pars_fragment:Jp,iridescence_pars_fragment:Kp,opaque_fragment:Qp,packing:jp,premultiplied_alpha_fragment:tm,project_vertex:em,dithering_fragment:nm,dithering_pars_fragment:im,roughnessmap_fragment:sm,roughnessmap_pars_fragment:rm,shadowmap_pars_fragment:om,shadowmap_pars_vertex:am,shadowmap_vertex:lm,shadowmask_pars_fragment:cm,skinbase_vertex:hm,skinning_pars_vertex:um,skinning_vertex:dm,skinnormal_vertex:fm,specularmap_fragment:pm,specularmap_pars_fragment:mm,tonemapping_fragment:gm,tonemapping_pars_fragment:_m,transmission_fragment:xm,transmission_pars_fragment:vm,uv_pars_fragment:ym,uv_pars_vertex:Mm,uv_vertex:Sm,worldpos_vertex:bm,background_vert:Em,background_frag:wm,backgroundCube_vert:Tm,backgroundCube_frag:Am,cube_vert:Rm,cube_frag:Cm,depth_vert:Pm,depth_frag:Im,distanceRGBA_vert:Lm,distanceRGBA_frag:Dm,equirect_vert:Um,equirect_frag:Nm,linedashed_vert:Fm,linedashed_frag:Om,meshbasic_vert:Bm,meshbasic_frag:zm,meshlambert_vert:Hm,meshlambert_frag:km,meshmatcap_vert:Vm,meshmatcap_frag:Gm,meshnormal_vert:Wm,meshnormal_frag:Xm,meshphong_vert:Ym,meshphong_frag:qm,meshphysical_vert:Zm,meshphysical_frag:$m,meshtoon_vert:Jm,meshtoon_frag:Km,points_vert:Qm,points_frag:jm,shadow_vert:tg,shadow_frag:eg,sprite_vert:ng,sprite_frag:ig},lt={common:{diffuse:{value:new At(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Gt},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Gt}},envmap:{envMap:{value:null},envMapRotation:{value:new Gt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Gt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Gt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Gt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Gt},normalScale:{value:new K(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Gt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Gt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Gt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Gt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new At(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new At(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0},uvTransform:{value:new Gt}},sprite:{diffuse:{value:new At(16777215)},opacity:{value:1},center:{value:new K(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Gt},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0}}},yn={basic:{uniforms:Oe([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.fog]),vertexShader:Xt.meshbasic_vert,fragmentShader:Xt.meshbasic_frag},lambert:{uniforms:Oe([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new At(0)}}]),vertexShader:Xt.meshlambert_vert,fragmentShader:Xt.meshlambert_frag},phong:{uniforms:Oe([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new At(0)},specular:{value:new At(1118481)},shininess:{value:30}}]),vertexShader:Xt.meshphong_vert,fragmentShader:Xt.meshphong_frag},standard:{uniforms:Oe([lt.common,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.roughnessmap,lt.metalnessmap,lt.fog,lt.lights,{emissive:{value:new At(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xt.meshphysical_vert,fragmentShader:Xt.meshphysical_frag},toon:{uniforms:Oe([lt.common,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.gradientmap,lt.fog,lt.lights,{emissive:{value:new At(0)}}]),vertexShader:Xt.meshtoon_vert,fragmentShader:Xt.meshtoon_frag},matcap:{uniforms:Oe([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,{matcap:{value:null}}]),vertexShader:Xt.meshmatcap_vert,fragmentShader:Xt.meshmatcap_frag},points:{uniforms:Oe([lt.points,lt.fog]),vertexShader:Xt.points_vert,fragmentShader:Xt.points_frag},dashed:{uniforms:Oe([lt.common,lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xt.linedashed_vert,fragmentShader:Xt.linedashed_frag},depth:{uniforms:Oe([lt.common,lt.displacementmap]),vertexShader:Xt.depth_vert,fragmentShader:Xt.depth_frag},normal:{uniforms:Oe([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,{opacity:{value:1}}]),vertexShader:Xt.meshnormal_vert,fragmentShader:Xt.meshnormal_frag},sprite:{uniforms:Oe([lt.sprite,lt.fog]),vertexShader:Xt.sprite_vert,fragmentShader:Xt.sprite_frag},background:{uniforms:{uvTransform:{value:new Gt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xt.background_vert,fragmentShader:Xt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Gt}},vertexShader:Xt.backgroundCube_vert,fragmentShader:Xt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xt.cube_vert,fragmentShader:Xt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xt.equirect_vert,fragmentShader:Xt.equirect_frag},distanceRGBA:{uniforms:Oe([lt.common,lt.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xt.distanceRGBA_vert,fragmentShader:Xt.distanceRGBA_frag},shadow:{uniforms:Oe([lt.lights,lt.fog,{color:{value:new At(0)},opacity:{value:1}}]),vertexShader:Xt.shadow_vert,fragmentShader:Xt.shadow_frag}};yn.physical={uniforms:Oe([yn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Gt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Gt},clearcoatNormalScale:{value:new K(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Gt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Gt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Gt},sheen:{value:0},sheenColor:{value:new At(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Gt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Gt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Gt},transmissionSamplerSize:{value:new K},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Gt},attenuationDistance:{value:0},attenuationColor:{value:new At(0)},specularColor:{value:new At(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Gt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Gt},anisotropyVector:{value:new K},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Gt}}]),vertexShader:Xt.meshphysical_vert,fragmentShader:Xt.meshphysical_frag};var Cr={r:0,b:0,g:0},di=new sn,sg=new Ot;function rg(i,t,e,n,s,r,o){let a=new At(0),l=r===!0?0:1,c,h,f=null,d=0,u=null;function m(b){let v=b.isScene===!0?b.background:null;return v&&v.isTexture&&(v=(b.backgroundBlurriness>0?e:t).get(v)),v}function _(b){let v=!1,x=m(b);x===null?p(a,l):x&&x.isColor&&(p(x,1),v=!0);let L=i.xr.getEnvironmentBlendMode();L==="additive"?n.buffers.color.setClear(0,0,0,1,o):L==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function g(b,v){let x=m(v);x&&(x.isCubeTexture||x.mapping===bo)?(h===void 0&&(h=new St(new Pt(1,1,1),new _e({name:"BackgroundCubeMaterial",uniforms:os(yn.backgroundCube.uniforms),vertexShader:yn.backgroundCube.vertexShader,fragmentShader:yn.backgroundCube.fragmentShader,side:Ne,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(L,T,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),di.copy(v.backgroundRotation),di.x*=-1,di.y*=-1,di.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(di.y*=-1,di.z*=-1),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(sg.makeRotationFromEuler(di)),h.material.toneMapped=qt.getTransfer(x.colorSpace)!==ne,(f!==x||d!==x.version||u!==i.toneMapping)&&(h.material.needsUpdate=!0,f=x,d=x.version,u=i.toneMapping),h.layers.enableAll(),b.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new St(new ni(2,2),new _e({name:"BackgroundMaterial",uniforms:os(yn.background.uniforms),vertexShader:yn.background.vertexShader,fragmentShader:yn.background.fragmentShader,side:ei,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=qt.getTransfer(x.colorSpace)!==ne,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(f!==x||d!==x.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,f=x,d=x.version,u=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function p(b,v){b.getRGB(Cr,ou(i)),n.buffers.color.setClear(Cr.r,Cr.g,Cr.b,v,o)}return{getClearColor:function(){return a},setClearColor:function(b,v=1){a.set(b),l=v,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,p(a,l)},render:_,addToRenderList:g}}function og(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,o=!1;function a(y,I,z,O,k){let Z=!1,V=f(O,z,I);r!==V&&(r=V,c(r.object)),Z=u(y,O,z,k),Z&&m(y,O,z,k),k!==null&&t.update(k,i.ELEMENT_ARRAY_BUFFER),(Z||o)&&(o=!1,x(y,I,z,O),k!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function l(){return i.createVertexArray()}function c(y){return i.bindVertexArray(y)}function h(y){return i.deleteVertexArray(y)}function f(y,I,z){let O=z.wireframe===!0,k=n[y.id];k===void 0&&(k={},n[y.id]=k);let Z=k[I.id];Z===void 0&&(Z={},k[I.id]=Z);let V=Z[O];return V===void 0&&(V=d(l()),Z[O]=V),V}function d(y){let I=[],z=[],O=[];for(let k=0;k<e;k++)I[k]=0,z[k]=0,O[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:z,attributeDivisors:O,object:y,attributes:{},index:null}}function u(y,I,z,O){let k=r.attributes,Z=I.attributes,V=0,et=z.getAttributes();for(let G in et)if(et[G].location>=0){let pt=k[G],yt=Z[G];if(yt===void 0&&(G==="instanceMatrix"&&y.instanceMatrix&&(yt=y.instanceMatrix),G==="instanceColor"&&y.instanceColor&&(yt=y.instanceColor)),pt===void 0||pt.attribute!==yt||yt&&pt.data!==yt.data)return!0;V++}return r.attributesNum!==V||r.index!==O}function m(y,I,z,O){let k={},Z=I.attributes,V=0,et=z.getAttributes();for(let G in et)if(et[G].location>=0){let pt=Z[G];pt===void 0&&(G==="instanceMatrix"&&y.instanceMatrix&&(pt=y.instanceMatrix),G==="instanceColor"&&y.instanceColor&&(pt=y.instanceColor));let yt={};yt.attribute=pt,pt&&pt.data&&(yt.data=pt.data),k[G]=yt,V++}r.attributes=k,r.attributesNum=V,r.index=O}function _(){let y=r.newAttributes;for(let I=0,z=y.length;I<z;I++)y[I]=0}function g(y){p(y,0)}function p(y,I){let z=r.newAttributes,O=r.enabledAttributes,k=r.attributeDivisors;z[y]=1,O[y]===0&&(i.enableVertexAttribArray(y),O[y]=1),k[y]!==I&&(i.vertexAttribDivisor(y,I),k[y]=I)}function b(){let y=r.newAttributes,I=r.enabledAttributes;for(let z=0,O=I.length;z<O;z++)I[z]!==y[z]&&(i.disableVertexAttribArray(z),I[z]=0)}function v(y,I,z,O,k,Z,V){V===!0?i.vertexAttribIPointer(y,I,z,k,Z):i.vertexAttribPointer(y,I,z,O,k,Z)}function x(y,I,z,O){_();let k=O.attributes,Z=z.getAttributes(),V=I.defaultAttributeValues;for(let et in Z){let G=Z[et];if(G.location>=0){let at=k[et];if(at===void 0&&(et==="instanceMatrix"&&y.instanceMatrix&&(at=y.instanceMatrix),et==="instanceColor"&&y.instanceColor&&(at=y.instanceColor)),at!==void 0){let pt=at.normalized,yt=at.itemSize,Ht=t.get(at);if(Ht===void 0)continue;let jt=Ht.buffer,q=Ht.type,it=Ht.bytesPerElement,Mt=q===i.INT||q===i.UNSIGNED_INT||at.gpuType===jl;if(at.isInterleavedBufferAttribute){let rt=at.data,It=rt.stride,Bt=at.offset;if(rt.isInstancedInterleavedBuffer){for(let Ut=0;Ut<G.locationSize;Ut++)p(G.location+Ut,rt.meshPerAttribute);y.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=rt.meshPerAttribute*rt.count)}else for(let Ut=0;Ut<G.locationSize;Ut++)g(G.location+Ut);i.bindBuffer(i.ARRAY_BUFFER,jt);for(let Ut=0;Ut<G.locationSize;Ut++)v(G.location+Ut,yt/G.locationSize,q,pt,It*it,(Bt+yt/G.locationSize*Ut)*it,Mt)}else{if(at.isInstancedBufferAttribute){for(let rt=0;rt<G.locationSize;rt++)p(G.location+rt,at.meshPerAttribute);y.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=at.meshPerAttribute*at.count)}else for(let rt=0;rt<G.locationSize;rt++)g(G.location+rt);i.bindBuffer(i.ARRAY_BUFFER,jt);for(let rt=0;rt<G.locationSize;rt++)v(G.location+rt,yt/G.locationSize,q,pt,yt*it,yt/G.locationSize*rt*it,Mt)}}else if(V!==void 0){let pt=V[et];if(pt!==void 0)switch(pt.length){case 2:i.vertexAttrib2fv(G.location,pt);break;case 3:i.vertexAttrib3fv(G.location,pt);break;case 4:i.vertexAttrib4fv(G.location,pt);break;default:i.vertexAttrib1fv(G.location,pt)}}}}b()}function L(){A();for(let y in n){let I=n[y];for(let z in I){let O=I[z];for(let k in O)h(O[k].object),delete O[k];delete I[z]}delete n[y]}}function T(y){if(n[y.id]===void 0)return;let I=n[y.id];for(let z in I){let O=I[z];for(let k in O)h(O[k].object),delete O[k];delete I[z]}delete n[y.id]}function C(y){for(let I in n){let z=n[I];if(z[y.id]===void 0)continue;let O=z[y.id];for(let k in O)h(O[k].object),delete O[k];delete z[y.id]}}function A(){S(),o=!0,r!==s&&(r=s,c(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:A,resetDefaultState:S,dispose:L,releaseStatesOfGeometry:T,releaseStatesOfProgram:C,initAttributes:_,enableAttribute:g,disableUnusedAttributes:b}}function ag(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function o(c,h,f){f!==0&&(i.drawArraysInstanced(n,c,h,f),e.update(h,n,f))}function a(c,h,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,f);let u=0;for(let m=0;m<f;m++)u+=h[m];e.update(u,n,1)}function l(c,h,f,d){if(f===0)return;let u=t.get("WEBGL_multi_draw");if(u===null)for(let m=0;m<c.length;m++)o(c[m],h[m],d[m]);else{u.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,f);let m=0;for(let _=0;_<f;_++)m+=h[_]*d[_];e.update(m,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function lg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let C=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(C){return!(C!==fn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){let A=C===gn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(C!==zn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==Sn&&!A)}function l(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let f=e.logarithmicDepthBuffer===!0,d=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),u=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),v=i.getParameter(i.MAX_VARYING_VECTORS),x=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),L=m>0,T=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:f,reverseDepthBuffer:d,maxTextures:u,maxVertexTextures:m,maxTextureSize:_,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:b,maxVaryings:v,maxFragmentUniforms:x,vertexTextures:L,maxSamples:T}}function cg(i){let t=this,e=null,n=0,s=!1,r=!1,o=new Nn,a=new Gt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,d){let u=f.length!==0||d||n!==0||s;return s=d,n=f.length,u},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,d){e=h(f,d,0)},this.setState=function(f,d,u){let m=f.clippingPlanes,_=f.clipIntersection,g=f.clipShadows,p=i.get(f);if(!s||m===null||m.length===0||r&&!g)r?h(null):c();else{let b=r?0:n,v=b*4,x=p.clippingState||null;l.value=x,x=h(m,d,v,u);for(let L=0;L!==v;++L)x[L]=e[L];p.clippingState=x,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(f,d,u,m){let _=f!==null?f.length:0,g=null;if(_!==0){if(g=l.value,m!==!0||g===null){let p=u+_*4,b=d.matrixWorldInverse;a.getNormalMatrix(b),(g===null||g.length<p)&&(g=new Float32Array(p));for(let v=0,x=u;v!==_;++v,x+=4)o.copy(f[v]).applyMatrix4(b,a),o.normal.toArray(g,x),g[x+3]=o.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,g}}function hg(i){let t=new WeakMap;function e(o,a){return a===Ua?o.mapping=es:a===Na&&(o.mapping=ns),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===Ua||a===Na)if(t.has(o)){let l=t.get(o).texture;return e(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new fl(l.height);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var as=class extends Kr{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Zi=4,ch=[.125,.215,.35,.446,.526,.582],_i=20,ma=new as,hh=new At,ga=null,_a=0,xa=0,va=!1,pi=(1+Math.sqrt(5))/2,Xi=1/pi,uh=[new P(-pi,Xi,0),new P(pi,Xi,0),new P(-Xi,0,pi),new P(Xi,0,pi),new P(0,pi,-Xi),new P(0,pi,Xi),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],jr=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){ga=this._renderer.getRenderTarget(),_a=this._renderer.getActiveCubeFace(),xa=this._renderer.getActiveMipmapLevel(),va=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ph(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=fh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ga,_a,xa),this._renderer.xr.enabled=va,t.scissorTest=!1,Pr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===es||t.mapping===ns?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ga=this._renderer.getRenderTarget(),_a=this._renderer.getActiveCubeFace(),xa=this._renderer.getActiveMipmapLevel(),va=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Mn,minFilter:Mn,generateMipmaps:!1,type:gn,format:fn,colorSpace:fs,depthBuffer:!1},s=dh(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=dh(t,e,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=ug(r)),this._blurMaterial=dg(r,t,e)}return s}_compileMaterial(t){let e=new St(this._lodPlanes[0],t);this._renderer.compile(e,ma)}_sceneToCubeUV(t,e,n,s){let a=new Be(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,d=h.toneMapping;h.getClearColor(hh),h.toneMapping=ti,h.autoClear=!1;let u=new rs({name:"PMREM.Background",side:Ne,depthWrite:!1,depthTest:!1}),m=new St(new Pt,u),_=!1,g=t.background;g?g.isColor&&(u.color.copy(g),t.background=null,_=!0):(u.color.copy(hh),_=!0);for(let p=0;p<6;p++){let b=p%3;b===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):b===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));let v=this._cubeSize;Pr(s,b*v,p>2?v:0,v,v),h.setRenderTarget(s),_&&h.render(m,a),h.render(t,a)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=d,h.autoClear=f,t.background=g}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===es||t.mapping===ns;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=ph()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=fh());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new St(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;Pr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,ma)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=uh[(s-r-1)%uh.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,f=new St(this._lodPlanes[s],c),d=c.uniforms,u=this._sizeLods[n]-1,m=isFinite(r)?Math.PI/(2*u):2*Math.PI/(2*_i-1),_=r/m,g=isFinite(r)?1+Math.floor(h*_):_i;g>_i&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${_i}`);let p=[],b=0;for(let C=0;C<_i;++C){let A=C/_,S=Math.exp(-A*A/2);p.push(S),C===0?b+=S:C<g&&(b+=2*S)}for(let C=0;C<p.length;C++)p[C]=p[C]/b;d.envMap.value=t.texture,d.samples.value=g,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:v}=this;d.dTheta.value=m,d.mipInt.value=v-n;let x=this._sizeLods[s],L=3*x*(s>v-Zi?s-v+Zi:0),T=4*(this._cubeSize-x);Pr(e,L,T,3*x,2*x),l.setRenderTarget(e),l.render(f,ma)}};function ug(i){let t=[],e=[],n=[],s=i,r=i-Zi+1+ch.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);e.push(a);let l=1/a;o>i-Zi?l=ch[o-i+Zi-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),h=-c,f=1+c,d=[h,h,f,h,f,f,h,h,f,f,h,f],u=6,m=6,_=3,g=2,p=1,b=new Float32Array(_*m*u),v=new Float32Array(g*m*u),x=new Float32Array(p*m*u);for(let T=0;T<u;T++){let C=T%3*2/3-1,A=T>2?0:-1,S=[C,A,0,C+2/3,A,0,C+2/3,A+1,0,C,A,0,C+2/3,A+1,0,C,A+1,0];b.set(S,_*m*T),v.set(d,g*m*T);let y=[T,T,T,T,T,T];x.set(y,p*m*T)}let L=new Ce;L.setAttribute("position",new Re(b,_)),L.setAttribute("uv",new Re(v,g)),L.setAttribute("faceIndex",new Re(x,p)),t.push(L),s>Zi&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function dh(i,t,e){let n=new ze(i,t,e);return n.texture.mapping=bo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Pr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function dg(i,t,e){let n=new Float32Array(_i),s=new P(0,1,0);return new _e({name:"SphericalGaussianBlur",defines:{n:_i,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ac(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:bn,depthTest:!1,depthWrite:!1})}function fh(){return new _e({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ac(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:bn,depthTest:!1,depthWrite:!1})}function ph(){return new _e({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ac(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:bn,depthTest:!1,depthWrite:!1})}function ac(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function fg(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===Ua||l===Na,h=l===es||l===ns;if(c||h){let f=t.get(a),d=f!==void 0?f.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return e===null&&(e=new jr(i)),f=c?e.fromEquirectangular(a,f):e.fromCubemap(a,f),f.texture.pmremVersion=a.pmremVersion,t.set(a,f),f.texture;if(f!==void 0)return f.texture;{let u=a.image;return c&&u&&u.height>0||h&&u&&s(u)?(e===null&&(e=new jr(i)),f=c?e.fromEquirectangular(a):e.fromCubemap(a),f.texture.pmremVersion=a.pmremVersion,t.set(a,f),a.addEventListener("dispose",r),f.texture):null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function pg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Ds("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function mg(i,t,e,n){let s={},r=new WeakMap;function o(f){let d=f.target;d.index!==null&&t.remove(d.index);for(let m in d.attributes)t.remove(d.attributes[m]);for(let m in d.morphAttributes){let _=d.morphAttributes[m];for(let g=0,p=_.length;g<p;g++)t.remove(_[g])}d.removeEventListener("dispose",o),delete s[d.id];let u=r.get(d);u&&(t.remove(u),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(f,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,e.memory.geometries++),d}function l(f){let d=f.attributes;for(let m in d)t.update(d[m],i.ARRAY_BUFFER);let u=f.morphAttributes;for(let m in u){let _=u[m];for(let g=0,p=_.length;g<p;g++)t.update(_[g],i.ARRAY_BUFFER)}}function c(f){let d=[],u=f.index,m=f.attributes.position,_=0;if(u!==null){let b=u.array;_=u.version;for(let v=0,x=b.length;v<x;v+=3){let L=b[v+0],T=b[v+1],C=b[v+2];d.push(L,T,T,C,C,L)}}else if(m!==void 0){let b=m.array;_=m.version;for(let v=0,x=b.length/3-1;v<x;v+=3){let L=v+0,T=v+1,C=v+2;d.push(L,T,T,C,C,L)}}else return;let g=new(su(d)?Jr:$r)(d,1);g.version=_;let p=r.get(f);p&&t.remove(p),r.set(f,g)}function h(f){let d=r.get(f);if(d){let u=f.index;u!==null&&d.version<u.version&&c(f)}else c(f);return r.get(f)}return{get:a,update:l,getWireframeAttribute:h}}function gg(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,u){i.drawElements(n,u,r,d*o),e.update(u,n,1)}function c(d,u,m){m!==0&&(i.drawElementsInstanced(n,u,r,d*o,m),e.update(u,n,m))}function h(d,u,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,d,0,m);let g=0;for(let p=0;p<m;p++)g+=u[p];e.update(g,n,1)}function f(d,u,m,_){if(m===0)return;let g=t.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<d.length;p++)c(d[p]/o,u[p],_[p]);else{g.multiDrawElementsInstancedWEBGL(n,u,0,r,d,0,_,0,m);let p=0;for(let b=0;b<m;b++)p+=u[b]*_[b];e.update(p,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=f}function _g(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function xg(i,t,e){let n=new WeakMap,s=new me;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=h!==void 0?h.length:0,d=n.get(a);if(d===void 0||d.count!==f){let S=function(){C.dispose(),n.delete(a),a.removeEventListener("dispose",S)};d!==void 0&&d.texture.dispose();let u=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],b=a.morphAttributes.color||[],v=0;u===!0&&(v=1),m===!0&&(v=2),_===!0&&(v=3);let x=a.attributes.position.count*v,L=1;x>t.maxTextureSize&&(L=Math.ceil(x/t.maxTextureSize),x=t.maxTextureSize);let T=new Float32Array(x*L*4*f),C=new qr(T,x,L,f);C.type=Sn,C.needsUpdate=!0;let A=v*4;for(let y=0;y<f;y++){let I=g[y],z=p[y],O=b[y],k=x*L*4*y;for(let Z=0;Z<I.count;Z++){let V=Z*A;u===!0&&(s.fromBufferAttribute(I,Z),T[k+V+0]=s.x,T[k+V+1]=s.y,T[k+V+2]=s.z,T[k+V+3]=0),m===!0&&(s.fromBufferAttribute(z,Z),T[k+V+4]=s.x,T[k+V+5]=s.y,T[k+V+6]=s.z,T[k+V+7]=0),_===!0&&(s.fromBufferAttribute(O,Z),T[k+V+8]=s.x,T[k+V+9]=s.y,T[k+V+10]=s.z,T[k+V+11]=O.itemSize===4?s.w:1)}}d={count:f,texture:C,size:new K(x,L)},n.set(a,d),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let u=0;for(let _=0;_<c.length;_++)u+=c[_];let m=a.morphTargetsRelative?1:1-u;l.getUniforms().setValue(i,"morphTargetBaseInfluence",m),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function vg(i,t,e,n){let s=new WeakMap;function r(l){let c=n.render.frame,h=l.geometry,f=t.get(l,h);if(s.get(f)!==c&&(t.update(f),s.set(f,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return f}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}var to=class extends Ge{constructor(t,e,n,s,r,o,a,l,c,h=Ki){if(h!==Ki&&h!==ss)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Ki&&(n=yi),n===void 0&&h===ss&&(n=is),super(null,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:$e,this.minFilter=l!==void 0?l:$e,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},lu=new Ge,mh=new to(1,1),cu=new qr,hu=new ul,uu=new Qr,gh=[],_h=[],xh=new Float32Array(16),vh=new Float32Array(9),yh=new Float32Array(4);function ps(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=gh[s];if(r===void 0&&(r=new Float32Array(s),gh[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Me(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Se(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function wo(i,t){let e=_h[t];e===void 0&&(e=new Int32Array(t),_h[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function yg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Mg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Me(e,t))return;i.uniform2fv(this.addr,t),Se(e,t)}}function Sg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Me(e,t))return;i.uniform3fv(this.addr,t),Se(e,t)}}function bg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Me(e,t))return;i.uniform4fv(this.addr,t),Se(e,t)}}function Eg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Me(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Se(e,t)}else{if(Me(e,n))return;yh.set(n),i.uniformMatrix2fv(this.addr,!1,yh),Se(e,n)}}function wg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Me(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Se(e,t)}else{if(Me(e,n))return;vh.set(n),i.uniformMatrix3fv(this.addr,!1,vh),Se(e,n)}}function Tg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Me(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Se(e,t)}else{if(Me(e,n))return;xh.set(n),i.uniformMatrix4fv(this.addr,!1,xh),Se(e,n)}}function Ag(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Rg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Me(e,t))return;i.uniform2iv(this.addr,t),Se(e,t)}}function Cg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Me(e,t))return;i.uniform3iv(this.addr,t),Se(e,t)}}function Pg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Me(e,t))return;i.uniform4iv(this.addr,t),Se(e,t)}}function Ig(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Lg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Me(e,t))return;i.uniform2uiv(this.addr,t),Se(e,t)}}function Dg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Me(e,t))return;i.uniform3uiv(this.addr,t),Se(e,t)}}function Ug(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Me(e,t))return;i.uniform4uiv(this.addr,t),Se(e,t)}}function Ng(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(mh.compareFunction=iu,r=mh):r=lu,e.setTexture2D(t||r,s)}function Fg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||hu,s)}function Og(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||uu,s)}function Bg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||cu,s)}function zg(i){switch(i){case 5126:return yg;case 35664:return Mg;case 35665:return Sg;case 35666:return bg;case 35674:return Eg;case 35675:return wg;case 35676:return Tg;case 5124:case 35670:return Ag;case 35667:case 35671:return Rg;case 35668:case 35672:return Cg;case 35669:case 35673:return Pg;case 5125:return Ig;case 36294:return Lg;case 36295:return Dg;case 36296:return Ug;case 35678:case 36198:case 36298:case 36306:case 35682:return Ng;case 35679:case 36299:case 36307:return Fg;case 35680:case 36300:case 36308:case 36293:return Og;case 36289:case 36303:case 36311:case 36292:return Bg}}function Hg(i,t){i.uniform1fv(this.addr,t)}function kg(i,t){let e=ps(t,this.size,2);i.uniform2fv(this.addr,e)}function Vg(i,t){let e=ps(t,this.size,3);i.uniform3fv(this.addr,e)}function Gg(i,t){let e=ps(t,this.size,4);i.uniform4fv(this.addr,e)}function Wg(i,t){let e=ps(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function Xg(i,t){let e=ps(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Yg(i,t){let e=ps(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function qg(i,t){i.uniform1iv(this.addr,t)}function Zg(i,t){i.uniform2iv(this.addr,t)}function $g(i,t){i.uniform3iv(this.addr,t)}function Jg(i,t){i.uniform4iv(this.addr,t)}function Kg(i,t){i.uniform1uiv(this.addr,t)}function Qg(i,t){i.uniform2uiv(this.addr,t)}function jg(i,t){i.uniform3uiv(this.addr,t)}function t0(i,t){i.uniform4uiv(this.addr,t)}function e0(i,t,e){let n=this.cache,s=t.length,r=wo(e,s);Me(n,r)||(i.uniform1iv(this.addr,r),Se(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||lu,r[o])}function n0(i,t,e){let n=this.cache,s=t.length,r=wo(e,s);Me(n,r)||(i.uniform1iv(this.addr,r),Se(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||hu,r[o])}function i0(i,t,e){let n=this.cache,s=t.length,r=wo(e,s);Me(n,r)||(i.uniform1iv(this.addr,r),Se(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||uu,r[o])}function s0(i,t,e){let n=this.cache,s=t.length,r=wo(e,s);Me(n,r)||(i.uniform1iv(this.addr,r),Se(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||cu,r[o])}function r0(i){switch(i){case 5126:return Hg;case 35664:return kg;case 35665:return Vg;case 35666:return Gg;case 35674:return Wg;case 35675:return Xg;case 35676:return Yg;case 5124:case 35670:return qg;case 35667:case 35671:return Zg;case 35668:case 35672:return $g;case 35669:case 35673:return Jg;case 5125:return Kg;case 36294:return Qg;case 36295:return jg;case 36296:return t0;case 35678:case 36198:case 36298:case 36306:case 35682:return e0;case 35679:case 36299:case 36307:return n0;case 35680:case 36300:case 36308:case 36293:return i0;case 36289:case 36303:case 36311:case 36292:return s0}}var pl=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=zg(e.type)}},ml=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=r0(e.type)}},gl=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},ya=/(\w+)(\])?(\[|\.)?/g;function Mh(i,t){i.seq.push(t),i.map[t.id]=t}function o0(i,t,e){let n=i.name,s=n.length;for(ya.lastIndex=0;;){let r=ya.exec(n),o=ya.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Mh(e,c===void 0?new pl(a,i,t):new ml(a,i,t));break}else{let f=e.map[a];f===void 0&&(f=new gl(a),Mh(e,f)),e=f}}}var ji=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);o0(r,o,this)}}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function Sh(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var a0=37297,l0=0;function c0(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var bh=new Gt;function h0(i){qt._getMatrix(bh,qt.workingColorSpace,i);let t=`mat3( ${bh.elements.map(e=>e.toFixed(4))} )`;switch(qt.getTransfer(i)){case Eo:return[t,"LinearTransferOETF"];case ne:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Eh(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+c0(i.getShaderSource(t),o)}else return s}function u0(i,t){let e=h0(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function d0(i,t){let e;switch(t){case Zl:e="Linear";break;case $l:e="Reinhard";break;case Jl:e="Cineon";break;case js:e="ACESFilmic";break;case Kl:e="AgX";break;case Ql:e="Neutral";break;case Rd:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Ir=new P;function f0(){qt.getLuminanceCoefficients(Ir);let i=Ir.x.toFixed(4),t=Ir.y.toFixed(4),e=Ir.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function p0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Us).join(`
`)}function m0(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function g0(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Us(i){return i!==""}function wh(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Th(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var _0=/^[ \t]*#include +<([\w\d./]+)>/gm;function _l(i){return i.replace(_0,v0)}var x0=new Map;function v0(i,t){let e=Xt[t];if(e===void 0){let n=x0.get(t);if(n!==void 0)e=Xt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return _l(e)}var y0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ah(i){return i.replace(y0,M0)}function M0(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Rh(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function S0(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Wh?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===ql?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Un&&(t="SHADOWMAP_TYPE_VSM"),t}function b0(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case es:case ns:t="ENVMAP_TYPE_CUBE";break;case bo:t="ENVMAP_TYPE_CUBE_UV";break}return t}function E0(i){let t="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===ns&&(t="ENVMAP_MODE_REFRACTION"),t}function w0(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Xh:t="ENVMAP_BLENDING_MULTIPLY";break;case Td:t="ENVMAP_BLENDING_MIX";break;case Ad:t="ENVMAP_BLENDING_ADD";break}return t}function T0(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function A0(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=S0(e),c=b0(e),h=E0(e),f=w0(e),d=T0(e),u=p0(e),m=m0(r),_=s.createProgram(),g,p,b=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Us).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Us).join(`
`),p.length>0&&(p+=`
`)):(g=[Rh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Us).join(`
`),p=[Rh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+f:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ti?"#define TONE_MAPPING":"",e.toneMapping!==ti?Xt.tonemapping_pars_fragment:"",e.toneMapping!==ti?d0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Xt.colorspace_pars_fragment,u0("linearToOutputTexel",e.outputColorSpace),f0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Us).join(`
`)),o=_l(o),o=wh(o,e),o=Th(o,e),a=_l(a),a=wh(a,e),a=Th(a,e),o=Ah(o),a=Ah(a),e.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,g=[u,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",e.glslVersion===kc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===kc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let v=b+g+o,x=b+p+a,L=Sh(s,s.VERTEX_SHADER,v),T=Sh(s,s.FRAGMENT_SHADER,x);s.attachShader(_,L),s.attachShader(_,T),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function C(I){if(i.debug.checkShaderErrors){let z=s.getProgramInfoLog(_).trim(),O=s.getShaderInfoLog(L).trim(),k=s.getShaderInfoLog(T).trim(),Z=!0,V=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(Z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,L,T);else{let et=Eh(s,L,"vertex"),G=Eh(s,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+z+`
`+et+`
`+G)}else z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",z):(O===""||k==="")&&(V=!1);V&&(I.diagnostics={runnable:Z,programLog:z,vertexShader:{log:O,prefix:g},fragmentShader:{log:k,prefix:p}})}s.deleteShader(L),s.deleteShader(T),A=new ji(s,_),S=g0(s,_)}let A;this.getUniforms=function(){return A===void 0&&C(this),A};let S;this.getAttributes=function(){return S===void 0&&C(this),S};let y=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(_,a0)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=l0++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=L,this.fragmentShader=T,this}var R0=0,xl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new vl(t),e.set(t,n)),n}},vl=class{constructor(t){this.id=R0++,this.code=t,this.usedTimes=0}};function C0(i,t,e,n,s,r,o){let a=new Xs,l=new xl,c=new Set,h=[],f=s.logarithmicDepthBuffer,d=s.vertexTextures,u=s.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function g(S,y,I,z,O){let k=z.fog,Z=O.geometry,V=S.isMeshStandardMaterial?z.environment:null,et=(S.isMeshStandardMaterial?e:t).get(S.envMap||V),G=et&&et.mapping===bo?et.image.height:null,at=m[S.type];S.precision!==null&&(u=s.getMaxPrecision(S.precision),u!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",u,"instead."));let pt=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,yt=pt!==void 0?pt.length:0,Ht=0;Z.morphAttributes.position!==void 0&&(Ht=1),Z.morphAttributes.normal!==void 0&&(Ht=2),Z.morphAttributes.color!==void 0&&(Ht=3);let jt,q,it,Mt;if(at){let se=yn[at];jt=se.vertexShader,q=se.fragmentShader}else jt=S.vertexShader,q=S.fragmentShader,l.update(S),it=l.getVertexShaderID(S),Mt=l.getFragmentShaderID(S);let rt=i.getRenderTarget(),It=i.state.buffers.depth.getReversed(),Bt=O.isInstancedMesh===!0,Ut=O.isBatchedMesh===!0,Jt=!!S.map,J=!!S.matcap,nt=!!et,R=!!S.aoMap,Rt=!!S.lightMap,j=!!S.bumpMap,_t=!!S.normalMap,ot=!!S.displacementMap,Lt=!!S.emissiveMap,mt=!!S.metalnessMap,w=!!S.roughnessMap,M=S.anisotropy>0,F=S.clearcoat>0,X=S.dispersion>0,Q=S.iridescence>0,Y=S.sheen>0,bt=S.transmission>0,ct=M&&!!S.anisotropyMap,gt=F&&!!S.clearcoatMap,Yt=F&&!!S.clearcoatNormalMap,tt=F&&!!S.clearcoatRoughnessMap,xt=Q&&!!S.iridescenceMap,Dt=Q&&!!S.iridescenceThicknessMap,Ft=Y&&!!S.sheenColorMap,vt=Y&&!!S.sheenRoughnessMap,Zt=!!S.specularMap,Wt=!!S.specularColorMap,ae=!!S.specularIntensityMap,D=bt&&!!S.transmissionMap,ht=bt&&!!S.thicknessMap,W=!!S.gradientMap,$=!!S.alphaMap,ft=S.alphaTest>0,ut=!!S.alphaHash,kt=!!S.extensions,pe=ti;S.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&(pe=i.toneMapping);let Ie={shaderID:at,shaderType:S.type,shaderName:S.name,vertexShader:jt,fragmentShader:q,defines:S.defines,customVertexShaderID:it,customFragmentShaderID:Mt,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:u,batching:Ut,batchingColor:Ut&&O._colorsTexture!==null,instancing:Bt,instancingColor:Bt&&O.instanceColor!==null,instancingMorph:Bt&&O.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:rt===null?i.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:fs,alphaToCoverage:!!S.alphaToCoverage,map:Jt,matcap:J,envMap:nt,envMapMode:nt&&et.mapping,envMapCubeUVHeight:G,aoMap:R,lightMap:Rt,bumpMap:j,normalMap:_t,displacementMap:d&&ot,emissiveMap:Lt,normalMapObjectSpace:_t&&S.normalMapType===Ld,normalMapTangentSpace:_t&&S.normalMapType===nu,metalnessMap:mt,roughnessMap:w,anisotropy:M,anisotropyMap:ct,clearcoat:F,clearcoatMap:gt,clearcoatNormalMap:Yt,clearcoatRoughnessMap:tt,dispersion:X,iridescence:Q,iridescenceMap:xt,iridescenceThicknessMap:Dt,sheen:Y,sheenColorMap:Ft,sheenRoughnessMap:vt,specularMap:Zt,specularColorMap:Wt,specularIntensityMap:ae,transmission:bt,transmissionMap:D,thicknessMap:ht,gradientMap:W,opaque:S.transparent===!1&&S.blending===Ji&&S.alphaToCoverage===!1,alphaMap:$,alphaTest:ft,alphaHash:ut,combine:S.combine,mapUv:Jt&&_(S.map.channel),aoMapUv:R&&_(S.aoMap.channel),lightMapUv:Rt&&_(S.lightMap.channel),bumpMapUv:j&&_(S.bumpMap.channel),normalMapUv:_t&&_(S.normalMap.channel),displacementMapUv:ot&&_(S.displacementMap.channel),emissiveMapUv:Lt&&_(S.emissiveMap.channel),metalnessMapUv:mt&&_(S.metalnessMap.channel),roughnessMapUv:w&&_(S.roughnessMap.channel),anisotropyMapUv:ct&&_(S.anisotropyMap.channel),clearcoatMapUv:gt&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:Yt&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:tt&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:xt&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:Dt&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:Ft&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:vt&&_(S.sheenRoughnessMap.channel),specularMapUv:Zt&&_(S.specularMap.channel),specularColorMapUv:Wt&&_(S.specularColorMap.channel),specularIntensityMapUv:ae&&_(S.specularIntensityMap.channel),transmissionMapUv:D&&_(S.transmissionMap.channel),thicknessMapUv:ht&&_(S.thicknessMap.channel),alphaMapUv:$&&_(S.alphaMap.channel),vertexTangents:!!Z.attributes.tangent&&(_t||M),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!Z.attributes.uv&&(Jt||$),fog:!!k,useFog:S.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:f,reverseDepthBuffer:It,skinning:O.isSkinnedMesh===!0,morphTargets:Z.morphAttributes.position!==void 0,morphNormals:Z.morphAttributes.normal!==void 0,morphColors:Z.morphAttributes.color!==void 0,morphTargetsCount:yt,morphTextureStride:Ht,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:pe,decodeVideoTexture:Jt&&S.map.isVideoTexture===!0&&qt.getTransfer(S.map.colorSpace)===ne,decodeVideoTextureEmissive:Lt&&S.emissiveMap.isVideoTexture===!0&&qt.getTransfer(S.emissiveMap.colorSpace)===ne,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Fn,flipSided:S.side===Ne,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:kt&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(kt&&S.extensions.multiDraw===!0||Ut)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Ie.vertexUv1s=c.has(1),Ie.vertexUv2s=c.has(2),Ie.vertexUv3s=c.has(3),c.clear(),Ie}function p(S){let y=[];if(S.shaderID?y.push(S.shaderID):(y.push(S.customVertexShaderID),y.push(S.customFragmentShaderID)),S.defines!==void 0)for(let I in S.defines)y.push(I),y.push(S.defines[I]);return S.isRawShaderMaterial===!1&&(b(y,S),v(y,S),y.push(i.outputColorSpace)),y.push(S.customProgramCacheKey),y.join()}function b(S,y){S.push(y.precision),S.push(y.outputColorSpace),S.push(y.envMapMode),S.push(y.envMapCubeUVHeight),S.push(y.mapUv),S.push(y.alphaMapUv),S.push(y.lightMapUv),S.push(y.aoMapUv),S.push(y.bumpMapUv),S.push(y.normalMapUv),S.push(y.displacementMapUv),S.push(y.emissiveMapUv),S.push(y.metalnessMapUv),S.push(y.roughnessMapUv),S.push(y.anisotropyMapUv),S.push(y.clearcoatMapUv),S.push(y.clearcoatNormalMapUv),S.push(y.clearcoatRoughnessMapUv),S.push(y.iridescenceMapUv),S.push(y.iridescenceThicknessMapUv),S.push(y.sheenColorMapUv),S.push(y.sheenRoughnessMapUv),S.push(y.specularMapUv),S.push(y.specularColorMapUv),S.push(y.specularIntensityMapUv),S.push(y.transmissionMapUv),S.push(y.thicknessMapUv),S.push(y.combine),S.push(y.fogExp2),S.push(y.sizeAttenuation),S.push(y.morphTargetsCount),S.push(y.morphAttributeCount),S.push(y.numDirLights),S.push(y.numPointLights),S.push(y.numSpotLights),S.push(y.numSpotLightMaps),S.push(y.numHemiLights),S.push(y.numRectAreaLights),S.push(y.numDirLightShadows),S.push(y.numPointLightShadows),S.push(y.numSpotLightShadows),S.push(y.numSpotLightShadowsWithMaps),S.push(y.numLightProbes),S.push(y.shadowMapType),S.push(y.toneMapping),S.push(y.numClippingPlanes),S.push(y.numClipIntersection),S.push(y.depthPacking)}function v(S,y){a.disableAll(),y.supportsVertexTextures&&a.enable(0),y.instancing&&a.enable(1),y.instancingColor&&a.enable(2),y.instancingMorph&&a.enable(3),y.matcap&&a.enable(4),y.envMap&&a.enable(5),y.normalMapObjectSpace&&a.enable(6),y.normalMapTangentSpace&&a.enable(7),y.clearcoat&&a.enable(8),y.iridescence&&a.enable(9),y.alphaTest&&a.enable(10),y.vertexColors&&a.enable(11),y.vertexAlphas&&a.enable(12),y.vertexUv1s&&a.enable(13),y.vertexUv2s&&a.enable(14),y.vertexUv3s&&a.enable(15),y.vertexTangents&&a.enable(16),y.anisotropy&&a.enable(17),y.alphaHash&&a.enable(18),y.batching&&a.enable(19),y.dispersion&&a.enable(20),y.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reverseDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),S.push(a.mask)}function x(S){let y=m[S.type],I;if(y){let z=yn[y];I=si.clone(z.uniforms)}else I=S.uniforms;return I}function L(S,y){let I;for(let z=0,O=h.length;z<O;z++){let k=h[z];if(k.cacheKey===y){I=k,++I.usedTimes;break}}return I===void 0&&(I=new A0(i,y,S,r),h.push(I)),I}function T(S){if(--S.usedTimes===0){let y=h.indexOf(S);h[y]=h[h.length-1],h.pop(),S.destroy()}}function C(S){l.remove(S)}function A(){l.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:x,acquireProgram:L,releaseProgram:T,releaseShaderCache:C,programs:h,dispose:A}}function P0(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function I0(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Ch(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Ph(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(f,d,u,m,_,g){let p=i[t];return p===void 0?(p={id:f.id,object:f,geometry:d,material:u,groupOrder:m,renderOrder:f.renderOrder,z:_,group:g},i[t]=p):(p.id=f.id,p.object=f,p.geometry=d,p.material=u,p.groupOrder=m,p.renderOrder=f.renderOrder,p.z=_,p.group=g),t++,p}function a(f,d,u,m,_,g){let p=o(f,d,u,m,_,g);u.transmission>0?n.push(p):u.transparent===!0?s.push(p):e.push(p)}function l(f,d,u,m,_,g){let p=o(f,d,u,m,_,g);u.transmission>0?n.unshift(p):u.transparent===!0?s.unshift(p):e.unshift(p)}function c(f,d){e.length>1&&e.sort(f||I0),n.length>1&&n.sort(d||Ch),s.length>1&&s.sort(d||Ch)}function h(){for(let f=t,d=i.length;f<d;f++){let u=i[f];if(u.id===null)break;u.id=null,u.object=null,u.geometry=null,u.material=null,u.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function L0(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new Ph,i.set(n,[o])):s>=r.length?(o=new Ph,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function D0(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new P,color:new At};break;case"SpotLight":e={position:new P,direction:new P,color:new At,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new P,color:new At,distance:0,decay:0};break;case"HemisphereLight":e={direction:new P,skyColor:new At,groundColor:new At};break;case"RectAreaLight":e={color:new At,position:new P,halfWidth:new P,halfHeight:new P};break}return i[t.id]=e,e}}}function U0(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new K};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new K};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new K,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var N0=0;function F0(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function O0(i){let t=new D0,e=U0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new P);let s=new P,r=new Ot,o=new Ot;function a(c){let h=0,f=0,d=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let u=0,m=0,_=0,g=0,p=0,b=0,v=0,x=0,L=0,T=0,C=0;c.sort(F0);for(let S=0,y=c.length;S<y;S++){let I=c[S],z=I.color,O=I.intensity,k=I.distance,Z=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=z.r*O,f+=z.g*O,d+=z.b*O;else if(I.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(I.sh.coefficients[V],O);C++}else if(I.isDirectionalLight){let V=t.get(I);if(V.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let et=I.shadow,G=e.get(I);G.shadowIntensity=et.intensity,G.shadowBias=et.bias,G.shadowNormalBias=et.normalBias,G.shadowRadius=et.radius,G.shadowMapSize=et.mapSize,n.directionalShadow[u]=G,n.directionalShadowMap[u]=Z,n.directionalShadowMatrix[u]=I.shadow.matrix,b++}n.directional[u]=V,u++}else if(I.isSpotLight){let V=t.get(I);V.position.setFromMatrixPosition(I.matrixWorld),V.color.copy(z).multiplyScalar(O),V.distance=k,V.coneCos=Math.cos(I.angle),V.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),V.decay=I.decay,n.spot[_]=V;let et=I.shadow;if(I.map&&(n.spotLightMap[L]=I.map,L++,et.updateMatrices(I),I.castShadow&&T++),n.spotLightMatrix[_]=et.matrix,I.castShadow){let G=e.get(I);G.shadowIntensity=et.intensity,G.shadowBias=et.bias,G.shadowNormalBias=et.normalBias,G.shadowRadius=et.radius,G.shadowMapSize=et.mapSize,n.spotShadow[_]=G,n.spotShadowMap[_]=Z,x++}_++}else if(I.isRectAreaLight){let V=t.get(I);V.color.copy(z).multiplyScalar(O),V.halfWidth.set(I.width*.5,0,0),V.halfHeight.set(0,I.height*.5,0),n.rectArea[g]=V,g++}else if(I.isPointLight){let V=t.get(I);if(V.color.copy(I.color).multiplyScalar(I.intensity),V.distance=I.distance,V.decay=I.decay,I.castShadow){let et=I.shadow,G=e.get(I);G.shadowIntensity=et.intensity,G.shadowBias=et.bias,G.shadowNormalBias=et.normalBias,G.shadowRadius=et.radius,G.shadowMapSize=et.mapSize,G.shadowCameraNear=et.camera.near,G.shadowCameraFar=et.camera.far,n.pointShadow[m]=G,n.pointShadowMap[m]=Z,n.pointShadowMatrix[m]=I.shadow.matrix,v++}n.point[m]=V,m++}else if(I.isHemisphereLight){let V=t.get(I);V.skyColor.copy(I.color).multiplyScalar(O),V.groundColor.copy(I.groundColor).multiplyScalar(O),n.hemi[p]=V,p++}}g>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=lt.LTC_FLOAT_1,n.rectAreaLTC2=lt.LTC_FLOAT_2):(n.rectAreaLTC1=lt.LTC_HALF_1,n.rectAreaLTC2=lt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=f,n.ambient[2]=d;let A=n.hash;(A.directionalLength!==u||A.pointLength!==m||A.spotLength!==_||A.rectAreaLength!==g||A.hemiLength!==p||A.numDirectionalShadows!==b||A.numPointShadows!==v||A.numSpotShadows!==x||A.numSpotMaps!==L||A.numLightProbes!==C)&&(n.directional.length=u,n.spot.length=_,n.rectArea.length=g,n.point.length=m,n.hemi.length=p,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=v,n.pointShadowMap.length=v,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=v,n.spotLightMatrix.length=x+L-T,n.spotLightMap.length=L,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=C,A.directionalLength=u,A.pointLength=m,A.spotLength=_,A.rectAreaLength=g,A.hemiLength=p,A.numDirectionalShadows=b,A.numPointShadows=v,A.numSpotShadows=x,A.numSpotMaps=L,A.numLightProbes=C,n.version=N0++)}function l(c,h){let f=0,d=0,u=0,m=0,_=0,g=h.matrixWorldInverse;for(let p=0,b=c.length;p<b;p++){let v=c[p];if(v.isDirectionalLight){let x=n.directional[f];x.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(g),f++}else if(v.isSpotLight){let x=n.spot[u];x.position.setFromMatrixPosition(v.matrixWorld),x.position.applyMatrix4(g),x.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(g),u++}else if(v.isRectAreaLight){let x=n.rectArea[m];x.position.setFromMatrixPosition(v.matrixWorld),x.position.applyMatrix4(g),o.identity(),r.copy(v.matrixWorld),r.premultiply(g),o.extractRotation(r),x.halfWidth.set(v.width*.5,0,0),x.halfHeight.set(0,v.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),m++}else if(v.isPointLight){let x=n.point[d];x.position.setFromMatrixPosition(v.matrixWorld),x.position.applyMatrix4(g),d++}else if(v.isHemisphereLight){let x=n.hemi[_];x.direction.setFromMatrixPosition(v.matrixWorld),x.direction.transformDirection(g),_++}}}return{setup:a,setupView:l,state:n}}function Ih(i){let t=new O0(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function o(h){n.push(h)}function a(){t.setup(e)}function l(h){t.setupView(e,h)}let c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function B0(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new Ih(i),t.set(s,[a])):r>=o.length?(a=new Ih(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var yl=class extends Mi{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Pd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Ml=class extends Mi{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},z0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,H0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function k0(i,t,e){let n=new Ys,s=new K,r=new K,o=new me,a=new yl({depthPacking:Id}),l=new Ml,c={},h=e.maxTextureSize,f={[ei]:Ne,[Ne]:ei,[Fn]:Fn},d=new _e({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new K},radius:{value:4}},vertexShader:z0,fragmentShader:H0}),u=d.clone();u.defines.HORIZONTAL_PASS=1;let m=new Ce;m.setAttribute("position",new Re(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new St(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Wh;let p=this.type;this.render=function(T,C,A){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||T.length===0)return;let S=i.getRenderTarget(),y=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),z=i.state;z.setBlending(bn),z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);let O=p!==Un&&this.type===Un,k=p===Un&&this.type!==Un;for(let Z=0,V=T.length;Z<V;Z++){let et=T[Z],G=et.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",et,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let at=G.getFrameExtents();if(s.multiply(at),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/at.x),s.x=r.x*at.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/at.y),s.y=r.y*at.y,G.mapSize.y=r.y)),G.map===null||O===!0||k===!0){let yt=this.type!==Un?{minFilter:$e,magFilter:$e}:{};G.map!==null&&G.map.dispose(),G.map=new ze(s.x,s.y,yt),G.map.texture.name=et.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();let pt=G.getViewportCount();for(let yt=0;yt<pt;yt++){let Ht=G.getViewport(yt);o.set(r.x*Ht.x,r.y*Ht.y,r.x*Ht.z,r.y*Ht.w),z.viewport(o),G.updateMatrices(et,yt),n=G.getFrustum(),x(C,A,G.camera,et,this.type)}G.isPointLightShadow!==!0&&this.type===Un&&b(G,A),G.needsUpdate=!1}p=this.type,g.needsUpdate=!1,i.setRenderTarget(S,y,I)};function b(T,C){let A=t.update(_);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,u.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,u.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new ze(s.x,s.y)),d.uniforms.shadow_pass.value=T.map.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(C,null,A,d,_,null),u.uniforms.shadow_pass.value=T.mapPass.texture,u.uniforms.resolution.value=T.mapSize,u.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(C,null,A,u,_,null)}function v(T,C,A,S){let y=null,I=A.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(I!==void 0)y=I;else if(y=A.isPointLight===!0?l:a,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0){let z=y.uuid,O=C.uuid,k=c[z];k===void 0&&(k={},c[z]=k);let Z=k[O];Z===void 0&&(Z=y.clone(),k[O]=Z,C.addEventListener("dispose",L)),y=Z}if(y.visible=C.visible,y.wireframe=C.wireframe,S===Un?y.side=C.shadowSide!==null?C.shadowSide:C.side:y.side=C.shadowSide!==null?C.shadowSide:f[C.side],y.alphaMap=C.alphaMap,y.alphaTest=C.alphaTest,y.map=C.map,y.clipShadows=C.clipShadows,y.clippingPlanes=C.clippingPlanes,y.clipIntersection=C.clipIntersection,y.displacementMap=C.displacementMap,y.displacementScale=C.displacementScale,y.displacementBias=C.displacementBias,y.wireframeLinewidth=C.wireframeLinewidth,y.linewidth=C.linewidth,A.isPointLight===!0&&y.isMeshDistanceMaterial===!0){let z=i.properties.get(y);z.light=A}return y}function x(T,C,A,S,y){if(T.visible===!1)return;if(T.layers.test(C.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&y===Un)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,T.matrixWorld);let O=t.update(T),k=T.material;if(Array.isArray(k)){let Z=O.groups;for(let V=0,et=Z.length;V<et;V++){let G=Z[V],at=k[G.materialIndex];if(at&&at.visible){let pt=v(T,at,S,y);T.onBeforeShadow(i,T,C,A,O,pt,G),i.renderBufferDirect(A,null,O,pt,T,G),T.onAfterShadow(i,T,C,A,O,pt,G)}}}else if(k.visible){let Z=v(T,k,S,y);T.onBeforeShadow(i,T,C,A,O,Z,null),i.renderBufferDirect(A,null,O,Z,T,null),T.onAfterShadow(i,T,C,A,O,Z,null)}}let z=T.children;for(let O=0,k=z.length;O<k;O++)x(z[O],C,A,S,y)}function L(T){T.target.removeEventListener("dispose",L);for(let A in c){let S=c[A],y=T.target.uuid;y in S&&(S[y].dispose(),delete S[y])}}}var V0={[Aa]:Ra,[Ca]:La,[Pa]:Da,[ts]:Ia,[Ra]:Aa,[La]:Ca,[Da]:Pa,[Ia]:ts};function G0(i,t){function e(){let D=!1,ht=new me,W=null,$=new me(0,0,0,0);return{setMask:function(ft){W!==ft&&!D&&(i.colorMask(ft,ft,ft,ft),W=ft)},setLocked:function(ft){D=ft},setClear:function(ft,ut,kt,pe,Ie){Ie===!0&&(ft*=pe,ut*=pe,kt*=pe),ht.set(ft,ut,kt,pe),$.equals(ht)===!1&&(i.clearColor(ft,ut,kt,pe),$.copy(ht))},reset:function(){D=!1,W=null,$.set(-1,0,0,0)}}}function n(){let D=!1,ht=!1,W=null,$=null,ft=null;return{setReversed:function(ut){if(ht!==ut){let kt=t.get("EXT_clip_control");ht?kt.clipControlEXT(kt.LOWER_LEFT_EXT,kt.ZERO_TO_ONE_EXT):kt.clipControlEXT(kt.LOWER_LEFT_EXT,kt.NEGATIVE_ONE_TO_ONE_EXT);let pe=ft;ft=null,this.setClear(pe)}ht=ut},getReversed:function(){return ht},setTest:function(ut){ut?rt(i.DEPTH_TEST):It(i.DEPTH_TEST)},setMask:function(ut){W!==ut&&!D&&(i.depthMask(ut),W=ut)},setFunc:function(ut){if(ht&&(ut=V0[ut]),$!==ut){switch(ut){case Aa:i.depthFunc(i.NEVER);break;case Ra:i.depthFunc(i.ALWAYS);break;case Ca:i.depthFunc(i.LESS);break;case ts:i.depthFunc(i.LEQUAL);break;case Pa:i.depthFunc(i.EQUAL);break;case Ia:i.depthFunc(i.GEQUAL);break;case La:i.depthFunc(i.GREATER);break;case Da:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}$=ut}},setLocked:function(ut){D=ut},setClear:function(ut){ft!==ut&&(ht&&(ut=1-ut),i.clearDepth(ut),ft=ut)},reset:function(){D=!1,W=null,$=null,ft=null,ht=!1}}}function s(){let D=!1,ht=null,W=null,$=null,ft=null,ut=null,kt=null,pe=null,Ie=null;return{setTest:function(se){D||(se?rt(i.STENCIL_TEST):It(i.STENCIL_TEST))},setMask:function(se){ht!==se&&!D&&(i.stencilMask(se),ht=se)},setFunc:function(se,ln,An){(W!==se||$!==ln||ft!==An)&&(i.stencilFunc(se,ln,An),W=se,$=ln,ft=An)},setOp:function(se,ln,An){(ut!==se||kt!==ln||pe!==An)&&(i.stencilOp(se,ln,An),ut=se,kt=ln,pe=An)},setLocked:function(se){D=se},setClear:function(se){Ie!==se&&(i.clearStencil(se),Ie=se)},reset:function(){D=!1,ht=null,W=null,$=null,ft=null,ut=null,kt=null,pe=null,Ie=null}}}let r=new e,o=new n,a=new s,l=new WeakMap,c=new WeakMap,h={},f={},d=new WeakMap,u=[],m=null,_=!1,g=null,p=null,b=null,v=null,x=null,L=null,T=null,C=new At(0,0,0),A=0,S=!1,y=null,I=null,z=null,O=null,k=null,Z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,et=0,G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(et=parseFloat(/^WebGL (\d)/.exec(G)[1]),V=et>=1):G.indexOf("OpenGL ES")!==-1&&(et=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),V=et>=2);let at=null,pt={},yt=i.getParameter(i.SCISSOR_BOX),Ht=i.getParameter(i.VIEWPORT),jt=new me().fromArray(yt),q=new me().fromArray(Ht);function it(D,ht,W,$){let ft=new Uint8Array(4),ut=i.createTexture();i.bindTexture(D,ut),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let kt=0;kt<W;kt++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(ht,0,i.RGBA,1,1,$,0,i.RGBA,i.UNSIGNED_BYTE,ft):i.texImage2D(ht+kt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ft);return ut}let Mt={};Mt[i.TEXTURE_2D]=it(i.TEXTURE_2D,i.TEXTURE_2D,1),Mt[i.TEXTURE_CUBE_MAP]=it(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Mt[i.TEXTURE_2D_ARRAY]=it(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Mt[i.TEXTURE_3D]=it(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),rt(i.DEPTH_TEST),o.setFunc(ts),j(!1),_t(Dc),rt(i.CULL_FACE),R(bn);function rt(D){h[D]!==!0&&(i.enable(D),h[D]=!0)}function It(D){h[D]!==!1&&(i.disable(D),h[D]=!1)}function Bt(D,ht){return f[D]!==ht?(i.bindFramebuffer(D,ht),f[D]=ht,D===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=ht),D===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=ht),!0):!1}function Ut(D,ht){let W=u,$=!1;if(D){W=d.get(ht),W===void 0&&(W=[],d.set(ht,W));let ft=D.textures;if(W.length!==ft.length||W[0]!==i.COLOR_ATTACHMENT0){for(let ut=0,kt=ft.length;ut<kt;ut++)W[ut]=i.COLOR_ATTACHMENT0+ut;W.length=ft.length,$=!0}}else W[0]!==i.BACK&&(W[0]=i.BACK,$=!0);$&&i.drawBuffers(W)}function Jt(D){return m!==D?(i.useProgram(D),m=D,!0):!1}let J={[mi]:i.FUNC_ADD,[cd]:i.FUNC_SUBTRACT,[hd]:i.FUNC_REVERSE_SUBTRACT};J[ud]=i.MIN,J[dd]=i.MAX;let nt={[fd]:i.ZERO,[pd]:i.ONE,[md]:i.SRC_COLOR,[wa]:i.SRC_ALPHA,[Md]:i.SRC_ALPHA_SATURATE,[vd]:i.DST_COLOR,[_d]:i.DST_ALPHA,[gd]:i.ONE_MINUS_SRC_COLOR,[Ta]:i.ONE_MINUS_SRC_ALPHA,[yd]:i.ONE_MINUS_DST_COLOR,[xd]:i.ONE_MINUS_DST_ALPHA,[Sd]:i.CONSTANT_COLOR,[bd]:i.ONE_MINUS_CONSTANT_COLOR,[Ed]:i.CONSTANT_ALPHA,[wd]:i.ONE_MINUS_CONSTANT_ALPHA};function R(D,ht,W,$,ft,ut,kt,pe,Ie,se){if(D===bn){_===!0&&(It(i.BLEND),_=!1);return}if(_===!1&&(rt(i.BLEND),_=!0),D!==ld){if(D!==g||se!==S){if((p!==mi||x!==mi)&&(i.blendEquation(i.FUNC_ADD),p=mi,x=mi),se)switch(D){case Ji:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Vr:i.blendFunc(i.ONE,i.ONE);break;case Uc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Nc:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case Ji:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Vr:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Uc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Nc:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}b=null,v=null,L=null,T=null,C.set(0,0,0),A=0,g=D,S=se}return}ft=ft||ht,ut=ut||W,kt=kt||$,(ht!==p||ft!==x)&&(i.blendEquationSeparate(J[ht],J[ft]),p=ht,x=ft),(W!==b||$!==v||ut!==L||kt!==T)&&(i.blendFuncSeparate(nt[W],nt[$],nt[ut],nt[kt]),b=W,v=$,L=ut,T=kt),(pe.equals(C)===!1||Ie!==A)&&(i.blendColor(pe.r,pe.g,pe.b,Ie),C.copy(pe),A=Ie),g=D,S=!1}function Rt(D,ht){D.side===Fn?It(i.CULL_FACE):rt(i.CULL_FACE);let W=D.side===Ne;ht&&(W=!W),j(W),D.blending===Ji&&D.transparent===!1?R(bn):R(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);let $=D.stencilWrite;a.setTest($),$&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Lt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?rt(i.SAMPLE_ALPHA_TO_COVERAGE):It(i.SAMPLE_ALPHA_TO_COVERAGE)}function j(D){y!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),y=D)}function _t(D){D!==od?(rt(i.CULL_FACE),D!==I&&(D===Dc?i.cullFace(i.BACK):D===ad?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):It(i.CULL_FACE),I=D}function ot(D){D!==z&&(V&&i.lineWidth(D),z=D)}function Lt(D,ht,W){D?(rt(i.POLYGON_OFFSET_FILL),(O!==ht||k!==W)&&(i.polygonOffset(ht,W),O=ht,k=W)):It(i.POLYGON_OFFSET_FILL)}function mt(D){D?rt(i.SCISSOR_TEST):It(i.SCISSOR_TEST)}function w(D){D===void 0&&(D=i.TEXTURE0+Z-1),at!==D&&(i.activeTexture(D),at=D)}function M(D,ht,W){W===void 0&&(at===null?W=i.TEXTURE0+Z-1:W=at);let $=pt[W];$===void 0&&($={type:void 0,texture:void 0},pt[W]=$),($.type!==D||$.texture!==ht)&&(at!==W&&(i.activeTexture(W),at=W),i.bindTexture(D,ht||Mt[D]),$.type=D,$.texture=ht)}function F(){let D=pt[at];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function X(){try{i.compressedTexImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Q(){try{i.compressedTexImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Y(){try{i.texSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function bt(){try{i.texSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ct(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function gt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Yt(){try{i.texStorage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function tt(){try{i.texStorage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function xt(){try{i.texImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Dt(){try{i.texImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ft(D){jt.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),jt.copy(D))}function vt(D){q.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),q.copy(D))}function Zt(D,ht){let W=c.get(ht);W===void 0&&(W=new WeakMap,c.set(ht,W));let $=W.get(D);$===void 0&&($=i.getUniformBlockIndex(ht,D.name),W.set(D,$))}function Wt(D,ht){let $=c.get(ht).get(D);l.get(ht)!==$&&(i.uniformBlockBinding(ht,$,D.__bindingPointIndex),l.set(ht,$))}function ae(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},at=null,pt={},f={},d=new WeakMap,u=[],m=null,_=!1,g=null,p=null,b=null,v=null,x=null,L=null,T=null,C=new At(0,0,0),A=0,S=!1,y=null,I=null,z=null,O=null,k=null,jt.set(0,0,i.canvas.width,i.canvas.height),q.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:rt,disable:It,bindFramebuffer:Bt,drawBuffers:Ut,useProgram:Jt,setBlending:R,setMaterial:Rt,setFlipSided:j,setCullFace:_t,setLineWidth:ot,setPolygonOffset:Lt,setScissorTest:mt,activeTexture:w,bindTexture:M,unbindTexture:F,compressedTexImage2D:X,compressedTexImage3D:Q,texImage2D:xt,texImage3D:Dt,updateUBOMapping:Zt,uniformBlockBinding:Wt,texStorage2D:Yt,texStorage3D:tt,texSubImage2D:Y,texSubImage3D:bt,compressedTexSubImage2D:ct,compressedTexSubImage3D:gt,scissor:Ft,viewport:vt,reset:ae}}function Lh(i,t,e,n){let s=W0(n);switch(e){case Jh:return i*t;case Qh:return i*t;case jh:return i*t*2;case nc:return i*t/s.components*s.byteLength;case ic:return i*t/s.components*s.byteLength;case tu:return i*t*2/s.components*s.byteLength;case sc:return i*t*2/s.components*s.byteLength;case Kh:return i*t*3/s.components*s.byteLength;case fn:return i*t*4/s.components*s.byteLength;case rc:return i*t*4/s.components*s.byteLength;case Or:case Br:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case zr:case Hr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Oa:case za:return Math.max(i,16)*Math.max(t,8)/4;case Fa:case Ba:return Math.max(i,8)*Math.max(t,8)/2;case Ha:case ka:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Va:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ga:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Wa:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Xa:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ya:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case qa:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Za:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case $a:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Ja:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Ka:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Qa:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case ja:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case tl:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case el:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case nl:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case kr:case il:case sl:return Math.ceil(i/4)*Math.ceil(t/4)*16;case eu:case rl:return Math.ceil(i/4)*Math.ceil(t/4)*8;case ol:case al:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function W0(i){switch(i){case zn:case qh:return{byteLength:1,components:1};case Gs:case Zh:case gn:return{byteLength:2,components:1};case tc:case ec:return{byteLength:2,components:4};case yi:case jl:case Sn:return{byteLength:4,components:1};case $h:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function X0(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new K,h=new WeakMap,f,d=new WeakMap,u=!1;try{u=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(w,M){return u?new OffscreenCanvas(w,M):Xr("canvas")}function _(w,M,F){let X=1,Q=mt(w);if((Q.width>F||Q.height>F)&&(X=F/Math.max(Q.width,Q.height)),X<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){let Y=Math.floor(X*Q.width),bt=Math.floor(X*Q.height);f===void 0&&(f=m(Y,bt));let ct=M?m(Y,bt):f;return ct.width=Y,ct.height=bt,ct.getContext("2d").drawImage(w,0,0,Y,bt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+Y+"x"+bt+")."),ct}else return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),w;return w}function g(w){return w.generateMipmaps}function p(w){i.generateMipmap(w)}function b(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(w,M,F,X,Q=!1){if(w!==null){if(i[w]!==void 0)return i[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let Y=M;if(M===i.RED&&(F===i.FLOAT&&(Y=i.R32F),F===i.HALF_FLOAT&&(Y=i.R16F),F===i.UNSIGNED_BYTE&&(Y=i.R8)),M===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(Y=i.R8UI),F===i.UNSIGNED_SHORT&&(Y=i.R16UI),F===i.UNSIGNED_INT&&(Y=i.R32UI),F===i.BYTE&&(Y=i.R8I),F===i.SHORT&&(Y=i.R16I),F===i.INT&&(Y=i.R32I)),M===i.RG&&(F===i.FLOAT&&(Y=i.RG32F),F===i.HALF_FLOAT&&(Y=i.RG16F),F===i.UNSIGNED_BYTE&&(Y=i.RG8)),M===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(Y=i.RG8UI),F===i.UNSIGNED_SHORT&&(Y=i.RG16UI),F===i.UNSIGNED_INT&&(Y=i.RG32UI),F===i.BYTE&&(Y=i.RG8I),F===i.SHORT&&(Y=i.RG16I),F===i.INT&&(Y=i.RG32I)),M===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(Y=i.RGB8UI),F===i.UNSIGNED_SHORT&&(Y=i.RGB16UI),F===i.UNSIGNED_INT&&(Y=i.RGB32UI),F===i.BYTE&&(Y=i.RGB8I),F===i.SHORT&&(Y=i.RGB16I),F===i.INT&&(Y=i.RGB32I)),M===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(Y=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(Y=i.RGBA16UI),F===i.UNSIGNED_INT&&(Y=i.RGBA32UI),F===i.BYTE&&(Y=i.RGBA8I),F===i.SHORT&&(Y=i.RGBA16I),F===i.INT&&(Y=i.RGBA32I)),M===i.RGB&&F===i.UNSIGNED_INT_5_9_9_9_REV&&(Y=i.RGB9_E5),M===i.RGBA){let bt=Q?Eo:qt.getTransfer(X);F===i.FLOAT&&(Y=i.RGBA32F),F===i.HALF_FLOAT&&(Y=i.RGBA16F),F===i.UNSIGNED_BYTE&&(Y=bt===ne?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(Y=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(Y=i.RGB5_A1)}return(Y===i.R16F||Y===i.R32F||Y===i.RG16F||Y===i.RG32F||Y===i.RGBA16F||Y===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function x(w,M){let F;return w?M===null||M===yi||M===is?F=i.DEPTH24_STENCIL8:M===Sn?F=i.DEPTH32F_STENCIL8:M===Gs&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===yi||M===is?F=i.DEPTH_COMPONENT24:M===Sn?F=i.DEPTH_COMPONENT32F:M===Gs&&(F=i.DEPTH_COMPONENT16),F}function L(w,M){return g(w)===!0||w.isFramebufferTexture&&w.minFilter!==$e&&w.minFilter!==Mn?Math.log2(Math.max(M.width,M.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?M.mipmaps.length:1}function T(w){let M=w.target;M.removeEventListener("dispose",T),A(M),M.isVideoTexture&&h.delete(M)}function C(w){let M=w.target;M.removeEventListener("dispose",C),y(M)}function A(w){let M=n.get(w);if(M.__webglInit===void 0)return;let F=w.source,X=d.get(F);if(X){let Q=X[M.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&S(w),Object.keys(X).length===0&&d.delete(F)}n.remove(w)}function S(w){let M=n.get(w);i.deleteTexture(M.__webglTexture);let F=w.source,X=d.get(F);delete X[M.__cacheKey],o.memory.textures--}function y(w){let M=n.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),n.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(M.__webglFramebuffer[X]))for(let Q=0;Q<M.__webglFramebuffer[X].length;Q++)i.deleteFramebuffer(M.__webglFramebuffer[X][Q]);else i.deleteFramebuffer(M.__webglFramebuffer[X]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[X])}else{if(Array.isArray(M.__webglFramebuffer))for(let X=0;X<M.__webglFramebuffer.length;X++)i.deleteFramebuffer(M.__webglFramebuffer[X]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let X=0;X<M.__webglColorRenderbuffer.length;X++)M.__webglColorRenderbuffer[X]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[X]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let F=w.textures;for(let X=0,Q=F.length;X<Q;X++){let Y=n.get(F[X]);Y.__webglTexture&&(i.deleteTexture(Y.__webglTexture),o.memory.textures--),n.remove(F[X])}n.remove(w)}let I=0;function z(){I=0}function O(){let w=I;return w>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+s.maxTextures),I+=1,w}function k(w){let M=[];return M.push(w.wrapS),M.push(w.wrapT),M.push(w.wrapR||0),M.push(w.magFilter),M.push(w.minFilter),M.push(w.anisotropy),M.push(w.internalFormat),M.push(w.format),M.push(w.type),M.push(w.generateMipmaps),M.push(w.premultiplyAlpha),M.push(w.flipY),M.push(w.unpackAlignment),M.push(w.colorSpace),M.join()}function Z(w,M){let F=n.get(w);if(w.isVideoTexture&&ot(w),w.isRenderTargetTexture===!1&&w.version>0&&F.__version!==w.version){let X=w.image;if(X===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{q(F,w,M);return}}e.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+M)}function V(w,M){let F=n.get(w);if(w.version>0&&F.__version!==w.version){q(F,w,M);return}e.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+M)}function et(w,M){let F=n.get(w);if(w.version>0&&F.__version!==w.version){q(F,w,M);return}e.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+M)}function G(w,M){let F=n.get(w);if(w.version>0&&F.__version!==w.version){it(F,w,M);return}e.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+M)}let at={[ks]:i.REPEAT,[xi]:i.CLAMP_TO_EDGE,[Vs]:i.MIRRORED_REPEAT},pt={[$e]:i.NEAREST,[Cd]:i.NEAREST_MIPMAP_NEAREST,[ur]:i.NEAREST_MIPMAP_LINEAR,[Mn]:i.LINEAR,[qo]:i.LINEAR_MIPMAP_NEAREST,[vi]:i.LINEAR_MIPMAP_LINEAR},yt={[Dd]:i.NEVER,[zd]:i.ALWAYS,[Ud]:i.LESS,[iu]:i.LEQUAL,[Nd]:i.EQUAL,[Bd]:i.GEQUAL,[Fd]:i.GREATER,[Od]:i.NOTEQUAL};function Ht(w,M){if(M.type===Sn&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===Mn||M.magFilter===qo||M.magFilter===ur||M.magFilter===vi||M.minFilter===Mn||M.minFilter===qo||M.minFilter===ur||M.minFilter===vi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,at[M.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,at[M.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,at[M.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,pt[M.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,pt[M.minFilter]),M.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,yt[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===$e||M.minFilter!==ur&&M.minFilter!==vi||M.type===Sn&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){let F=t.get("EXT_texture_filter_anisotropic");i.texParameterf(w,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function jt(w,M){let F=!1;w.__webglInit===void 0&&(w.__webglInit=!0,M.addEventListener("dispose",T));let X=M.source,Q=d.get(X);Q===void 0&&(Q={},d.set(X,Q));let Y=k(M);if(Y!==w.__cacheKey){Q[Y]===void 0&&(Q[Y]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,F=!0),Q[Y].usedTimes++;let bt=Q[w.__cacheKey];bt!==void 0&&(Q[w.__cacheKey].usedTimes--,bt.usedTimes===0&&S(M)),w.__cacheKey=Y,w.__webglTexture=Q[Y].texture}return F}function q(w,M,F){let X=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(X=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(X=i.TEXTURE_3D);let Q=jt(w,M),Y=M.source;e.bindTexture(X,w.__webglTexture,i.TEXTURE0+F);let bt=n.get(Y);if(Y.version!==bt.__version||Q===!0){e.activeTexture(i.TEXTURE0+F);let ct=qt.getPrimaries(qt.workingColorSpace),gt=M.colorSpace===jn?null:qt.getPrimaries(M.colorSpace),Yt=M.colorSpace===jn||ct===gt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Yt);let tt=_(M.image,!1,s.maxTextureSize);tt=Lt(M,tt);let xt=r.convert(M.format,M.colorSpace),Dt=r.convert(M.type),Ft=v(M.internalFormat,xt,Dt,M.colorSpace,M.isVideoTexture);Ht(X,M);let vt,Zt=M.mipmaps,Wt=M.isVideoTexture!==!0,ae=bt.__version===void 0||Q===!0,D=Y.dataReady,ht=L(M,tt);if(M.isDepthTexture)Ft=x(M.format===ss,M.type),ae&&(Wt?e.texStorage2D(i.TEXTURE_2D,1,Ft,tt.width,tt.height):e.texImage2D(i.TEXTURE_2D,0,Ft,tt.width,tt.height,0,xt,Dt,null));else if(M.isDataTexture)if(Zt.length>0){Wt&&ae&&e.texStorage2D(i.TEXTURE_2D,ht,Ft,Zt[0].width,Zt[0].height);for(let W=0,$=Zt.length;W<$;W++)vt=Zt[W],Wt?D&&e.texSubImage2D(i.TEXTURE_2D,W,0,0,vt.width,vt.height,xt,Dt,vt.data):e.texImage2D(i.TEXTURE_2D,W,Ft,vt.width,vt.height,0,xt,Dt,vt.data);M.generateMipmaps=!1}else Wt?(ae&&e.texStorage2D(i.TEXTURE_2D,ht,Ft,tt.width,tt.height),D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,tt.width,tt.height,xt,Dt,tt.data)):e.texImage2D(i.TEXTURE_2D,0,Ft,tt.width,tt.height,0,xt,Dt,tt.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Wt&&ae&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ht,Ft,Zt[0].width,Zt[0].height,tt.depth);for(let W=0,$=Zt.length;W<$;W++)if(vt=Zt[W],M.format!==fn)if(xt!==null)if(Wt){if(D)if(M.layerUpdates.size>0){let ft=Lh(vt.width,vt.height,M.format,M.type);for(let ut of M.layerUpdates){let kt=vt.data.subarray(ut*ft/vt.data.BYTES_PER_ELEMENT,(ut+1)*ft/vt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,ut,vt.width,vt.height,1,xt,kt)}M.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,vt.width,vt.height,tt.depth,xt,vt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,W,Ft,vt.width,vt.height,tt.depth,0,vt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Wt?D&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,vt.width,vt.height,tt.depth,xt,Dt,vt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,W,Ft,vt.width,vt.height,tt.depth,0,xt,Dt,vt.data)}else{Wt&&ae&&e.texStorage2D(i.TEXTURE_2D,ht,Ft,Zt[0].width,Zt[0].height);for(let W=0,$=Zt.length;W<$;W++)vt=Zt[W],M.format!==fn?xt!==null?Wt?D&&e.compressedTexSubImage2D(i.TEXTURE_2D,W,0,0,vt.width,vt.height,xt,vt.data):e.compressedTexImage2D(i.TEXTURE_2D,W,Ft,vt.width,vt.height,0,vt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Wt?D&&e.texSubImage2D(i.TEXTURE_2D,W,0,0,vt.width,vt.height,xt,Dt,vt.data):e.texImage2D(i.TEXTURE_2D,W,Ft,vt.width,vt.height,0,xt,Dt,vt.data)}else if(M.isDataArrayTexture)if(Wt){if(ae&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ht,Ft,tt.width,tt.height,tt.depth),D)if(M.layerUpdates.size>0){let W=Lh(tt.width,tt.height,M.format,M.type);for(let $ of M.layerUpdates){let ft=tt.data.subarray($*W/tt.data.BYTES_PER_ELEMENT,($+1)*W/tt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,$,tt.width,tt.height,1,xt,Dt,ft)}M.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,tt.width,tt.height,tt.depth,xt,Dt,tt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Ft,tt.width,tt.height,tt.depth,0,xt,Dt,tt.data);else if(M.isData3DTexture)Wt?(ae&&e.texStorage3D(i.TEXTURE_3D,ht,Ft,tt.width,tt.height,tt.depth),D&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,tt.width,tt.height,tt.depth,xt,Dt,tt.data)):e.texImage3D(i.TEXTURE_3D,0,Ft,tt.width,tt.height,tt.depth,0,xt,Dt,tt.data);else if(M.isFramebufferTexture){if(ae)if(Wt)e.texStorage2D(i.TEXTURE_2D,ht,Ft,tt.width,tt.height);else{let W=tt.width,$=tt.height;for(let ft=0;ft<ht;ft++)e.texImage2D(i.TEXTURE_2D,ft,Ft,W,$,0,xt,Dt,null),W>>=1,$>>=1}}else if(Zt.length>0){if(Wt&&ae){let W=mt(Zt[0]);e.texStorage2D(i.TEXTURE_2D,ht,Ft,W.width,W.height)}for(let W=0,$=Zt.length;W<$;W++)vt=Zt[W],Wt?D&&e.texSubImage2D(i.TEXTURE_2D,W,0,0,xt,Dt,vt):e.texImage2D(i.TEXTURE_2D,W,Ft,xt,Dt,vt);M.generateMipmaps=!1}else if(Wt){if(ae){let W=mt(tt);e.texStorage2D(i.TEXTURE_2D,ht,Ft,W.width,W.height)}D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,xt,Dt,tt)}else e.texImage2D(i.TEXTURE_2D,0,Ft,xt,Dt,tt);g(M)&&p(X),bt.__version=Y.version,M.onUpdate&&M.onUpdate(M)}w.__version=M.version}function it(w,M,F){if(M.image.length!==6)return;let X=jt(w,M),Q=M.source;e.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+F);let Y=n.get(Q);if(Q.version!==Y.__version||X===!0){e.activeTexture(i.TEXTURE0+F);let bt=qt.getPrimaries(qt.workingColorSpace),ct=M.colorSpace===jn?null:qt.getPrimaries(M.colorSpace),gt=M.colorSpace===jn||bt===ct?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,gt);let Yt=M.isCompressedTexture||M.image[0].isCompressedTexture,tt=M.image[0]&&M.image[0].isDataTexture,xt=[];for(let $=0;$<6;$++)!Yt&&!tt?xt[$]=_(M.image[$],!0,s.maxCubemapSize):xt[$]=tt?M.image[$].image:M.image[$],xt[$]=Lt(M,xt[$]);let Dt=xt[0],Ft=r.convert(M.format,M.colorSpace),vt=r.convert(M.type),Zt=v(M.internalFormat,Ft,vt,M.colorSpace),Wt=M.isVideoTexture!==!0,ae=Y.__version===void 0||X===!0,D=Q.dataReady,ht=L(M,Dt);Ht(i.TEXTURE_CUBE_MAP,M);let W;if(Yt){Wt&&ae&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ht,Zt,Dt.width,Dt.height);for(let $=0;$<6;$++){W=xt[$].mipmaps;for(let ft=0;ft<W.length;ft++){let ut=W[ft];M.format!==fn?Ft!==null?Wt?D&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,ft,0,0,ut.width,ut.height,Ft,ut.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,ft,Zt,ut.width,ut.height,0,ut.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Wt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,ft,0,0,ut.width,ut.height,Ft,vt,ut.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,ft,Zt,ut.width,ut.height,0,Ft,vt,ut.data)}}}else{if(W=M.mipmaps,Wt&&ae){W.length>0&&ht++;let $=mt(xt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,ht,Zt,$.width,$.height)}for(let $=0;$<6;$++)if(tt){Wt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,xt[$].width,xt[$].height,Ft,vt,xt[$].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,Zt,xt[$].width,xt[$].height,0,Ft,vt,xt[$].data);for(let ft=0;ft<W.length;ft++){let kt=W[ft].image[$].image;Wt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,ft+1,0,0,kt.width,kt.height,Ft,vt,kt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,ft+1,Zt,kt.width,kt.height,0,Ft,vt,kt.data)}}else{Wt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,Ft,vt,xt[$]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,Zt,Ft,vt,xt[$]);for(let ft=0;ft<W.length;ft++){let ut=W[ft];Wt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,ft+1,0,0,Ft,vt,ut.image[$]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,ft+1,Zt,Ft,vt,ut.image[$])}}}g(M)&&p(i.TEXTURE_CUBE_MAP),Y.__version=Q.version,M.onUpdate&&M.onUpdate(M)}w.__version=M.version}function Mt(w,M,F,X,Q,Y){let bt=r.convert(F.format,F.colorSpace),ct=r.convert(F.type),gt=v(F.internalFormat,bt,ct,F.colorSpace),Yt=n.get(M),tt=n.get(F);if(tt.__renderTarget=M,!Yt.__hasExternalTextures){let xt=Math.max(1,M.width>>Y),Dt=Math.max(1,M.height>>Y);Q===i.TEXTURE_3D||Q===i.TEXTURE_2D_ARRAY?e.texImage3D(Q,Y,gt,xt,Dt,M.depth,0,bt,ct,null):e.texImage2D(Q,Y,gt,xt,Dt,0,bt,ct,null)}e.bindFramebuffer(i.FRAMEBUFFER,w),_t(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,X,Q,tt.__webglTexture,0,j(M)):(Q===i.TEXTURE_2D||Q>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,X,Q,tt.__webglTexture,Y),e.bindFramebuffer(i.FRAMEBUFFER,null)}function rt(w,M,F){if(i.bindRenderbuffer(i.RENDERBUFFER,w),M.depthBuffer){let X=M.depthTexture,Q=X&&X.isDepthTexture?X.type:null,Y=x(M.stencilBuffer,Q),bt=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ct=j(M);_t(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ct,Y,M.width,M.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ct,Y,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,Y,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,bt,i.RENDERBUFFER,w)}else{let X=M.textures;for(let Q=0;Q<X.length;Q++){let Y=X[Q],bt=r.convert(Y.format,Y.colorSpace),ct=r.convert(Y.type),gt=v(Y.internalFormat,bt,ct,Y.colorSpace),Yt=j(M);F&&_t(M)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Yt,gt,M.width,M.height):_t(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Yt,gt,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,gt,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function It(w,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,w),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let X=n.get(M.depthTexture);X.__renderTarget=M,(!X.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),Z(M.depthTexture,0);let Q=X.__webglTexture,Y=j(M);if(M.depthTexture.format===Ki)_t(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Q,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Q,0);else if(M.depthTexture.format===ss)_t(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Q,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Q,0);else throw new Error("Unknown depthTexture format")}function Bt(w){let M=n.get(w),F=w.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==w.depthTexture){let X=w.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),X){let Q=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,X.removeEventListener("dispose",Q)};X.addEventListener("dispose",Q),M.__depthDisposeCallback=Q}M.__boundDepthTexture=X}if(w.depthTexture&&!M.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");It(M.__webglFramebuffer,w)}else if(F){M.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[X]),M.__webglDepthbuffer[X]===void 0)M.__webglDepthbuffer[X]=i.createRenderbuffer(),rt(M.__webglDepthbuffer[X],w,!1);else{let Q=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Y=M.__webglDepthbuffer[X];i.bindRenderbuffer(i.RENDERBUFFER,Y),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,Y)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),rt(M.__webglDepthbuffer,w,!1);else{let X=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Q=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Q),i.framebufferRenderbuffer(i.FRAMEBUFFER,X,i.RENDERBUFFER,Q)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Ut(w,M,F){let X=n.get(w);M!==void 0&&Mt(X.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Bt(w)}function Jt(w){let M=w.texture,F=n.get(w),X=n.get(M);w.addEventListener("dispose",C);let Q=w.textures,Y=w.isWebGLCubeRenderTarget===!0,bt=Q.length>1;if(bt||(X.__webglTexture===void 0&&(X.__webglTexture=i.createTexture()),X.__version=M.version,o.memory.textures++),Y){F.__webglFramebuffer=[];for(let ct=0;ct<6;ct++)if(M.mipmaps&&M.mipmaps.length>0){F.__webglFramebuffer[ct]=[];for(let gt=0;gt<M.mipmaps.length;gt++)F.__webglFramebuffer[ct][gt]=i.createFramebuffer()}else F.__webglFramebuffer[ct]=i.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){F.__webglFramebuffer=[];for(let ct=0;ct<M.mipmaps.length;ct++)F.__webglFramebuffer[ct]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(bt)for(let ct=0,gt=Q.length;ct<gt;ct++){let Yt=n.get(Q[ct]);Yt.__webglTexture===void 0&&(Yt.__webglTexture=i.createTexture(),o.memory.textures++)}if(w.samples>0&&_t(w)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let ct=0;ct<Q.length;ct++){let gt=Q[ct];F.__webglColorRenderbuffer[ct]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[ct]);let Yt=r.convert(gt.format,gt.colorSpace),tt=r.convert(gt.type),xt=v(gt.internalFormat,Yt,tt,gt.colorSpace,w.isXRRenderTarget===!0),Dt=j(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,Dt,xt,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ct,i.RENDERBUFFER,F.__webglColorRenderbuffer[ct])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),rt(F.__webglDepthRenderbuffer,w,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Y){e.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture),Ht(i.TEXTURE_CUBE_MAP,M);for(let ct=0;ct<6;ct++)if(M.mipmaps&&M.mipmaps.length>0)for(let gt=0;gt<M.mipmaps.length;gt++)Mt(F.__webglFramebuffer[ct][gt],w,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,gt);else Mt(F.__webglFramebuffer[ct],w,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0);g(M)&&p(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(bt){for(let ct=0,gt=Q.length;ct<gt;ct++){let Yt=Q[ct],tt=n.get(Yt);e.bindTexture(i.TEXTURE_2D,tt.__webglTexture),Ht(i.TEXTURE_2D,Yt),Mt(F.__webglFramebuffer,w,Yt,i.COLOR_ATTACHMENT0+ct,i.TEXTURE_2D,0),g(Yt)&&p(i.TEXTURE_2D)}e.unbindTexture()}else{let ct=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(ct=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ct,X.__webglTexture),Ht(ct,M),M.mipmaps&&M.mipmaps.length>0)for(let gt=0;gt<M.mipmaps.length;gt++)Mt(F.__webglFramebuffer[gt],w,M,i.COLOR_ATTACHMENT0,ct,gt);else Mt(F.__webglFramebuffer,w,M,i.COLOR_ATTACHMENT0,ct,0);g(M)&&p(ct),e.unbindTexture()}w.depthBuffer&&Bt(w)}function J(w){let M=w.textures;for(let F=0,X=M.length;F<X;F++){let Q=M[F];if(g(Q)){let Y=b(w),bt=n.get(Q).__webglTexture;e.bindTexture(Y,bt),p(Y),e.unbindTexture()}}}let nt=[],R=[];function Rt(w){if(w.samples>0){if(_t(w)===!1){let M=w.textures,F=w.width,X=w.height,Q=i.COLOR_BUFFER_BIT,Y=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,bt=n.get(w),ct=M.length>1;if(ct)for(let gt=0;gt<M.length;gt++)e.bindFramebuffer(i.FRAMEBUFFER,bt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+gt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,bt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+gt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,bt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,bt.__webglFramebuffer);for(let gt=0;gt<M.length;gt++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(Q|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(Q|=i.STENCIL_BUFFER_BIT)),ct){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,bt.__webglColorRenderbuffer[gt]);let Yt=n.get(M[gt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Yt,0)}i.blitFramebuffer(0,0,F,X,0,0,F,X,Q,i.NEAREST),l===!0&&(nt.length=0,R.length=0,nt.push(i.COLOR_ATTACHMENT0+gt),w.depthBuffer&&w.resolveDepthBuffer===!1&&(nt.push(Y),R.push(Y),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,R)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,nt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ct)for(let gt=0;gt<M.length;gt++){e.bindFramebuffer(i.FRAMEBUFFER,bt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+gt,i.RENDERBUFFER,bt.__webglColorRenderbuffer[gt]);let Yt=n.get(M[gt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,bt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+gt,i.TEXTURE_2D,Yt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,bt.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.resolveDepthBuffer===!1&&l){let M=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function j(w){return Math.min(s.maxSamples,w.samples)}function _t(w){let M=n.get(w);return w.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function ot(w){let M=o.render.frame;h.get(w)!==M&&(h.set(w,M),w.update())}function Lt(w,M){let F=w.colorSpace,X=w.format,Q=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||F!==fs&&F!==jn&&(qt.getTransfer(F)===ne?(X!==fn||Q!==zn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),M}function mt(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=z,this.setTexture2D=Z,this.setTexture2DArray=V,this.setTexture3D=et,this.setTextureCube=G,this.rebindTextures=Ut,this.setupRenderTarget=Jt,this.updateRenderTargetMipmap=J,this.updateMultisampleRenderTarget=Rt,this.setupDepthRenderbuffer=Bt,this.setupFrameBufferTexture=Mt,this.useMultisampledRTT=_t}function Y0(i,t){function e(n,s=jn){let r,o=qt.getTransfer(s);if(n===zn)return i.UNSIGNED_BYTE;if(n===tc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ec)return i.UNSIGNED_SHORT_5_5_5_1;if(n===$h)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===qh)return i.BYTE;if(n===Zh)return i.SHORT;if(n===Gs)return i.UNSIGNED_SHORT;if(n===jl)return i.INT;if(n===yi)return i.UNSIGNED_INT;if(n===Sn)return i.FLOAT;if(n===gn)return i.HALF_FLOAT;if(n===Jh)return i.ALPHA;if(n===Kh)return i.RGB;if(n===fn)return i.RGBA;if(n===Qh)return i.LUMINANCE;if(n===jh)return i.LUMINANCE_ALPHA;if(n===Ki)return i.DEPTH_COMPONENT;if(n===ss)return i.DEPTH_STENCIL;if(n===nc)return i.RED;if(n===ic)return i.RED_INTEGER;if(n===tu)return i.RG;if(n===sc)return i.RG_INTEGER;if(n===rc)return i.RGBA_INTEGER;if(n===Or||n===Br||n===zr||n===Hr)if(o===ne)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Or)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Hr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Or)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===zr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Hr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Fa||n===Oa||n===Ba||n===za)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Fa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Oa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ba)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===za)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ha||n===ka||n===Va)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ha||n===ka)return o===ne?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Va)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ga||n===Wa||n===Xa||n===Ya||n===qa||n===Za||n===$a||n===Ja||n===Ka||n===Qa||n===ja||n===tl||n===el||n===nl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ga)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Wa)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Xa)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ya)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===qa)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Za)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===$a)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ja)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ka)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Qa)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ja)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===tl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===el)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===nl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===kr||n===il||n===sl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===kr)return o===ne?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===il)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===sl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===eu||n===rl||n===ol||n===al)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===kr)return r.COMPRESSED_RED_RGTC1_EXT;if(n===rl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ol)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===al)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===is?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Sl=class extends Be{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}},ce=class extends He{constructor(){super(),this.isGroup=!0,this.type="Group"}},q0={type:"move"},Os=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ce,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ce,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ce,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let _ of t.hand.values()){let g=e.getJointPose(_,n),p=this._getHandJoint(c,_);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],d=h.position.distanceTo(f.position),u=.02,m=.005;c.inputState.pinching&&d>u+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=u-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(q0)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new ce;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Z0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,$0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,bl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){let s=new Ge,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new _e({vertexShader:Z0,fragmentShader:$0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new St(new ni(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},El=class extends Hn{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,f=null,d=null,u=null,m=null,_=new bl,g=e.getContextAttributes(),p=null,b=null,v=[],x=[],L=new K,T=null,C=new Be;C.viewport=new me;let A=new Be;A.viewport=new me;let S=[C,A],y=new Sl,I=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let it=v[q];return it===void 0&&(it=new Os,v[q]=it),it.getTargetRaySpace()},this.getControllerGrip=function(q){let it=v[q];return it===void 0&&(it=new Os,v[q]=it),it.getGripSpace()},this.getHand=function(q){let it=v[q];return it===void 0&&(it=new Os,v[q]=it),it.getHandSpace()};function O(q){let it=x.indexOf(q.inputSource);if(it===-1)return;let Mt=v[it];Mt!==void 0&&(Mt.update(q.inputSource,q.frame,c||o),Mt.dispatchEvent({type:q.type,data:q.inputSource}))}function k(){s.removeEventListener("select",O),s.removeEventListener("selectstart",O),s.removeEventListener("selectend",O),s.removeEventListener("squeeze",O),s.removeEventListener("squeezestart",O),s.removeEventListener("squeezeend",O),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",Z);for(let q=0;q<v.length;q++){let it=x[q];it!==null&&(x[q]=null,v[q].disconnect(it))}I=null,z=null,_.reset(),t.setRenderTarget(p),u=null,d=null,f=null,s=null,b=null,jt.stop(),n.isPresenting=!1,t.setPixelRatio(T),t.setSize(L.width,L.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:u},this.getBinding=function(){return f},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(p=t.getRenderTarget(),s.addEventListener("select",O),s.addEventListener("selectstart",O),s.addEventListener("selectend",O),s.addEventListener("squeeze",O),s.addEventListener("squeezestart",O),s.addEventListener("squeezeend",O),s.addEventListener("end",k),s.addEventListener("inputsourceschange",Z),g.xrCompatible!==!0&&await e.makeXRCompatible(),T=t.getPixelRatio(),t.getSize(L),s.renderState.layers===void 0){let it={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};u=new XRWebGLLayer(s,e,it),s.updateRenderState({baseLayer:u}),t.setPixelRatio(1),t.setSize(u.framebufferWidth,u.framebufferHeight,!1),b=new ze(u.framebufferWidth,u.framebufferHeight,{format:fn,type:zn,colorSpace:t.outputColorSpace,stencilBuffer:g.stencil})}else{let it=null,Mt=null,rt=null;g.depth&&(rt=g.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,it=g.stencil?ss:Ki,Mt=g.stencil?is:yi);let It={colorFormat:e.RGBA8,depthFormat:rt,scaleFactor:r};f=new XRWebGLBinding(s,e),d=f.createProjectionLayer(It),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),b=new ze(d.textureWidth,d.textureHeight,{format:fn,type:zn,depthTexture:new to(d.textureWidth,d.textureHeight,Mt,void 0,void 0,void 0,void 0,void 0,void 0,it),stencilBuffer:g.stencil,colorSpace:t.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),jt.setContext(s),jt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function Z(q){for(let it=0;it<q.removed.length;it++){let Mt=q.removed[it],rt=x.indexOf(Mt);rt>=0&&(x[rt]=null,v[rt].disconnect(Mt))}for(let it=0;it<q.added.length;it++){let Mt=q.added[it],rt=x.indexOf(Mt);if(rt===-1){for(let Bt=0;Bt<v.length;Bt++)if(Bt>=x.length){x.push(Mt),rt=Bt;break}else if(x[Bt]===null){x[Bt]=Mt,rt=Bt;break}if(rt===-1)break}let It=v[rt];It&&It.connect(Mt)}}let V=new P,et=new P;function G(q,it,Mt){V.setFromMatrixPosition(it.matrixWorld),et.setFromMatrixPosition(Mt.matrixWorld);let rt=V.distanceTo(et),It=it.projectionMatrix.elements,Bt=Mt.projectionMatrix.elements,Ut=It[14]/(It[10]-1),Jt=It[14]/(It[10]+1),J=(It[9]+1)/It[5],nt=(It[9]-1)/It[5],R=(It[8]-1)/It[0],Rt=(Bt[8]+1)/Bt[0],j=Ut*R,_t=Ut*Rt,ot=rt/(-R+Rt),Lt=ot*-R;if(it.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Lt),q.translateZ(ot),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),It[10]===-1)q.projectionMatrix.copy(it.projectionMatrix),q.projectionMatrixInverse.copy(it.projectionMatrixInverse);else{let mt=Ut+ot,w=Jt+ot,M=j-Lt,F=_t+(rt-Lt),X=J*Jt/w*mt,Q=nt*Jt/w*mt;q.projectionMatrix.makePerspective(M,F,X,Q,mt,w),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function at(q,it){it===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(it.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let it=q.near,Mt=q.far;_.texture!==null&&(_.depthNear>0&&(it=_.depthNear),_.depthFar>0&&(Mt=_.depthFar)),y.near=A.near=C.near=it,y.far=A.far=C.far=Mt,(I!==y.near||z!==y.far)&&(s.updateRenderState({depthNear:y.near,depthFar:y.far}),I=y.near,z=y.far),C.layers.mask=q.layers.mask|2,A.layers.mask=q.layers.mask|4,y.layers.mask=C.layers.mask|A.layers.mask;let rt=q.parent,It=y.cameras;at(y,rt);for(let Bt=0;Bt<It.length;Bt++)at(It[Bt],rt);It.length===2?G(y,C,A):y.projectionMatrix.copy(C.projectionMatrix),pt(q,y,rt)};function pt(q,it,Mt){Mt===null?q.matrix.copy(it.matrixWorld):(q.matrix.copy(Mt.matrixWorld),q.matrix.invert(),q.matrix.multiply(it.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(it.projectionMatrix),q.projectionMatrixInverse.copy(it.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Ws*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&u===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=q)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(y)};let yt=null;function Ht(q,it){if(h=it.getViewerPose(c||o),m=it,h!==null){let Mt=h.views;u!==null&&(t.setRenderTargetFramebuffer(b,u.framebuffer),t.setRenderTarget(b));let rt=!1;Mt.length!==y.cameras.length&&(y.cameras.length=0,rt=!0);for(let Bt=0;Bt<Mt.length;Bt++){let Ut=Mt[Bt],Jt=null;if(u!==null)Jt=u.getViewport(Ut);else{let nt=f.getViewSubImage(d,Ut);Jt=nt.viewport,Bt===0&&(t.setRenderTargetTextures(b,nt.colorTexture,d.ignoreDepthValues?void 0:nt.depthStencilTexture),t.setRenderTarget(b))}let J=S[Bt];J===void 0&&(J=new Be,J.layers.enable(Bt),J.viewport=new me,S[Bt]=J),J.matrix.fromArray(Ut.transform.matrix),J.matrix.decompose(J.position,J.quaternion,J.scale),J.projectionMatrix.fromArray(Ut.projectionMatrix),J.projectionMatrixInverse.copy(J.projectionMatrix).invert(),J.viewport.set(Jt.x,Jt.y,Jt.width,Jt.height),Bt===0&&(y.matrix.copy(J.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),rt===!0&&y.cameras.push(J)}let It=s.enabledFeatures;if(It&&It.includes("depth-sensing")){let Bt=f.getDepthInformation(Mt[0]);Bt&&Bt.isValid&&Bt.texture&&_.init(t,Bt,s.renderState)}}for(let Mt=0;Mt<v.length;Mt++){let rt=x[Mt],It=v[Mt];rt!==null&&It!==void 0&&It.update(rt,it,c||o)}yt&&yt(q,it),it.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:it}),m=null}let jt=new au;jt.setAnimationLoop(Ht),this.setAnimationLoop=function(q){yt=q},this.dispose=function(){}}},fi=new sn,J0=new Ot;function K0(i,t){function e(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function n(g,p){p.color.getRGB(g.fogColor.value,ou(i)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,b,v,x){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(g,p):p.isMeshToonMaterial?(r(g,p),f(g,p)):p.isMeshPhongMaterial?(r(g,p),h(g,p)):p.isMeshStandardMaterial?(r(g,p),d(g,p),p.isMeshPhysicalMaterial&&u(g,p,x)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),_(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(o(g,p),p.isLineDashedMaterial&&a(g,p)):p.isPointsMaterial?l(g,p,b,v):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,e(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===Ne&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,e(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===Ne&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,e(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,e(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let b=t.get(p),v=b.envMap,x=b.envMapRotation;v&&(g.envMap.value=v,fi.copy(x),fi.x*=-1,fi.y*=-1,fi.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(fi.y*=-1,fi.z*=-1),g.envMapRotation.value.setFromMatrix4(J0.makeRotationFromEuler(fi)),g.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,g.aoMapTransform))}function o(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform))}function a(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,b,v){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*b,g.scale.value=v*.5,p.map&&(g.map.value=p.map,e(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function f(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function d(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function u(g,p,b){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ne&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=b.texture,g.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function _(g,p){let b=t.get(p).light;g.referencePosition.value.setFromMatrixPosition(b.matrixWorld),g.nearDistance.value=b.shadow.camera.near,g.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Q0(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,v){let x=v.program;n.uniformBlockBinding(b,x)}function c(b,v){let x=s[b.id];x===void 0&&(m(b),x=h(b),s[b.id]=x,b.addEventListener("dispose",g));let L=v.program;n.updateUBOMapping(b,L);let T=t.render.frame;r[b.id]!==T&&(d(b),r[b.id]=T)}function h(b){let v=f();b.__bindingPointIndex=v;let x=i.createBuffer(),L=b.__size,T=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,x),i.bufferData(i.UNIFORM_BUFFER,L,T),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,v,x),x}function f(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(b){let v=s[b.id],x=b.uniforms,L=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,v);for(let T=0,C=x.length;T<C;T++){let A=Array.isArray(x[T])?x[T]:[x[T]];for(let S=0,y=A.length;S<y;S++){let I=A[S];if(u(I,T,S,L)===!0){let z=I.__offset,O=Array.isArray(I.value)?I.value:[I.value],k=0;for(let Z=0;Z<O.length;Z++){let V=O[Z],et=_(V);typeof V=="number"||typeof V=="boolean"?(I.__data[0]=V,i.bufferSubData(i.UNIFORM_BUFFER,z+k,I.__data)):V.isMatrix3?(I.__data[0]=V.elements[0],I.__data[1]=V.elements[1],I.__data[2]=V.elements[2],I.__data[3]=0,I.__data[4]=V.elements[3],I.__data[5]=V.elements[4],I.__data[6]=V.elements[5],I.__data[7]=0,I.__data[8]=V.elements[6],I.__data[9]=V.elements[7],I.__data[10]=V.elements[8],I.__data[11]=0):(V.toArray(I.__data,k),k+=et.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,z,I.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(b,v,x,L){let T=b.value,C=v+"_"+x;if(L[C]===void 0)return typeof T=="number"||typeof T=="boolean"?L[C]=T:L[C]=T.clone(),!0;{let A=L[C];if(typeof T=="number"||typeof T=="boolean"){if(A!==T)return L[C]=T,!0}else if(A.equals(T)===!1)return A.copy(T),!0}return!1}function m(b){let v=b.uniforms,x=0,L=16;for(let C=0,A=v.length;C<A;C++){let S=Array.isArray(v[C])?v[C]:[v[C]];for(let y=0,I=S.length;y<I;y++){let z=S[y],O=Array.isArray(z.value)?z.value:[z.value];for(let k=0,Z=O.length;k<Z;k++){let V=O[k],et=_(V),G=x%L,at=G%et.boundary,pt=G+at;x+=at,pt!==0&&L-pt<et.storage&&(x+=L-pt),z.__data=new Float32Array(et.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=x,x+=et.storage}}}let T=x%L;return T>0&&(x+=L-T),b.__size=x,b.__cache={},this}function _(b){let v={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(v.boundary=4,v.storage=4):b.isVector2?(v.boundary=8,v.storage=8):b.isVector3||b.isColor?(v.boundary=16,v.storage=12):b.isVector4?(v.boundary=16,v.storage=16):b.isMatrix3?(v.boundary=48,v.storage=48):b.isMatrix4?(v.boundary=64,v.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),v}function g(b){let v=b.target;v.removeEventListener("dispose",g);let x=o.indexOf(v.__bindingPointIndex);o.splice(x,1),i.deleteBuffer(s[v.id]),delete s[v.id],delete r[v.id]}function p(){for(let b in s)i.deleteBuffer(s[b]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}var eo=class{constructor(t={}){let{canvas:e=nf(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reverseDepthBuffer:d=!1}=t;this.isWebGLRenderer=!0;let u;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");u=n.getContextAttributes().alpha}else u=o;let m=new Uint32Array(4),_=new Int32Array(4),g=null,p=null,b=[],v=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ue,this.toneMapping=ti,this.toneMappingExposure=1;let x=this,L=!1,T=0,C=0,A=null,S=-1,y=null,I=new me,z=new me,O=null,k=new At(0),Z=0,V=e.width,et=e.height,G=1,at=null,pt=null,yt=new me(0,0,V,et),Ht=new me(0,0,V,et),jt=!1,q=new Ys,it=!1,Mt=!1,rt=new Ot,It=new Ot,Bt=new P,Ut=new me,Jt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},J=!1;function nt(){return A===null?G:1}let R=n;function Rt(E,U){return e.getContext(E,U)}try{let E={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine","three.js r170"),e.addEventListener("webglcontextlost",$,!1),e.addEventListener("webglcontextrestored",ft,!1),e.addEventListener("webglcontextcreationerror",ut,!1),R===null){let U="webgl2";if(R=Rt(U,E),R===null)throw Rt(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let j,_t,ot,Lt,mt,w,M,F,X,Q,Y,bt,ct,gt,Yt,tt,xt,Dt,Ft,vt,Zt,Wt,ae,D;function ht(){j=new pg(R),j.init(),Wt=new Y0(R,j),_t=new lg(R,j,t,Wt),ot=new G0(R,j),_t.reverseDepthBuffer&&d&&ot.buffers.depth.setReversed(!0),Lt=new _g(R),mt=new P0,w=new X0(R,j,ot,mt,_t,Wt,Lt),M=new hg(x),F=new fg(x),X=new Ef(R),ae=new og(R,X),Q=new mg(R,X,Lt,ae),Y=new vg(R,Q,X,Lt),Ft=new xg(R,_t,w),tt=new cg(mt),bt=new C0(x,M,F,j,_t,ae,tt),ct=new K0(x,mt),gt=new L0,Yt=new B0(j),Dt=new rg(x,M,F,ot,Y,u,l),xt=new k0(x,Y,_t),D=new Q0(R,Lt,_t,ot),vt=new ag(R,j,Lt),Zt=new gg(R,j,Lt),Lt.programs=bt.programs,x.capabilities=_t,x.extensions=j,x.properties=mt,x.renderLists=gt,x.shadowMap=xt,x.state=ot,x.info=Lt}ht();let W=new El(x,R);this.xr=W,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){let E=j.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=j.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(E){E!==void 0&&(G=E,this.setSize(V,et,!1))},this.getSize=function(E){return E.set(V,et)},this.setSize=function(E,U,B=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=E,et=U,e.width=Math.floor(E*G),e.height=Math.floor(U*G),B===!0&&(e.style.width=E+"px",e.style.height=U+"px"),this.setViewport(0,0,E,U)},this.getDrawingBufferSize=function(E){return E.set(V*G,et*G).floor()},this.setDrawingBufferSize=function(E,U,B){V=E,et=U,G=B,e.width=Math.floor(E*B),e.height=Math.floor(U*B),this.setViewport(0,0,E,U)},this.getCurrentViewport=function(E){return E.copy(I)},this.getViewport=function(E){return E.copy(yt)},this.setViewport=function(E,U,B,H){E.isVector4?yt.set(E.x,E.y,E.z,E.w):yt.set(E,U,B,H),ot.viewport(I.copy(yt).multiplyScalar(G).round())},this.getScissor=function(E){return E.copy(Ht)},this.setScissor=function(E,U,B,H){E.isVector4?Ht.set(E.x,E.y,E.z,E.w):Ht.set(E,U,B,H),ot.scissor(z.copy(Ht).multiplyScalar(G).round())},this.getScissorTest=function(){return jt},this.setScissorTest=function(E){ot.setScissorTest(jt=E)},this.setOpaqueSort=function(E){at=E},this.setTransparentSort=function(E){pt=E},this.getClearColor=function(E){return E.copy(Dt.getClearColor())},this.setClearColor=function(){Dt.setClearColor.apply(Dt,arguments)},this.getClearAlpha=function(){return Dt.getClearAlpha()},this.setClearAlpha=function(){Dt.setClearAlpha.apply(Dt,arguments)},this.clear=function(E=!0,U=!0,B=!0){let H=0;if(E){let N=!1;if(A!==null){let st=A.texture.format;N=st===rc||st===sc||st===ic}if(N){let st=A.texture.type,dt=st===zn||st===yi||st===Gs||st===is||st===tc||st===ec,Et=Dt.getClearColor(),wt=Dt.getClearAlpha(),zt=Et.r,Vt=Et.g,Tt=Et.b;dt?(m[0]=zt,m[1]=Vt,m[2]=Tt,m[3]=wt,R.clearBufferuiv(R.COLOR,0,m)):(_[0]=zt,_[1]=Vt,_[2]=Tt,_[3]=wt,R.clearBufferiv(R.COLOR,0,_))}else H|=R.COLOR_BUFFER_BIT}U&&(H|=R.DEPTH_BUFFER_BIT),B&&(H|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",$,!1),e.removeEventListener("webglcontextrestored",ft,!1),e.removeEventListener("webglcontextcreationerror",ut,!1),gt.dispose(),Yt.dispose(),mt.dispose(),M.dispose(),F.dispose(),Y.dispose(),ae.dispose(),D.dispose(),bt.dispose(),W.dispose(),W.removeEventListener("sessionstart",wc),W.removeEventListener("sessionend",Tc),ai.stop()};function $(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),L=!0}function ft(){console.log("THREE.WebGLRenderer: Context Restored."),L=!1;let E=Lt.autoReset,U=xt.enabled,B=xt.autoUpdate,H=xt.needsUpdate,N=xt.type;ht(),Lt.autoReset=E,xt.enabled=U,xt.autoUpdate=B,xt.needsUpdate=H,xt.type=N}function ut(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function kt(E){let U=E.target;U.removeEventListener("dispose",kt),pe(U)}function pe(E){Ie(E),mt.remove(E)}function Ie(E){let U=mt.get(E).programs;U!==void 0&&(U.forEach(function(B){bt.releaseProgram(B)}),E.isShaderMaterial&&bt.releaseShaderCache(E))}this.renderBufferDirect=function(E,U,B,H,N,st){U===null&&(U=Jt);let dt=N.isMesh&&N.matrixWorld.determinant()<0,Et=id(E,U,B,H,N);ot.setMaterial(H,dt);let wt=B.index,zt=1;if(H.wireframe===!0){if(wt=Q.getWireframeAttribute(B),wt===void 0)return;zt=2}let Vt=B.drawRange,Tt=B.attributes.position,Qt=Vt.start*zt,le=(Vt.start+Vt.count)*zt;st!==null&&(Qt=Math.max(Qt,st.start*zt),le=Math.min(le,(st.start+st.count)*zt)),wt!==null?(Qt=Math.max(Qt,0),le=Math.min(le,wt.count)):Tt!=null&&(Qt=Math.max(Qt,0),le=Math.min(le,Tt.count));let he=le-Qt;if(he<0||he===1/0)return;ae.setup(N,H,Et,B,wt);let Ve,te=vt;if(wt!==null&&(Ve=X.get(wt),te=Zt,te.setIndex(Ve)),N.isMesh)H.wireframe===!0?(ot.setLineWidth(H.wireframeLinewidth*nt()),te.setMode(R.LINES)):te.setMode(R.TRIANGLES);else if(N.isLine){let Ct=H.linewidth;Ct===void 0&&(Ct=1),ot.setLineWidth(Ct*nt()),N.isLineSegments?te.setMode(R.LINES):N.isLineLoop?te.setMode(R.LINE_LOOP):te.setMode(R.LINE_STRIP)}else N.isPoints?te.setMode(R.POINTS):N.isSprite&&te.setMode(R.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)te.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(j.get("WEBGL_multi_draw"))te.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{let Ct=N._multiDrawStarts,Rn=N._multiDrawCounts,ee=N._multiDrawCount,cn=wt?X.get(wt).bytesPerElement:1,Ii=mt.get(H).currentProgram.getUniforms();for(let Ye=0;Ye<ee;Ye++)Ii.setValue(R,"_gl_DrawID",Ye),te.render(Ct[Ye]/cn,Rn[Ye])}else if(N.isInstancedMesh)te.renderInstances(Qt,he,N.count);else if(B.isInstancedBufferGeometry){let Ct=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,Rn=Math.min(B.instanceCount,Ct);te.renderInstances(Qt,he,Rn)}else te.render(Qt,he)};function se(E,U,B){E.transparent===!0&&E.side===Fn&&E.forceSinglePass===!1?(E.side=Ne,E.needsUpdate=!0,hr(E,U,B),E.side=ei,E.needsUpdate=!0,hr(E,U,B),E.side=Fn):hr(E,U,B)}this.compile=function(E,U,B=null){B===null&&(B=E),p=Yt.get(B),p.init(U),v.push(p),B.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),E!==B&&E.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),p.setupLights();let H=new Set;return E.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;let st=N.material;if(st)if(Array.isArray(st))for(let dt=0;dt<st.length;dt++){let Et=st[dt];se(Et,B,N),H.add(Et)}else se(st,B,N),H.add(st)}),v.pop(),p=null,H},this.compileAsync=function(E,U,B=null){let H=this.compile(E,U,B);return new Promise(N=>{function st(){if(H.forEach(function(dt){mt.get(dt).currentProgram.isReady()&&H.delete(dt)}),H.size===0){N(E);return}setTimeout(st,10)}j.get("KHR_parallel_shader_compile")!==null?st():setTimeout(st,10)})};let ln=null;function An(E){ln&&ln(E)}function wc(){ai.stop()}function Tc(){ai.start()}let ai=new au;ai.setAnimationLoop(An),typeof self<"u"&&ai.setContext(self),this.setAnimationLoop=function(E){ln=E,W.setAnimationLoop(E),E===null?ai.stop():ai.start()},W.addEventListener("sessionstart",wc),W.addEventListener("sessionend",Tc),this.render=function(E,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(U),U=W.getCamera()),E.isScene===!0&&E.onBeforeRender(x,E,U,A),p=Yt.get(E,v.length),p.init(U),v.push(p),It.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),q.setFromProjectionMatrix(It),Mt=this.localClippingEnabled,it=tt.init(this.clippingPlanes,Mt),g=gt.get(E,b.length),g.init(),b.push(g),W.enabled===!0&&W.isPresenting===!0){let st=x.xr.getDepthSensingMesh();st!==null&&Yo(st,U,-1/0,x.sortObjects)}Yo(E,U,0,x.sortObjects),g.finish(),x.sortObjects===!0&&g.sort(at,pt),J=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,J&&Dt.addToRenderList(g,E),this.info.render.frame++,it===!0&&tt.beginShadows();let B=p.state.shadowsArray;xt.render(B,E,U),it===!0&&tt.endShadows(),this.info.autoReset===!0&&this.info.reset();let H=g.opaque,N=g.transmissive;if(p.setupLights(),U.isArrayCamera){let st=U.cameras;if(N.length>0)for(let dt=0,Et=st.length;dt<Et;dt++){let wt=st[dt];Rc(H,N,E,wt)}J&&Dt.render(E);for(let dt=0,Et=st.length;dt<Et;dt++){let wt=st[dt];Ac(g,E,wt,wt.viewport)}}else N.length>0&&Rc(H,N,E,U),J&&Dt.render(E),Ac(g,E,U);A!==null&&(w.updateMultisampleRenderTarget(A),w.updateRenderTargetMipmap(A)),E.isScene===!0&&E.onAfterRender(x,E,U),ae.resetDefaultState(),S=-1,y=null,v.pop(),v.length>0?(p=v[v.length-1],it===!0&&tt.setGlobalState(x.clippingPlanes,p.state.camera)):p=null,b.pop(),b.length>0?g=b[b.length-1]:g=null};function Yo(E,U,B,H){if(E.visible===!1)return;if(E.layers.test(U.layers)){if(E.isGroup)B=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(U);else if(E.isLight)p.pushLight(E),E.castShadow&&p.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||q.intersectsSprite(E)){H&&Ut.setFromMatrixPosition(E.matrixWorld).applyMatrix4(It);let dt=Y.update(E),Et=E.material;Et.visible&&g.push(E,dt,Et,B,Ut.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||q.intersectsObject(E))){let dt=Y.update(E),Et=E.material;if(H&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ut.copy(E.boundingSphere.center)):(dt.boundingSphere===null&&dt.computeBoundingSphere(),Ut.copy(dt.boundingSphere.center)),Ut.applyMatrix4(E.matrixWorld).applyMatrix4(It)),Array.isArray(Et)){let wt=dt.groups;for(let zt=0,Vt=wt.length;zt<Vt;zt++){let Tt=wt[zt],Qt=Et[Tt.materialIndex];Qt&&Qt.visible&&g.push(E,dt,Qt,B,Ut.z,Tt)}}else Et.visible&&g.push(E,dt,Et,B,Ut.z,null)}}let st=E.children;for(let dt=0,Et=st.length;dt<Et;dt++)Yo(st[dt],U,B,H)}function Ac(E,U,B,H){let N=E.opaque,st=E.transmissive,dt=E.transparent;p.setupLightsView(B),it===!0&&tt.setGlobalState(x.clippingPlanes,B),H&&ot.viewport(I.copy(H)),N.length>0&&cr(N,U,B),st.length>0&&cr(st,U,B),dt.length>0&&cr(dt,U,B),ot.buffers.depth.setTest(!0),ot.buffers.depth.setMask(!0),ot.buffers.color.setMask(!0),ot.setPolygonOffset(!1)}function Rc(E,U,B,H){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[H.id]===void 0&&(p.state.transmissionRenderTarget[H.id]=new ze(1,1,{generateMipmaps:!0,type:j.has("EXT_color_buffer_half_float")||j.has("EXT_color_buffer_float")?gn:zn,minFilter:vi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:qt.workingColorSpace}));let st=p.state.transmissionRenderTarget[H.id],dt=H.viewport||I;st.setSize(dt.z,dt.w);let Et=x.getRenderTarget();x.setRenderTarget(st),x.getClearColor(k),Z=x.getClearAlpha(),Z<1&&x.setClearColor(16777215,.5),x.clear(),J&&Dt.render(B);let wt=x.toneMapping;x.toneMapping=ti;let zt=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),p.setupLightsView(H),it===!0&&tt.setGlobalState(x.clippingPlanes,H),cr(E,B,H),w.updateMultisampleRenderTarget(st),w.updateRenderTargetMipmap(st),j.has("WEBGL_multisampled_render_to_texture")===!1){let Vt=!1;for(let Tt=0,Qt=U.length;Tt<Qt;Tt++){let le=U[Tt],he=le.object,Ve=le.geometry,te=le.material,Ct=le.group;if(te.side===Fn&&he.layers.test(H.layers)){let Rn=te.side;te.side=Ne,te.needsUpdate=!0,Cc(he,B,H,Ve,te,Ct),te.side=Rn,te.needsUpdate=!0,Vt=!0}}Vt===!0&&(w.updateMultisampleRenderTarget(st),w.updateRenderTargetMipmap(st))}x.setRenderTarget(Et),x.setClearColor(k,Z),zt!==void 0&&(H.viewport=zt),x.toneMapping=wt}function cr(E,U,B){let H=U.isScene===!0?U.overrideMaterial:null;for(let N=0,st=E.length;N<st;N++){let dt=E[N],Et=dt.object,wt=dt.geometry,zt=H===null?dt.material:H,Vt=dt.group;Et.layers.test(B.layers)&&Cc(Et,U,B,wt,zt,Vt)}}function Cc(E,U,B,H,N,st){E.onBeforeRender(x,U,B,H,N,st),E.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),N.onBeforeRender(x,U,B,H,E,st),N.transparent===!0&&N.side===Fn&&N.forceSinglePass===!1?(N.side=Ne,N.needsUpdate=!0,x.renderBufferDirect(B,U,H,N,E,st),N.side=ei,N.needsUpdate=!0,x.renderBufferDirect(B,U,H,N,E,st),N.side=Fn):x.renderBufferDirect(B,U,H,N,E,st),E.onAfterRender(x,U,B,H,N,st)}function hr(E,U,B){U.isScene!==!0&&(U=Jt);let H=mt.get(E),N=p.state.lights,st=p.state.shadowsArray,dt=N.state.version,Et=bt.getParameters(E,N.state,st,U,B),wt=bt.getProgramCacheKey(Et),zt=H.programs;H.environment=E.isMeshStandardMaterial?U.environment:null,H.fog=U.fog,H.envMap=(E.isMeshStandardMaterial?F:M).get(E.envMap||H.environment),H.envMapRotation=H.environment!==null&&E.envMap===null?U.environmentRotation:E.envMapRotation,zt===void 0&&(E.addEventListener("dispose",kt),zt=new Map,H.programs=zt);let Vt=zt.get(wt);if(Vt!==void 0){if(H.currentProgram===Vt&&H.lightsStateVersion===dt)return Ic(E,Et),Vt}else Et.uniforms=bt.getUniforms(E),E.onBeforeCompile(Et,x),Vt=bt.acquireProgram(Et,wt),zt.set(wt,Vt),H.uniforms=Et.uniforms;let Tt=H.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Tt.clippingPlanes=tt.uniform),Ic(E,Et),H.needsLights=rd(E),H.lightsStateVersion=dt,H.needsLights&&(Tt.ambientLightColor.value=N.state.ambient,Tt.lightProbe.value=N.state.probe,Tt.directionalLights.value=N.state.directional,Tt.directionalLightShadows.value=N.state.directionalShadow,Tt.spotLights.value=N.state.spot,Tt.spotLightShadows.value=N.state.spotShadow,Tt.rectAreaLights.value=N.state.rectArea,Tt.ltc_1.value=N.state.rectAreaLTC1,Tt.ltc_2.value=N.state.rectAreaLTC2,Tt.pointLights.value=N.state.point,Tt.pointLightShadows.value=N.state.pointShadow,Tt.hemisphereLights.value=N.state.hemi,Tt.directionalShadowMap.value=N.state.directionalShadowMap,Tt.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Tt.spotShadowMap.value=N.state.spotShadowMap,Tt.spotLightMatrix.value=N.state.spotLightMatrix,Tt.spotLightMap.value=N.state.spotLightMap,Tt.pointShadowMap.value=N.state.pointShadowMap,Tt.pointShadowMatrix.value=N.state.pointShadowMatrix),H.currentProgram=Vt,H.uniformsList=null,Vt}function Pc(E){if(E.uniformsList===null){let U=E.currentProgram.getUniforms();E.uniformsList=ji.seqWithValue(U.seq,E.uniforms)}return E.uniformsList}function Ic(E,U){let B=mt.get(E);B.outputColorSpace=U.outputColorSpace,B.batching=U.batching,B.batchingColor=U.batchingColor,B.instancing=U.instancing,B.instancingColor=U.instancingColor,B.instancingMorph=U.instancingMorph,B.skinning=U.skinning,B.morphTargets=U.morphTargets,B.morphNormals=U.morphNormals,B.morphColors=U.morphColors,B.morphTargetsCount=U.morphTargetsCount,B.numClippingPlanes=U.numClippingPlanes,B.numIntersection=U.numClipIntersection,B.vertexAlphas=U.vertexAlphas,B.vertexTangents=U.vertexTangents,B.toneMapping=U.toneMapping}function id(E,U,B,H,N){U.isScene!==!0&&(U=Jt),w.resetTextureUnits();let st=U.fog,dt=H.isMeshStandardMaterial?U.environment:null,Et=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:fs,wt=(H.isMeshStandardMaterial?F:M).get(H.envMap||dt),zt=H.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Vt=!!B.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Tt=!!B.morphAttributes.position,Qt=!!B.morphAttributes.normal,le=!!B.morphAttributes.color,he=ti;H.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(he=x.toneMapping);let Ve=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,te=Ve!==void 0?Ve.length:0,Ct=mt.get(H),Rn=p.state.lights;if(it===!0&&(Mt===!0||E!==y)){let en=E===y&&H.id===S;tt.setState(H,E,en)}let ee=!1;H.version===Ct.__version?(Ct.needsLights&&Ct.lightsStateVersion!==Rn.state.version||Ct.outputColorSpace!==Et||N.isBatchedMesh&&Ct.batching===!1||!N.isBatchedMesh&&Ct.batching===!0||N.isBatchedMesh&&Ct.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Ct.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Ct.instancing===!1||!N.isInstancedMesh&&Ct.instancing===!0||N.isSkinnedMesh&&Ct.skinning===!1||!N.isSkinnedMesh&&Ct.skinning===!0||N.isInstancedMesh&&Ct.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Ct.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Ct.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Ct.instancingMorph===!1&&N.morphTexture!==null||Ct.envMap!==wt||H.fog===!0&&Ct.fog!==st||Ct.numClippingPlanes!==void 0&&(Ct.numClippingPlanes!==tt.numPlanes||Ct.numIntersection!==tt.numIntersection)||Ct.vertexAlphas!==zt||Ct.vertexTangents!==Vt||Ct.morphTargets!==Tt||Ct.morphNormals!==Qt||Ct.morphColors!==le||Ct.toneMapping!==he||Ct.morphTargetsCount!==te)&&(ee=!0):(ee=!0,Ct.__version=H.version);let cn=Ct.currentProgram;ee===!0&&(cn=hr(H,U,N));let Ii=!1,Ye=!1,ws=!1,ue=cn.getUniforms(),vn=Ct.uniforms;if(ot.useProgram(cn.program)&&(Ii=!0,Ye=!0,ws=!0),H.id!==S&&(S=H.id,Ye=!0),Ii||y!==E){ot.buffers.depth.getReversed()?(rt.copy(E.projectionMatrix),rf(rt),of(rt),ue.setValue(R,"projectionMatrix",rt)):ue.setValue(R,"projectionMatrix",E.projectionMatrix),ue.setValue(R,"viewMatrix",E.matrixWorldInverse);let Xn=ue.map.cameraPosition;Xn!==void 0&&Xn.setValue(R,Bt.setFromMatrixPosition(E.matrixWorld)),_t.logarithmicDepthBuffer&&ue.setValue(R,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&ue.setValue(R,"isOrthographic",E.isOrthographicCamera===!0),y!==E&&(y=E,Ye=!0,ws=!0)}if(N.isSkinnedMesh){ue.setOptional(R,N,"bindMatrix"),ue.setOptional(R,N,"bindMatrixInverse");let en=N.skeleton;en&&(en.boneTexture===null&&en.computeBoneTexture(),ue.setValue(R,"boneTexture",en.boneTexture,w))}N.isBatchedMesh&&(ue.setOptional(R,N,"batchingTexture"),ue.setValue(R,"batchingTexture",N._matricesTexture,w),ue.setOptional(R,N,"batchingIdTexture"),ue.setValue(R,"batchingIdTexture",N._indirectTexture,w),ue.setOptional(R,N,"batchingColorTexture"),N._colorsTexture!==null&&ue.setValue(R,"batchingColorTexture",N._colorsTexture,w));let Ts=B.morphAttributes;if((Ts.position!==void 0||Ts.normal!==void 0||Ts.color!==void 0)&&Ft.update(N,B,cn),(Ye||Ct.receiveShadow!==N.receiveShadow)&&(Ct.receiveShadow=N.receiveShadow,ue.setValue(R,"receiveShadow",N.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(vn.envMap.value=wt,vn.flipEnvMap.value=wt.isCubeTexture&&wt.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&U.environment!==null&&(vn.envMapIntensity.value=U.environmentIntensity),Ye&&(ue.setValue(R,"toneMappingExposure",x.toneMappingExposure),Ct.needsLights&&sd(vn,ws),st&&H.fog===!0&&ct.refreshFogUniforms(vn,st),ct.refreshMaterialUniforms(vn,H,G,et,p.state.transmissionRenderTarget[E.id]),ji.upload(R,Pc(Ct),vn,w)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(ji.upload(R,Pc(Ct),vn,w),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&ue.setValue(R,"center",N.center),ue.setValue(R,"modelViewMatrix",N.modelViewMatrix),ue.setValue(R,"normalMatrix",N.normalMatrix),ue.setValue(R,"modelMatrix",N.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){let en=H.uniformsGroups;for(let Xn=0,Yn=en.length;Xn<Yn;Xn++){let Lc=en[Xn];D.update(Lc,cn),D.bind(Lc,cn)}}return cn}function sd(E,U){E.ambientLightColor.needsUpdate=U,E.lightProbe.needsUpdate=U,E.directionalLights.needsUpdate=U,E.directionalLightShadows.needsUpdate=U,E.pointLights.needsUpdate=U,E.pointLightShadows.needsUpdate=U,E.spotLights.needsUpdate=U,E.spotLightShadows.needsUpdate=U,E.rectAreaLights.needsUpdate=U,E.hemisphereLights.needsUpdate=U}function rd(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(E,U,B){mt.get(E.texture).__webglTexture=U,mt.get(E.depthTexture).__webglTexture=B;let H=mt.get(E);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=B===void 0,H.__autoAllocateDepthBuffer||j.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,U){let B=mt.get(E);B.__webglFramebuffer=U,B.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(E,U=0,B=0){A=E,T=U,C=B;let H=!0,N=null,st=!1,dt=!1;if(E){let wt=mt.get(E);if(wt.__useDefaultFramebuffer!==void 0)ot.bindFramebuffer(R.FRAMEBUFFER,null),H=!1;else if(wt.__webglFramebuffer===void 0)w.setupRenderTarget(E);else if(wt.__hasExternalTextures)w.rebindTextures(E,mt.get(E.texture).__webglTexture,mt.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let Tt=E.depthTexture;if(wt.__boundDepthTexture!==Tt){if(Tt!==null&&mt.has(Tt)&&(E.width!==Tt.image.width||E.height!==Tt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");w.setupDepthRenderbuffer(E)}}let zt=E.texture;(zt.isData3DTexture||zt.isDataArrayTexture||zt.isCompressedArrayTexture)&&(dt=!0);let Vt=mt.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Vt[U])?N=Vt[U][B]:N=Vt[U],st=!0):E.samples>0&&w.useMultisampledRTT(E)===!1?N=mt.get(E).__webglMultisampledFramebuffer:Array.isArray(Vt)?N=Vt[B]:N=Vt,I.copy(E.viewport),z.copy(E.scissor),O=E.scissorTest}else I.copy(yt).multiplyScalar(G).floor(),z.copy(Ht).multiplyScalar(G).floor(),O=jt;if(ot.bindFramebuffer(R.FRAMEBUFFER,N)&&H&&ot.drawBuffers(E,N),ot.viewport(I),ot.scissor(z),ot.setScissorTest(O),st){let wt=mt.get(E.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+U,wt.__webglTexture,B)}else if(dt){let wt=mt.get(E.texture),zt=U||0;R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,wt.__webglTexture,B||0,zt)}S=-1},this.readRenderTargetPixels=function(E,U,B,H,N,st,dt){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Et=mt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&dt!==void 0&&(Et=Et[dt]),Et){ot.bindFramebuffer(R.FRAMEBUFFER,Et);try{let wt=E.texture,zt=wt.format,Vt=wt.type;if(!_t.textureFormatReadable(zt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!_t.textureTypeReadable(Vt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=E.width-H&&B>=0&&B<=E.height-N&&R.readPixels(U,B,H,N,Wt.convert(zt),Wt.convert(Vt),st)}finally{let wt=A!==null?mt.get(A).__webglFramebuffer:null;ot.bindFramebuffer(R.FRAMEBUFFER,wt)}}},this.readRenderTargetPixelsAsync=async function(E,U,B,H,N,st,dt){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Et=mt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&dt!==void 0&&(Et=Et[dt]),Et){let wt=E.texture,zt=wt.format,Vt=wt.type;if(!_t.textureFormatReadable(zt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!_t.textureTypeReadable(Vt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=E.width-H&&B>=0&&B<=E.height-N){ot.bindFramebuffer(R.FRAMEBUFFER,Et);let Tt=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,Tt),R.bufferData(R.PIXEL_PACK_BUFFER,st.byteLength,R.STREAM_READ),R.readPixels(U,B,H,N,Wt.convert(zt),Wt.convert(Vt),0);let Qt=A!==null?mt.get(A).__webglFramebuffer:null;ot.bindFramebuffer(R.FRAMEBUFFER,Qt);let le=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await sf(R,le,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,Tt),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,st),R.deleteBuffer(Tt),R.deleteSync(le),st}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,U=null,B=0){E.isTexture!==!0&&(Ds("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,E=arguments[1]);let H=Math.pow(2,-B),N=Math.floor(E.image.width*H),st=Math.floor(E.image.height*H),dt=U!==null?U.x:0,Et=U!==null?U.y:0;w.setTexture2D(E,0),R.copyTexSubImage2D(R.TEXTURE_2D,B,0,0,dt,Et,N,st),ot.unbindTexture()},this.copyTextureToTexture=function(E,U,B=null,H=null,N=0){E.isTexture!==!0&&(Ds("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,E=arguments[1],U=arguments[2],N=arguments[3]||0,B=null);let st,dt,Et,wt,zt,Vt,Tt,Qt,le,he=E.isCompressedTexture?E.mipmaps[N]:E.image;B!==null?(st=B.max.x-B.min.x,dt=B.max.y-B.min.y,Et=B.isBox3?B.max.z-B.min.z:1,wt=B.min.x,zt=B.min.y,Vt=B.isBox3?B.min.z:0):(st=he.width,dt=he.height,Et=he.depth||1,wt=0,zt=0,Vt=0),H!==null?(Tt=H.x,Qt=H.y,le=H.z):(Tt=0,Qt=0,le=0);let Ve=Wt.convert(U.format),te=Wt.convert(U.type),Ct;U.isData3DTexture?(w.setTexture3D(U,0),Ct=R.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(w.setTexture2DArray(U,0),Ct=R.TEXTURE_2D_ARRAY):(w.setTexture2D(U,0),Ct=R.TEXTURE_2D),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,U.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,U.unpackAlignment);let Rn=R.getParameter(R.UNPACK_ROW_LENGTH),ee=R.getParameter(R.UNPACK_IMAGE_HEIGHT),cn=R.getParameter(R.UNPACK_SKIP_PIXELS),Ii=R.getParameter(R.UNPACK_SKIP_ROWS),Ye=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,he.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,he.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,wt),R.pixelStorei(R.UNPACK_SKIP_ROWS,zt),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Vt);let ws=E.isDataArrayTexture||E.isData3DTexture,ue=U.isDataArrayTexture||U.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){let vn=mt.get(E),Ts=mt.get(U),en=mt.get(vn.__renderTarget),Xn=mt.get(Ts.__renderTarget);ot.bindFramebuffer(R.READ_FRAMEBUFFER,en.__webglFramebuffer),ot.bindFramebuffer(R.DRAW_FRAMEBUFFER,Xn.__webglFramebuffer);for(let Yn=0;Yn<Et;Yn++)ws&&R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,mt.get(E).__webglTexture,N,Vt+Yn),E.isDepthTexture?(ue&&R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,mt.get(U).__webglTexture,N,le+Yn),R.blitFramebuffer(wt,zt,st,dt,Tt,Qt,st,dt,R.DEPTH_BUFFER_BIT,R.NEAREST)):ue?R.copyTexSubImage3D(Ct,N,Tt,Qt,le+Yn,wt,zt,st,dt):R.copyTexSubImage2D(Ct,N,Tt,Qt,le+Yn,wt,zt,st,dt);ot.bindFramebuffer(R.READ_FRAMEBUFFER,null),ot.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else ue?E.isDataTexture||E.isData3DTexture?R.texSubImage3D(Ct,N,Tt,Qt,le,st,dt,Et,Ve,te,he.data):U.isCompressedArrayTexture?R.compressedTexSubImage3D(Ct,N,Tt,Qt,le,st,dt,Et,Ve,he.data):R.texSubImage3D(Ct,N,Tt,Qt,le,st,dt,Et,Ve,te,he):E.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,N,Tt,Qt,st,dt,Ve,te,he.data):E.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,N,Tt,Qt,he.width,he.height,Ve,he.data):R.texSubImage2D(R.TEXTURE_2D,N,Tt,Qt,st,dt,Ve,te,he);R.pixelStorei(R.UNPACK_ROW_LENGTH,Rn),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,ee),R.pixelStorei(R.UNPACK_SKIP_PIXELS,cn),R.pixelStorei(R.UNPACK_SKIP_ROWS,Ii),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Ye),N===0&&U.generateMipmaps&&R.generateMipmap(Ct),ot.unbindTexture()},this.copyTextureToTexture3D=function(E,U,B=null,H=null,N=0){return E.isTexture!==!0&&(Ds("WebGLRenderer: copyTextureToTexture3D function signature has changed."),B=arguments[0]||null,H=arguments[1]||null,E=arguments[2],U=arguments[3],N=arguments[4]||0),Ds('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,U,B,H,N)},this.initRenderTarget=function(E){mt.get(E).__webglFramebuffer===void 0&&w.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?w.setTextureCube(E,0):E.isData3DTexture?w.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?w.setTexture2DArray(E,0):w.setTexture2D(E,0),ot.unbindTexture()},this.resetState=function(){T=0,C=0,A=null,ot.reset(),ae.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return On}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorspace=qt._getDrawingBufferColorSpace(t),e.unpackColorSpace=qt._getUnpackColorSpace()}},no=class i{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new At(t),this.density=e}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var io=class extends He{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new sn,this.environmentIntensity=1,this.environmentRotation=new sn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}};var wl=class extends Ge{constructor(t=null,e=1,n=1,s,r,o,a,l,c=$e,h=$e,f,d){super(null,o,a,l,c,h,s,r,f,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var qs=class extends Re{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Yi=new Ot,Dh=new Ot,Lr=[],Uh=new pn,j0=new Ot,Is=new St,Ls=new kn,ge=class extends St{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new qs(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,j0)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new pn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Yi),Uh.copy(t.boundingBox).applyMatrix4(Yi),this.boundingBox.union(Uh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new kn),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Yi),Ls.copy(t.boundingSphere).applyMatrix4(Yi),this.boundingSphere.union(Ls)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(Is.geometry=this.geometry,Is.material=this.material,Is.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ls.copy(this.boundingSphere),Ls.applyMatrix4(n),t.ray.intersectsSphere(Ls)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Yi),Dh.multiplyMatrices(n,Yi),Is.matrixWorld=Dh,Is.raycast(t,Lr);for(let o=0,a=Lr.length;o<a;o++){let l=Lr[o];l.instanceId=r,l.object=this,e.push(l)}Lr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new qs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new wl(new Float32Array(s*this.count),s,this.count,nc,Sn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var so=class extends Ge{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},rn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){let n=this.getLengths(),s=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let h=n[s],d=n[s+1]-h,u=(o-h)/d;return(s+u)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=e||(o.isVector2?new K:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){let n=new P,s=[],r=[],o=[],a=new P,l=new Ot;for(let u=0;u<=t;u++){let m=u/t;s[u]=this.getTangentAt(m,new P)}r[0]=new P,o[0]=new P;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),f=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),f<=c&&(c=f,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let u=1;u<=t;u++){if(r[u]=r[u-1].clone(),o[u]=o[u-1].clone(),a.crossVectors(s[u-1],s[u]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(Te(s[u-1].dot(s[u]),-1,1));r[u].applyMatrix4(l.makeRotationAxis(a,m))}o[u].crossVectors(s[u],r[u])}if(e===!0){let u=Math.acos(Te(r[0].dot(r[t]),-1,1));u/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(u=-u);for(let m=1;m<=t;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],u*m)),o[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Zs=class extends rn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new K){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),f=Math.sin(this.aRotation),d=l-this.aX,u=c-this.aY;l=d*h-u*f+this.aX,c=d*f+u*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Tl=class extends Zs{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function lc(){let i=0,t=0,e=0,n=0;function s(r,o,a,l){i=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,f){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,u=(a-o)/h-(l-o)/(h+f)+(l-a)/f;d*=h,u*=h,s(o,a,d,u)},calc:function(r){let o=r*r,a=o*r;return i+t*r+e*o+n*a}}}var Dr=new P,Ma=new lc,Sa=new lc,ba=new lc,ls=class extends rn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new P){let n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(Dr.subVectors(s[0],s[1]).add(s[0]),c=Dr);let f=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Dr.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Dr),this.curveType==="centripetal"||this.curveType==="chordal"){let u=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(f),u),_=Math.pow(f.distanceToSquared(d),u),g=Math.pow(d.distanceToSquared(h),u);_<1e-4&&(_=1),m<1e-4&&(m=_),g<1e-4&&(g=_),Ma.initNonuniformCatmullRom(c.x,f.x,d.x,h.x,m,_,g),Sa.initNonuniformCatmullRom(c.y,f.y,d.y,h.y,m,_,g),ba.initNonuniformCatmullRom(c.z,f.z,d.z,h.z,m,_,g)}else this.curveType==="catmullrom"&&(Ma.initCatmullRom(c.x,f.x,d.x,h.x,this.tension),Sa.initCatmullRom(c.y,f.y,d.y,h.y,this.tension),ba.initCatmullRom(c.z,f.z,d.z,h.z,this.tension));return n.set(Ma.calc(l),Sa.calc(l),ba.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new P().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Nh(i,t,e,n,s){let r=(n-t)*.5,o=(s-e)*.5,a=i*i,l=i*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*i+e}function t_(i,t){let e=1-i;return e*e*t}function e_(i,t){return 2*(1-i)*i*t}function n_(i,t){return i*i*t}function Bs(i,t,e,n){return t_(i,t)+e_(i,e)+n_(i,n)}function i_(i,t){let e=1-i;return e*e*e*t}function s_(i,t){let e=1-i;return 3*e*e*i*t}function r_(i,t){return 3*(1-i)*i*i*t}function o_(i,t){return i*i*i*t}function zs(i,t,e,n,s){return i_(i,t)+s_(i,e)+r_(i,n)+o_(i,s)}var ro=class extends rn{constructor(t=new K,e=new K,n=new K,s=new K){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new K){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(zs(t,s.x,r.x,o.x,a.x),zs(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Al=class extends rn{constructor(t=new P,e=new P,n=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new P){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(zs(t,s.x,r.x,o.x,a.x),zs(t,s.y,r.y,o.y,a.y),zs(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},oo=class extends rn{constructor(t=new K,e=new K){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new K){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new K){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Rl=class extends rn{constructor(t=new P,e=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new P){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new P){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ao=class extends rn{constructor(t=new K,e=new K,n=new K){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new K){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Bs(t,s.x,r.x,o.x),Bs(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Cl=class extends rn{constructor(t=new P,e=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new P){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Bs(t,s.x,r.x,o.x),Bs(t,s.y,r.y,o.y),Bs(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},lo=class extends rn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new K){let n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],f=s[o>s.length-3?s.length-1:o+2];return n.set(Nh(a,l.x,c.x,h.x,f.x),Nh(a,l.y,c.y,h.y,f.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new K().fromArray(s))}return this}},Pl=Object.freeze({__proto__:null,ArcCurve:Tl,CatmullRomCurve3:ls,CubicBezierCurve:ro,CubicBezierCurve3:Al,EllipseCurve:Zs,LineCurve:oo,LineCurve3:Rl,QuadraticBezierCurve:ao,QuadraticBezierCurve3:Cl,SplineCurve:lo}),Il=class extends rn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Pl[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new Pl[s.type]().fromJSON(s))}return this}},cs=class extends Il{constructor(t){super(),this.type="Path",this.currentPoint=new K,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new oo(this.currentPoint.clone(),new K(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new ao(this.currentPoint.clone(),new K(t,e),new K(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){let a=new ro(this.currentPoint.clone(),new K(t,e),new K(n,s),new K(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new lo(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,s,r,o,a,l),this}absellipse(t,e,n,s,r,o,a,l){let c=new Zs(t,e,n,s,r,o,a,l);if(this.curves.length>0){let f=c.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},co=class i extends Ce{constructor(t=[new K(0,-.5),new K(.5,0),new K(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=Te(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],h=1/e,f=new P,d=new K,u=new P,m=new P,_=new P,g=0,p=0;for(let b=0;b<=t.length-1;b++)switch(b){case 0:g=t[b+1].x-t[b].x,p=t[b+1].y-t[b].y,u.x=p*1,u.y=-g,u.z=p*0,_.copy(u),u.normalize(),l.push(u.x,u.y,u.z);break;case t.length-1:l.push(_.x,_.y,_.z);break;default:g=t[b+1].x-t[b].x,p=t[b+1].y-t[b].y,u.x=p*1,u.y=-g,u.z=p*0,m.copy(u),u.x+=_.x,u.y+=_.y,u.z+=_.z,u.normalize(),l.push(u.x,u.y,u.z),_.copy(m)}for(let b=0;b<=e;b++){let v=n+b*h*s,x=Math.sin(v),L=Math.cos(v);for(let T=0;T<=t.length-1;T++){f.x=t[T].x*x,f.y=t[T].y,f.z=t[T].x*L,o.push(f.x,f.y,f.z),d.x=b/e,d.y=T/(t.length-1),a.push(d.x,d.y);let C=l[3*T+0]*x,A=l[3*T+1],S=l[3*T+0]*L;c.push(C,A,S)}}for(let b=0;b<e;b++)for(let v=0;v<t.length-1;v++){let x=v+b*t.length,L=x,T=x+t.length,C=x+t.length+1,A=x+1;r.push(L,T,A),r.push(C,A,T)}this.setIndex(r),this.setAttribute("position",new ie(o,3)),this.setAttribute("uv",new ie(a,2)),this.setAttribute("normal",new ie(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.points,t.segments,t.phiStart,t.phiLength)}};var be=class i extends Ce{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],f=[],d=[],u=[],m=0,_=[],g=n/2,p=0;b(),o===!1&&(t>0&&v(!0),e>0&&v(!1)),this.setIndex(h),this.setAttribute("position",new ie(f,3)),this.setAttribute("normal",new ie(d,3)),this.setAttribute("uv",new ie(u,2));function b(){let x=new P,L=new P,T=0,C=(e-t)/n;for(let A=0;A<=r;A++){let S=[],y=A/r,I=y*(e-t)+t;for(let z=0;z<=s;z++){let O=z/s,k=O*l+a,Z=Math.sin(k),V=Math.cos(k);L.x=I*Z,L.y=-y*n+g,L.z=I*V,f.push(L.x,L.y,L.z),x.set(Z,C,V).normalize(),d.push(x.x,x.y,x.z),u.push(O,1-y),S.push(m++)}_.push(S)}for(let A=0;A<s;A++)for(let S=0;S<r;S++){let y=_[S][A],I=_[S+1][A],z=_[S+1][A+1],O=_[S][A+1];(t>0||S!==0)&&(h.push(y,I,O),T+=3),(e>0||S!==r-1)&&(h.push(I,z,O),T+=3)}c.addGroup(p,T,0),p+=T}function v(x){let L=m,T=new K,C=new P,A=0,S=x===!0?t:e,y=x===!0?1:-1;for(let z=1;z<=s;z++)f.push(0,g*y,0),d.push(0,y,0),u.push(.5,.5),m++;let I=m;for(let z=0;z<=s;z++){let k=z/s*l+a,Z=Math.cos(k),V=Math.sin(k);C.x=S*V,C.y=g*y,C.z=S*Z,f.push(C.x,C.y,C.z),d.push(0,y,0),T.x=Z*.5+.5,T.y=V*.5*y+.5,u.push(T.x,T.y),m++}for(let z=0;z<s;z++){let O=L+z,k=I+z;x===!0?h.push(k,k+1,O):h.push(k+1,k,O),A+=3}c.addGroup(p,A,x===!0?1:2),p+=A}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ho=class i extends be{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},uo=class i extends Ce{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],o=[];a(s),c(n),h(),this.setAttribute("position",new ie(r,3)),this.setAttribute("normal",new ie(r.slice(),3)),this.setAttribute("uv",new ie(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(b){let v=new P,x=new P,L=new P;for(let T=0;T<e.length;T+=3)u(e[T+0],v),u(e[T+1],x),u(e[T+2],L),l(v,x,L,b)}function l(b,v,x,L){let T=L+1,C=[];for(let A=0;A<=T;A++){C[A]=[];let S=b.clone().lerp(x,A/T),y=v.clone().lerp(x,A/T),I=T-A;for(let z=0;z<=I;z++)z===0&&A===T?C[A][z]=S:C[A][z]=S.clone().lerp(y,z/I)}for(let A=0;A<T;A++)for(let S=0;S<2*(T-A)-1;S++){let y=Math.floor(S/2);S%2===0?(d(C[A][y+1]),d(C[A+1][y]),d(C[A][y])):(d(C[A][y+1]),d(C[A+1][y+1]),d(C[A+1][y]))}}function c(b){let v=new P;for(let x=0;x<r.length;x+=3)v.x=r[x+0],v.y=r[x+1],v.z=r[x+2],v.normalize().multiplyScalar(b),r[x+0]=v.x,r[x+1]=v.y,r[x+2]=v.z}function h(){let b=new P;for(let v=0;v<r.length;v+=3){b.x=r[v+0],b.y=r[v+1],b.z=r[v+2];let x=g(b)/2/Math.PI+.5,L=p(b)/Math.PI+.5;o.push(x,1-L)}m(),f()}function f(){for(let b=0;b<o.length;b+=6){let v=o[b+0],x=o[b+2],L=o[b+4],T=Math.max(v,x,L),C=Math.min(v,x,L);T>.9&&C<.1&&(v<.2&&(o[b+0]+=1),x<.2&&(o[b+2]+=1),L<.2&&(o[b+4]+=1))}}function d(b){r.push(b.x,b.y,b.z)}function u(b,v){let x=b*3;v.x=t[x+0],v.y=t[x+1],v.z=t[x+2]}function m(){let b=new P,v=new P,x=new P,L=new P,T=new K,C=new K,A=new K;for(let S=0,y=0;S<r.length;S+=9,y+=6){b.set(r[S+0],r[S+1],r[S+2]),v.set(r[S+3],r[S+4],r[S+5]),x.set(r[S+6],r[S+7],r[S+8]),T.set(o[y+0],o[y+1]),C.set(o[y+2],o[y+3]),A.set(o[y+4],o[y+5]),L.copy(b).add(v).add(x).divideScalar(3);let I=g(L);_(T,y+0,b,I),_(C,y+2,v,I),_(A,y+4,x,I)}}function _(b,v,x,L){L<0&&b.x===1&&(o[v]=b.x-1),x.x===0&&x.z===0&&(o[v]=L/2/Math.PI+.5)}function g(b){return Math.atan2(b.z,-b.x)}function p(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.details)}},fo=class i extends uo{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var Vn=class extends cs{constructor(t){super(t),this.uuid=wi(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new cs().fromJSON(s))}return this}},a_={triangulate:function(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=du(i,0,s,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c,h,f,d,u;if(n&&(r=d_(i,t,r,e)),i.length>80*e){a=c=i[0],l=h=i[1];for(let m=e;m<s;m+=e)f=i[m],d=i[m+1],f<a&&(a=f),d<l&&(l=d),f>c&&(c=f),d>h&&(h=d);u=Math.max(c-a,h-l),u=u!==0?32767/u:0}return $s(r,o,e,a,l,u,0),o}};function du(i,t,e,n,s){let r,o;if(s===b_(i,t,e,n)>0)for(r=t;r<e;r+=n)o=Fh(r,i[r],i[r+1],o);else for(r=e-n;r>=t;r-=n)o=Fh(r,i[r],i[r+1],o);return o&&To(o,o.next)&&(Ks(o),o=o.next),o}function Si(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(To(e,e.next)||fe(e.prev,e,e.next)===0)){if(Ks(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function $s(i,t,e,n,s,r,o){if(!i)return;!o&&r&&__(i,n,s,r);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,r?c_(i,n,s,r):l_(i)){t.push(l.i/e|0),t.push(i.i/e|0),t.push(c.i/e|0),Ks(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=h_(Si(i),t,e),$s(i,t,e,n,s,r,2)):o===2&&u_(i,t,e,n,s,r):$s(Si(i),t,e,n,s,r,1);break}}}function l_(i){let t=i.prev,e=i,n=i.next;if(fe(t,e,n)>=0)return!1;let s=t.x,r=e.x,o=n.x,a=t.y,l=e.y,c=n.y,h=s<r?s<o?s:o:r<o?r:o,f=a<l?a<c?a:c:l<c?l:c,d=s>r?s>o?s:o:r>o?r:o,u=a>l?a>c?a:c:l>c?l:c,m=n.next;for(;m!==t;){if(m.x>=h&&m.x<=d&&m.y>=f&&m.y<=u&&$i(s,a,r,l,o,c,m.x,m.y)&&fe(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function c_(i,t,e,n){let s=i.prev,r=i,o=i.next;if(fe(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,f=r.y,d=o.y,u=a<l?a<c?a:c:l<c?l:c,m=h<f?h<d?h:d:f<d?f:d,_=a>l?a>c?a:c:l>c?l:c,g=h>f?h>d?h:d:f>d?f:d,p=Ll(u,m,t,e,n),b=Ll(_,g,t,e,n),v=i.prevZ,x=i.nextZ;for(;v&&v.z>=p&&x&&x.z<=b;){if(v.x>=u&&v.x<=_&&v.y>=m&&v.y<=g&&v!==s&&v!==o&&$i(a,h,l,f,c,d,v.x,v.y)&&fe(v.prev,v,v.next)>=0||(v=v.prevZ,x.x>=u&&x.x<=_&&x.y>=m&&x.y<=g&&x!==s&&x!==o&&$i(a,h,l,f,c,d,x.x,x.y)&&fe(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;v&&v.z>=p;){if(v.x>=u&&v.x<=_&&v.y>=m&&v.y<=g&&v!==s&&v!==o&&$i(a,h,l,f,c,d,v.x,v.y)&&fe(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;x&&x.z<=b;){if(x.x>=u&&x.x<=_&&x.y>=m&&x.y<=g&&x!==s&&x!==o&&$i(a,h,l,f,c,d,x.x,x.y)&&fe(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function h_(i,t,e){let n=i;do{let s=n.prev,r=n.next.next;!To(s,r)&&fu(s,n,n.next,r)&&Js(s,r)&&Js(r,s)&&(t.push(s.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),Ks(n),Ks(n.next),n=i=r),n=n.next}while(n!==i);return Si(n)}function u_(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&y_(o,a)){let l=pu(o,a);o=Si(o,o.next),l=Si(l,l.next),$s(o,t,e,n,s,r,0),$s(l,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function d_(i,t,e,n){let s=[],r,o,a,l,c;for(r=0,o=t.length;r<o;r++)a=t[r]*n,l=r<o-1?t[r+1]*n:i.length,c=du(i,a,l,n,!1),c===c.next&&(c.steiner=!0),s.push(v_(c));for(s.sort(f_),r=0;r<s.length;r++)e=p_(s[r],e);return e}function f_(i,t){return i.x-t.x}function p_(i,t){let e=m_(i,t);if(!e)return t;let n=pu(e,i);return Si(n,n.next),Si(e,e.next)}function m_(i,t){let e=t,n=-1/0,s,r=i.x,o=i.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){let d=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=r&&d>n&&(n=d,s=e.x<e.next.x?e:e.next,d===r))return s}e=e.next}while(e!==t);if(!s)return null;let a=s,l=s.x,c=s.y,h=1/0,f;e=s;do r>=e.x&&e.x>=l&&r!==e.x&&$i(o<c?r:n,o,l,c,o<c?n:r,o,e.x,e.y)&&(f=Math.abs(o-e.y)/(r-e.x),Js(e,i)&&(f<h||f===h&&(e.x>s.x||e.x===s.x&&g_(s,e)))&&(s=e,h=f)),e=e.next;while(e!==a);return s}function g_(i,t){return fe(i.prev,i,t.prev)<0&&fe(t.next,i,i.next)<0}function __(i,t,e,n){let s=i;do s.z===0&&(s.z=Ll(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,x_(s)}function x_(i){let t,e,n,s,r,o,a,l,c=1;do{for(e=i,i=null,r=null,o=0;e;){for(o++,n=e,a=0,t=0;t<c&&(a++,n=n.nextZ,!!n);t++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||e.z<=n.z)?(s=e,e=e.nextZ,a--):(s=n,n=n.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;e=n}r.nextZ=null,c*=2}while(o>1);return i}function Ll(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function v_(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function $i(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function y_(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!M_(i,t)&&(Js(i,t)&&Js(t,i)&&S_(i,t)&&(fe(i.prev,i,t.prev)||fe(i,t.prev,t))||To(i,t)&&fe(i.prev,i,i.next)>0&&fe(t.prev,t,t.next)>0)}function fe(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function To(i,t){return i.x===t.x&&i.y===t.y}function fu(i,t,e,n){let s=Nr(fe(i,t,e)),r=Nr(fe(i,t,n)),o=Nr(fe(e,n,i)),a=Nr(fe(e,n,t));return!!(s!==r&&o!==a||s===0&&Ur(i,e,t)||r===0&&Ur(i,n,t)||o===0&&Ur(e,i,n)||a===0&&Ur(e,t,n))}function Ur(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Nr(i){return i>0?1:i<0?-1:0}function M_(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&fu(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Js(i,t){return fe(i.prev,i,i.next)<0?fe(i,t,i.next)>=0&&fe(i,i.prev,t)>=0:fe(i,t,i.prev)<0||fe(i,i.next,t)<0}function S_(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function pu(i,t){let e=new Dl(i.i,i.x,i.y),n=new Dl(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Fh(i,t,e,n){let s=new Dl(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Ks(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Dl(i,t,e){this.i=i,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function b_(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var Hs=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];Oh(t),Bh(n,t);let o=t.length;e.forEach(Oh);for(let l=0;l<e.length;l++)s.push(o),o+=e[l].length,Bh(n,e[l]);let a=a_.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Oh(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function Bh(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var ii=class i extends Ce{constructor(t=new Vn([new K(.5,.5),new K(-.5,.5),new K(-.5,-.5),new K(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let a=0,l=t.length;a<l;a++){let c=t[a];o(c)}this.setAttribute("position",new ie(s,3)),this.setAttribute("uv",new ie(r,2)),this.computeVertexNormals();function o(a){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,f=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,u=e.bevelThickness!==void 0?e.bevelThickness:.2,m=e.bevelSize!==void 0?e.bevelSize:u-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,g=e.bevelSegments!==void 0?e.bevelSegments:3,p=e.extrudePath,b=e.UVGenerator!==void 0?e.UVGenerator:E_,v,x=!1,L,T,C,A;p&&(v=p.getSpacedPoints(h),x=!0,d=!1,L=p.computeFrenetFrames(h,!1),T=new P,C=new P,A=new P),d||(g=0,u=0,m=0,_=0);let S=a.extractPoints(c),y=S.shape,I=S.holes;if(!Hs.isClockWise(y)){y=y.reverse();for(let J=0,nt=I.length;J<nt;J++){let R=I[J];Hs.isClockWise(R)&&(I[J]=R.reverse())}}let O=Hs.triangulateShape(y,I),k=y;for(let J=0,nt=I.length;J<nt;J++){let R=I[J];y=y.concat(R)}function Z(J,nt,R){return nt||console.error("THREE.ExtrudeGeometry: vec does not exist"),J.clone().addScaledVector(nt,R)}let V=y.length,et=O.length;function G(J,nt,R){let Rt,j,_t,ot=J.x-nt.x,Lt=J.y-nt.y,mt=R.x-J.x,w=R.y-J.y,M=ot*ot+Lt*Lt,F=ot*w-Lt*mt;if(Math.abs(F)>Number.EPSILON){let X=Math.sqrt(M),Q=Math.sqrt(mt*mt+w*w),Y=nt.x-Lt/X,bt=nt.y+ot/X,ct=R.x-w/Q,gt=R.y+mt/Q,Yt=((ct-Y)*w-(gt-bt)*mt)/(ot*w-Lt*mt);Rt=Y+ot*Yt-J.x,j=bt+Lt*Yt-J.y;let tt=Rt*Rt+j*j;if(tt<=2)return new K(Rt,j);_t=Math.sqrt(tt/2)}else{let X=!1;ot>Number.EPSILON?mt>Number.EPSILON&&(X=!0):ot<-Number.EPSILON?mt<-Number.EPSILON&&(X=!0):Math.sign(Lt)===Math.sign(w)&&(X=!0),X?(Rt=-Lt,j=ot,_t=Math.sqrt(M)):(Rt=ot,j=Lt,_t=Math.sqrt(M/2))}return new K(Rt/_t,j/_t)}let at=[];for(let J=0,nt=k.length,R=nt-1,Rt=J+1;J<nt;J++,R++,Rt++)R===nt&&(R=0),Rt===nt&&(Rt=0),at[J]=G(k[J],k[R],k[Rt]);let pt=[],yt,Ht=at.concat();for(let J=0,nt=I.length;J<nt;J++){let R=I[J];yt=[];for(let Rt=0,j=R.length,_t=j-1,ot=Rt+1;Rt<j;Rt++,_t++,ot++)_t===j&&(_t=0),ot===j&&(ot=0),yt[Rt]=G(R[Rt],R[_t],R[ot]);pt.push(yt),Ht=Ht.concat(yt)}for(let J=0;J<g;J++){let nt=J/g,R=u*Math.cos(nt*Math.PI/2),Rt=m*Math.sin(nt*Math.PI/2)+_;for(let j=0,_t=k.length;j<_t;j++){let ot=Z(k[j],at[j],Rt);rt(ot.x,ot.y,-R)}for(let j=0,_t=I.length;j<_t;j++){let ot=I[j];yt=pt[j];for(let Lt=0,mt=ot.length;Lt<mt;Lt++){let w=Z(ot[Lt],yt[Lt],Rt);rt(w.x,w.y,-R)}}}let jt=m+_;for(let J=0;J<V;J++){let nt=d?Z(y[J],Ht[J],jt):y[J];x?(C.copy(L.normals[0]).multiplyScalar(nt.x),T.copy(L.binormals[0]).multiplyScalar(nt.y),A.copy(v[0]).add(C).add(T),rt(A.x,A.y,A.z)):rt(nt.x,nt.y,0)}for(let J=1;J<=h;J++)for(let nt=0;nt<V;nt++){let R=d?Z(y[nt],Ht[nt],jt):y[nt];x?(C.copy(L.normals[J]).multiplyScalar(R.x),T.copy(L.binormals[J]).multiplyScalar(R.y),A.copy(v[J]).add(C).add(T),rt(A.x,A.y,A.z)):rt(R.x,R.y,f/h*J)}for(let J=g-1;J>=0;J--){let nt=J/g,R=u*Math.cos(nt*Math.PI/2),Rt=m*Math.sin(nt*Math.PI/2)+_;for(let j=0,_t=k.length;j<_t;j++){let ot=Z(k[j],at[j],Rt);rt(ot.x,ot.y,f+R)}for(let j=0,_t=I.length;j<_t;j++){let ot=I[j];yt=pt[j];for(let Lt=0,mt=ot.length;Lt<mt;Lt++){let w=Z(ot[Lt],yt[Lt],Rt);x?rt(w.x,w.y+v[h-1].y,v[h-1].x+R):rt(w.x,w.y,f+R)}}}q(),it();function q(){let J=s.length/3;if(d){let nt=0,R=V*nt;for(let Rt=0;Rt<et;Rt++){let j=O[Rt];It(j[2]+R,j[1]+R,j[0]+R)}nt=h+g*2,R=V*nt;for(let Rt=0;Rt<et;Rt++){let j=O[Rt];It(j[0]+R,j[1]+R,j[2]+R)}}else{for(let nt=0;nt<et;nt++){let R=O[nt];It(R[2],R[1],R[0])}for(let nt=0;nt<et;nt++){let R=O[nt];It(R[0]+V*h,R[1]+V*h,R[2]+V*h)}}n.addGroup(J,s.length/3-J,0)}function it(){let J=s.length/3,nt=0;Mt(k,nt),nt+=k.length;for(let R=0,Rt=I.length;R<Rt;R++){let j=I[R];Mt(j,nt),nt+=j.length}n.addGroup(J,s.length/3-J,1)}function Mt(J,nt){let R=J.length;for(;--R>=0;){let Rt=R,j=R-1;j<0&&(j=J.length-1);for(let _t=0,ot=h+g*2;_t<ot;_t++){let Lt=V*_t,mt=V*(_t+1),w=nt+Rt+Lt,M=nt+j+Lt,F=nt+j+mt,X=nt+Rt+mt;Bt(w,M,F,X)}}}function rt(J,nt,R){l.push(J),l.push(nt),l.push(R)}function It(J,nt,R){Ut(J),Ut(nt),Ut(R);let Rt=s.length/3,j=b.generateTopUV(n,s,Rt-3,Rt-2,Rt-1);Jt(j[0]),Jt(j[1]),Jt(j[2])}function Bt(J,nt,R,Rt){Ut(J),Ut(nt),Ut(Rt),Ut(nt),Ut(R),Ut(Rt);let j=s.length/3,_t=b.generateSideWallUV(n,s,j-6,j-3,j-2,j-1);Jt(_t[0]),Jt(_t[1]),Jt(_t[3]),Jt(_t[1]),Jt(_t[2]),Jt(_t[3])}function Ut(J){s.push(l[J*3+0]),s.push(l[J*3+1]),s.push(l[J*3+2])}function Jt(J){r.push(J.x),r.push(J.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return w_(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];n.push(a)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new Pl[s.type]().fromJSON(s)),new i(n,t.options)}},E_={generateTopUV:function(i,t,e,n,s){let r=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],c=t[s*3],h=t[s*3+1];return[new K(r,o),new K(a,l),new K(c,h)]},generateSideWallUV:function(i,t,e,n,s,r){let o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],f=t[n*3+2],d=t[s*3],u=t[s*3+1],m=t[s*3+2],_=t[r*3],g=t[r*3+1],p=t[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new K(o,1-l),new K(c,1-f),new K(d,1-m),new K(_,1-p)]:[new K(a,1-l),new K(h,1-f),new K(u,1-m),new K(g,1-p)]}};function w_(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var po=class i extends uo{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var hs=class i extends Ce{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],f=new P,d=new P,u=[],m=[],_=[],g=[];for(let p=0;p<=n;p++){let b=[],v=p/n,x=0;p===0&&o===0?x=.5/e:p===n&&l===Math.PI&&(x=-.5/e);for(let L=0;L<=e;L++){let T=L/e;f.x=-t*Math.cos(s+T*r)*Math.sin(o+v*a),f.y=t*Math.cos(o+v*a),f.z=t*Math.sin(s+T*r)*Math.sin(o+v*a),m.push(f.x,f.y,f.z),d.copy(f).normalize(),_.push(d.x,d.y,d.z),g.push(T+x,1-v),b.push(c++)}h.push(b)}for(let p=0;p<n;p++)for(let b=0;b<e;b++){let v=h[p][b+1],x=h[p][b],L=h[p+1][b],T=h[p+1][b+1];(p!==0||o>0)&&u.push(v,x,T),(p!==n-1||l<Math.PI)&&u.push(x,L,T)}this.setIndex(u),this.setAttribute("position",new ie(m,3)),this.setAttribute("normal",new ie(_,3)),this.setAttribute("uv",new ie(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var mo=class i extends Ce{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);let o=[],a=[],l=[],c=[],h=new P,f=new P,d=new P;for(let u=0;u<=n;u++)for(let m=0;m<=s;m++){let _=m/s*r,g=u/n*Math.PI*2;f.x=(t+e*Math.cos(g))*Math.cos(_),f.y=(t+e*Math.cos(g))*Math.sin(_),f.z=e*Math.sin(g),a.push(f.x,f.y,f.z),h.x=t*Math.cos(_),h.y=t*Math.sin(_),d.subVectors(f,h).normalize(),l.push(d.x,d.y,d.z),c.push(m/s),c.push(u/n)}for(let u=1;u<=n;u++)for(let m=1;m<=s;m++){let _=(s+1)*u+m-1,g=(s+1)*(u-1)+m-1,p=(s+1)*(u-1)+m,b=(s+1)*u+m;o.push(_,g,b),o.push(g,p,b)}this.setIndex(o),this.setAttribute("position",new ie(a,3)),this.setAttribute("normal",new ie(l,3)),this.setAttribute("uv",new ie(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};var go=class extends _e{static get type(){return"RawShaderMaterial"}constructor(t){super(t),this.isRawShaderMaterial=!0}},ve=class extends Mi{static get type(){return"MeshStandardMaterial"}constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new At(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new At(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=nu,this.normalScale=new K(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};function Fr(i,t,e){return!i||!e&&i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function T_(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var us=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Ul=class extends us{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Fc,endingEnd:Fc}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Oc:r=t,a=2*e-n;break;case Bc:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Oc:o=t,l=2*n-e;break;case Bc:o=1,l=n+s[1]-s[0];break;default:o=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,f=this._offsetNext,d=this._weightPrev,u=this._weightNext,m=(n-e)/(s-e),_=m*m,g=_*m,p=-d*g+2*d*_-d*m,b=(1+d)*g+(-1.5-2*d)*_+(-.5+d)*m+1,v=(-1-u)*g+(1.5+u)*_+.5*m,x=u*g-u*_;for(let L=0;L!==a;++L)r[L]=p*o[h+L]+b*o[c+L]+v*o[l+L]+x*o[f+L];return r}},Nl=class extends us{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(n-e)/(s-e),f=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*f+o[l+d]*h;return r}},Fl=class extends us{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},mn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Fr(e,this.TimeBufferType),this.values=Fr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Fr(t.times,Array),values:Fr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Fl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Nl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Ul(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case Gr:e=this.InterpolantFactoryMethodDiscrete;break;case ll:e=this.InterpolantFactoryMethodLinear;break;case Zo:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Gr;case this.InterpolantFactoryMethodLinear:return ll;case this.InterpolantFactoryMethodSmooth:return Zo}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(s!==void 0&&T_(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Zo,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(s)l=!0;else{let f=a*n,d=f-n,u=f+n;for(let m=0;m!==n;++m){let _=e[f+m];if(_!==e[d+m]||_!==e[u+m]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let f=a*n,d=o*n;for(let u=0;u!==n;++u)e[d+u]=e[f+u]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};mn.prototype.TimeBufferType=Float32Array;mn.prototype.ValueBufferType=Float32Array;mn.prototype.DefaultInterpolation=ll;var bi=class extends mn{constructor(t,e,n){super(t,e,n)}};bi.prototype.ValueTypeName="bool";bi.prototype.ValueBufferType=Array;bi.prototype.DefaultInterpolation=Gr;bi.prototype.InterpolantFactoryMethodLinear=void 0;bi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ol=class extends mn{};Ol.prototype.ValueTypeName="color";var Bl=class extends mn{};Bl.prototype.ValueTypeName="number";var zl=class extends us{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(s-e),c=t*a;for(let h=c+a;c!==h;c+=4)Je.slerpFlat(r,0,o,c-a,o,c,l);return r}},_o=class extends mn{InterpolantFactoryMethodLinear(t){return new zl(this.times,this.values,this.getValueSize(),t)}};_o.prototype.ValueTypeName="quaternion";_o.prototype.InterpolantFactoryMethodSmooth=void 0;var Ei=class extends mn{constructor(t,e,n){super(t,e,n)}};Ei.prototype.ValueTypeName="string";Ei.prototype.ValueBufferType=Array;Ei.prototype.DefaultInterpolation=Gr;Ei.prototype.InterpolantFactoryMethodLinear=void 0;Ei.prototype.InterpolantFactoryMethodSmooth=void 0;var Hl=class extends mn{};Hl.prototype.ValueTypeName="vector";var kl=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,f){return c.push(h,f),this},this.removeHandler=function(h){let f=c.indexOf(h);return f!==-1&&c.splice(f,2),this},this.getHandler=function(h){for(let f=0,d=c.length;f<d;f+=2){let u=c[f],m=c[f+1];if(u.global&&(u.lastIndex=0),u.test(h))return m}return null}}},A_=new kl,Vl=class{constructor(t){this.manager=t!==void 0?t:A_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};Vl.DEFAULT_MATERIAL_NAME="__DEFAULT";var Qs=class extends He{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new At(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}},xo=class extends Qs{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(He.DEFAULT_UP),this.updateMatrix(),this.groundColor=new At(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}},Ea=new Ot,zh=new P,Hh=new P,Gl=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new K(512,512),this.map=null,this.mapPass=null,this.matrix=new Ot,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ys,this._frameExtents=new K(1,1),this._viewportCount=1,this._viewports=[new me(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;zh.setFromMatrixPosition(t.matrixWorld),e.position.copy(zh),Hh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Hh),e.updateMatrixWorld(),Ea.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ea),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ea)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}};var Wl=class extends Gl{constructor(){super(new as(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},vo=class extends Qs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(He.DEFAULT_UP),this.updateMatrix(),this.target=new He,this.shadow=new Wl}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}},yo=class extends Qs{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}};var ds=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=kh(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=kh();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};function kh(){return performance.now()}var cc="\\[\\]\\.:\\/",R_=new RegExp("["+cc+"]","g"),hc="[^"+cc+"]",C_="[^"+cc.replace("\\.","")+"]",P_=/((?:WC+[\/:])*)/.source.replace("WC",hc),I_=/(WCOD+)?/.source.replace("WCOD",C_),L_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",hc),D_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",hc),U_=new RegExp("^"+P_+I_+L_+D_+"$"),N_=["material","materials","bones","map"],Xl=class{constructor(t,e,n){let s=n||de.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},de=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(R_,"")}static parseTrackName(t){let e=U_.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);N_.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[s];if(o===void 0){let c=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};de.Composite=Xl;de.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};de.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};de.prototype.GetterByBindingType=[de.prototype._getValue_direct,de.prototype._getValue_array,de.prototype._getValue_arrayElement,de.prototype._getValue_toArray];de.prototype.SetterByBindingTypeAndVersioning=[[de.prototype._setValue_direct,de.prototype._setValue_direct_setNeedsUpdate,de.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[de.prototype._setValue_array,de.prototype._setValue_array_setNeedsUpdate,de.prototype._setValue_array_setMatrixWorldNeedsUpdate],[de.prototype._setValue_arrayElement,de.prototype._setValue_arrayElement_setNeedsUpdate,de.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[de.prototype._setValue_fromArray,de.prototype._setValue_fromArray_setNeedsUpdate,de.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Ax=new Float32Array(1);var Vh=new Ot,Mo=class{constructor(t,e,n=0,s=1/0){this.ray=new Zr(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new Xs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Vh.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Vh),this}intersectObject(t,e=!0,n=[]){return Yl(t,this,n,e),n.sort(Gh),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Yl(t[s],this,n,e);return n.sort(Gh),n}};function Gh(i,t){return i.distance-t.distance}function Yl(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Yl(r[o],t,e,!0)}}var So=class extends Hn{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");var ye={terrace:{w:450,d:300,h:15,cx:0,cz:0},grandStair:{run:62,cx:-225,zCenter:0,rampGap:5,rampWidth:11,parapetH:1.7,steps:60},skyRadius:2600,fogPlain:.0018,camera:{near:.5,far:7e3,fov:55},quality:{high:{pixelRatioCap:2,shadowMap:2048,shadows:!0,bloom:!0},mid:{pixelRatioCap:1.5,shadowMap:1024,shadows:!0,bloom:!0},low:{pixelRatioCap:1,shadowMap:0,shadows:!1,bloom:!1}}},ms=[{id:"gate",name:"\u4E07\u56FD\u95E8",en:"Gate of All Nations",rect:[-160,-30,34,34],h:9},{id:"apadana",name:"\u963F\u5E15\u8FBE\u7EB3\u5BAB",en:"Apadana",rect:[-30,45,85,85],h:20},{id:"tripy",name:"\u4E09\u95E8\u5385",en:"Tripylon",rect:[62,-18,17,17],h:8},{id:"throne",name:"\u767E\u67F1\u5385",en:"Hall of 100 Columns",rect:[140,55,75,75],h:23},{id:"treasury",name:"\u738B\u5BA4\u56FD\u5E93",en:"Royal Treasury",rect:[148,122,110,50],h:10},{id:"tachara",name:"\u5927\u6D41\u58EB\u5BAB",en:"Palace of Darius",rect:[-178,-85,36,28],h:11},{id:"hadish",name:"\u859B\u897F\u65AF\u5BAB",en:"Palace of Xerxes",rect:[-42,-102,44,32],h:12},{id:"harem",name:"\u540E\u5BAB",en:"Harem of Xerxes",rect:[-196,55,24,64],h:9}];function F_(){let i=ye.grandStair,t=(i.rampWidth+i.rampGap)/2;return[{x0:i.cx-i.run,x1:i.cx,z0:i.zCenter-t,z1:i.zCenter-i.rampGap/2},{x0:i.cx-i.run,x1:i.cx,z0:i.zCenter+i.rampGap/2,z1:i.zCenter+t}]}function uc(i,t){let e=ye.terrace;return Math.abs(i-e.cx)<=e.w/2&&Math.abs(t-e.cz)<=e.d/2}function Ti(i,t,e){let n=ye.terrace;if(uc(i,t))return n.h;for(let s of F_())if(i>=s.x0&&i<=s.x1&&t>=s.z0&&t<=s.z1){let r=(i-s.x0)/(s.x1-s.x0);return n.h*r*r*(3-2*r)}return e?e(i,t):0}var _n={night:{az:210,el:42,sunColor:9414616,sunIntensity:.25,hemiSky:2766165,hemiGround:1710626,hemiIntensity:.5,amb:.12,fogColor:856608,fogDensity:.0042,top:395800,horizon:1778742,sunGlow:.12,stars:1,exposure:1},dawn:{az:240,el:12,sunColor:16761994,sunIntensity:1.6,hemiSky:10466520,hemiGround:6969924,hemiIntensity:.7,amb:.26,fogColor:15260096,fogDensity:.003,top:8297412,horizon:15915440,sunGlow:.7,stars:.05,exposure:1.05},golden:{az:262,el:27,sunColor:16767912,sunIntensity:2.9,hemiSky:12570856,hemiGround:9073493,hemiIntensity:.85,amb:.3,fogColor:15983816,fogDensity:.00135,top:8825048,horizon:16179124,sunGlow:.55,stars:0,exposure:1.05},afternoon:{az:300,el:38,sunColor:16773844,sunIntensity:3.1,hemiSky:13229298,hemiGround:9863262,hemiIntensity:.9,amb:.32,fogColor:15787730,fogDensity:.00105,top:7314142,horizon:15524040,sunGlow:.4,stars:0,exposure:1.02},sunset:{az:296,el:8,sunColor:16757611,sunIntensity:2.4,hemiSky:14202e3,hemiGround:8018496,hemiIntensity:.75,amb:.28,fogColor:15780256,fogDensity:68e-5,top:10123944,horizon:16759162,sunGlow:.95,stars:0,exposure:1.18}};var Ao={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var Ke=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},O_=new as(-1,1,1,-1,0,1),dc=class extends Ce{constructor(){super(),this.setAttribute("position",new ie([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new ie([0,2,0,0,2,0],2))}},B_=new dc,ri=class{constructor(t){this._mesh=new St(B_,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,O_)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var gs=class extends Ke{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof _e?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=si.clone(t.uniforms),this.material=new _e({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new ri(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var er=class extends Ke{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){let s=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},Ro=class extends Ke{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var Co=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let n=t.getSize(new K);this._width=n.width,this._height=n.height,e=new ze(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:gn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new gs(Ao),this.copyPass.material.blending=bn,this.clock=new ds}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let e=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),o.needsSwap){if(n){let a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}er!==void 0&&(o instanceof er?n=!0:o instanceof Ro&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new K);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Po=class extends Ke{constructor(t,e,n=null,s=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new At}render(t,e,n){let s=t.autoClear;t.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),t.autoClear=s}};var mu={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new At(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var _s=class i extends Ke{constructor(t,e,n,s){super(),this.strength=e!==void 0?e:1,this.radius=n,this.threshold=s,this.resolution=t!==void 0?new K(t.x,t.y):new K(256,256),this.clearColor=new At(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new ze(r,o,{type:gn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let f=0;f<this.nMips;f++){let d=new ze(r,o,{type:gn});d.texture.name="UnrealBloomPass.h"+f,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);let u=new ze(r,o,{type:gn});u.texture.name="UnrealBloomPass.v"+f,u.texture.generateMipmaps=!1,this.renderTargetsVertical.push(u),r=Math.round(r/2),o=Math.round(o/2)}let a=mu;this.highPassUniforms=si.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new _e({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];let l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let f=0;f<this.nMips;f++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[f])),this.separableBlurMaterials[f].uniforms.invSize.value=new K(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let h=Ao;this.copyUniforms=si.clone(h.uniforms),this.blendMaterial=new _e({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:Vr,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new At,this.oldClearAlpha=1,this.basic=new rs,this.fsQuad=new ri(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),s=Math.round(e/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new K(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(t,e,n,s,r){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(n),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=o}getSeperableBlurMaterial(t){let e=[];for(let n=0;n<t;n++)e.push(.39894*Math.exp(-.5*n*n/(t*t))/t);return new _e({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new K(.5,.5)},direction:{value:new K(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(t){return new _e({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}};_s.BlurDirectionX=new K(1,0);_s.BlurDirectionY=new K(0,1);var gu={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var Io=class extends Ke{constructor(){super();let t=gu;this.uniforms=si.clone(t.uniforms),this.material=new go({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new ri(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},qt.getTransfer(this._outputColorSpace)===ne&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Zl?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===$l?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Jl?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===js?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Kl?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Ql&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var z_={uniforms:{tDiffuse:{value:null},uTime:{value:0},uVignette:{value:1.15},uGrain:{value:.045}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uGrain;
    varying vec2 vUv;
    void main() {
      vec4 col = texture2D(tDiffuse, vUv);
      // \u6697\u89D2
      vec2 d = vUv - 0.5;
      float vig = smoothstep(0.92, 0.32, length(d) * uVignette * 2.0);
      col.rgb *= mix(0.62, 1.0, vig);
      // \u9897\u7C92
      float g = fract(sin(dot(vUv * (uTime + 13.7), vec2(12.9898, 78.233))) * 43758.5453);
      col.rgb += (g - 0.5) * uGrain;
      gl_FragColor = col;
    }`};function _u(i,t,e,n){let s=new Co(i);s.addPass(new Po(t,e));let r=null;n.bloom&&(r=new _s(new K(window.innerWidth,window.innerHeight),.28,.5,.9),s.addPass(r));let o=new gs(z_);return s.addPass(o),s.addPass(new Io),s.setSize(window.innerWidth,window.innerHeight),{composer:s,bloom:r,grain:o}}function xu(i){let t=new eo({canvas:i,antialias:!0,powerPreference:"high-performance"});t.outputColorSpace=Ue,t.toneMapping=js,t.toneMappingExposure=1,t.shadowMap.enabled=!0,t.shadowMap.type=ql;let e=new io,n=new Be(ye.camera.fov,window.innerWidth/window.innerHeight,ye.camera.near,ye.camera.far),s={renderer:t,scene:e,camera:n,composer:null,bloom:null,grain:null,tier:"high",clock:new ds,updateFns:[],onFrame:null,_fps:[],_fpsWindow:0};return s.setQuality=r=>{let o=ye.quality[r];s.tier=r,t.setPixelRatio(Math.min(window.devicePixelRatio,o.pixelRatioCap)),t.shadowMap.enabled=o.shadows,s.sun&&(s.sun.castShadow=o.shadows),s.sun&&o.shadows&&s.sun.shadow.mapSize.set(o.shadowMap,o.shadowMap);let a=_u(t,e,n,o);s.composer=a.composer,s.bloom=a.bloom,s.grain=a.grain,s.renderer.shadowMap.needsUpdate=!0},s.setQuality("high"),s.render=()=>{s.grain&&(s.grain.uniforms.uTime.value=s.clock.elapsedTime%97),s.composer.render()},s.loop=()=>{requestAnimationFrame(s.loop);let r=Math.min(s.clock.getDelta(),.1);for(let o of s.updateFns)o(r);if(s.onFrame&&s.onFrame(r),s.render(),s._fps.push(1/Math.max(r,1e-4)),s._fpsWindow+=r,s._fpsWindow>3){let o=s._fps.reduce((a,l)=>a+l,0)/s._fps.length;s._fps.length=0,s._fpsWindow=0,o<30&&s.tier!=="low"?s.setQuality(s.tier==="high"?"mid":"low"):o>55&&s.tier==="mid"&&s.setQuality("high")}},window.addEventListener("resize",()=>{n.aspect=window.innerWidth/window.innerHeight,n.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight),s.composer&&s.composer.setSize(window.innerWidth,window.innerHeight)}),t.setSize(window.innerWidth,window.innerHeight),s}var H_=`
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,k_=`
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uSunColor;
uniform vec3 uSunDir;
uniform float uSunGlow;
uniform float uStars;
varying vec3 vDir;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.17, 0.13));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y, -1.0, 1.0);
  float t = pow(smoothstep(-0.08, 0.62, h), 0.78);
  vec3 col = mix(uHorizon, uTop, t);

  // \u592A\u9633\u8F89\u5149 + \u65E5\u76D8
  float sd = max(dot(d, normalize(uSunDir)), 0.0);
  float glow = pow(sd, 8.0) * uSunGlow;
  float disc = smoothstep(0.9992, 0.99965, sd);
  col += uSunColor * glow * 0.85;
  col += uSunColor * disc * 2.2;

  // \u661F\u7A7A(\u4EC5\u591C)
  if (uStars > 0.001 && h > 0.02) {
    vec3 cell = floor(d * 260.0);
    float s = hash(cell);
    if (s > 0.9975) {
      float tw = 0.6 + 0.4 * hash(cell + 7.31);
      col += vec3(0.9, 0.94, 1.0) * uStars * tw * smoothstep(0.02, 0.3, h);
    }
  }
  gl_FragColor = vec4(col, 1.0);
}`;function vu(i){let t={uTop:{value:new At(8825048)},uHorizon:{value:new At(16179124)},uSunColor:{value:new At(16767912)},uSunDir:{value:new P(.4,.5,.2)},uSunGlow:{value:.55},uStars:{value:0}},e=new _e({uniforms:t,vertexShader:H_,fragmentShader:k_,side:Ne,depthWrite:!1,fog:!1}),n=new hs(2600,40,24),s=new St(n,e);s.frustumCulled=!1,s.userData.noOcclude=!0,s.renderOrder=-10,i.add(s);let r=new vo(16767912,2.9);r.castShadow=!0,r.shadow.mapSize.set(2048,2048);let o=r.shadow.camera;o.near=50,o.far=1400,o.left=-380,o.right=380,o.top=320,o.bottom=-320,r.shadow.bias=-6e-4,r.shadow.normalBias=.6,i.add(r),i.add(r.target);let a=new xo(12570856,9073493,.65);i.add(a);let l=new yo(16777215,.2);i.add(l);let c=new no(15983816,.00135);return i.fog=c,{dome:s,sun:r,hemi:a,amb:l,fog:c,uniforms:t,state:null}}var V_=new At,G_=new P;function Ai(i){return V_.set(i)}function W_(i,t){let e=tr.degToRad(i),n=tr.degToRad(t);return G_.set(Math.sin(e)*Math.cos(n),Math.sin(n),Math.cos(e)*Math.cos(n))}var X_=new At,Y_=new At,q_=new At;function Lo(i,t,e,n={}){let s=o=>{let a=i[o]+(t[o]-i[o])*e;return n[o]=a,a},r=o=>(n[o]=q_.copy(X_.set(i[o])).lerp(Y_.set(t[o]),e).getHex(),n[o]);return{az:s("az"),el:s("el"),sunColor:r("sunColor"),sunIntensity:s("sunIntensity"),hemiSky:r("hemiSky"),hemiGround:r("hemiGround"),hemiIntensity:s("hemiIntensity"),amb:s("amb"),fogColor:r("fogColor"),fogDensity:s("fogDensity"),top:r("top"),horizon:r("horizon"),sunGlow:s("sunGlow"),stars:s("stars"),exposure:s("exposure")}}function Ri(i,t,e){i.state=t;let n=W_(t.az,t.el);i.sun.position.copy(n).multiplyScalar(700),i.sun.target.position.set(0,10,0),i.sun.color.copy(Ai(t.sunColor)),i.sun.intensity=t.sunIntensity,i.hemi.color.copy(Ai(t.hemiSky)),i.hemi.groundColor.copy(Ai(t.hemiGround)),i.hemi.intensity=t.hemiIntensity,i.amb.intensity=t.amb,i.fog.color.copy(Ai(t.fogColor)),i.fog.density=t.fogDensity,i.uniforms.uTop.value.copy(Ai(t.top)),i.uniforms.uHorizon.value.copy(Ai(t.horizon)),i.uniforms.uSunColor.value.copy(Ai(t.sunColor)),i.uniforms.uSunDir.value.copy(n),i.uniforms.uSunGlow.value=t.sunGlow,i.uniforms.uStars.value=t.stars,e&&(e.toneMappingExposure=t.exposure)}function Gn(i){let t=i>>>0;return function(){t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function nr(i,t){let e=document.createElement("canvas");return e.width=i,e.height=t,[e,e.getContext("2d")]}function ir(i,{repeat:t=1,srgb:e=!0}={}){let n=new so(i);return n.wrapS=n.wrapT=ks,n.repeat.set(t,t),n.anisotropy=4,e&&(n.colorSpace=Ue),n}function sr(i,t,e,n,s,r){for(let o=0;o<s;o++){let a=n()*t,l=n()*e,c=1+n()*2,h=(n()-.5)*r;i.fillStyle=`rgba(${h>0?255:0},${h>0?255:0},${h>0?255:0},${Math.abs(h)})`,i.fillRect(a,l,c,c)}}function yu({base:i="#cdb891",mortar:t="#8f7f60",blocks:e=[6,5],size:n=256,seed:s=7,weather:r=.18}={}){let[o,a]=nr(n,n);a.fillStyle=i,a.fillRect(0,0,n,n);let l=Gn(s),c=e[0],h=e[1],f=n/c;for(let d=0;d<c;d++){let u=d%2*(n/h/2);for(let m=-1;m<h;m++){let _=n/h,g=m*_+u,p=d*f,b=1-r*l()*.9+r*.2;a.fillStyle=Mu(i,b),a.fillRect(g+1.2,p+1.2,_-2.4,f-2.4)}}a.strokeStyle=t,a.lineWidth=1.6;for(let d=0;d<=c;d++)a.beginPath(),a.moveTo(0,d*f),a.lineTo(n,d*f),a.stroke();for(let d=0;d<c;d++){let u=d%2*(n/h/2);for(let m=0;m<=h;m++){let _=(m*n/h+u)%n;a.beginPath(),a.moveTo(_,d*f),a.lineTo(_,(d+1)*f),a.stroke()}}return sr(a,n,n,l,2200,.16),ir(o)}function Z_({size:i=256,seed:t=11,base:e="#c9b68e",line:n="#93825f"}={}){let[s,r]=nr(i,i);r.fillStyle=e,r.fillRect(0,0,i,i);let o=Gn(t),a=4,l=i/a;r.strokeStyle=n,r.lineWidth=2;for(let c=0;c<=a;c++)r.beginPath(),r.moveTo(c*l,0),r.lineTo(c*l,i),r.stroke(),r.beginPath(),r.moveTo(0,c*l),r.lineTo(i,c*l),r.stroke();for(let c=0;c<a;c++)for(let h=0;h<a;h++){let f=1-o()*.1;r.fillStyle=Mu(e,f),r.fillRect(c*l+2,h*l+2,l-4,l-4)}return sr(r,i,i,o,1600,.13),ir(s)}function $_({size:i=256,seed:t=23}={}){let[e,n]=nr(i,i),s=Gn(t);n.fillStyle="#a8925c",n.fillRect(0,0,i,i);let r=["#b8a26a","#98834e","#c2b077","#8e7c4e","#b09a62"];for(let a=0;a<380;a++){n.fillStyle=r[s()*r.length|0],n.globalAlpha=.16+s()*.2;let l=6+s()*40,c=4+s()*22;n.beginPath(),n.ellipse(s()*i,s()*i,l,c,s()*Math.PI,0,Math.PI*2),n.fill()}n.globalAlpha=1,sr(n,i,i,s,1400,.1);let o=ir(e,{repeat:36});return o.wrapS=o.wrapT=Vs,o}function J_({size:i=256,seed:t=31,base:e="#b9b3a4",vein:n="#8e887a"}={}){let[s,r]=nr(i,i);r.fillStyle=e,r.fillRect(0,0,i,i);let o=Gn(t);r.strokeStyle=n,r.lineWidth=1;for(let a=0;a<26;a++){r.globalAlpha=.12+o()*.2,r.beginPath();let l=o()*i,c=0;for(r.moveTo(l,c);c<i;)c+=6+o()*12,l+=(o()-.5)*16,r.lineTo(l,c);r.stroke()}return r.globalAlpha=1,sr(r,i,i,o,900,.08),ir(s,{repeat:3})}function K_({size:i=256,seed:t=43,base:e="#a49a88"}={}){return yu({base:e,mortar:"#6e6350",blocks:[5,4],size:i,seed:t,weather:.14})}function Q_({size:i=64,seed:t=5}={}){let[e,n]=nr(i,i),s=Gn(t);n.fillStyle="#c2ac82",n.fillRect(0,0,i,i);let r=i/2,o=i/2,a=i*.38;for(let l=0;l<8;l++){let c=l/8*Math.PI*2;n.fillStyle=l%2?"#9d8256":"#b3996b",n.beginPath(),n.ellipse(r+Math.cos(c)*a*.55,o+Math.sin(c)*a*.55,a*.4,a*.24,c,0,Math.PI*2),n.fill()}return n.fillStyle="#8a6f47",n.beginPath(),n.arc(r,o,a*.34,0,Math.PI*2),n.fill(),sr(n,i,i,s,120,.1),ir(e,{repeat:1})}function Mu(i,t){let e=new At(i);return e.multiplyScalar(t),"#"+e.getHexString()}function Su(){let i=yu(),t=K_(),e=Z_(),n=J_(),s=$_(),r=(o,a={})=>new ve({map:o,roughness:.92,metalness:0,...a});return{stone:r(i.clone()),stoneDark:r(t.clone()),paving:r(e.clone(),{roughness:.85}),marble:r(n.clone(),{roughness:.55}),relief:r(i.clone(),{color:14075812,roughness:.9}),rose:r(Q_(),{roughness:.9}),ground:r(s.clone(),{vertexColors:!0}),bark:new ve({color:5916210,roughness:1}),cypress:new ve({color:3033642,roughness:1}),shrub:new ve({color:5726266,roughness:1}),rock:new ve({color:9273196,roughness:1}),goldTrim:new ve({color:13148766,roughness:.45,metalness:.55})}}function Qe(i,t=!1){let e=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},o={},a=i[0].morphTargetsRelative,l=new Ce,c=0;for(let h=0;h<i.length;++h){let f=i[h],d=0;if(e!==(f.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let u in f.attributes){if(!n.has(u))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+u+'" attribute exists among all geometries, or in none of them.'),null;r[u]===void 0&&(r[u]=[]),r[u].push(f.attributes[u]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let u in f.morphAttributes){if(!s.has(u))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[u]===void 0&&(o[u]=[]),o[u].push(f.morphAttributes[u])}if(t){let u;if(e)u=f.index.count;else if(f.attributes.position!==void 0)u=f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,u,h),c+=u}}if(e){let h=0,f=[];for(let d=0;d<i.length;++d){let u=i[d].index;for(let m=0;m<u.count;++m)f.push(u.getX(m)+h);h+=i[d].attributes.position.count}l.setIndex(f)}for(let h in r){let f=bu(r[h]);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,f)}for(let h in o){let f=o[h][0].length;if(f===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<f;++d){let u=[];for(let _=0;_<o[h].length;++_)u.push(o[h][_][d]);let m=bu(u);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(m)}}return l}function bu(i){let t,e,n,s=-1,r=0;for(let c=0;c<i.length;++c){let h=i[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}let o=new t(r),a=new Re(o,e,n),l=0;for(let c=0;c<i.length;++c){let h=i[c];if(h.isInterleavedBufferAttribute){let f=l/e;for(let d=0,u=h.count;d<u;d++)for(let m=0;m<e;m++){let _=h.getComponent(d,m);a.setComponent(d+f,m,_)}}else o.set(h.array,l);l+=h.count*e}return s!==void 0&&(a.gpuType=s),a}function Do(i,t){let e=Math.sin(i*127.1+t*311.7)*43758.5453;return e-Math.floor(e)}function j_(i,t){let e=Math.floor(i),n=Math.floor(t),s=i-e,r=t-n,o=s*s*(3-2*s),a=r*r*(3-2*r),l=Do(e,n),c=Do(e+1,n),h=Do(e,n+1),f=Do(e+1,n+1);return l+(c-l)*o+(h-l)*a+(l-c-h+f)*o*a}function rr(i,t,e=4){let n=0,s=.5,r=1;for(let o=0;o<e;o++)n+=j_(i*r,t*r)*s,s*=.5,r*=2.1;return n}var xs=(i,t,e)=>{let n=Math.min(1,Math.max(0,(e-i)/(t-i)));return n*n*(3-2*n)};function or(i,t){let e=(rr(i*.004+9.7,t*.004+3.1)-.5)*14;e+=(rr(i*.02,t*.02)-.5)*2.2;let n=ye.terrace,s=Math.max(0,Math.abs(i-n.cx)-n.w/2),r=Math.max(0,Math.abs(t-n.cz)-n.d/2),o=Math.hypot(s,r);return e*=xs(12,95,o),e}function tx(i,t){let e=xs(520,1500,i+400)*xs(-800,200,-Math.abs(t-60)+900),n=1-Math.abs(rr(i*.0022+4.2,t*.0022+8.4)*2-1);n=Math.pow(n,1.6);let s=e*n*460,r=xs(750,1600,Math.hypot(i,t));return s+=r*(rr(i*.003+1.3,t*.003+6.6)*.9)*190,s}function vs(i,t){return uc(i,t)?ye.terrace.h:or(i,t)+tx(i,t)*(1-xs(12,95,pc(i,t)))}function pc(i,t){let e=ye.terrace,n=Math.max(0,Math.abs(i-e.cx)-e.w/2),s=Math.max(0,Math.abs(t-e.cz)-e.d/2);return Math.hypot(n,s)}function Eu(i,t){let s=new ni(3600,3600,150,150);s.rotateX(-Math.PI/2);let r=s.attributes.position,o=new Float32Array(r.count*3),a=new At(10324565),l=new At(9272406),c=new At(8221024),h=new At(7036752),f=new At;for(let u=0;u<r.count;u++){let m=r.getX(u),_=r.getZ(u),g=vs(m,_);r.setY(u,g);let p=(vs(m+6,_)-g)*(vs(m,_+6)-g),b=xs(30,120,g);if(f.copy(a).lerp(l,rr(m*.01,_*.01)),b>0){let v=f.clone().lerp(p<0?h:c,b*.85);f.copy(v)}o[u*3]=f.r,o[u*3+1]=f.g,o[u*3+2]=f.b}s.setAttribute("color",new Re(o,3)),s.computeVertexNormals();let d=new St(s,t.ground);return d.receiveShadow=!0,d.userData.noOcclude=!0,i.add(d),sx(i,t),{ground:d}}function ex(){let i=new be(.16,.24,1.6,6);i.translate(0,.8,0);let t=[],e=[3.4,2.8,2,1.3],n=1.2;for(let s=0;s<4;s++){let r=e[s],o=1.5-s*.32,a=new ho(o,r,7);a.translate(0,n+r/2,0),n+=r*.62,t.push(a)}return Qe([i,...t])}function nx(){let i=new po(1,0),t=i.attributes.position,e=Gn(88);for(let n=0;n<t.count;n++)t.setXYZ(n,t.getX(n)*(.7+e()*.5),t.getY(n)*.55*(.7+e()*.5),t.getZ(n)*(.7+e()*.5));return i.computeVertexNormals(),i}function ix(){let i=new fo(1,0),t=i.attributes.position,e=Gn(199);for(let n=0;n<t.count;n++)t.setXYZ(n,t.getX(n)*(.6+e()*.8),t.getY(n)*(.5+e()*.6),t.getZ(n)*(.6+e()*.8));return i.computeVertexNormals(),i}function fc(i,t,e,n,s,r){let o=new ge(t,e,n),a=new Ot,l=new Je,c=new P,h=new P,f=Gn(s),d=0,u=0;for(;d<n&&u<n*30;){u++;let m=(f()-.5)*3200,_=(f()-.5)*3200;if(Math.abs(m)>1560||Math.abs(_)>1560)continue;let g=r(m,_,f);g&&(l.setFromAxisAngle(new P(0,1,0),f()*Math.PI*2),c.set(g.s,g.s,g.s),h.set(m,g.y,_),a.compose(h,l,c),o.setMatrixAt(d++,a))}return o.count=d,o.castShadow=!0,o.receiveShadow=!0,i.add(o),o}function sx(i,t){fc(i,ex(),t.cypress,240,51,(e,n,s)=>{if(pc(e,n)<36)return null;let r=vs(e,n);return r>130||r<-4?null:s()<.5&&Math.abs(e)<620&&Math.abs(n)<480?{y:r,s:.7+s()*1}:s()<.75?{y:r,s:.8+s()*1.6}:null}),fc(i,nx(),t.shrub,210,77,(e,n,s)=>{if(pc(e,n)<30)return null;let r=vs(e,n);return r>110?null:{y:r,s:.8+s()*1.8}}),fc(i,ix(),t.rock,130,13,(e,n,s)=>{let r=vs(e,n);return r<25||r>210?null:{y:r-.3,s:.8+s()*2.6}})}function rx(i){let t=new Vn;t.moveTo(-.13,1.42),t.lineTo(.13,1.42),t.lineTo(.13,1.5),t.lineTo(-.13,1.5),t.closePath();let e=new cs;e.absarc(0,1.28,.15,0,Math.PI*2,!1),t.holes.push(e),t.moveTo(.16,1.16),t.lineTo(.28,.98),t.lineTo(.5,.92),t.lineTo(.5,.78),t.lineTo(.3,.8),t.lineTo(.22,.72),t.lineTo(.34,.36),t.lineTo(.24,0),t.lineTo(.08,0),t.lineTo(.12,.3),t.lineTo(-.14,0),t.lineTo(-.3,0),t.lineTo(-.2,.42),t.lineTo(-.3,.78),t.lineTo(-.24,1.16),t.closePath();let n=new ii(t,{depth:.12,bevelEnabled:!1}),s=o=>Qe([n,o.index?o.toNonIndexed():o],!1);if(i===1){let o=new Pt(.05,1.7,.05);return o.translate(.38,.85,.06),s(o)}let r=new Pt(.34,.05,.14);return r.translate(.42,.95,.06),s(r)}var mc=new Map;function En(i,t,{from:e,to:n,count:s=12,y:r=0,variant:o=0,face:a=[0,1],offset:l=.08,rise:c=0}){let h=`f${o}`;mc.has(h)||mc.set(h,rx(o));let f=mc.get(h),d=new ge(f,t,s),u=Math.atan2(-a[1],a[0]);for(let m=0;m<s;m++){let _=s===1?.5:m/(s-1),g=e[0]+(n[0]-e[0])*_+a[0]*l,p=e[1]+(n[1]-e[1])*_+a[1]*l,b=new Ot().makeRotationY(u);b.setPosition(g,r+c*_,p),d.setMatrixAt(m,b)}return d.castShadow=!1,d.receiveShadow=!0,i.add(d),d}function wu(i,t,{from:e,to:n,y:s,face:r=[0,1],count:o=14,radius:a=.22}){let l=new be(a,a,.08,14),c=new ge(l,t,o),h=new Je().setFromAxisAngle(new P(1,0,0),Math.PI/2),d=new Je().setFromAxisAngle(new P(0,1,0),Math.atan2(r[0],r[1])).multiply(h),u=new Ot;for(let m=0;m<o;m++){let _=o===1?.5:m/(o-1),g=e[0]+(n[0]-e[0])*_+r[0]*.02,p=e[1]+(n[1]-e[1])*_+r[1]*.02;u.compose(new P(g,s,p),d,new P(1,1,1)),c.setMatrixAt(m,u)}return i.add(c),c}function gc(i,t,{from:e,to:n,y:s,face:r=[0,1],width:o=.3,depth:a=.1,rise:l=0}){let c=n[0]-e[0],h=n[1]-e[1],f=Math.hypot(c,h),d=new Pt(f,o,a),u=new St(d,t),m=s+l/2,_=Math.atan2(l,f);u.position.set((e[0]+n[0])/2+r[0]*a,m,(e[1]+n[1])/2+r[1]*a),u.rotation.y=Math.atan2(-h,c);let g=new P(0,1,0).cross(new P(c,0,h).normalize());return l!==0&&u.rotateOnWorldAxis(g.normalize(),-_),u.receiveShadow=!0,i.add(u),u}function Tu(i,t){let e=ye.terrace,n=new ce,s=t.stone.map.clone();s.repeat.set(56,2.2),s.needsUpdate=!0;let r=new ve({map:s,roughness:.95}),o=new St(new Pt(e.w,e.h,e.d),r);o.position.set(e.cx,e.h/2,e.cz),o.receiveShadow=!0,o.castShadow=!0,n.add(o);let a=t.paving.map.clone();a.repeat.set(38,26),a.needsUpdate=!0;let l=new ve({map:a,roughness:.86}),c=new St(new ni(e.w,e.d),l);c.rotation.x=-Math.PI/2,c.position.set(e.cx,e.h+.02,e.cz),c.receiveShadow=!0,n.add(c);let h=t.stoneDark,f=new St(new Pt(e.w+2.4,1.1,e.d+2.4),h);f.position.set(e.cx,e.h+.55,e.cz),f.castShadow=!0,n.add(f);for(let d of ms){let[u,m,_,g]=d.rect,p=new St(new Pt(_+6,.9,g+6),t.stone);p.position.set(u,e.h+.45,m),p.receiveShadow=!0,p.castShadow=!0,n.add(p)}return n.add(ox(t)),i.add(n),{group:n}}function ox(i){let t=ye.grandStair,e=ye.terrace,n=new ce,s=(t.rampWidth+t.rampGap)/2,r=i.stone.map.clone();r.repeat.set(1,1),r.needsUpdate=!0;let o=new ve({map:r,roughness:.9});for(let l of[-1,1]){let c=t.zCenter+l*(t.rampGap/2+t.rampWidth/2),h=c-t.rampWidth/2,f=c+t.rampWidth/2,d=t.steps,u=e.h/d,m=t.run/d,_=[];for(let L=0;L<d;L++){let T=t.cx-t.run+(L+1)*m-m/2,C=(L+1)*u,A=new Pt(m+.15,C,f-h);A.translate(T,C/2,c),_.push(A)}let g=new Pt(t.run,2.4,f-h);g.translate(t.cx-t.run/2,1.2,c),_.push(g);let p=new St(Qe(_),o);p.castShadow=!0,p.receiveShadow=!0,n.add(p);let b=[];for(let L=0;L<d;L++){let T=t.cx-t.run+(L+1)*m-m/2,C=(L+1)*u,A=new Pt(m+.15,t.parapetH,1.3);A.translate(T,C+t.parapetH/2,c+l*(t.rampWidth/2+.65)),b.push(A)}let v=new St(Qe(b),o);v.castShadow=!0,v.receiveShadow=!0,n.add(v);let x=c+l*(t.rampWidth/2+.65+.06);En(n,i.relief,{from:[t.cx-t.run+2,x],to:[t.cx-1,x],count:18,y:1.45,variant:0,face:[0,l],offset:l*.06,rise:e.h}),En(n,i.relief,{from:[t.cx-t.run+2,x],to:[t.cx-1,x],count:18,y:2.35,variant:1,face:[0,l],offset:l*.06,rise:e.h})}let a=new St(new Pt(t.run,t.parapetH+1.1,t.rampGap),i.stoneDark);return a.position.set(t.cx-t.run/2,e.h/2+.9,t.zCenter),a.rotation.z=Math.atan2(e.h,t.run),a.castShadow=!0,a.receiveShadow=!0,n.add(a),n}var Nv=new Ot;function ax(i=1.5,t=1,e=.8){let n=a=>a/1.42*i,s=a=>a*t,r=new Vn;r.moveTo(n(0),s(.95)),r.quadraticCurveTo(n(.35),s(1.05),n(.62),s(.98)),r.quadraticCurveTo(n(.9),s(.9),n(1.05),s(.78)),r.quadraticCurveTo(n(1.22),s(.62),n(1.3),s(.42)),r.quadraticCurveTo(n(1.36),s(.3),n(1.28),s(.24)),r.lineTo(n(1.14),s(.26)),r.quadraticCurveTo(n(1),s(.28),n(.94),s(.2)),r.lineTo(n(.9),0),r.lineTo(n(.76),0),r.lineTo(n(.78),s(.3)),r.quadraticCurveTo(n(.6),s(.38),n(.42),s(.36)),r.lineTo(n(.38),0),r.lineTo(n(.24),0),r.lineTo(n(.28),s(.42)),r.quadraticCurveTo(n(.1),s(.5),n(.05),s(.7)),r.closePath();let o=new ii(r,{depth:e,bevelEnabled:!0,bevelThickness:.04,bevelSize:.04,bevelSegments:1});return o.translate(0,0,-e/2),o}function lx(i,t,e,n=40,s=56){let r=new be(t,i,e,s,6,!1),o=r.attributes.position;for(let a=0;a<o.count;a++){let l=o.getX(a),c=o.getZ(a),h=o.getY(a);if(h>e/2-.05||h<-e/2+.05)continue;let f=Math.atan2(c,l),d=1-.05*Math.pow(Math.cos(f*n*.5)*.5+.5,1.2);o.setX(a,l*d),o.setZ(a,c*d)}return r.computeVertexNormals(),r.translate(0,e/2,0),r}function cx(i){let t=[new K(0,0),new K(i*1.28,0),new K(i*1.32,.25),new K(i*1.18,.55),new K(i*.98,.95),new K(i*.92,1.3),new K(i*1.06,1.55),new K(i*1.12,1.75),new K(i*1.02,1.9),new K(i*.9,2)];return new co(t,40)}var _c=new Map;function We(i,t="bull"){let e=`${i}|${t}`;if(_c.has(e))return _c.get(e);let n=[],s=i*.055;n.push(cx(s));let r=s*.95,o=s*.62,a=t==="bull"?i*.24:i*.12,l=i-2-a,c=lx(r,o,l);c.translate(0,2,0),n.push(c);let h=new mo(o*1.15,o*.14,8,40);if(h.rotateX(Math.PI/2),h.translate(0,2+l+.1,0),n.push(h),t==="bull"){let u=new be(o*1.08,o*1.3,a*.26,32);u.translate(0,2+l+a*.14,0),n.push(u);let m=new Pt(i*.15,a*.26,i*.3);m.translate(0,2+l+a*.4,0),n.push(m);let _=i*.16,g=i*.115,p=i*.07;for(let b of[1,-1]){let v=ax(_,g,p);b===-1&&v.rotateY(Math.PI),v.translate(0,2+l+a*.55+g*.53,b*p*.55),n.push(v)}}else{let u=new Pt(i*.16,a,i*.16);u.translate(0,2+l+a/2,0),n.push(u)}let f=n.map(u=>u.index?u.toNonIndexed():u),d=Qe(f,!1);return d.computeBoundingSphere(),_c.set(e,d),d}function Au(i,t){let e=new be(t*.92,t*1.12,i,20,3,!1),n=e.attributes.position,s=r=>Math.abs(Math.sin(r*127.13+i*31.7))*.35;for(let r=0;r<n.count;r++)n.getY(r)>i/2-.01&&n.setY(r,i/2+(s(r)-.12)*t*2.2);return e.computeVertexNormals(),e}function xc(i,t,e,n,s,r,o,a=0){let l=new St(new Pt(i,t,e),o);return l.position.set(n,s,r),l.rotation.y=a,l.castShadow=!0,l.receiveShadow=!0,l}function hx(){let i=new Vn;return i.moveTo(0,0),i.bezierCurveTo(.5,.65,1.4,.9,2.3,.62),i.lineTo(2.3,.28),i.bezierCurveTo(1.5,.42,.7,.22,.12,-.28),i.closePath(),i}function Ru(i=1){let t=[],e=(v,x,L,T,C=0,A=0)=>{C&&v.rotateX(C),A&&v.rotateY(A),v.translate(x,L,T),t.push(v)},s=new be(.78,.92,3.8,12);s.rotateZ(Math.PI/2),s.scale(1,1,.62),e(s,-.3,4.6*.5,0);let r=new be(.82,.95,1.5,12);r.rotateZ(Math.PI/2),r.scale(1,1,.72),e(r,1.55,4.6*.47,0);let o=new Pt(4.3,.42,1.3);e(o,-.3,4.6*.67,0);let a=new Pt(.5,4.6*.42,.52);e(a.clone(),1.5,4.6*.21,.44),e(a.clone(),1.5,4.6*.21,-.44),e(a.clone(),-1.8,4.6*.21,.5),e(a.clone(),-1.8,4.6*.21,-.5);let l=new Pt(.58,.2,.58);e(l.clone(),1.5,.1,.44),e(l.clone(),1.5,.1,-.44),e(l.clone(),-1.8,.1,.5),e(l.clone(),-1.8,.1,-.5);let c=new be(.42,.5,1.3,10);c.rotateZ(.5),e(c,1.95,4.6*.68,0);let h=new hs(.46,12,10);e(h,2.35,4.6*.82,0);let f=new Pt(.34,.5,.34);e(f,2.62,4.6*.79,0);let d=new Pt(.22,.72,.3);e(d,2.55,4.6*.6,0);let u=new be(.42,.44,.5,12);e(u,2.35,4.6*.96,0);let m=new be(.5,.42,.34,12);e(m,2.35,4.6*1.12,0);for(let v of[.14,-.14]){let x=new be(.09,.13,.44,8);x.rotateX(Math.PI/2.6),e(x,2.42,4.6*1.2,v)}let _=new ii(hx(),{depth:.16,bevelEnabled:!1});_.scale(1.6,1.9,1),e(_,-1,4.6*.52,.78),e(_.clone(),-1,4.6*.52,-.94);let g=new be(.16,.1,.9,8);g.rotateX(Math.PI/2.4),e(g,-2.5,4.6*.62,0);let p=t.map(v=>v.index?v.toNonIndexed():v),b=Qe(p,!1);return b.computeVertexNormals(),b.computeBoundingSphere(),i!==1&&b.scale(i,i,i),b}function vc(i,t,e,n,s,r=1,o=5.5){let a=new ce;for(let l of[1,-1]){let c=new St(i,t);c.position.set(e,n,s+l*o),c.rotation.y=r>0?-Math.PI/2:Math.PI/2,c.castShadow=!0,c.receiveShadow=!0,a.add(c)}return a}var on=-160,an=-30;function Cu(i){let{scene:t,mats:e,addCollider:n}=i,s=16.7,r=new ce,o=new St(new Pt(30,1.4,30),e.stone);o.position.set(on,s-.7,an),o.receiveShadow=!0,o.castShadow=!0,r.add(o);let a=8.6,l=2.2,c=27,h=e.stone.map.clone();h.repeat.set(6,4),h.needsUpdate=!0;let f=new ve({map:h,roughness:.95}),d=new ve({color:7298883,roughness:.9});for(let b of[-1,1]){let v=new St(new Pt(c,a,l),f);v.position.set(on,s+a/2,an+b*c/2),v.castShadow=!0,v.receiveShadow=!0,r.add(v)}for(let b of[-1,1]){let v=(c-6)/2;for(let L of[-1,1]){let T=new St(new Pt(l,a,v),f);T.position.set(on+b*(c/2),s+a/2,an+L*(3+v/2)),T.castShadow=!0,T.receiveShadow=!0,r.add(T)}let x=new St(new Pt(l+.6,2.4,6.4),f);x.position.set(on+b*(c/2),s+a+1.2,an),x.castShadow=!0,x.receiveShadow=!0,r.add(x);for(let L of[-1,1]){let T=new St(new Pt(.24,5.4,.3),d);T.position.set(on+b*(c/2+.05),s+4.4,an+L*3.3),r.add(T)}}let u=We(16.5,"bull"),m=new ge(u,e.stone,4),_=new Ot,g=0;for(let b of[-6,6])for(let v of[-6,6])_.identity(),_.setPosition(on+b,s,an+v),m.setMatrixAt(g++,_);m.castShadow=!0,m.receiveShadow=!0,r.add(m),r.add(xc(20,1.8,3.4,on,s+17.6,an+6,e.stoneDark)),r.add(xc(20,1.8,3.4,on,s+17.6,an-6,e.stoneDark));let p=Ru(1.15);return r.add(vc(p,e.stone,on-4.6,s,an,-1)),r.add(vc(p,e.stone,on+4.6,s,an,1)),t.add(r),n({minX:on-15,maxX:on+15,minZ:an-15,maxZ:an+15,doorW:3}),{group:r}}var Ee=-30,je=45,Uo=18.2,Wn=3.2;function Pu(i){let{scene:t,mats:e,addCollider:n}=i,s=new ce;for(let u=0;u<3;u++){let m=85-u*6,_=new St(new Pt(m,.77,m),e.stone);_.position.set(Ee,15.9+u*.77,je),_.castShadow=!0,_.receiveShadow=!0,s.add(_)}let r=We(18.6,"bull"),o=new ge(r,e.stone,36),a=new Ot,l=0;for(let u=0;u<6;u++)for(let m=0;m<6;m++)a.identity(),a.setPosition(Ee+(m-2.5)*11,Uo,je+(u-2.5)*11),o.setMatrixAt(l++,a);o.castShadow=!0,o.receiveShadow=!0,s.add(o);let c=We(15.5,"bull"),h=new ge(c,e.stone,24);l=0;let f=(u,m)=>{a.identity(),a.setPosition(u,Uo,m),h.setMatrixAt(l++,a)},d=33;for(let u of[-10,10])f(Ee-d,je+u),f(Ee-d-7,je+u),f(Ee+d,je+u),f(Ee+d+7,je+u),f(Ee+u,je+d),f(Ee+u,je+d+7);h.castShadow=!0,h.receiveShadow=!0,s.add(h);for(let u of[-1,1]){let m=new St(new Pt(11,14,11),e.stone);m.position.set(Ee+u*(d+3.5),Uo+7,je+d+3.5),m.castShadow=!0,m.receiveShadow=!0,s.add(m);let _=new St(new Pt(12,1.2,12),e.stoneDark);_.position.set(Ee+u*(d+3.5),Uo+14.6,je+d+3.5),s.add(_)}return s.add(ux(e)),t.add(s),n({minX:Ee-44,maxX:Ee+44,minZ:je-44,maxZ:je+44,doorS:!0}),{group:s}}function ux(i){let t=new ce,e=13,n=12,s=6,r=15,o=je-42.5,a=16,l=[];for(let u of[-1,1])for(let m=0;m<a;m++){let _=Wn*(m+1)/a,g=Ee+u*(s/2+e/2),p=o-n*(m+1)/(2*a);l.push(new Pt(e,_,n*(m+1)/a).translate(g,r+_/2,p));let b=Ee+u*(s/2+e+.8);l.push(new Pt(1.6,_+1.4,n*(m+1)/a).translate(b,r+(_+1.4)/2,p))}let c=new ve({map:i.stone.map.clone(),roughness:.92}),h=new St(Qe(l,!1),c);h.castShadow=!0,h.receiveShadow=!0,t.add(h);let f=new St(new Pt(s-1,Wn+.6,n+.8),i.stoneDark);f.position.set(Ee,r+(Wn+.6)/2,o-n/2),f.castShadow=!0,t.add(f);let d=i.relief;for(let u of[-1,1]){let m=o-n+1,_=o-.5,g=Ee+u*(s/2+e+1.68);En(t,d,{from:[g,m],to:[g,_],count:8,y:r+.95,variant:0,face:[u,0],offset:u*.08,rise:Wn}),En(t,d,{from:[g,m],to:[g,_],count:8,y:r+2.15,variant:1,face:[u,0],offset:u*.08,rise:Wn}),gc(t,i.stoneDark,{from:[g,m],to:[g,_],y:r+2.9,face:[u,0],width:.22,depth:u*.08,rise:Wn}),gc(t,i.stoneDark,{from:[g,m],to:[g,_],y:r+.45,face:[u,0],width:.22,depth:u*.08,rise:Wn});let p=Ee+u*(s/2+e);En(t,d,{from:[p,m],to:[p,_],count:8,y:r+1,variant:1,face:[-u,0],offset:0,rise:Wn})}return wu(t,i.rose,{from:[Ee-2.2,o-n+3],to:[Ee+2.2,o-n+3],y:r+Wn-.5,face:[0,-1],count:4}),t}function xn(i,t,{w:e,h:n,d:s,x:r,y:o,z:a,rotY:l=0}){let c=new ce,h=new Pt(s,n,s);for(let u of[-1,1]){let m=new St(h,i);m.position.set(u*(e/2+s/2),n/2,0),m.castShadow=!0,m.receiveShadow=!0,c.add(m)}let f=new St(new Pt(e+s*2,s*.9,s),i);f.position.set(0,n+s*.45,0),f.castShadow=!0,f.receiveShadow=!0,c.add(f);for(let u of[-1,1]){let m=new St(new Pt(.18,n*.62,.12),t);m.position.set(u*(e/2+.1),n*.42,s/2+.02),c.add(m)}let d=new St(new Pt(e*.86,.18,.12),t);return d.position.set(0,n-s*.7,s/2+.02),c.add(d),c.position.set(r,o,a),c.rotation.y=l,c}function wn(i,{x:t,z:e,w:n,d:s,h:r,rotY:o=0}){let a=new St(new Pt(n,r,s),i);return a.position.set(t,r/2,e),a.rotation.y=o,a.castShadow=!0,a.receiveShadow=!0,a}var Ci=140,Pi=55,No=18.3;function Iu(i){let{scene:t,mats:e,addCollider:n}=i,s=new ce;for(let u=0;u<3;u++){let m=75-u*5,_=new St(new Pt(m,.8,m),e.stoneDark);_.position.set(Ci,15.9+u*.8,Pi),_.castShadow=!0,_.receiveShadow=!0,s.add(_)}let r=We(22,"bull"),o=new ge(r,e.stoneDark,100),a=new Ot,l=0;for(let u=0;u<10;u++)for(let m=0;m<10;m++)a.identity(),a.setPosition(Ci+(m-4.5)*6.9,No,Pi+(u-4.5)*6.9),o.setMatrixAt(l++,a);o.castShadow=!0,o.receiveShadow=!0,s.add(o),s.add(xn(e.stoneDark,e.goldTrim,{w:7,h:11,d:2.4,x:Ci,y:No,z:Pi-34,rotY:0})),s.add(xn(e.stoneDark,e.goldTrim,{w:7,h:11,d:2.4,x:Ci+34,y:No,z:Pi,rotY:Math.PI/2}));let c=new ve({map:e.stone.map.clone(),roughness:.95});c.map.repeat.set(10,1),c.map.needsUpdate=!0;let h=72,f=1.8,d=3.2;for(let[u,m,_,g]of[[0,-h/2,h,0],[0,h/2,h,0],[-h/2,0,h,Math.PI/2],[h/2,0,h,Math.PI/2]]){let p=new St(new Pt(_,d,f),c);p.position.set(Ci+u,No+d/2,Pi+m),p.rotation.y=g,p.castShadow=!0,p.receiveShadow=!0,s.add(p)}return t.add(s),n({minX:Ci-36,maxX:Ci+36,minZ:Pi-36,maxZ:Pi+36,doorS:!0,doorE:!0}),{group:s}}function Lu(i){let{scene:t,mats:e,addCollider:n}=i,s=148,r=122,o=15.9,a=new ce,l=We(12.5,"plain"),c=Au(4.5,.75),h=L=>{let T=Math.sin(L*12.9898+s*7.7+r*3.1)*43758.5453;return T-Math.floor(T)},f=0,d=0,u=10,m=5,_=10,g=9,p=u*m,b=new ge(l,e.stone,p),v=new ge(c,e.stoneDark,p),x=new Ot;for(let L=0;L<m;L++)for(let T=0;T<u;T++){let C=s+(T-(u-1)/2)*_,A=r+(L-(m-1)/2)*g;x.identity(),x.setPosition(C,o,A),h(L*u+T)<.45?b.setMatrixAt(f++,x):v.setMatrixAt(d++,x)}b.count=f,v.count=d,b.castShadow=!0,b.receiveShadow=!0,v.castShadow=!0,v.receiveShadow=!0,a.add(b),a.add(v);for(let L=0;L<=m;L++){let T=r+(L-m/2)*g-g/2;a.add(wn(e.stoneDark,{x:s,z:T,w:u*_,d:1.4,h:2.6}))}return a.add(wn(e.stone,{x:s,z:r-28,w:100,d:1.6,h:4.2})),a.add(wn(e.stone,{x:s,z:r+28,w:100,d:1.6,h:3.4})),t.add(a),n({minX:s-55,maxX:s+55,minZ:r-30,maxZ:r+30,doorW:!0}),{group:a}}function Du(i){let{scene:t,mats:e,addCollider:n}=i,s=62,r=-18,o=16.2,a=new ce,l=new St(new Pt(17,.8,17),e.stone);l.position.set(s,o-.4,r),l.receiveShadow=!0,l.castShadow=!0,a.add(l);let c=We(11,"bull"),h=new ge(c,e.stone,4),f=new Ot,d=0;for(let u of[-4.5,4.5])for(let m of[-4.5,4.5])f.identity(),f.setPosition(s+u,o,r+m),h.setMatrixAt(d++,f);return h.castShadow=!0,h.receiveShadow=!0,a.add(h),a.add(xn(e.stone,e.rose,{w:4.4,h:7,d:1.7,x:s,y:o,z:r-7.5})),a.add(xn(e.stone,e.rose,{w:4.4,h:7,d:1.7,x:s-7.5,y:o,z:r,rotY:Math.PI/2})),a.add(xn(e.stone,e.rose,{w:4.4,h:7,d:1.7,x:s+7.5,y:o,z:r,rotY:Math.PI/2})),t.add(a),n({minX:s-8.5,maxX:s+8.5,minZ:r-8.5,maxZ:r+8.5}),{group:a}}function Uu(i){let{scene:t,mats:e,addCollider:n}=i,s=-178,r=-85,o=17.4,a=new ce;for(let d=0;d<2;d++){let u=34-d*4,m=new St(new Pt(u,.75,27-d*3),e.marble);m.position.set(s,15.9+d*.75,r),m.castShadow=!0,m.receiveShadow=!0,a.add(m)}let l=We(11,"bull"),c=new ge(l,e.marble,12),h=new Ot,f=0;for(let d=0;d<3;d++)for(let u=0;u<4;u++)h.identity(),h.setPosition(s+(u-1.5)*5.4,o,r-3+d*5.6),c.setMatrixAt(f++,h);c.castShadow=!0,c.receiveShadow=!0,a.add(c);for(let d=0;d<2;d++)for(let u=0;u<4;u++){let m=new St(We(9.5,"bull"),e.marble);m.position.set(s+(u-1.5)*5.4,o,r-10.5+d*2.6),m.castShadow=!0,m.receiveShadow=!0,a.add(m)}return a.add(xn(e.marble,e.rose,{w:3.6,h:6.5,d:1.5,x:s-6,y:o,z:r+10.8})),a.add(xn(e.marble,e.rose,{w:3.6,h:6.5,d:1.5,x:s+6,y:o,z:r+10.8})),a.add(xn(e.marble,e.rose,{w:3.6,h:6.5,d:1.5,x:s-12.5,y:o,z:r+3,rotY:Math.PI/2})),a.add(wn(e.marble,{x:s-13.5,z:r+12,w:9,d:1.5,h:8})),a.add(wn(e.marble,{x:s+13.5,z:r+12,w:9,d:1.5,h:8})),En(a,e.relief,{from:[s-8.6,r+13.2],to:[s-4.4,r+13.2],count:3,y:o+.1,variant:1,face:[0,1],offset:.5}),En(a,e.relief,{from:[s+4.4,r+13.2],to:[s+8.6,r+13.2],count:3,y:o+.1,variant:1,face:[0,1],offset:.5}),t.add(a),n({minX:s-17,maxX:s+17,minZ:r-14,maxZ:r+14,doorN:!0}),{group:a}}function Nu(i){let{scene:t,mats:e,addCollider:n}=i,s=-42,r=-102,o=17,a=new ce,l=new St(new Pt(42,1.1,30),e.stone);l.position.set(s,o-.55,r),l.receiveShadow=!0,l.castShadow=!0,a.add(l);let c=We(13,"bull"),h=new ge(c,e.stone,36),f=new Ot,d=0;for(let u=0;u<6;u++)for(let m=0;m<6;m++)f.identity(),f.setPosition(s+(m-2.5)*6.2,o,r+(u-2.5)*4.6),h.setMatrixAt(d++,f);return h.castShadow=!0,h.receiveShadow=!0,a.add(h),a.add(xn(e.stone,e.rose,{w:5,h:8,d:2,x:s,y:o,z:r+14.5})),a.add(wn(e.stone,{x:s-16,z:r+14.8,w:10,d:1.6,h:7})),a.add(wn(e.stone,{x:s+16,z:r+14.8,w:10,d:1.6,h:7})),t.add(a),n({minX:s-21,maxX:s+21,minZ:r-15,maxZ:r+15,doorN:!0}),{group:a}}function Fu(i){let{scene:t,mats:e,addCollider:n}=i,s=-196,r=55,o=16.8,a=new ce,l=new St(new Pt(22,.9,60),e.stone);l.position.set(s,o-.45,r),l.receiveShadow=!0,l.castShadow=!0,a.add(l);let c=We(9.5,"plain"),h=new ge(c,e.stone,6),f=new Ot;for(let d=0;d<6;d++)f.identity(),f.setPosition(s+8.5,o,r-20+d*8),h.setMatrixAt(d,f);return h.castShadow=!0,h.receiveShadow=!0,a.add(h),a.add(wn(e.stone,{x:s-4,z:r,w:13,d:52,h:8.5})),t.add(a),n({minX:s-11,maxX:s+11,minZ:r-26,maxZ:r+26}),{group:a}}var yc=_n.golden,dx=_n.dawn,Mc=_n.afternoon,fx=_n.sunset,ke=[{id:"prologue",num:"\u5E8F\u7AE0",seal:"\u5929",title:"\u5C71\u4E0B\u5E73\u539F",en:"THE PLAIN BELOW",day:dx,fov:60,poi:[0,18,0],building:"\u6CE2\u65AF\u6CE2\u5229\u65AF",paras:["\u4E24\u5343\u4E94\u767E\u5E74\u524D,\u5728\u4ECA\u4F0A\u6717\u5357\u90E8\u7684\u9AD8\u539F\u8FB9\u7F18,\u4E00\u5EA7\u57CE\u5728\u5C71\u811A\u4E0B\u751F\u957F\u3002","\u5B83\u7531\u5927\u6D41\u58EB\u4E00\u4E16\u8087\u5EFA,\u5386\u7ECF\u859B\u897F\u65AF\u4E0E\u963F\u5854\u859B\u897F\u65AF\u4E09\u4EE3\u8425\u7B51,\u662F\u963F\u5951\u7F8E\u5C3C\u5FB7\u738B\u671D\u7684\u793C\u4EEA\u4E4B\u90FD\u3002","\u6CBF\u7740\u811A\u4E0B\u8FD9\u6761\u5927\u9053,\u5C06\u767B\u4E0A\u90A3\u5EA7\u5341\u4E94\u7C73\u9AD8\u7684\u77F3\u780C\u53F0\u5730\u3002"],kfs:[{p:[-560,150,-460]},{p:[-380,95,-280]},{p:[-310,48,-140]},{p:[-282,24,-66]}]},{id:"gate",num:"\u7B2C\u4E00\u7AE0",seal:"\u95E8",title:"\u4E07\u56FD\u95E8",en:"GATE OF ALL NATIONS",day:yc,fov:52,poi:[-166,20,-30],poiAt:.8,building:"\u4E07\u56FD\u95E8",paras:["\u767B\u4E0A\u53CC\u9636,\u4FBF\u662F\u859B\u897F\u65AF\u4E00\u4E16\u5174\u5EFA\u7684\u300C\u4E07\u56FD\u95E8\u300D\u2014\u2014\u5E1D\u56FD\u56DB\u65B9\u4F7F\u8282\u7684\u5165\u57CE\u4E4B\u95E8\u3002","\u95E8\u6D1E\u4E24\u4FA7\u8E72\u8E1E\u7740\u4EBA\u9996\u7FFC\u725B\u50CF\u62C9\u739B\u82CF,\u94ED\u6587\u4EE5\u4E09\u79CD\u6587\u5B57\u5BA3\u544A:\u8FD9\u662F\u4E07\u56FD\u4E4B\u95E8\u3002","\u7A7F\u8FC7\u5E7D\u6697\u7684\u95E8\u5385,\u5927\u5385\u56DB\u67F1\u64CE\u5929,\u5149\u7EBF\u4ECE\u4E1C\u95E8\u6D8C\u5165,\u8FCE\u63A5\u6BCF\u4E00\u4F4D\u6765\u4F7F\u3002"],kfs:[{p:[-268,7.5,13]},{p:[-246,13.6,11]},{p:[-225,17.3,9.4]},{p:[-186,17.5,-30]},{p:[-160,18,-30]},{p:[-140,18,-34]}]},{id:"stairway",num:"\u7B2C\u4E8C\u7AE0",seal:"\u9636",title:"\u4F7F\u8282\u9636\u68AF",en:"THE STAIRWAY OF ENVOYS",day:yc,fov:48,poi:[-43.4,17.6,-3],poiAt:.9,building:"\u963F\u5E15\u8FBE\u7EB3\u5BAB",paras:["\u963F\u5E15\u8FBE\u7EB3\u5BAB\u5357\u9762\u7684\u53CC\u9636\u62A4\u58C1\u4E0A,\u954C\u523B\u7740\u5E1D\u56FD\u6700\u8457\u540D\u7684\u6D6E\u96D5\u957F\u5377\u3002","\u4E8C\u5341\u4E09\u4E2A\u5C5E\u56FD\u4F7F\u8282\u6367\u7740\u8D21\u54C1\u3001\u7275\u7740\u826F\u9A79,\u5217\u961F\u800C\u884C;\u6CE2\u65AF\u4E0E\u7C73\u5E95\u536B\u5175\u6301\u77DB\u76F8\u8FCE\u3002","\u8863\u8936\u3001\u53D1\u5377\u4E0E\u7EDC\u8F94\u7EA4\u6BEB\u6BD5\u73B0\u2014\u2014\u8FD9\u662F\u6CE2\u65AF\u6CE2\u5229\u65AF\u7559\u7ED9\u4E16\u754C\u7684\u300C\u77F3\u4E0A\u53F2\u8BB0\u300D\u3002"],kfs:[{p:[-96,18,-40]},{p:[-64,17.6,-20]},{p:[-40,16.9,-14]},{p:[-30,20.8,4]}]},{id:"apadana",num:"\u7B2C\u4E09\u7AE0",seal:"\u67F1",title:"\u963F\u5E15\u8FBE\u7EB3\u5BAB",en:"APADANA \xB7 THE AUDIENCE HALL",day:yc,fov:56,poi:[-30,24,45],building:"\u963F\u5E15\u8FBE\u7EB3\u5BAB",poiAt:.6,paras:["\u5927\u6D41\u58EB\u4E0E\u859B\u897F\u65AF\u7684\u89D0\u89C1\u5927\u5385:\u516D\u5341\u7C73\u89C1\u65B9,\u66FE\u7ACB\u4E03\u5341\u4E8C\u6839\u77F3\u67F1,\u53EF\u5BB9\u4E07\u4EBA\u3002","\u5341\u516B\u7C73\u9AD8\u7684\u67F1\u8EAB\u81EA\u83B2\u74E3\u949F\u5F62\u67F1\u7840\u62D4\u8D77,\u67F1\u5934\u662F\u4E00\u5BF9\u80CC\u9A6E\u6A2A\u6881\u7684\u53CC\u725B\u3002","\u6BCF\u9022\u6CE2\u65AF\u65B0\u5E74,\u4E07\u56FD\u4F7F\u8282\u81EA\u6B64\u89D0\u89C1\u300C\u738B\u4E2D\u4E4B\u738B\u300D,\u91D1\u5E37\u853D\u65E5,\u9999\u70DF\u7F2D\u7ED5\u3002"],kfs:[{p:[-30,20.5,20]},{p:[-30,20.5,45]},{p:[-48,20.5,60]}]},{id:"throne",num:"\u7B2C\u56DB\u7AE0",seal:"\u767E",title:"\u767E\u67F1\u5385",en:"HALL OF A HUNDRED COLUMNS",day:Mc,fov:50,poi:[140,24,55],poiAt:.75,building:"\u767E\u67F1\u5385",paras:["\u859B\u897F\u65AF\u4E4B\u5B50\u963F\u5854\u859B\u897F\u65AF\u4E00\u4E16\u7684\u300C\u767E\u67F1\u5385\u300D,\u5341\u4E58\u5341\u7684\u67F1\u9635\u6491\u8D77\u5E1D\u56FD\u7684\u884C\u653F\u4E2D\u67A2\u3002","\u8FD9\u91CC\u68C0\u9605\u8FC7\u300C\u4E0D\u6B7B\u519B\u300D,\u4E5F\u88C1\u51B3\u8FC7\u5E1D\u56FD\u4E8C\u5341\u4E8C\u4E2A\u884C\u7701\u7684\u8D21\u8D4B\u8D26\u518C\u3002","\u95E8\u6963\u4E0A,\u738B\u4E0E\u6076\u9B54\u4E4B\u5F71\u640F\u6597\u7684\u6D6E\u96D5,\u5B88\u62A4\u7740\u8FD9\u5EA7\u81F3\u9AD8\u6743\u529B\u7684\u6BBF\u5802\u3002"],kfs:[{p:[-10,26.5,30]},{p:[40,25,-10]},{p:[100,23,10]},{p:[140,22,30]},{p:[140,21,50]}]},{id:"treasury",num:"\u7B2C\u4E94\u7AE0",seal:"\u5E93",title:"\u738B\u5BA4\u56FD\u5E93",en:"ROYAL TREASURY",day:Mc,fov:50,poi:[148,19,122],poiAt:.7,building:"\u738B\u5BA4\u56FD\u5E93",paras:["\u767E\u67F1\u5385\u4E4B\u540E,\u662F\u5E1D\u56FD\u8D22\u5BCC\u7684\u5FC3\u810F\u2014\u2014\u738B\u5BA4\u56FD\u5E93,\u66FE\u85CF\u6709\u8FD1\u5343\u6839\u67F1\u5B50\u652F\u6491\u7684\u5E93\u623F\u3002","\u5404\u90A6\u8D21\u8D4B\u81F3\u6B64\u7194\u94F8\u4E3A\u91D1\u6761\u4E0E\u94F6\u952D,\u94ED\u6587\u6CE5\u677F\u5728\u9ED1\u6697\u4E2D\u9759\u9759\u8BB0\u8D26\u3002","\u540E\u6765,\u4E9A\u5386\u5C71\u5927\u7684\u58EB\u5175\u4ECE\u8FD9\u91CC\u9A6E\u8D70\u4E86\u4E09\u5343\u9A7C\u91D1\u94F6\u2014\u2014\u5E1D\u56FD\u7684\u9EC4\u660F\u7531\u6B64\u5F00\u59CB\u3002"],kfs:[{p:[184,19.5,55]},{p:[186,22.5,90]},{p:[162,19,112]},{p:[148,18.3,122]},{p:[118,19,132]}]},{id:"palaces",num:"\u7B2C\u516D\u7AE0",seal:"\u5BAB",title:"\u738B\u5BA4\u5BDD\u5BAB",en:"PALACES OF THE KINGS",day:Mc,fov:50,poi:[-178,20,-85],building:"\u5927\u6D41\u58EB\u5BAB",paras:["\u53F0\u5730\u897F\u5357\u89D2,\u5927\u6D41\u58EB\u5BAB\u300C\u5854\u67E5\u62C9\u300D\u4EE5\u6253\u78E8\u5982\u955C\u7684\u7070\u77F3\u7B51\u5C31,\u662F\u5BAB\u57CE\u6700\u53E4\u8001\u7684\u5BAB\u6BBF\u3002","\u859B\u897F\u65AF\u5BAB\u300C\u54C8\u8FEA\u4EC0\u300D\u4E34\u5D16\u800C\u7ACB,\u4FEF\u77B0\u5C71\u4E0B\u5E73\u539F;\u540E\u5BAB\u6CBF\u7740\u897F\u5899\u7EF5\u5EF6\u800C\u5367\u3002","\u5BAB\u5899\u7684\u95E8\u7A97\u4E0A,\u4F8D\u536B\u6D6E\u96D5\u81F3\u4ECA\u4ECD\u5728\u81EA\u5DF1\u7684\u5C97\u4F4D\u4E0A\u7AD9\u7ACB\u4E86\u4E24\u5343\u4E94\u767E\u5E74\u3002"],kfs:[{p:[60,18.5,60]},{p:[-42,18.2,-80]},{p:[-118,18.2,-58]},{p:[-166,18.6,-70]},{p:[-190,18,-20]}]},{id:"finale",num:"\u7EC8\u7AE0",seal:"\u66AE",title:"\u5915\u7167\u5168\u57CE",en:"THE CITY AT SUNSET",day:fx,fov:58,poi:[0,18,0],building:"\u6CE2\u65AF\u6CE2\u5229\u65AF",paras:["\u5915\u9633\u63A0\u8FC7\u67F1\u5934\u4E0E\u6B8B\u9636,\u6574\u5EA7\u53F0\u5730\u6C89\u5165\u91D1\u7EA2\u8272\u7684\u66AE\u972D\u3002","\u516C\u5143\u524D 330 \u5E74,\u4E9A\u5386\u5C71\u5927\u7684\u706B\u820C\u66FE\u541E\u6CA1\u8FD9\u4E00\u5207;\u800C\u77F3\u5934\u7684\u8BB0\u5FC6\u4ECE\u672A\u7184\u706D\u3002","\u6CE2\u65AF\u6CE2\u5229\u65AF\u4E0D\u662F\u5E9F\u589F\u2014\u2014\u5B83\u662F\u4EBA\u7C7B\u7B2C\u4E00\u6B21\u4EE5\u77F3\u4E66\u5199\u300C\u5929\u4E0B\u4E00\u5BB6\u300D\u7684\u5730\u65B9\u3002"],kfs:[{p:[-240,30,-120]},{p:[-320,90,-200]},{p:[-460,200,-330]},{p:[-620,300,-480]}]}],Sc=["\u4E24\u5343\u4E94\u767E\u5E74\u524D,\u5728\u4ECA\u5929\u7684\u4F0A\u6717\u5357\u90E8,\u77D7\u7ACB\u7740\u4E00\u5EA7\u4EE4\u4EBA\u60CA\u53F9\u7684\u53E4\u57CE\u3002","\u5B83\u7531\u5F3A\u76DB\u7684\u541B\u738B\u8425\u9020,\u662F\u5F53\u65F6\u4E16\u4E0A\u6700\u5927\u5E1D\u56FD\u7684\u793C\u4EEA\u4E4B\u90FD\u3002","\u4ECA\u5929,\u6211\u4EEC\u79F0\u5B83\u4E3A\u2014\u2014\u6CE2\u65AF\u6CE2\u5229\u65AF\u3002"];var ar=i=>Math.min(1,Math.max(0,i));function zu(){let i=ke.flatMap(A=>A.kfs.map(S=>new P(...S.p))),t=new ls(i,!1,"centripetal");t.arcLengthDivisions=800;let e=t.getLength(),n=i.length,s=800,r=[];for(let A=0;A<=s;A++)r.push(t.getPointAt(A/s));let o=[],a=0;for(let A=0;A<n;A++){let S=a,y=1/0;for(let I=a;I<=s;I++){let z=r[I].distanceToSquared(i[A]);z<y&&(y=z,S=I)}o.push(S/s),a=S}let l=[],c=0;ke.forEach(A=>{let S=o[c];c+=A.kfs.length,l.push([S,o[c-1]])});let h=l.map(([A,S],y)=>A+(S-A)*(ke[y].poiAt??.42)),f=ke.map(A=>new P(...A.poi||A.kfs[0].p)),d=l.map(([A,S])=>(S-A)*.3),u=A=>{let S=1;for(let y=0;y<l.length;y++){let I=Math.abs(A-h[y])/Math.max(d[y],1e-5);I<1&&(S+=1.5*Math.pow(.5+.5*Math.cos(I*Math.PI),2))}return S},m=2048,_=new Float64Array(m+1),g=1/m;for(let A=0;A<m;A++){let S=_[A];_[A+1]=Math.min(1,S+g/u(Math.min(S,1))*(1+1e-9))}_[m]=1;let p=A=>{let S=ar(A)*m,y=Math.min(m-1,Math.floor(S));return _[y]+(_[y+1]-_[y])*(S-y)},b=[];for(let A=0;A<m&&b.length<h.length;){for(;A<m&&_[A]<h[b.length];)A++;b.push(A/m)}let v=ke.map(A=>A.fov??55),x=new ls(v.map((A,S)=>new P(h[S],A,0)),!1,"catmullrom",.5);return{posCurve:t,boundsS:l,midsS:h,pois:f,fovAt:A=>{let S=new P;return x.getPoint(ar(A),S),S.y},poiW:A=>{for(let S=0;S<l.length;S++){let[y,I]=l[S],z=h[S],O=(I-y)*.3,k=Math.abs(A-z)/Math.max(O,1e-5);if(k<1)return Math.pow(.5+.5*Math.cos(k*Math.PI),1.6)}return 0},chapterAtS:A=>{for(let S=0;S<l.length;S++)if(A<=l[S][1]+1e-9)return S;return l.length-1},P2s:p,totalLen:e,midP:b,knotArc:o}}var Tn=new P,Fo=new P,bc=new P,Ou=new P,Bu=new P(0,1,0),Oo=class{constructor(t,e,n={}){this.path=t,this.camera=e,this.chapterIndex=0,this.state=null,this.t=0,this.leadArc=.018,this.groundHeight=n.groundHeight||null,this.colliders=n.colliders||[]}chapterAt(t){let e=this.path.P2s(t);return this.path.chapterAtS(e)}progressOfChapter(t){let[e]=this.path.boundsS[t];return e+1e-4}sample(t,e=this.t){let{posCurve:n,P2s:s,pois:r,poiW:o,fovAt:a,chapterAtS:l,boundsS:c}=this.path,h=s(t),f=l(h);n.getPointAt(ar(h),Tn),n.getPointAt(ar(h+this.leadArc),bc);let d=r[f],u=o(h);Fo.copy(bc).lerp(d,u);let m=bc.clone(),_=.22+.18*u;if(Ou.subVectors(Fo,Tn).cross(Bu).normalize(),Tn.addScaledVector(Ou,Math.sin(e*.31)*_*.35),Tn.y+=Math.sin(e*.47)*_*.16,Fo.addScaledVector(Bu,Math.sin(e*.23)*.3),this.groundHeight){let I=this.groundHeight(Tn.x,Tn.z)+1.5;Tn.y<I&&(Tn.y=I)}this._pushOut(Tn);let g=ke[f],p=o(h),b=a(h),v=ke[Math.max(0,f-1)].day,x=g.day,[L,T]=c[f],C=ar((h-L)/Math.max(T-L,1e-6)),A=f===0?Math.min(1,C*2):tr.smoothstep(C,.15,.9),S=Lo(v,x,A,this.state||{});return{pos:Tn.clone(),look:Fo.clone(),ahead:m,fov:b,state:S,chapterIndex:f,tl:C,poiW:p}}_pushOut(t){let e=t.y;for(let n of this.colliders){if(n.circle){if(n.circle[3]-n.circle[2]>=3.4)continue;let[o,a,l,c]=n.circle,h=Math.hypot(t.x-o,t.z-a);if(h>l-.9&&h<c+.9){let d=(h<(l+c)/2?l-1:c+1)/Math.max(h,1e-4);t.x=o+(t.x-o)*d,t.z=a+(t.z-a)*d}continue}if(Math.min(n.maxX-n.minX,n.maxZ-n.minZ)>=3.4)continue;let r=.9;if(t.x>n.minX-r&&t.x<n.maxX+r&&t.z>n.minZ-r&&t.z<n.maxZ+r){let o=Math.min(t.x-(n.minX-r),n.maxX+r-t.x),a=Math.min(t.z-(n.minZ-r),n.maxZ+r-t.z);o<=a?t.x+=t.x-(n.minX+n.maxX)/2>=0?o:-o:t.z+=t.z-(n.minZ+n.maxZ)/2>=0?a:-a}}}update(t,e){this.t+=e;let n=this.sample(t),s=this.camera;return s.position.copy(n.pos),s.up.set(0,1,0),s.lookAt(n.look),s.fov=n.fov,s.updateProjectionMatrix(),this.state=n.state,n.chapterIndex!==this.chapterIndex?(this.chapterIndex=n.chapterIndex,n.chapterIndex):-1}};var Bo=class{constructor({dom:t,onChapterChange:e,getMode:n,tourCam:s}){this.P=0,this.target=0,this.onChapterChange=e,this.getMode=n,this.tourCam=s,this.enabled=!1,this._chapter=-1,t.addEventListener("wheel",o=>{if(!this.enabled)return;o.preventDefault();let a=o.deltaMode===1?18:o.deltaMode===2?120:1;this.target=lr(this.target+o.deltaY*a*75e-6)},{passive:!1});let r=null;t.addEventListener("touchstart",o=>{this.enabled&&(r=o.touches[0].clientY)},{passive:!0}),t.addEventListener("touchmove",o=>{if(!this.enabled||r===null)return;let a=r-o.touches[0].clientY;r=o.touches[0].clientY,this.target=lr(this.target+a*55e-5),o.preventDefault()},{passive:!1}),window.addEventListener("keydown",o=>{this.enabled&&(o.key==="ArrowRight"||o.key==="PageDown"?this.nextChapter(1):o.key==="ArrowLeft"||o.key==="PageUp"?this.nextChapter(-1):o.key===" "&&(this.target=lr(this.target+.06)))})}nextChapter(t){this.jumpToChapter(this.currentChapter()+t)}currentChapter(){let t=this.tourCam.path.boundsS,e=this.target;for(let n=0;n<t.length;n++)if(e<=t[n][1]+1e-9)return n;return t.length-1}jumpToChapter(t){let e=this.tourCam.path.boundsS,n=Math.min(e.length-1,Math.max(0,t));this.target=lr(e[n][0]+.02)}setProgress(t,e=!1){this.target=lr(t),e&&(this.P=this.target)}update(t,e){if(!this.enabled)return 0;let n=1-Math.exp(-t*3);this.P+=(this.target-this.P)*n,Math.abs(this.target-this.P)<1e-5&&(this.P=this.target);let s=e.update(this.P,t);return s>=0&&this._chapter!==s&&(this._chapter=s,this.onChapterChange(s)),this.P}};function lr(i){return Math.min(1,Math.max(0,i))}var ys=new sn(0,0,0,"YXZ"),Ms=new P,px={type:"change"},mx={type:"lock"},gx={type:"unlock"},Hu=Math.PI/2,zo=class extends So{constructor(t,e=null){super(t,e),this.isLocked=!1,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.pointerSpeed=1,this._onMouseMove=_x.bind(this),this._onPointerlockChange=xx.bind(this),this._onPointerlockError=vx.bind(this),this.domElement!==null&&this.connect()}connect(){this.domElement.ownerDocument.addEventListener("mousemove",this._onMouseMove),this.domElement.ownerDocument.addEventListener("pointerlockchange",this._onPointerlockChange),this.domElement.ownerDocument.addEventListener("pointerlockerror",this._onPointerlockError)}disconnect(){this.domElement.ownerDocument.removeEventListener("mousemove",this._onMouseMove),this.domElement.ownerDocument.removeEventListener("pointerlockchange",this._onPointerlockChange),this.domElement.ownerDocument.removeEventListener("pointerlockerror",this._onPointerlockError)}dispose(){this.disconnect()}getObject(){return console.warn("THREE.PointerLockControls: getObject() has been deprecated. Use controls.object instead."),this.object}getDirection(t){return t.set(0,0,-1).applyQuaternion(this.object.quaternion)}moveForward(t){if(this.enabled===!1)return;let e=this.object;Ms.setFromMatrixColumn(e.matrix,0),Ms.crossVectors(e.up,Ms),e.position.addScaledVector(Ms,t)}moveRight(t){if(this.enabled===!1)return;let e=this.object;Ms.setFromMatrixColumn(e.matrix,0),e.position.addScaledVector(Ms,t)}lock(){this.domElement.requestPointerLock()}unlock(){this.domElement.ownerDocument.exitPointerLock()}};function _x(i){if(this.enabled===!1||this.isLocked===!1)return;let t=i.movementX||i.mozMovementX||i.webkitMovementX||0,e=i.movementY||i.mozMovementY||i.webkitMovementY||0,n=this.object;ys.setFromQuaternion(n.quaternion),ys.y-=t*.002*this.pointerSpeed,ys.x-=e*.002*this.pointerSpeed,ys.x=Math.max(Hu-this.maxPolarAngle,Math.min(Hu-this.minPolarAngle,ys.x)),n.quaternion.setFromEuler(ys),this.dispatchEvent(px)}function xx(){this.domElement.ownerDocument.pointerLockElement===this.domElement?(this.dispatchEvent(mx),this.isLocked=!0):(this.dispatchEvent(gx),this.isLocked=!1)}function vx(){console.error("THREE.PointerLockControls: Unable to use Pointer Lock API")}var oi={},Ho=class{constructor({camera:t,dom:e,colliders:n,plainFn:s}){this.camera=t,this.dom=e,this.colliders=n,this.plainFn=s,this.enabled=!1,this.eye=1.8,this.vel=new P,this._onLock=null,this._fwd=new P,this.pointer=new zo(t,e),this.pointer.addEventListener("lock",()=>{this.enabled=!0,this._emit(!0)}),this.pointer.addEventListener("unlock",()=>{this.enabled=!1,this._emit(!1)}),window.addEventListener("keydown",r=>{oi[r.code]=!0}),window.addEventListener("keyup",r=>{oi[r.code]=!1})}onLockChange(t){this._onLock=t}_emit(t){this._onLock&&this._onLock(t)}enter(t){if(t)this.camera.position.set(t[0],t[1],t[2]);else{let e=Ti(this.camera.position.x,this.camera.position.z,this.plainFn);this.camera.position.y=e+this.eye}this.pointer.lock()}exit(){this.pointer.unlock()}update(t){if(!this.enabled)return;let e=(oi.KeyD?1:0)-(oi.KeyA?1:0),n=(oi.KeyW?1:0)-(oi.KeyS?1:0);this.camera.getWorldDirection(this._fwd),this._fwd.y=0,this._fwd.lengthSq()<1e-6&&this._fwd.set(0,0,-1),this._fwd.normalize();let s=this._fwd.x,r=this._fwd.z,o=-r,a=s,l=s*n+o*e,c=r*n+a*e,h=Math.hypot(l,c);h>0&&(l/=h,c/=h);let f=9*(oi.ShiftLeft||oi.ShiftRight?2.1:1),d=1-Math.exp(-t*8);this.vel.x+=(l*f-this.vel.x)*d,this.vel.z+=(c*f-this.vel.z)*d;let u=this.camera.position,m=u.x+this.vel.x*t,_=u.z+this.vel.z*t;this._blocked(m,u.z)||(u.x=m),this._blocked(u.x,_)||(u.z=_);let g=Math.hypot(u.x,u.z);g>900&&(u.x*=900/g,u.z*=900/g);let p=Ti(u.x,u.z,this.plainFn);u.y+=(p+this.eye-u.y)*Math.min(1,t*10)}_blocked(t,e){let n=this.camera.position.y-this.eye,s=Ti(t,e,this.plainFn);if(Math.abs(s-n)>2.4)return!0;for(let r of this.colliders)if(t>r.minX-.6&&t<r.maxX+.6&&e>r.minZ-.6&&e<r.maxZ+.6){if(r.doorS&&Math.abs(t-(r.minX+r.maxX)/2)<(r.doorW??3)||r.doorN&&Math.abs(t-(r.minX+r.maxX)/2)<(r.doorW??3))continue;return!0}return!1}};var ku=560,Vu=360,Gu=1.05,Wu=1.05,Ss=i=>ku/2+i*Gu,bs=i=>Vu/2-i*Wu;function Xu(i,{onJump:t}){let e=ye.terrace,n="http://www.w3.org/2000/svg";i.innerHTML="";let s=document.createElementNS(n,"svg");s.setAttribute("viewBox",`0 0 ${ku} ${Vu}`),s.classList.add("map-svg");let r=(u,m,_,g,p,b)=>{let v=document.createElementNS(n,"rect");if(v.setAttribute("x",Ss(u-_/2)),v.setAttribute("y",bs(m+g/2)),v.setAttribute("width",_*Gu),v.setAttribute("height",g*Wu),v.setAttribute("class",p),s.appendChild(v),b){let x=document.createElementNS(n,"text");x.setAttribute("x",Ss(u)),x.setAttribute("y",bs(m)+4),x.setAttribute("class","map-label"),x.textContent=b,s.appendChild(x)}return v};r(e.cx,e.cz,e.w,e.d,"map-terrace"),r(-255,0,60,30,"map-stair");let o=[];for(let u of ms)r(u.rect[0],u.rect[1],u.rect[2],u.rect[3],"map-bldg");let a=document.createElementNS(n,"polyline"),l=[];ke.forEach(u=>u.kfs.forEach(m=>l.push(`${Ss(m.p[0])},${bs(m.p[2])}`))),a.setAttribute("points",l.join(" ")),a.setAttribute("class","map-route"),s.appendChild(a);let c=[{i:0,x:-330,z:-250},{i:1,x:-160,z:-30},{i:2,x:-30,z:-25},{i:3,x:-30,z:45},{i:4,x:140,z:55},{i:5,x:148,z:122},{i:6,x:-120,z:-80},{i:7,x:-420,z:-330}],h=[];for(let u of c){let m=document.createElementNS(n,"g");m.setAttribute("class","map-hot"),m.addEventListener("click",()=>t(u.i));let _=document.createElementNS(n,"circle");_.setAttribute("cx",Ss(u.x)),_.setAttribute("cy",bs(u.z)),_.setAttribute("r",11),m.appendChild(_);let g=document.createElementNS(n,"text");g.setAttribute("x",Ss(u.x)),g.setAttribute("y",bs(u.z)-16),g.setAttribute("text-anchor","middle"),g.textContent=ke[u.i].title,m.appendChild(g),s.appendChild(m),h.push(m)}let f=document.createElementNS(n,"g"),d=document.createElementNS(n,"circle");return d.setAttribute("r",5),d.setAttribute("class","map-marker"),f.appendChild(d),s.appendChild(f),i.appendChild(s),{svg:s,marker:f,update(u,m,_){d.setAttribute("cx",Ss(u)),d.setAttribute("cy",bs(m)),h.forEach((g,p)=>g.classList.toggle("active",p===_))}}}var ko=class{constructor({sky:t,renderer:e,ui:n}){this.sky=t,this.renderer=e,this.ui=n,this.steps=[],this.done=!1,this.progress=0,this._state=null,Ri(t,_n.night,e)}add(t,e){return this.steps.push({label:t,fn:e}),this}run(t,e){let n=0,s=this.steps.length,r=()=>{if(n<s){let o=this.steps[n];try{o.fn()}catch(a){throw console.error(`[\u6784\u5EFA\u5931\u8D25] ${o.label}`,a),a}n++,this.progress=n/s,this.ui.setLoading(this.progress,o.label),this._state=Lo(_n.night,_n.dawn,yx(this.progress),this._state||{}),Ri(this.sky,this._state,this.renderer),t(),requestAnimationFrame(r)}else this.done=!0,e()};requestAnimationFrame(r)}};function yx(i){return 1-Math.pow(1-i,3)}var oe=i=>document.querySelector(i);function Yu(){let i={preloader:oe("#preloader"),loadBar:oe("#load-bar"),loadLabel:oe("#load-label"),loadPct:oe("#load-pct"),intro:oe("#intro"),introLines:oe("#intro-lines"),enterBtn:oe("#enter-btn"),hud:oe("#hud"),card:oe("#chapter-card"),cardNum:oe("#card-num"),cardTitle:oe("#card-title"),cardEn:oe("#card-en"),cardParas:oe("#card-paras"),dots:oe("#progress-dots"),scrollHint:oe("#scroll-hint"),topbar:oe("#topbar"),mapBtn:oe("#btn-map"),roamBtn:oe("#btn-roam"),fsBtn:oe("#btn-fs"),mapOverlay:oe("#map-overlay"),mapBox:oe("#map-box"),mapClose:oe("#map-close"),roamHud:oe("#roam-hud"),roamBack:oe("#btn-roam-back"),error:oe("#error-screen"),errorMsg:oe("#error-msg"),fadeVeil:oe("#fade-veil")};return{el:i,setLoading(e,n){i.loadBar.style.transform=`scaleX(${e})`,i.loadPct.textContent=`${Math.round(e*100)}%`,n&&(i.loadLabel.textContent=n)},hidePreloader(){i.preloader.classList.add("hide"),setTimeout(()=>i.preloader.style.display="none",900)},showIntro(){i.intro.classList.remove("hidden"),i.introLines.innerHTML="",Sc.forEach((e,n)=>{let s=document.createElement("p");s.textContent=e,s.style.animationDelay=`${.7+n*1.6}s`,i.introLines.appendChild(s)}),setTimeout(()=>i.enterBtn.classList.add("show"),.7*1e3+Sc.length*1600+500)},hideIntro(){i.intro.classList.add("hidden"),setTimeout(()=>i.intro.style.display="none",1400)},showHud(){i.hud.classList.remove("hidden")},showChapter(e){let n=ke[e];i.card.classList.remove("show"),i.card.offsetWidth,i.cardNum.textContent=`${n.num} \xB7 ${String(e+1).padStart(2,"0")} / ${String(ke.length).padStart(2,"0")}`,i.cardTitle.textContent=n.title,i.cardEn.textContent=n.en,i.cardParas.innerHTML="",n.paras.forEach(s=>{let r=document.createElement("p");r.textContent=s,i.cardParas.appendChild(r)}),i.card.classList.add("show"),this._syncDots(e)},hideChapter(){i.card.classList.remove("show")},_syncDots(e){[...i.dots.children].forEach((n,s)=>{n.classList.toggle("active",s===e),n.classList.toggle("done",s<e)})},buildDots(e){i.dots.innerHTML="",ke.forEach((n,s)=>{let r=document.createElement("button");r.className="dot",r.title=`${n.num} \xB7 ${n.title}`,r.setAttribute("aria-label",r.title),r.addEventListener("click",()=>e(s)),i.dots.appendChild(r)})},showScrollHint(){i.scrollHint.classList.add("show")},hideScrollHint(){i.scrollHint.classList.remove("show")},toggleMap(e){i.mapOverlay.classList.toggle("show",e)},setRoamMode(e){i.roamHud.classList.toggle("show",e),i.topbar.classList.toggle("roaming",e),i.roamBtn.textContent=e?"\u8FD4\u56DE\u5BFC\u89C8":"\u81EA\u7531\u6F2B\u6E38"},showError(e){i.errorMsg.innerHTML=e,i.error.classList.remove("hidden")},veil(e){i.fadeVeil.classList.toggle("show",e)}}}var $t=Yu(),Nt,Es,Vo,Kt,Ae,tn,Ku,Xe=null,qu=-1,Go=[],Mx=i=>Go.push(i),Qu=new URLSearchParams(location.search),Wo=Qu.has("qa"),ju=Qu.has("clean");function td(i){console.error(i),$t.showError(i)}async function Sx(){window.__trace.push("boot-start");let i=document.getElementById("gl");try{Nt=xu(i)}catch(n){td(`WebGL \u521D\u59CB\u5316\u5931\u8D25:${n.message}<br>\u8BF7\u4F7F\u7528\u652F\u6301 WebGL2 \u7684\u73B0\u4EE3\u6D4F\u89C8\u5668(Chrome / Edge / Firefox)\u3002`);return}Es=vu(Nt.scene),Nt.sun=Es.sun,Vo=Su(),window.__trace.push("boot-mats-done"),Xe=new ko({sky:Es,renderer:Nt.renderer,ui:$t}),Xe.loading=!0;let t={scene:Nt.scene,mats:Vo,addCollider:Mx};Xe.add("\u9ECE\u660E\u524D\u7684\u9ED1\u6697 \xB7 \u5149\u7167\u4E0E\u5929\u7A79",()=>{}),Xe.add("\u5851\u9020\u5C71\u5DDD\u5E73\u539F",()=>{Eu(Nt.scene,Vo)}),Xe.add("\u7B51\u8D77\u5341\u4E94\u7C73\u53F0\u5730",()=>{Tu(Nt.scene,Vo)}),Xe.add("\u96D5\u51FF\u4E07\u56FD\u95E8",()=>{Cu(t)}),Xe.add("\u7AD6\u7ACB\u963F\u5E15\u8FBE\u7EB3\u5BAB\u4E03\u5341\u4E8C\u67F1",()=>{Pu(t)}),Xe.add("\u5217\u9635\u767E\u67F1\u5385\u4E0E\u56FD\u5E93",()=>{Iu(t),Lu(t)}),Xe.add("\u8425\u7B51\u738B\u5BA4\u5BAB\u6BBF\u7FA4",()=>{Du(t),Uu(t),Nu(t),Fu(t)}),Xe.add("\u65E5\u51FA \xB7 \u51C6\u5907\u542F\u7A0B",()=>{let n=zu();Kt=new Oo(n,Nt.camera,{groundHeight:(s,r)=>Ti(s,r,or),colliders:Go}),Ae=new Bo({dom:i,onChapterChange:s=>{re==="tour"&&$t.showChapter(s)},getMode:()=>re,tourCam:Kt}),tn=new Ho({camera:Nt.camera,dom:i,colliders:Go,plainFn:or}),tn.onLockChange(s=>{!s&&re==="roam"&&$t.setRoamMode(!0)}),Ku=Xu($t.el.mapBox,{onJump:s=>{$t.toggleMap(!1),Ae.jumpToChapter(s)}}),$t.buildDots(s=>Ae.jumpToChapter(s)),Nt.updateFns.push(wx)});let e=()=>{Ex(),Wo||Nt.loop()};Xe.run(()=>Nt.render(),e),bx()}var re="preloader";function bx(){Nt.camera.position.set(-560,150,-460),Nt.camera.lookAt(0,30,0),Nt.camera.fov=60,Nt.camera.updateProjectionMatrix()}function Ex(){if(re="intro",Xe.loading=!1,$t.hidePreloader(),$t.showIntro(),Wo){ju&&document.body.classList.add("qa-clean"),ed();return}Nt.onFrame=i=>{Nt.camera.position.y+=Math.sin(performance.now()*2e-4)*.02,Nt.camera.rotation.z=Math.sin(performance.now()*13e-5)*.004}}function ed(){re="tour",$t.hideIntro(),Nt.onFrame=null,Ae.enabled=!Wo,$t.showHud(),$t.showChapter(0),$t.showScrollHint(),Ri(Es,_n.dawn,Nt.renderer),Wo||(setTimeout(()=>$t.hideScrollHint(),9e3),setTimeout(()=>$t.hideChapter(),14e3))}function wx(i){let t=performance.now()*.001;if(re==="tour"){if(Ae.update(i,Kt),Kt.state&&Ri(Es,Kt.state,Nt.renderer),$t.el.mapOverlay.classList.contains("show")){let e=Nt.camera.position;Ku.update(e.x,e.z,Kt.chapterIndex)}}else re==="roam"&&tn.update(i)}function nd(){re!=="tour"&&re!=="map"||($t.toggleMap(!1),re="roam",Ae.enabled=!1,$t.hideChapter(),$t.setRoamMode(!0),tn.enter([Nt.camera.position.x,ye.terrace.h+1.8,Nt.camera.position.z]))}function Zu(){re="tour",$t.setRoamMode(!1),Ae.enabled=!0,Ae.setProgress(Ae.P),$t.showChapter(Kt.chapterIndex),setTimeout(()=>$t.hideChapter(),8e3)}window.__trace=["module-eval readyState="+document.readyState];function $u(){window.__trace.push("bindEvents"),Sx(),$t.el.enterBtn.addEventListener("click",ed),$t.el.mapBtn.addEventListener("click",()=>{let i=!$t.el.mapOverlay.classList.contains("show");$t.toggleMap(i),i&&re==="tour"&&(Ae.enabled=!1),!i&&re==="tour"&&(Ae.enabled=!0)}),$t.el.mapClose.addEventListener("click",()=>{$t.toggleMap(!1),re==="tour"&&(Ae.enabled=!0)}),$t.el.roamBtn.addEventListener("click",()=>{re==="roam"?Zu():nd()}),$t.el.roamBack.addEventListener("click",Zu),$t.el.fsBtn.addEventListener("click",()=>{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.()}),window.addEventListener("keydown",i=>{i.code==="KeyM"&&(re==="tour"||re==="map")&&$t.el.mapBtn.click(),i.code==="KeyF"&&(re==="tour"||re==="roam")&&$t.el.roamBtn.click()})}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",$u):$u();window.addEventListener("error",i=>{re!=="preloader"&&re!=="intro"||td(`${i?.message||"\u672A\u77E5\u9519\u8BEF"}<br><br>
    \u82E5\u4EE5\u53CC\u51FB(file://)\u65B9\u5F0F\u6253\u5F00:\u8BF7\u786E\u8BA4\u6253\u5F00\u7684\u662F <b>dist/index.html</b>,\u4E14\u540C\u76EE\u5F55\u5B58\u5728 js/local.bundle.js;<br>
    \u82E5\u901A\u8FC7 HTTP \u8BBF\u95EE:\u8BF7\u8FD0\u884C <code>python -m http.server 8080 --bind 127.0.0.1 --directory dist</code>\u3002`)});var Xo=null,Ju=new P;function Tx(){Xo=[];let i=new pn,t=new kn;Nt.scene.traverse(e=>{!e.isMesh||e.userData.noOcclude||(e.updateWorldMatrix(!0,!1),i.setFromObject(e),!i.isEmpty()&&(i.getBoundingSphere(t),Xo.push({mesh:e,sphere:t.clone()})))})}function Ec(i,t,e){let n=new Mo;n.set(i,t),n.far=e;let s=[];for(let r of Xo)n.ray.intersectSphere(r.sphere,Ju)&&Ju.distanceTo(i)<=e+.01&&s.push(r.mesh);return s.length?n.intersectObjects(s,!1).filter(r=>r.distance<=e):[]}window.__persepolis={get ready(){return!!(Nt&&(re==="intro"||re==="tour")&&Xe&&!Xe.loading)},async waitReady(){for(;!(Nt&&(re==="intro"||re==="tour"));)await new Promise(i=>setTimeout(i,120));return!0},render(i,t,e=!0){if(!Kt)return!1;if(re="tour",Kt.t=i/1e3,Ae.setProgress(t,e),Kt.update(Ae.P,0),Kt.state&&Ri(Es,Kt.state,Nt.renderer),Nt.grain&&(Nt.grain.uniforms.uTime.value=i/1e3%97),!ju){let n=Kt.chapterIndex;qu!==n&&(qu=n,$t.showChapter(n))}return Nt.render(),!0},chapter(i){return Ae?(Ae.jumpToChapter(i),!0):!1},chapterProgress(i){if(!Kt)return(i+.45)/8;let[t,e]=Kt.path.boundsS[Math.min(i,Kt.path.boundsS.length-1)];return t+(e-t)*.42},audit(i){if(!Kt)return null;Xo||Tx();let t=Kt.sample(i,6),e={pos:t.pos.toArray().map(d=>Math.round(d*10)/10),chapter:t.chapterIndex,s:Math.round(Kt.path.P2s(i)*1e3)/1e3,bounds:Kt.path.boundsS.map(d=>[Math.round(d[0]*1e3)/1e3,Math.round(d[1]*1e3)/1e3]),tight:!1,lookBlocked:!1,hits:0},n=t.look.clone().sub(t.pos),s=n.length();n.normalize();let r=Ec(t.pos,n,Math.max(s*.96,2))[0];e.poiW=Math.round((t.poiW??0)*100)/100;let o=!1;if(r){let d=t.ahead?t.pos.distanceTo(t.ahead):s,u=r.distance<3.2&&r.distance<d-4,m=e.poiW>.55&&r.distance<s-2.5&&r.distance<s*.9&&e.hitNearName!==poiBuilding;o=u||m,e.lookDist=Math.round(r.distance*10)/10,e.aheadDist=Math.round(d*10)/10}if(e.lookBlocked=o,e.lookBlocked){e.lookAt=t.look.toArray().map(_=>Math.round(_*10)/10);let d=r.point,u=null,m=1e9;for(let _ of ms){let g=Math.hypot(d.x-_.rect[0],d.z-_.rect[1]);g<m&&(m=g,u=_.name)}e.hitNearName=u,e.hitNear=`${u}@${Math.round(m)}m`}for(let d of[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(Ec(t.pos,new P(...d),1.05).length){e.tight=!0;break}let a=n.clone(),l=new P().crossVectors(a,new P(0,1,0)).normalize(),c=new P().crossVectors(l,a).normalize(),h=Math.tan(t.fov*Math.PI/180/2)*1.1,f=0;for(let d of[-1,0,1])for(let u of[-1,0,1]){let m=a.clone().addScaledVector(l,d*h).addScaledVector(c,u*h).normalize();(Ec(t.pos,m,700).length||m.y<-.05&&t.pos.y>2)&&f++}return e.hits=f,e},bounds(){return Kt?Kt.path.boundsS:[]},curveProbe(){if(!Kt)return null;let i=Kt.path.posCurve,t={totalLen:Math.round(i.getLength()),knotArc:Kt.path.knotArc??null,samples:[]};for(let e=0;e<=10;e++){let n=i.getPointAt(e/10);t.samples.push([Math.round(n.x),Math.round(n.y),Math.round(n.z)])}return t},roamPlace(i,t){if(!tn)return!1;nd(),tn.pointer.enabled=!1,tn.enabled=!0;let e=Ti(i,t,or);return tn.camera.position.set(i,e+tn.eye,t),tn.camera.rotation.set(0,0,0),!0},roamStep(i){return tn?(tn.update(i),tn.camera.position.toArray().map(t=>Math.round(t*100)/100)):!1},renderPose(i,t,e,n=55){return Nt?(Nt.camera.position.set(...t),Nt.camera.up.set(0,1,0),Nt.camera.lookAt(...e),Nt.camera.fov=n,Nt.camera.updateProjectionMatrix(),Nt.grain&&(Nt.grain.uniforms.uTime.value=i/1e3%97),Nt.render(),!0):!1},state(){return{mode:re,progress:Ae?Ae.P:0,chapter:Kt?Kt.chapterIndex:-1,colliders:Go.length,tier:Nt?Nt.tier:null,sun:Kt&&Kt.state?{az:Math.round(Kt.state.az),el:Math.round(Kt.state.el),fog:Math.round(Kt.state.fogDensity*1e4)/1e4,stars:Math.round(Kt.state.stars*1e3)/1e3}:null,cam:Nt?Nt.camera.position.toArray().map(i=>Math.round(i*10)/10):null,fov:Nt?Math.round(Nt.camera.fov):null}}};})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
