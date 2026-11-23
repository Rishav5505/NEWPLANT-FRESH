// Procedural 3D potted plants with three.js — no model files to download.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const POT_COLORS = {
  terracotta: { label: "Terracotta", color: "#c2603a", roughness: 0.9 },
  ivory: { label: "Ivory glaze", color: "#efe9dc", roughness: 0.25 },
  charcoal: { label: "Matte charcoal", color: "#2e322e", roughness: 0.8 },
  sage: { label: "Sage glaze", color: "#9fb89a", roughness: 0.35 },
  forest: { label: "Forest gloss", color: "#1f4a2d", roughness: 0.3 },
  blush: { label: "Blush clay", color: "#e3b5a4", roughness: 0.7 },
};
export const POT_SHAPES = { classic: "Classic taper", cylinder: "Modern cylinder", bowl: "Low bowl" };
export const PLANTS = { monstera: "Monstera", snake: "Snake Plant", pothos: "Money Plant", cactus: "Cactus" };
export const SIZES = { s: 0.8, m: 1, l: 1.2 };

// Seeded random so the same configuration always looks identical.
const rng = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

function potProfile(shape) {
  if (shape === "cylinder") return { pts: [[0, 0], [0.62, 0], [0.64, 0.02], [0.64, 0.95], [0.6, 0.95], [0.6, 0.12]], top: 0.95, inner: 0.58 };
  if (shape === "bowl") return { pts: [[0, 0], [0.4, 0], [0.62, 0.08], [0.8, 0.32], [0.86, 0.55], [0.8, 0.55], [0.74, 0.34], [0.55, 0.14]], top: 0.55, inner: 0.76 };
  return { pts: [[0, 0], [0.48, 0], [0.5, 0.02], [0.66, 0.86], [0.74, 0.88], [0.75, 1.0], [0.68, 1.0], [0.62, 0.9], [0.46, 0.1]], top: 1.0, inner: 0.64 };
}

function makePot(shape, colorKey) {
  const { pts, top, inner } = potProfile(shape);
  const c = POT_COLORS[colorKey] || POT_COLORS.terracotta;
  const geo = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 64);
  const mat = new THREE.MeshStandardMaterial({ color: c.color, roughness: c.roughness, metalness: 0, side: THREE.DoubleSide });
  const pot = new THREE.Mesh(geo, mat);
  pot.castShadow = pot.receiveShadow = true;
  const g = new THREE.Group();
  g.add(pot);
  // Soil
  const soil = new THREE.Mesh(new THREE.CircleGeometry(inner, 48), new THREE.MeshStandardMaterial({ color: "#3b2a1e", roughness: 1 }));
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = top - 0.07;
  soil.receiveShadow = true;
  g.add(soil);
  // A thin accent band on glazed pots
  if (colorKey === "ivory" || colorKey === "forest") {
    const band = new THREE.Mesh(new THREE.TorusGeometry(shape === "bowl" ? 0.78 : shape === "cylinder" ? 0.645 : 0.6, 0.012, 8, 96), new THREE.MeshStandardMaterial({ color: "#c9a55a", metalness: 0.8, roughness: 0.3 }));
    band.rotation.x = Math.PI / 2;
    band.position.y = shape === "bowl" ? 0.42 : top * 0.72;
    g.add(band);
  }
  return { group: g, soilY: top - 0.07, rimR: inner };
}

const leafMat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, side: THREE.DoubleSide, ...extra });

// Bend a flat leaf so it curls back along its length and cups across its width.
function bendLeaf(geo, curl, cup) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, -curl * y * y + cup * x * x);
  }
  geo.computeVertexNormals();
  return geo;
}

function monsteraLeaf(L, W, r) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(-W * 1.05, L * 0.02, -W * 1.1, L * 0.78, 0, L);
  s.bezierCurveTo(W * 1.1, L * 0.78, W * 1.05, L * 0.02, 0, 0);
  // Fenestrations
  for (const side of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const h = new THREE.Path();
      const cy = L * (0.3 + k * 0.2), cx = side * W * (0.45 + r() * 0.12);
      h.absellipse(cx, cy, W * 0.12, L * 0.045, 0, Math.PI * 2, false, side * 0.6);
      s.holes.push(h);
    }
  }
  return bendLeaf(new THREE.ShapeGeometry(s, 24), 0.35, 0.25);
}

function heartLeaf(L, W) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(-W * 1.2, L * 0.15, -W * 0.8, L * 0.85, 0, L);
  s.bezierCurveTo(W * 0.8, L * 0.85, W * 1.2, L * 0.15, 0, 0);
  return bendLeaf(new THREE.ShapeGeometry(s, 12), 0.6, 0.6);
}

function bladeLeaf(H, W, cup = 1.6) {
  const s = new THREE.Shape();
  s.moveTo(-W, 0);
  s.quadraticCurveTo(-W * 1.25, H * 0.55, 0, H);
  s.quadraticCurveTo(W * 1.25, H * 0.55, W, 0);
  s.lineTo(-W, 0);
  return bendLeaf(new THREE.ShapeGeometry(s, 16), 0.04, cup);
}

function stemTube(points, radius, color) {
  const curve = new THREE.CatmullRomCurve3(points);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, radius, 6, false), leafMat(color));
  m.castShadow = true;
  return { mesh: m, curve };
}

function buildMonstera(r) {
  const g = new THREE.Group();
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.4;
    const reach = 0.5 + r() * 0.4, h = 0.5 + r() * 0.55;
    const end = new THREE.Vector3(Math.cos(a) * reach, h, Math.sin(a) * reach);
    const { mesh, curve } = stemTube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 0.08, h * 0.5, Math.sin(a) * 0.08), end], 0.022, "#3f6b2f");
    g.add(mesh);
    const L = 0.55 + r() * 0.25;
    const leaf = new THREE.Mesh(monsteraLeaf(L, L * 0.48, r), leafMat(new THREE.Color("#2f6b34").lerp(new THREE.Color("#4f8f3f"), r())));
    leaf.castShadow = true;
    const pivot = new THREE.Group();
    pivot.position.copy(end);
    const tangent = curve.getTangent(1);
    pivot.rotation.y = -a + Math.PI / 2;
    pivot.rotation.x = -1.15 - r() * 0.35 + tangent.y * 0.15;
    pivot.add(leaf);
    pivot.userData.sway = { base: pivot.rotation.x, amp: 0.05 + r() * 0.04, phase: r() * 6 };
    g.add(pivot);
  }
  return g;
}

function buildSnake(r) {
  const g = new THREE.Group();
  const n = 9;
  for (let i = 0; i < n; i++) {
    const H = 1.1 + r() * 0.9, W = 0.09 + r() * 0.05;
    const leafGroup = new THREE.Group();
    // Yellow margin sandwiched between two green faces, so it reads correctly from both sides.
    const edge = new THREE.Mesh(bladeLeaf(H * 1.01, W * 1.08, 1.6 / 1.08 / 1.08), leafMat("#d8cf6a"));
    const green = leafMat(new THREE.Color("#244d2b").lerp(new THREE.Color("#3e6e3a"), r()), { side: THREE.FrontSide });
    const geo = bladeLeaf(H, W);
    const front = new THREE.Mesh(geo, green);
    front.position.z = 0.006;
    const back = new THREE.Mesh(geo, green);
    back.position.z = -0.006;
    back.rotation.y = Math.PI;
    back.scale.x = -1;
    front.castShadow = true;
    leafGroup.add(edge, front, back);
    const a = r() * Math.PI * 2, d = r() * 0.25;
    leafGroup.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
    leafGroup.rotation.y = a + r();
    leafGroup.rotation.z = (r() - 0.5) * 0.35;
    leafGroup.rotation.x = (r() - 0.5) * 0.25;
    leafGroup.userData.sway = { axis: "z", base: leafGroup.rotation.z, amp: 0.015 + r() * 0.015, phase: r() * 6 };
    g.add(leafGroup);
  }
  return g;
}

function buildPothos(r, rimR, soilY) {
  const g = new THREE.Group();
  const vines = 7;
  const leafGeo = heartLeaf(0.2, 0.12);
  for (let v = 0; v < vines; v++) {
    const a = (v / vines) * Math.PI * 2 + r() * 0.5;
    // Vines may hang below the rim but never through the floor
    const up = 0.2 + r() * 0.35, out = rimR + 0.1 + r() * 0.15, drop = -Math.min(0.3 + r() * 0.9, soilY - 0.08);
    const pts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(a) * rimR * 0.5, up, Math.sin(a) * rimR * 0.5),
      new THREE.Vector3(Math.cos(a) * out, up * 0.6, Math.sin(a) * out),
      new THREE.Vector3(Math.cos(a) * (out + 0.12), drop * 0.5, Math.sin(a) * (out + 0.12)),
      new THREE.Vector3(Math.cos(a) * (out + 0.08), drop, Math.sin(a) * (out + 0.08)),
    ];
    const { mesh, curve } = stemTube(pts, 0.008, "#4c7a35");
    g.add(mesh);
    const count = 9 + Math.floor(r() * 5);
    for (let k = 0; k < count; k++) {
      const t = 0.12 + (k / count) * 0.88;
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const leaf = new THREE.Mesh(leafGeo, leafMat(new THREE.Color("#3d7a32").lerp(new THREE.Color("#b9c96a"), r() * 0.45)));
      leaf.castShadow = true;
      const pivot = new THREE.Group();
      pivot.position.copy(p);
      pivot.lookAt(p.clone().add(new THREE.Vector3(tan.z, 0.4, -tan.x).multiplyScalar(k % 2 ? 1 : -1)));
      pivot.rotateX(-Math.PI / 2.4);
      const s = 0.7 + (1 - t) * 0.6;
      pivot.scale.setScalar(s);
      pivot.add(leaf);
      pivot.userData.sway = { base: pivot.rotation.x, amp: 0.06, phase: r() * 6 };
      g.add(pivot);
    }
  }
  return g;
}

function buildCactus(r) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: "#3f7a4a", roughness: 0.7 });
  const ribbed = (height, radius) => {
    const prof = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const y = t * height;
      const rr = t < 0.85 ? radius : radius * Math.sqrt(Math.max(0, 1 - ((t - 0.85) / 0.15) ** 2));
      prof.push(new THREE.Vector2(Math.max(rr, 0.001), y));
    }
    const geo = new THREE.LatheGeometry(prof, 48);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const ang = Math.atan2(z, x);
      const f = 1 + 0.09 * Math.cos(ang * 10);
      p.setX(i, x * f);
      p.setZ(i, z * f);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    return m;
  };
  g.add(ribbed(1.25, 0.26));
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    const elbow = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.22, 6, 16), mat);
    elbow.rotation.z = Math.PI / 2;
    elbow.position.x = side * 0.3;
    const up = ribbed(0.45 + r() * 0.2, 0.12);
    up.position.set(side * 0.43, 0, 0);
    arm.add(elbow, up);
    arm.position.y = 0.45 + r() * 0.25;
    arm.rotation.y = r() * 0.6;
    g.add(arm);
  }
  // Flower on top
  const flower = new THREE.Group();
  const petalGeo = heartLeaf(0.12, 0.06);
  for (let i = 0; i < 8; i++) {
    const p = new THREE.Mesh(petalGeo, leafMat("#e86f8a"));
    const piv = new THREE.Group();
    piv.rotation.y = (i / 8) * Math.PI * 2;
    piv.rotateX(-0.7);
    piv.add(p);
    flower.add(piv);
  }
  flower.add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), leafMat("#f5d36b")));
  flower.position.y = 1.25;
  g.add(flower);
  return g;
}

export class PlantStudio {
  constructor(container, { interactive = true, autoRotate = true } = {}) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const w = container.clientWidth || 600, h = container.clientHeight || 600;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.touchAction = interactive ? "none" : "auto";

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    this.camera.position.set(0, 2.3, 6);

    this.scene.add(new THREE.HemisphereLight("#fff8e8", "#3b4a35", 1.2));
    const sun = new THREE.DirectionalLight("#fff3dc", 2.4);
    sun.position.set(3, 6, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -3;
    sun.shadow.camera.right = sun.shadow.camera.top = 3;
    sun.shadow.radius = 6;
    this.scene.add(sun);
    const rim = new THREE.DirectionalLight("#c7e3ff", 0.8);
    rim.position.set(-4, 3, -3);
    this.scene.add(rim);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.18 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Floating pollen
    const pg = new THREE.BufferGeometry();
    const N = 60, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = Math.random() * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.pollen = new THREE.Points(pg, new THREE.PointsMaterial({ color: "#e9d98a", size: 0.03, transparent: true, opacity: 0.7 }));
    this.scene.add(this.pollen);

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1.15, 0);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enabled = interactive;
    this.controls.enableZoom = interactive;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 9;
    this.controls.minPolarAngle = 0.3;
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.autoRotate = autoRotate && !this.reduced;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.update();

    this.onResize = () => {
      const W = container.clientWidth, H = container.clientHeight;
      if (!W || !H) return;
      this.camera.aspect = W / H;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(W, H);
    };
    this.ro = new ResizeObserver(this.onResize);
    this.ro.observe(container);

    this.running = true;
    this.renderer.setAnimationLoop(() => this.tick());
  }

  setConfig({ plant = "monstera", shape = "classic", color = "terracotta", size = "m", seed = 7 }) {
    this.disposeGroup(this.root);
    this.root.clear();
    const r = rng(seed * 9973 + plant.length * 131);
    const { group: pot, soilY, rimR } = makePot(shape, color);
    this.root.add(pot);
    const builders = { monstera: buildMonstera, snake: buildSnake, pothos: (rr) => buildPothos(rr, rimR, soilY), cactus: buildCactus };
    const plantGroup = (builders[plant] || buildMonstera)(r);
    plantGroup.position.y = soilY;
    if (plant === "cactus") plantGroup.scale.setScalar(shape === "bowl" ? 0.8 : 1);
    this.root.add(plantGroup);
    this.plantGroup = plantGroup;
    const s = SIZES[size] || 1;
    this.root.scale.setScalar(s);
    // Pop-in animation
    this.popStart = this.clock.getElapsedTime();
    this.root.scale.setScalar(s * 0.85);
    this.targetScale = s;
  }

  tick() {
    if (!this.running) return;
    const t = this.clock.getElapsedTime();
    if (this.targetScale) {
      const k = Math.min(1, (t - this.popStart) / 0.5);
      const e = 1 - Math.pow(1 - k, 3);
      this.root.scale.setScalar(this.targetScale * (0.85 + 0.15 * e));
    }
    if (!this.reduced && this.plantGroup) {
      this.plantGroup.traverse((o) => {
        const s = o.userData.sway;
        if (!s) return;
        const v = s.base + Math.sin(t * 1.3 + s.phase) * s.amp;
        if (s.axis === "z") o.rotation.z = v;
        else o.rotation.x = v;
      });
      this.pollen.rotation.y = t * 0.03;
      this.pollen.position.y = Math.sin(t * 0.4) * 0.05;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  snapshot() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL("image/png");
  }

  disposeGroup(group) {
    group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
  }

  dispose() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
    this.ro.disconnect();
    this.controls.dispose();
    this.disposeGroup(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

export const webglAvailable = () => {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
};
