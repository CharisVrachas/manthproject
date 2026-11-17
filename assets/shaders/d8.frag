#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform float u_time;
uniform vec2 u_tResolution;
uniform float u_bass;
uniform float u_tremble;
uniform float u_mid;
uniform float u_progress;   // 0 → 1: entrata a pixel (Codrops PixelImageGSAP)
uniform float u_overlay;    // 0 → 1: copertura pixel ROSSI sull'immagine (zoom hero)
uniform vec3 u_color;       // colore dei blocchi pixel (#e32604)
uniform vec3 u_bg;          // colore fondo/letterbox (bianco di default;
                            // sul campo rosso di section_origin è #e32604)
uniform float u_zoom;       // scala della foto nel canvas (0.97 storico, 1.0 = piena)
uniform float u_pixelate;   // 0 → 1: il BORDO della foto si spixela col movimento (galleria)
uniform vec2 u_mouse;       // cursore in px del canvas (origine in alto a sinistra)
uniform float u_hover;      // 0 → 1: pixel sotto il cursore (galleria)
uniform float u_gray;       // 1 = B/N in GPU (sorgenti VIDEO, 31-10-2026)
uniform float u_cover;      // 1 = riempi il riquadro (cover) invece di contain
uniform float u_lofi;       // 0 → 1: look "poca definizione" come la prima foto
                            // della galleria (sfocato, più ai bordi, neri
                            // chiusi, grana, vignettatura)

mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// ─── Bordo che si spixela col movimento (come il video della hero): una
// fascia lungo i 4 lati, larga in proporzione a u_pixelate, diventa a
// blocchi; verso l'esterno alcuni blocchi spariscono (morsi, colore u_bg).
// Ritorna xy = coordinata da campionare, z = 1 se il blocco è mangiato.
// ─── Pixel sotto il cursore: i blocchi vicini al cursore prendono il colore
// del loro centro, più fitti vicino al punto e sparsi verso il bordo
vec2 hoverPixel(vec2 tc) {
  if (u_hover < 0.001) return tc;
  float hb = 10.0;
  vec2 g = floor(tc * u_resolution / hb);
  vec2 c = (g + 0.5) * hb;
  vec2 m = vec2(u_mouse.x, u_resolution.y - u_mouse.y); // vTexCoord ha y verso l'alto
  float k = (1.0 - distance(c, m) / 130.0) * u_hover;
  if (k <= 0.0) return tc;
  float on = step(random(g * 2.17 + 1.3), k * 1.5);
  return mix(tc, c / u_resolution, on);
}

vec3 edgePixel(vec2 tc) {
  tc = hoverPixel(tc);
  if (u_pixelate < 0.001) return vec3(tc, 0.0);
  float bs = 7.0;                                    // blocco in px canvas
  vec2 g = floor(tc * u_resolution / bs);
  vec2 c = (g + 0.5) * bs;                           // centro del blocco
  float d = min(min(c.x, u_resolution.x - c.x), min(c.y, u_resolution.y - c.y));
  float band = u_pixelate * 40.0 + 0.001;            // larghezza della fascia
  float k = 1.0 - d / band;                          // 1 sul bordo → 0 all'interno
  if (k <= 0.0) return vec3(tc, 0.0);
  float r = random(g * 1.37 + 3.1);
  float eaten = step(r, k * 0.55);                   // più morsi verso l'esterno
  return vec3(c / u_resolution, eaten);
}

void main() {
  vec3 ep = edgePixel(vTexCoord);
  vec2 tc = ep.xy;
  // ─── Mapping CONTAIN: l'intera foto entra nel canvas (nessun ritaglio),
  //     le zone fuori [0,1] sono letterbox bianca (sfondo pagina) ────────
  float canA = u_resolution.x / u_resolution.y;
  float texA = u_tResolution.x / u_tResolution.y;
  vec2 ratio = vec2(
    max(canA / texA, 1.0),
    max(texA / canA, 1.0)
  );
  // COVER (31-10-2026): riempie tutto il riquadro, ritagliando i bordi
  if (u_cover > 0.5) ratio = vec2(min(canA / texA, 1.0), min(texA / canA, 1.0));

  vec2 uv = vec2(
    tc.x * ratio.x + (1.0 - ratio.x) * 0.5,
    tc.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  uv.y = 1.0 - uv.y;

  uv -= vec2(0.5);
  uv = scale(vec2(u_zoom)) * uv;
  uv += vec2(0.5);

  float wave   = sin(uv.y * u_bass + u_time) * u_mid;
  vec2 d = vec2(wave);
  vec2 suv = uv + d;

  vec4 image;
  if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) {
    image = vec4(u_bg, 1.0);
  } else if (u_lofi > 0.001) {
    // ─── Lo-fi: sfocatura che cresce verso i bordi (lente economica),
    // contrasto con i neri chiusi, vignettatura e grana ─────────────────
    vec2 q = vTexCoord - 0.5;
    float edge = clamp(length(q * vec2(1.0, 1.25)) * 1.6, 0.0, 1.0);
    float r = mix(0.0045, 0.016, edge * edge) * u_lofi;
    vec4 acc = texture2D(u_texture, suv);
    for (int i = 0; i < 12; i++) {
      float a = float(i) * 2.399963;               // angolo aureo
      float rr = r * sqrt((float(i) + 0.5) / 12.0);
      acc += texture2D(u_texture, clamp(suv + vec2(cos(a), sin(a)) * rr, 0.0, 1.0));
    }
    vec3 c = acc.rgb / 13.0;
    c = smoothstep(0.06, 0.92, c);                 // neri chiusi, bianchi pieni
    c *= 1.0 - 0.7 * u_lofi * pow(edge, 2.4);      // vignettatura
    c += (random(floor(vTexCoord * u_resolution)) - 0.5) * 0.09 * u_lofi; // grana
    image = vec4(mix(texture2D(u_texture, suv).rgb, c, u_lofi), 1.0);
  } else {
    image = texture2D(u_texture, suv);
  }
  if (u_gray > 0.5) image.rgb = vec3(dot(image.rgb, vec3(0.2126, 0.7152, 0.0722)));

  // ─── Entrata a pixel (port di Codrops PixelImageGSAP) ────────────────
  // Griglia di blocchi ~14px: una linea di sweep scende per rivelare la
  // foto; lungo la linea un bordo rumoroso per-blocco (dissolvenza random)
  // composto col colore u_color, come nel demo three.js.
  float cellPx = 7.0;  // blocchi dell'entrata: piccoli (prima 14)
  float gridCount = max(1.0, floor(u_resolution.x / cellPx));
  vec2 cell = floor(vTexCoord * gridCount) / gridCount;

  float band = 0.2;
  float prog = (1.0 + band) - (u_progress * (1.0 + band + band));

  float dist = 1.0 - distance(cell.y, prog);
  float clampedDist = smoothstep(band, 0.0, distance(cell.y, prog));
  float randDist = step(1.0 - band * random(cell), dist);
  dist = step(1.0 - band, dist);
  float rand = random(cell);
  float alpha = dist * (clampedDist + rand - 0.5 * (1.0 - randDist));
  // a entrata finita niente blocchi: l'ultima fila in basso cadeva proprio
  // sul confine della banda e restava accesa di rosso (2-11-2026)
  float blockA = max(0.0, alpha) * step(u_progress, 0.999);

  // la foto appare solo dove la linea di sweep è già passata
  float revealed = step(prog, cell.y);

  vec3 shown = mix(u_bg, image.rgb, revealed);

  // ─── Overlay pixel rossi (zoom hero): a immagine a pieno schermo i
  // blocchi della griglia diventano ROSSI progressivamente — sweep dall'
  // alto + soglia rumorosa per-blocco, lo stesso linguaggio dell'entrata.
  float oThr = u_overlay * 1.35 - (1.0 - cell.y) * 0.35;
  float cover = step(rand, oThr);
  shown = mix(shown, u_color, cover);

  vec3 outC = mix(shown, u_color, blockA);
  gl_FragColor = vec4(mix(outC, u_bg, ep.z), 1.0);
}