export const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

export const FS = `precision mediump float;
uniform vec2 uRes;uniform vec2 uMouse;uniform vec2 uTrail;uniform float uTime;uniform float uCell;uniform float uHue;uniform float uInt;uniform float uPx;uniform float uFlick;uniform float uLight;
vec3 hsv(vec3 c){vec4 K=vec4(1.,2./3.,1./3.,3.);vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);}
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){
 vec2 fc=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
 vec2 g=fc/uCell;vec2 id=floor(g);vec2 f=fract(g);
 vec2 c=(id+.5)*uCell;
 float d=length(c-uMouse)/uCell;float dt=length(c-uTrail)/uCell;
 float r=h21(id);
 float fl=step(.988,h21(id+floor(uTime*1.2)))*uFlick;
 float a=max(exp(-d*d*.03),exp(-dt*dt*.08)*.55)*uInt;
 a=floor(a*5.+r*.6)/5.;
 float hue=uHue+uMouse.x/uRes.x*.3+uMouse.y/uRes.y*.12+r*.04;
 vec3 col=hsv(vec3(fract(hue),.62,1.));
 vec2 px=f*uCell;float line=min(step(px.x,uPx)+step(px.y,uPx),1.);
 vec2 q=abs(f-.5);float box=step(max(q.x,q.y),.5-3.*uPx/uCell);
 vec3 o=vec3(.036,.04,.047);
 o+=line*(vec3(.05,.055,.062)+col*a*.85);
 o+=box*col*(a*.2+fl*.07);
 vec3 cl=hsv(vec3(fract(hue),.75,.8));
 vec3 l=vec3(.955,.953,.945)-line*.075;
 l=mix(l,cl,line*a*.9);
 l=mix(l,cl,box*(a*.22+fl*.07));
 gl_FragColor=vec4(mix(o,l,uLight),1.);
}`;
