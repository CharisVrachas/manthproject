import{d as e,l as t,t as n,u as r}from"./BaseLayout.astro_astro_type_script_index_0_lang.DigqkJ8e.js";import{a as i,i as a,n as o,r as s}from"./contact.Cb2jctut.js";import{C as c,O as l,T as u,d,i as f,k as p,l as m,m as h,u as g}from"./asterisk.B4PQh4XG.js";var _=`
attribute vec2 aCorner;
varying vec2 vCoord;

void main() {
	vCoord = aCorner;
	gl_Position = vec4(aCorner * 2.0 - 1.0, 0.0, 1.0);
}
`,v=`
precision mediump float;

varying vec2 vCoord;

uniform sampler2D uImage;
uniform vec2 uCanvasSize;
uniform vec2 uImageSize;
uniform float uProgress;
uniform float uPixelate;
uniform vec2 uPointer;
uniform float uHover;
uniform float uLofi;
uniform float uCover;
uniform float uZoom;
uniform float uGray;
uniform vec3 uBandColor;
uniform vec3 uBackground;

float noise(vec2 seed) {
	return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Blocks near the pointer snap to the colour at their centre.
vec2 pointerCluster(vec2 coord) {
	if (uHover < 0.001) return coord;
	float blockSize = 10.0;
	vec2 block = floor(coord * uCanvasSize / blockSize);
	vec2 centre = (block + 0.5) * blockSize;
	vec2 pointer = vec2(uPointer.x, uCanvasSize.y - uPointer.y);
	float strength = (1.0 - distance(centre, pointer) / 130.0) * uHover;
	if (strength <= 0.0) return coord;
	float active = step(noise(block * 2.17 + 1.3), strength * 1.5);
	return mix(coord, centre / uCanvasSize, active);
}

// Edge band turns blocky while moving; outer blocks get "bitten" (show the background).
vec3 edgeBlocks(vec2 coord) {
	coord = pointerCluster(coord);
	if (uPixelate < 0.001) return vec3(coord, 0.0);
	float blockSize = 7.0;
	vec2 block = floor(coord * uCanvasSize / blockSize);
	vec2 centre = (block + 0.5) * blockSize;
	float edgeDistance = min(min(centre.x, uCanvasSize.x - centre.x), min(centre.y, uCanvasSize.y - centre.y));
	float bandWidth = uPixelate * 40.0 + 0.001;
	float edge = 1.0 - edgeDistance / bandWidth;
	if (edge <= 0.0) return vec3(coord, 0.0);
	float bitten = step(noise(block * 1.37 + 3.1), edge * 0.55);
	return vec3(centre / uCanvasSize, bitten);
}

void main() {
	vec3 edge = edgeBlocks(vCoord);
	vec2 coord = edge.xy;

	float canvasAspect = uCanvasSize.x / uCanvasSize.y;
	float imageAspect = uImageSize.x / uImageSize.y;
	vec2 fit = vec2(max(canvasAspect / imageAspect, 1.0), max(imageAspect / canvasAspect, 1.0));
	if (uCover > 0.5) fit = vec2(min(canvasAspect / imageAspect, 1.0), min(imageAspect / canvasAspect, 1.0));

	vec2 uv = coord * fit + (1.0 - fit) * 0.5;
	uv.y = 1.0 - uv.y;
	uv = (uv - 0.5) * uZoom + 0.5;

	vec3 colour;
	if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
		colour = uBackground;
	} else if (uLofi > 0.001) {
		vec2 fromCentre = vCoord - 0.5;
		float vignette = clamp(length(fromCentre * vec2(1.0, 1.25)) * 1.6, 0.0, 1.0);
		float radius = mix(0.0045, 0.016, vignette * vignette) * uLofi;
		vec3 sum = texture2D(uImage, uv).rgb;
		for (int i = 0; i < 12; i++) {
			float angle = float(i) * 2.399963;
			float spread = radius * sqrt((float(i) + 0.5) / 12.0);
			sum += texture2D(uImage, clamp(uv + vec2(cos(angle), sin(angle)) * spread, 0.0, 1.0)).rgb;
		}
		vec3 soft = smoothstep(0.06, 0.92, sum / 13.0);
		soft *= 1.0 - 0.7 * uLofi * pow(vignette, 2.4);
		soft += (noise(floor(vCoord * uCanvasSize)) - 0.5) * 0.09 * uLofi;
		colour = mix(texture2D(uImage, uv).rgb, soft, uLofi);
	} else {
		colour = texture2D(uImage, uv).rgb;
	}
	if (uGray > 0.5) colour = vec3(dot(colour, vec3(0.2126, 0.7152, 0.0722)));

	// Entry sweep: a noisy red block band travels top → bottom, revealing the photo behind it.
	float columns = max(1.0, floor(uCanvasSize.x / 7.0));
	vec2 cell = floor(vCoord * columns) / columns;
	float band = 0.2;
	float sweep = (1.0 + band) - uProgress * (1.0 + 2.0 * band);
	float cellDistance = distance(cell.y, sweep);
	float nearBand = 1.0 - cellDistance;
	float falloff = smoothstep(band, 0.0, cellDistance);
	float jagged = step(1.0 - band * noise(cell), nearBand);
	float inBand = step(1.0 - band, nearBand);
	float blockAlpha = inBand * (falloff + noise(cell) - 0.5 * (1.0 - jagged));
	blockAlpha = max(0.0, blockAlpha) * step(uProgress, 0.999);

	vec3 shown = mix(uBackground, colour, step(sweep, cell.y));
	vec3 result = mix(shown, uBandColor, blockAlpha);
	gl_FragColor = vec4(mix(result, uBackground, edge.z), 1.0);
}
`,y=[`uImage`,`uCanvasSize`,`uImageSize`,`uProgress`,`uPixelate`,`uPointer`,`uHover`,`uLofi`,`uCover`,`uZoom`,`uGray`,`uBandColor`,`uBackground`],b=[.89,.149,.016],x=[.04,.04,.04];function S(e){return/\.(mp4|webm)(\?|$)/i.test(e)}function C(e){return new Promise((t,n)=>{let r=new Image;r.decoding=`async`,r.onload=()=>t(r),r.onerror=()=>n(Error(`pixel image: cannot load ${e}`)),r.src=e})}async function w(e){return e.complete&&e.naturalWidth||await new Promise((t,n)=>{e.addEventListener(`load`,()=>t(),{once:!0}),e.addEventListener(`error`,()=>n(Error(`pixel image: load error`)),{once:!0})}),e}function T(e,t){let n=document.createElement(`canvas`);n.width=e.naturalWidth,n.height=e.naturalHeight;let r=n.getContext(`2d`,{willReadFrequently:!0});if(!r)return n;r.drawImage(e,0,0);let i=r.getImageData(0,0,n.width,n.height),a=i.data;for(let e=0;e<a.length;e+=4){let n=a[e],r=a[e+1],i=a[e+2];if(t&&n>90&&n>r*2&&n>i*2)continue;let o=.2126*n+.7152*r+.0722*i;a[e]=o,a[e+1]=o,a[e+2]=o}return r.putImageData(i,0,0),n}function E(e,t,n){let r=e.createShader(t);if(!r)throw Error(`pixel image: cannot create shader`);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw Error(e.getShaderInfoLog(r)??`pixel image: shader error`);return r}function D(e,t,n={}){let i=e.getContext(`webgl`,{alpha:!0,premultipliedAlpha:!0,preserveDrawingBuffer:!0,antialias:!1});if(!i)return null;let a=i.createProgram();if(!a)return null;if(i.attachShader(a,E(i,i.VERTEX_SHADER,_)),i.attachShader(a,E(i,i.FRAGMENT_SHADER,v)),i.linkProgram(a),!i.getProgramParameter(a,i.LINK_STATUS))return console.error(i.getProgramInfoLog(a)),null;i.useProgram(a);let o=i.createBuffer();i.bindBuffer(i.ARRAY_BUFFER,o),i.bufferData(i.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),i.STATIC_DRAW);let s=i.getAttribLocation(a,`aCorner`);i.enableVertexAttribArray(s),i.vertexAttribPointer(s,2,i.FLOAT,!1,0,0);let c={};y.forEach(e=>{c[e]=i.getUniformLocation(a,e)});let l=i.createTexture();i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,l),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,new Uint8Array(4)),i.uniform1i(c.uImage,0),i.uniform3fv(c.uBandColor,b),i.uniform3fv(c.uBackground,n.bg??x),i.uniform1f(c.uZoom,n.zoom??1),i.uniform1f(c.uLofi,n.lofi??0),i.uniform1f(c.uCover,+!!n.cover);let u={progress:0,pixelate:0,hover:0,pointerX:-999,pointerY:-999},d=[1,1],f=null,p=!1,m=!1,h=0,g=``,D=(e,t,n)=>{i.bindTexture(i.TEXTURE_2D,l),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,e),d=[t||1,n||1],p=!0},O=()=>{let t=Math.max(1,Math.round(e.clientWidth||e.parentElement?.clientWidth||320)),n=Math.max(1,Math.round(e.clientHeight||e.parentElement?.clientHeight||180));(e.width!==t||e.height!==n)&&(e.width=t,e.height=n)},k=()=>{if(h=0,m||!p)return;O();let t=!!f&&f.readyState>=2&&!f.paused;f&&f.readyState>=2&&D(f,f.videoWidth,f.videoHeight),i.viewport(0,0,e.width,e.height),i.useProgram(a),i.uniform2f(c.uCanvasSize,e.width,e.height),i.uniform2f(c.uImageSize,d[0],d[1]),i.uniform1f(c.uProgress,u.progress),i.uniform1f(c.uPixelate,u.pixelate),i.uniform2f(c.uPointer,u.pointerX,u.pointerY),i.uniform1f(c.uHover,u.hover),i.uniform1f(c.uGray,+!!f),i.drawArrays(i.TRIANGLE_STRIP,0,4),t&&A()};function A(){!h&&!m&&(h=requestAnimationFrame(k))}let j=async e=>{let t=typeof e==`string`?e:e.currentSrc||e.src||String(e);if(t&&t===g)return;g=t;let r=typeof e==`string`&&S(e);if(e instanceof HTMLVideoElement||r)f||(f=e instanceof HTMLVideoElement?e:document.createElement(`video`),f.muted=!0,f.loop=!0,f.playsInline=!0,f.setAttribute(`playsinline`,``),f.preload=`auto`,f.addEventListener(`playing`,A),f.addEventListener(`loadeddata`,A)),typeof e==`string`&&f.getAttribute(`src`)!==e&&(f.src=e),p=!0,f.play().catch(()=>{}),A();else{f&&=(f.pause(),null);try{let r=typeof e==`string`?await C(e):e.complete&&e.naturalWidth?await w(e):await C(e.currentSrc||e.src);if(m||g!==t)return;D(T(r,!!n.keepRed),r.naturalWidth,r.naturalHeight),A()}catch(e){console.error(e)}}},M={x:-999,y:-999,hover:0},N=!1,P=()=>{let e=M.x-u.pointerX,t=M.y-u.pointerY,n=M.hover-u.hover;u.pointerX+=e*.18,u.pointerY+=t*.18,u.hover+=n*.12,A(),Math.abs(e)+Math.abs(t)<.3&&Math.abs(n)<.002&&(u.hover=M.hover,r.ticker.remove(P),N=!1)},F=()=>{N||(N=!0,r.ticker.add(P))},I=t=>{let n=e.getBoundingClientRect(),r=e.width/Math.max(1,n.width),i=e.height/Math.max(1,n.height);M.x=(t.clientX-n.left)*r,M.y=(t.clientY-n.top)*i,u.hover<.01&&M.hover===0&&(u.pointerX=M.x,u.pointerY=M.y),M.hover=1,F()},L=()=>{M.hover=0,F()},R=!!n.hover&&window.matchMedia(`(hover: hover)`).matches,z=e.parentElement??e;R&&(z.addEventListener(`pointermove`,I),z.addEventListener(`pointerleave`,L));let B=new ResizeObserver(()=>A());return B.observe(e),{get progress(){return u.progress},set progress(e){u.progress=e,A()},get pixelate(){return u.pixelate},set pixelate(e){u.pixelate=e,A()},ready:j(t),setSource:j,render:A,destroy(){m=!0,cancelAnimationFrame(h),r.ticker.remove(P),B.disconnect(),R&&(z.removeEventListener(`pointermove`,I),z.removeEventListener(`pointerleave`,L)),f&&(f.removeEventListener(`playing`,A),f.removeEventListener(`loadeddata`,A),f.pause(),typeof t!=`string`&&t instanceof HTMLVideoElement||(f.removeAttribute(`src`),f.load())),i.deleteTexture(l),i.deleteBuffer(o),i.deleteProgram(a),i.getExtension(`WEBGL_lose_context`)?.loseContext()}}}function O(e,t,n={}){let r=e.querySelector(`:scope > canvas`);return r||(r=document.createElement(`canvas`),r.setAttribute(`aria-hidden`,`true`),r.style.display=`block`,e.append(r)),D(r,t,n)}function k(n=document){let i=Array.from(n.querySelectorAll(`[data-pixel-image][data-texture]`)),a=[];for(let n of i){let i=n.querySelector(`canvas`),o=n.dataset.texture;if(!i||!o)continue;let s=!n.classList.contains(`pixel-image--round`)&&!e.reducedMotion,c=D(i,o,{bg:x,zoom:1,cover:!0,lofi:.45,hover:s});if(!c)continue;n.classList.add(`is-canvas-ready`);let l=n.closest(`figure`)??n,u=[],d=[];if(!s)u.push(t.create({trigger:l,start:`top 85%`,once:!0,onEnter:()=>{d.push(r.to(c,{progress:1,duration:e.reducedMotion?.01:1.6,ease:`none`}))}}));else{let e=r.fromTo(c,{progress:0},{progress:1,ease:`none`,scrollTrigger:{trigger:l,start:`top 95%`,end:`top 15%`,scrub:.5}});d.push(e);let n=r.quickTo(c,`pixelate`,{duration:.5,ease:`power2.out`});u.push(t.create({trigger:l,start:`top bottom`,end:`bottom top`,onUpdate:e=>n(r.utils.clamp(0,.6,Math.abs(e.getVelocity())/2500))})),d.push(r.fromTo(l,{clipPath:`inset(8% 6% 8% 6% round 12px)`},{clipPath:`inset(0% 0% 0% 0% round 10px)`,ease:`none`,scrollTrigger:{trigger:l,start:`top 90%`,end:`top 20%`,scrub:.6}}))}a.push(()=>{u.forEach(e=>e.kill()),d.forEach(e=>{e.scrollTrigger?.kill(),e.kill()}),c.destroy(),n.classList.remove(`is-canvas-ready`)})}return()=>a.forEach(e=>e())}function A(t){if(!t)return()=>{};let n=[];n.push(s(t.querySelector(`[data-line-reveal]`))),n.push(a(t.querySelectorAll(`[data-chapter-head], [data-reveal-block]`),{trigger:t,start:`top 70%`}));let o=t.querySelector(`[data-awards-list]`),c=Array.from(t.querySelectorAll(`[data-award-row]`));return o&&c.length&&!e.reducedMotion&&(n.push(r.fromTo(c,{yPercent:60,opacity:0},{yPercent:0,opacity:1,duration:.9,stagger:.07,ease:`power3.out`,scrollTrigger:{trigger:o,start:`top 82%`,once:!0}})),c.forEach((e,t)=>{let i=e.querySelector(`[data-award-name]`);if(!i)return;let a=t%2==1;n.push(r.fromTo(i,{x:a?`-4vw`:`4vw`},{x:a?`4vw`:`-4vw`,ease:`none`,scrollTrigger:{trigger:e,start:`top bottom`,end:`bottom top`,scrub:.6}}))})),()=>i(n)}function j(){let e=[],i=[];return{addBand:({band:a=null,ink:o=null,trigger:s,start:c=`top 55%`,end:l=`bottom 45%`})=>{a&&r.set(a,{opacity:0});let u={ink:o};e.push(t.create({trigger:s,start:c,end:l,onToggle:e=>{a&&r.to(a,{opacity:+!!e.isActive,duration:e.isActive?.2:.3,ease:`none`,overwrite:!0}),e.isActive?i.push(u):i.splice(i.indexOf(u),1);let t=i[i.length-1];t?n(t.ink):o===`light`&&document.documentElement.classList.contains(`is-ink-light`)&&n(null)}}))},destroy(){e.forEach(e=>e.kill()),n(null)}}}function M(e,t){return r.fromTo(e.querySelectorAll(`:scope > div > span`),{y:0,yPercent:101},{yPercent:0,ease:`none`,stagger:{each:.12,from:`end`},scrollTrigger:{trigger:e,start:`top bottom`,end:`bottom bottom`,scrub:!0,...t}})}function N(t,n=document,c={}){if(!t)return()=>{};let l=e.reducedMotion,u=[],d=[];u.push(o(t.querySelector(`[data-count-to]`),{trigger:t})),u.push(s(t.querySelector(`[data-line-reveal]`),{start:`top 75%`})),u.push(a(t.querySelectorAll(`[data-chapter-head], [data-reveal-block]`),{trigger:t,start:`top 60%`}));let f=t.querySelector(`[data-services]`),p=Array.from(t.querySelectorAll(`[data-service-row]`));f&&p.length&&!l&&u.push(r.fromTo(p,{clipPath:`inset(0 0 100% 0)`,y:40},{clipPath:`inset(0 0 0% 0)`,y:0,duration:1,stagger:.09,ease:`power4.out`,scrollTrigger:{trigger:f,start:`top 80%`,once:!0}}));let m=c.preview===void 0?n.querySelector(`[data-service-preview]`):c.preview,h=m?.querySelector(`canvas`);return f&&m&&h&&p.length&&e.finePointer&&window.innerWidth>900&&d.push(P(t,f,p,m,h,u)),()=>{i(u),d.forEach(e=>e())}}function P(e,n,i,a,o,s){let c=D(o,i[0].dataset.previewSrc??``,{bg:[.04,.04,.04],zoom:1,cover:!0,lofi:.55});c&&(c.progress=0),a.style.visibility=``,r.set(a,{xPercent:-50,yPercent:-50,scale:.6,autoAlpha:0});let l=r.quickTo(a,`x`,{duration:.55,ease:`power3.out`}),u=r.quickTo(a,`y`,{duration:.55,ease:`power3.out`}),d=r.quickTo(a,`rotation`,{duration:.8,ease:`power3.out`}),f={value:0},p=r.quickTo(f,`value`,{duration:.45,ease:`power2.out`,onUpdate:()=>{c&&(c.pixelate=f.value)}}),m=0,h=0,g=0,_=e=>{l(e.clientX),u(e.clientY),d(r.utils.clamp(-9,9,(e.clientX-m)*.5));let t=Math.hypot(e.clientX-m,e.clientY-h);p(r.utils.clamp(0,1,t/40)),window.clearTimeout(g),g=window.setTimeout(()=>p(0),90),m=e.clientX,h=e.clientY},v=null,y=i.map(e=>{let t=()=>{r.to(a,{"--preview-scale":Number(e.dataset.previewSize||1),duration:.5,ease:`power3.out`}),c&&(c.setSource(e.dataset.previewSrc??``),v?.kill(),c.progress=0,v=r.to(c,{progress:1,duration:.9,ease:`none`})),r.to(a,{scale:1,autoAlpha:1,duration:.45,ease:`power3.out`,overwrite:`auto`})};return e.addEventListener(`pointerenter`,t),[e,t]}),b=()=>{r.to(a,{scale:.6,autoAlpha:0,duration:.35,ease:`power3.in`,overwrite:`auto`})};return n.addEventListener(`pointerleave`,b),window.addEventListener(`pointermove`,_),s.push(t.create({trigger:e,start:`top bottom`,end:`bottom top`,onLeave:b,onLeaveBack:b})),()=>{window.clearTimeout(g),y.forEach(([e,t])=>e.removeEventListener(`pointerenter`,t)),n.removeEventListener(`pointerleave`,b),window.removeEventListener(`pointermove`,_),v?.kill(),r.killTweensOf(a),r.set(a,{clearProps:`all`}),c?.destroy()}}var F=.06;function I(t,n={}){let i=t.querySelector(`canvas`);i||(i=document.createElement(`canvas`),t.append(i));let a;try{a=new g({canvas:i,antialias:!0,alpha:!0})}catch(e){return console.warn(`[hero-star] WebGL unavailable`,e),null}a.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),a.setClearColor(0,0);let o=new p,s=new u(35,1,.1,50);s.position.set(0,0,n.cameraDistance??7);let _=new h(16777215,2.2);_.position.set(3,5,5);let v=new h(16767180,1.4);v.position.set(-5,-3,-2),o.add(_,v,new d(16777215,.85));let y=new c({color:16777215,roughness:.28,clearcoat:1,clearcoatRoughness:.2}),b=f(y,{capSegments:12,radialSegments:28});o.add(b.group);let x={form:+!!e.reducedMotion,spin:0},S={squeeze:1},C={x:0,y:0,targetX:0,targetY:0},w=e=>{let t=m(e.clientX,e.clientY);C.targetX=t.x,C.targetY=t.y},T=()=>{let e=t.clientWidth,n=t.clientHeight;a.setSize(e,n,!1),s.aspect=e/Math.max(1,n),s.updateProjectionMatrix()},E=new l,D=e=>{let t=i.getBoundingClientRect();e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom&&(E.setFromCamera({x:(e.clientX-t.left)/t.width*2-1,y:-((e.clientY-t.top)/t.height)*2+1},s),E.intersectObject(b.group,!0).length&&r.timeline().to(S,{squeeze:.78,duration:.18,ease:`power2.in`,overwrite:`auto`}).to(S,{squeeze:1,duration:.9,ease:`elastic.out(1.1, 0.35)`}))},O=!0,k=new IntersectionObserver(([e])=>{O=e.isIntersecting});k.observe(t);let A=performance.now(),j=()=>{let e=(performance.now()-A)/1e3;C.x+=(C.targetX-C.x)*F,C.y+=(C.targetY-C.y)*F,b.group.scale.setScalar(Math.max(.001,x.form*S.squeeze)*1.5),b.group.rotation.z=e*.25+x.spin,b.group.rotation.y=Math.sin(e*.5)*.35+C.x*.5,b.group.rotation.x=-C.y*.35,b.group.position.y=Math.sin(e*.9)*.08,a.render(o,s)},M=0,N=()=>{M=requestAnimationFrame(N),O&&j()};return T(),window.addEventListener(`resize`,T),window.addEventListener(`pointermove`,w),window.addEventListener(`pointerdown`,D),M=requestAnimationFrame(N),{state:x,snapshot(){j();let e=document.createElement(`canvas`);return e.width=i.width,e.height=i.height,e.getContext(`2d`)?.drawImage(i,0,0),{canvas:e,rect:i.getBoundingClientRect()}},destroy(){cancelAnimationFrame(M),k.disconnect(),window.removeEventListener(`resize`,T),window.removeEventListener(`pointermove`,w),window.removeEventListener(`pointerdown`,D),r.killTweensOf(S),r.killTweensOf(x),b.dispose(),y.dispose(),a.dispose(),a.forceContextLoss?.()}}}export{A as a,k as c,M as i,N as n,D as o,j as r,O as s,I as t};