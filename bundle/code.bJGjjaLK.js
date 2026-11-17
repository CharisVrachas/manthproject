import{d as e,f as t,n,u as r}from"./BaseLayout.astro_astro_type_script_index_0_lang.BdXrA8P9.js";import{a as i,i as a,n as o,r as s}from"./contact.C40J08-r.js";var c=`
attribute vec2 aCorner;
varying vec2 vCoord;

void main() {
	vCoord = aCorner;
	gl_Position = vec4(aCorner * 2.0 - 1.0, 0.0, 1.0);
}
`,l=`
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
`,u=[`uImage`,`uCanvasSize`,`uImageSize`,`uProgress`,`uPixelate`,`uPointer`,`uHover`,`uLofi`,`uCover`,`uZoom`,`uGray`,`uBandColor`,`uBackground`],d=[.89,.149,.016],f=[.04,.04,.04];function p(e){return/\.(mp4|webm)(\?|$)/i.test(e)}function m(e){return new Promise((t,n)=>{let r=new Image;r.decoding=`async`,r.onload=()=>t(r),r.onerror=()=>n(Error(`pixel image: cannot load ${e}`)),r.src=e})}async function h(e){return e.complete&&e.naturalWidth||await new Promise((t,n)=>{e.addEventListener(`load`,()=>t(),{once:!0}),e.addEventListener(`error`,()=>n(Error(`pixel image: load error`)),{once:!0})}),e}function g(e,t){let n=document.createElement(`canvas`);n.width=e.naturalWidth,n.height=e.naturalHeight;let r=n.getContext(`2d`,{willReadFrequently:!0});if(!r)return n;r.drawImage(e,0,0);let i=r.getImageData(0,0,n.width,n.height),a=i.data;for(let e=0;e<a.length;e+=4){let n=a[e],r=a[e+1],i=a[e+2];if(t&&n>90&&n>r*2&&n>i*2)continue;let o=.2126*n+.7152*r+.0722*i;a[e]=o,a[e+1]=o,a[e+2]=o}return r.putImageData(i,0,0),n}function _(e,t,n){let r=e.createShader(t);if(!r)throw Error(`pixel image: cannot create shader`);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw Error(e.getShaderInfoLog(r)??`pixel image: shader error`);return r}function v(t,n,r={}){let i=t.getContext(`webgl`,{alpha:!0,premultipliedAlpha:!0,preserveDrawingBuffer:!0,antialias:!1});if(!i)return null;let a=i.createProgram();if(!a)return null;if(i.attachShader(a,_(i,i.VERTEX_SHADER,c)),i.attachShader(a,_(i,i.FRAGMENT_SHADER,l)),i.linkProgram(a),!i.getProgramParameter(a,i.LINK_STATUS))return console.error(i.getProgramInfoLog(a)),null;i.useProgram(a);let o=i.createBuffer();i.bindBuffer(i.ARRAY_BUFFER,o),i.bufferData(i.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),i.STATIC_DRAW);let s=i.getAttribLocation(a,`aCorner`);i.enableVertexAttribArray(s),i.vertexAttribPointer(s,2,i.FLOAT,!1,0,0);let v={};u.forEach(e=>{v[e]=i.getUniformLocation(a,e)});let y=i.createTexture();i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,y),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,new Uint8Array(4)),i.uniform1i(v.uImage,0),i.uniform3fv(v.uBandColor,d),i.uniform3fv(v.uBackground,r.bg??f),i.uniform1f(v.uZoom,r.zoom??1),i.uniform1f(v.uLofi,r.lofi??0),i.uniform1f(v.uCover,+!!r.cover);let b={progress:0,pixelate:0,hover:0,pointerX:-999,pointerY:-999},x=[1,1],S=null,C=!1,w=!1,T=0,E=``,D=(e,t,n)=>{i.bindTexture(i.TEXTURE_2D,y),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,e),x=[t||1,n||1],C=!0},O=()=>{let e=Math.max(1,Math.round(t.clientWidth||t.parentElement?.clientWidth||320)),n=Math.max(1,Math.round(t.clientHeight||t.parentElement?.clientHeight||180));(t.width!==e||t.height!==n)&&(t.width=e,t.height=n)},k=()=>{if(T=0,w||!C)return;O();let e=!!S&&S.readyState>=2&&!S.paused;S&&S.readyState>=2&&D(S,S.videoWidth,S.videoHeight),i.viewport(0,0,t.width,t.height),i.useProgram(a),i.uniform2f(v.uCanvasSize,t.width,t.height),i.uniform2f(v.uImageSize,x[0],x[1]),i.uniform1f(v.uProgress,b.progress),i.uniform1f(v.uPixelate,b.pixelate),i.uniform2f(v.uPointer,b.pointerX,b.pointerY),i.uniform1f(v.uHover,b.hover),i.uniform1f(v.uGray,+!!S),i.drawArrays(i.TRIANGLE_STRIP,0,4),e&&A()};function A(){!T&&!w&&(T=requestAnimationFrame(k))}let j=async e=>{let t=typeof e==`string`?e:e.currentSrc||e.src||String(e);if(t&&t===E)return;E=t;let n=typeof e==`string`&&p(e);if(e instanceof HTMLVideoElement||n)S||(S=e instanceof HTMLVideoElement?e:document.createElement(`video`),S.muted=!0,S.loop=!0,S.playsInline=!0,S.setAttribute(`playsinline`,``),S.preload=`auto`,S.addEventListener(`playing`,A),S.addEventListener(`loadeddata`,A)),typeof e==`string`&&S.getAttribute(`src`)!==e&&(S.src=e),C=!0,S.play().catch(()=>{}),A();else{S&&=(S.pause(),null);try{let n=typeof e==`string`?await m(e):e.complete&&e.naturalWidth?await h(e):await m(e.currentSrc||e.src);if(w||E!==t)return;D(g(n,!!r.keepRed),n.naturalWidth,n.naturalHeight),A()}catch(e){console.error(e)}}},M={x:-999,y:-999,hover:0},N=!1,P=()=>{let t=M.x-b.pointerX,n=M.y-b.pointerY,r=M.hover-b.hover;b.pointerX+=t*.18,b.pointerY+=n*.18,b.hover+=r*.12,A(),Math.abs(t)+Math.abs(n)<.3&&Math.abs(r)<.002&&(b.hover=M.hover,e.ticker.remove(P),N=!1)},F=()=>{N||(N=!0,e.ticker.add(P))},I=e=>{let n=t.getBoundingClientRect(),r=t.width/Math.max(1,n.width),i=t.height/Math.max(1,n.height);M.x=(e.clientX-n.left)*r,M.y=(e.clientY-n.top)*i,b.hover<.01&&M.hover===0&&(b.pointerX=M.x,b.pointerY=M.y),M.hover=1,F()},L=()=>{M.hover=0,F()},R=!!r.hover&&window.matchMedia(`(hover: hover)`).matches,z=t.parentElement??t;R&&(z.addEventListener(`pointermove`,I),z.addEventListener(`pointerleave`,L));let B=new ResizeObserver(()=>A());return B.observe(t),{get progress(){return b.progress},set progress(e){b.progress=e,A()},get pixelate(){return b.pixelate},set pixelate(e){b.pixelate=e,A()},ready:j(n),setSource:j,render:A,destroy(){w=!0,cancelAnimationFrame(T),e.ticker.remove(P),B.disconnect(),R&&(z.removeEventListener(`pointermove`,I),z.removeEventListener(`pointerleave`,L)),S&&(S.removeEventListener(`playing`,A),S.removeEventListener(`loadeddata`,A),S.pause(),typeof n!=`string`&&n instanceof HTMLVideoElement||(S.removeAttribute(`src`),S.load())),i.deleteTexture(y),i.deleteBuffer(o),i.deleteProgram(a),i.getExtension(`WEBGL_lose_context`)?.loseContext()}}}function y(e,t,n={}){let r=e.querySelector(`:scope > canvas`);return r||(r=document.createElement(`canvas`),r.setAttribute(`aria-hidden`,`true`),r.style.display=`block`,e.append(r)),v(r,t,n)}function b(n=document){let i=Array.from(n.querySelectorAll(`[data-pixel-image][data-texture]`)),a=[];for(let n of i){let i=n.querySelector(`canvas`),o=n.dataset.texture;if(!i||!o)continue;let s=!n.classList.contains(`pixel-image--round`)&&!t.reducedMotion,c=v(i,o,{bg:f,zoom:1,cover:!0,lofi:.45,hover:s});if(!c)continue;n.classList.add(`is-canvas-ready`);let l=n.closest(`figure`)??n,u=[],d=[];if(!s)u.push(r.create({trigger:l,start:`top 85%`,once:!0,onEnter:()=>{d.push(e.to(c,{progress:1,duration:t.reducedMotion?.01:1.6,ease:`none`}))}}));else{let t=e.fromTo(c,{progress:0},{progress:1,ease:`none`,scrollTrigger:{trigger:l,start:`top 95%`,end:`top 15%`,scrub:.5}});d.push(t);let n=e.quickTo(c,`pixelate`,{duration:.5,ease:`power2.out`});u.push(r.create({trigger:l,start:`top bottom`,end:`bottom top`,onUpdate:t=>n(e.utils.clamp(0,.6,Math.abs(t.getVelocity())/2500))})),d.push(e.fromTo(l,{clipPath:`inset(8% 6% 8% 6% round 12px)`},{clipPath:`inset(0% 0% 0% 0% round 10px)`,ease:`none`,scrollTrigger:{trigger:l,start:`top 90%`,end:`top 20%`,scrub:.6}}))}a.push(()=>{u.forEach(e=>e.kill()),d.forEach(e=>{e.scrollTrigger?.kill(),e.kill()}),c.destroy(),n.classList.remove(`is-canvas-ready`)})}return()=>a.forEach(e=>e())}function x(n){if(!n)return()=>{};let r=[];r.push(s(n.querySelector(`[data-line-reveal]`))),r.push(a(n.querySelectorAll(`[data-chapter-head], [data-reveal-block]`),{trigger:n,start:`top 70%`}));let o=n.querySelector(`[data-awards-list]`),c=Array.from(n.querySelectorAll(`[data-award-row]`));return o&&c.length&&!t.reducedMotion&&(r.push(e.fromTo(c,{yPercent:60,opacity:0},{yPercent:0,opacity:1,duration:.9,stagger:.07,ease:`power3.out`,scrollTrigger:{trigger:o,start:`top 82%`,once:!0}})),c.forEach((t,n)=>{let i=t.querySelector(`[data-award-name]`);if(!i)return;let a=n%2==1;r.push(e.fromTo(i,{x:a?`-4vw`:`4vw`},{x:a?`4vw`:`-4vw`,ease:`none`,scrollTrigger:{trigger:t,start:`top bottom`,end:`bottom top`,scrub:.6}}))})),()=>i(r)}function S(){let t=[],i=[];return{addBand:({band:a=null,ink:o=null,trigger:s,start:c=`top 55%`,end:l=`bottom 45%`})=>{a&&e.set(a,{opacity:0});let u={ink:o};t.push(r.create({trigger:s,start:c,end:l,onToggle:t=>{a&&e.to(a,{opacity:+!!t.isActive,duration:t.isActive?.2:.3,ease:`none`,overwrite:!0}),t.isActive?i.push(u):i.splice(i.indexOf(u),1);let r=i[i.length-1];r?n(r.ink):o===`light`&&document.documentElement.classList.contains(`is-ink-light`)&&n(null)}}))},destroy(){t.forEach(e=>e.kill()),n(null)}}}function C(t,n){return e.fromTo(t.querySelectorAll(`:scope > div > span`),{y:0,yPercent:101},{yPercent:0,ease:`none`,stagger:{each:.12,from:`end`},scrollTrigger:{trigger:t,start:`top bottom`,end:`bottom bottom`,scrub:!0,...n}})}function w(n,r=document,c={}){if(!n)return()=>{};let l=t.reducedMotion,u=[],d=[];u.push(o(n.querySelector(`[data-count-to]`),{trigger:n})),u.push(s(n.querySelector(`[data-line-reveal]`),{start:`top 75%`})),u.push(a(n.querySelectorAll(`[data-chapter-head], [data-reveal-block]`),{trigger:n,start:`top 60%`}));let f=n.querySelector(`[data-services]`),p=Array.from(n.querySelectorAll(`[data-service-row]`));f&&p.length&&!l&&u.push(e.fromTo(p,{clipPath:`inset(0 0 100% 0)`,y:40},{clipPath:`inset(0 0 0% 0)`,y:0,duration:1,stagger:.09,ease:`power4.out`,scrollTrigger:{trigger:f,start:`top 80%`,once:!0}}));let m=c.preview===void 0?r.querySelector(`[data-service-preview]`):c.preview,h=m?.querySelector(`canvas`);return f&&m&&h&&p.length&&t.finePointer&&window.innerWidth>900&&d.push(T(n,f,p,m,h,u)),()=>{i(u),d.forEach(e=>e())}}function T(t,n,i,a,o,s){let c=v(o,i[0].dataset.previewSrc??``,{bg:[.04,.04,.04],zoom:1,cover:!0,lofi:.55});c&&(c.progress=0),a.style.visibility=``,e.set(a,{xPercent:-50,yPercent:-50,scale:.6,autoAlpha:0});let l=e.quickTo(a,`x`,{duration:.55,ease:`power3.out`}),u=e.quickTo(a,`y`,{duration:.55,ease:`power3.out`}),d=e.quickTo(a,`rotation`,{duration:.8,ease:`power3.out`}),f={value:0},p=e.quickTo(f,`value`,{duration:.45,ease:`power2.out`,onUpdate:()=>{c&&(c.pixelate=f.value)}}),m=0,h=0,g=0,_=t=>{l(t.clientX),u(t.clientY),d(e.utils.clamp(-9,9,(t.clientX-m)*.5));let n=Math.hypot(t.clientX-m,t.clientY-h);p(e.utils.clamp(0,1,n/40)),window.clearTimeout(g),g=window.setTimeout(()=>p(0),90),m=t.clientX,h=t.clientY},y=null,b=i.map(t=>{let n=()=>{e.to(a,{"--preview-scale":Number(t.dataset.previewSize||1),duration:.5,ease:`power3.out`}),c&&(c.setSource(t.dataset.previewSrc??``),y?.kill(),c.progress=0,y=e.to(c,{progress:1,duration:.9,ease:`none`})),e.to(a,{scale:1,autoAlpha:1,duration:.45,ease:`power3.out`,overwrite:`auto`})};return t.addEventListener(`pointerenter`,n),[t,n]}),x=()=>{e.to(a,{scale:.6,autoAlpha:0,duration:.35,ease:`power3.in`,overwrite:`auto`})};return n.addEventListener(`pointerleave`,x),window.addEventListener(`pointermove`,_),s.push(r.create({trigger:t,start:`top bottom`,end:`bottom top`,onLeave:x,onLeaveBack:x})),()=>{window.clearTimeout(g),b.forEach(([e,t])=>e.removeEventListener(`pointerenter`,t)),n.removeEventListener(`pointerleave`,x),window.removeEventListener(`pointermove`,_),y?.kill(),e.killTweensOf(a),e.set(a,{clearProps:`all`}),c?.destroy()}}export{v as a,x as i,S as n,y as o,C as r,b as s,w as t};