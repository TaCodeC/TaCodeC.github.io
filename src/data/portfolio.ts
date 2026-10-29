export type ModeKey = 'unity' | 'web';

export interface Media {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  caption?: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  title: string;
  desc: string;
  tags: string[];
  kind: string;
  /** YouTube id: the card opens the YouTube modal. */
  yt?: string;
  /** Instagram post or reel URL: the card opens the Instagram embed. */
  ig?: string;
  /** Card thumbnail; defaults to the YouTube thumbnail. */
  img?: string;
  /** Local media: the card opens the gallery modal. */
  media?: Media[];
  links?: ProjectLink[];
}

export interface Section {
  id: string;
  title: string;
  note: string;
  projects?: Project[];
}

export interface Experience {
  role: string;
  org: string;
  date: string;
  info: string[];
}

export interface ModeData {
  slug: string;
  role: string;
  bio: string;
  titleA: string;
  titleB: string;
  headline: string;
  hue: number;
  stack: string[];
  exp: Experience[];
  sections: Section[];
}

const LIVESKETCH_APK = 'https://drive.google.com/file/d/1bkaS038vE9e7umD3WS48KKHE6TBI_1LW/view?usp=share_link';

const images = (paths: string[], caption: (i: number) => string): Media[] =>
  paths.map((src, i) => ({ type: 'image', src, caption: caption(i) }));

const robotAntgFrames = Array.from({ length: 30 }, (_, i) => `/work/robot-antg/frame-${String(i + 1).padStart(2, '0')}.jpg`);

const monsImages: Media[] = [
  ...['1', '2', '3', '4', '5'].map((n) => ({ type: 'image' as const, src: `/work/mons/mons-1-${n}.jpg`, caption: `Mons 1 / 0${n}` })),
  ...['1', '2', '3'].map((n) => ({ type: 'image' as const, src: `/work/mons/mons-2-${n}.jpg`, caption: `Mons 2 / 0${n}` })),
  { type: 'image', src: '/work/mons/mons-3-1.jpg', caption: 'Mons 3 / 01' },
];

export const DATA: Record<ModeKey, ModeData> = {
  unity: {
    slug: 'unity',
    role: 'Technical Artist | Unity Developer',
    bio: 'Shaders, rendering and tools in Unity. Custom toon shading, mobile VR under tight frame budgets, and C# editor tooling. Co-author at PMW-2026.',
    titleA: 'Technical Artist',
    titleB: 'Unity Developer',
    headline: 'Real-time rendering, shaders and tools for Unity.',
    hue: 0.36,
    stack: ['C#', 'Unity URP', 'HLSL', 'C++', 'OpenGL ES', 'Python', 'Meta Quest 3', 'Android SDK', 'Git LFS'],
    exp: [
      { role: 'Technical Artist', org: 'Rassone Studios', date: 'Jun 2026 – Sep 2026', info: ['Wrote a custom two-pass toon shader to complete the game demo.', 'Built the animation and VFX setup, plus the C# editor tools behind it.', 'Removed 1,832 unused components after profiling, with no change to renderer or prefab counts.'] },
      { role: 'Graphics Programmer & Developer', org: 'Universidad de Guanajuato × Secretaría de Salud', date: 'Jan 2025 – Aug 2026', info: ['Built an AR/VR mental-health app in Unity and C#.', 'Owned the shader and rendering layer under a strict mobile frame budget.', 'Reduced shader instruction count and overdraw to stay within that budget.', 'Co-authored the resulting paper, accepted at PMW-2026.'] },
      { role: 'AR Developer', org: 'Universidad de Guanajuato, DICIS', date: 'Jan 2026 – Jun 2026', info: ['Built an interactive outreach app for university career fairs, run on-site by non-technical staff.'] },
    ],
    sections: [
      { id: 'cinematics', title: 'cinematics', note: 'HDRP, URP, timeline, cameras', projects: [
        { yt: 'n7X-pvLMr8U', kind: 'cinematic', title: 'Kriemhild Gretchen | Interpretive Cinematic (Unity HDRP)', desc: 'Interpretive Kriemhild Gretchen cinematic: procedural model scaling, glitch and mist shaders, custom lighting, set and camera work.', tags: ['HDRP', 'Shaders', 'Lighting', 'Cameras'] },
        { yt: 'RcN1iPYncfM', kind: 'cinematic', title: 'Zelda: URP Cinematic', desc: 'Cannon beam, a reactive and destructible shield, and a procedural cinematic synced beat by beat to in-game music. Zelda uses IK and a custom camera.', tags: ['URP', 'VFX', 'IK', 'Custom camera'] },
        { yt: 'lanOS08ilwI', kind: 'cinematic', title: 'Hammer of Dawn: Cinematic', desc: 'Cinematic interpretation of the Hammer of Dawn attack from Gears of War.', tags: ['Cinematic', 'VFX'] },
      ] },
      { id: 'vfx', title: 'vfx', note: 'real-time effects, VFX Graph, HLSL', projects: [
        { ig: 'https://www.instagram.com/reel/DfBaB8wtLHK/', kind: 'reel', img: '/work/portal-bubbles/thumb.jpg', title: 'Portal Bubbles', desc: 'Portal bubbles recreated in Unity from a Blender concept, for the continuation of the Kriemhild reel.', tags: ['Unity VFX', 'Portals', 'Kriemhild'] },
        { yt: 'G93O6hxvWB8', kind: 'real-time', img: '/assets/hammer-beam.jpg', title: 'Hammer of Dawn: Beam & Destruction', desc: 'Real-time Hammer of Dawn attack: beam strike and building destruction.', tags: ['Real-time', 'VFX', 'Destruction'] },
        { yt: 'T_bsac0WFsM', kind: 'real-time', img: '/assets/hammer-sky.jpg', title: 'Hammer of Dawn: Burned Atmosphere', desc: 'Hammer of Dawn attack with a burned-atmosphere sky effect.', tags: ['Real-time', 'Sky FX', 'Shaders'] },
      ] },
      { id: 'shaders', title: 'shaders_&_rendering', note: 'HLSL, URP, custom passes', projects: [
        { yt: 'HvoIC2wcSL4', kind: 'real-time', img: '/assets/granted-wish.jpg', title: 'Granted Wish', desc: 'Ray-traced water, responsive drizzle, volumetric fog and clouds, and a custom skybox.', tags: ['Ray-traced water', 'Volumetrics', 'Skybox'] },
        { ig: 'https://www.instagram.com/p/DfDxSIjkaIo/', kind: 'fan art', img: '/work/lancer-skins/thumb.jpg', title: 'Lancer Skins', desc: 'Gears of War Lancer skins fan art: a small VFX and shader study made with Shader Graph and VFX Graph in Unity.', tags: ['Fan art', 'Gears of War', 'Weapon skins'] },
      ] },
      { id: 'xr', title: 'xr_/_vr', note: 'Quest, mobile VR, AR', projects: [
        { yt: 'NvtyiGGKYJ8', kind: 'trailer', title: 'Sentinela: VR Game Trailer', desc: 'VR game developed for and in collaboration with ISAPEG Guanajuato. Lead programmer, technical artist, and implementation of features and interactions.', tags: ['VR', 'Lead programmer', 'Tech art', 'Interactions'] },
      ] },
      { id: 'games', title: 'games_&_prototypes', note: 'demos and jams', projects: [
        { yt: 'EF1ZiQQhXeI', kind: 'game jam', title: 'XibalHa', desc: '2D minigame made under a short deadline for the INAH Game Jam 2026 on preserving underwater environments. Implemented and programmed a responsive control system: PC controls on desktop web, on-screen controls on mobile.', tags: ['2D', 'Game jam', 'WebGL', 'Mobile controls'], links: [{ label: '▶ play on itch.io ↗', href: 'https://luizaguilar001.itch.io/xibalha' }] },
        {
          kind: 'horror', title: 'Herrería Embrujada', img: '/work/herreria/thumb.jpg',
          desc: 'First-person horror experience set in a haunted forge. Shader Graph materials, VFX Graph effects and a Cinemachine camera.',
          tags: ['Shader Graph', 'VFX Graph', 'Cinemachine', 'First person'],
          media: [{ type: 'video', src: '/work/herreria/herreria.mp4', poster: '/work/herreria/poster.jpg', caption: 'Gameplay' }],
          links: [
            { label: '↓ windows ↗', href: 'https://drive.google.com/file/d/1X6PIH3FpF-EKfCxxG9WZfrNNorN30u7q/view?usp=sharing' },
            { label: '↓ macos ↗', href: 'https://drive.google.com/file/d/181SgMlX90peLIArG36QbY9R28TGhR_2h/view?usp=sharing' },
          ],
        },
        {
          kind: 'horror', title: 'La Llorona', img: '/work/la-llorona/thumb.jpg',
          desc: 'First-person horror minigame: survive by keeping La Llorona in your line of sight while you complete objectives.',
          tags: ['Horror', 'First person', 'AI behavior'],
          media: [
            { type: 'video', src: '/work/la-llorona/gameplay.mp4', poster: '/work/la-llorona/thumb.jpg', caption: 'Gameplay' },
            ...images([1, 2, 3, 4, 5].map((n) => `/work/la-llorona/shot-${n}.jpg`), (i) => `Screenshot 0${i + 1}`),
          ],
        },
      ] },
      { id: 'modeling', title: 'modeling_&_rigging', note: 'Maya, hard surface, rigging', projects: [
        {
          kind: 'model', title: 'Knight', img: '/work/knight/thumb.jpg',
          desc: 'Medieval knight for an animated short: modeling, rigging and animation in Maya, with the final implementation in Unity.',
          tags: ['Maya', 'Modeling', 'Rigging', 'Unity'],
          media: [
            { type: 'video', src: '/work/knight/knight.mp4', poster: '/work/knight/poster.jpg', caption: 'Knight / video' },
            ...images([1, 2, 3].map((n) => `/work/knight/knight-${n}.jpg`), (i) => `Knight / 0${i + 1}`),
          ],
        },
        {
          kind: 'turntable', title: 'Robot Antg', img: '/work/robot-antg/thumb.jpg',
          desc: 'Hard-surface robot modeled in Maya, shown as a 30-frame render sequence to read silhouette and volume.',
          tags: ['Maya', 'Modeling', 'Hard surface'],
          media: images(robotAntgFrames, (i) => `Frame ${String(i + 1).padStart(2, '0')}`),
        },
      ] },
      { id: 'texturing', title: 'texturing_&_lookdev', note: 'Substance Painter, baking, materials', projects: [
        {
          kind: 'lookdev', title: 'Samurai', img: '/work/samurai/thumb.jpg',
          desc: 'Character texturing in Substance Painter, with final lookdev renders to review materials and surface read.',
          tags: ['Substance Painter', 'Lookdev', 'Render'],
          media: images([1, 2, 3, 4].map((n) => `/work/samurai/samurai-${n}.jpg`), (i) => `Samurai / 0${i + 1}`),
        },
        {
          kind: 'creatures', title: 'Mons 1 / 2 / 3', img: '/work/mons/thumb.jpg',
          desc: 'Horror creatures textured for Herrería Embrujada, with material variants and a grotesque surface read.',
          tags: ['Texturing', 'Horror', 'Creature art'],
          media: monsImages,
        },
        {
          kind: 'render', title: 'Robot Render', img: '/work/robot-render/thumb.jpg',
          desc: 'Lookdev and final render of a robot, focused on metallic materials and asset presentation.',
          tags: ['Texturing', 'Metal', 'Render'],
          media: [{ type: 'image', src: '/work/robot-render/robot-render.jpg', caption: 'Robot Render' }],
        },
      ] },
      { id: 'apps', title: 'apps', note: 'Android, OpenGL ES, NDI', projects: [
        {
          kind: 'android app', title: 'LiveSketch', img: '/work/livesketch/thumb.jpg',
          desc: 'Android drawing app (NativeActivity + OpenGL ES) that streams its canvas over the network via NDI. Downloadable as an alpha APK, and testable right in the browser.',
          tags: ['Android', 'NativeActivity', 'OpenGL ES', 'NDI', 'C++', 'Java'],
          media: [
            { type: 'image', src: '/work/livesketch/livesketch-1.jpg', caption: 'LiveSketch / canvas' },
            { type: 'image', src: '/work/livesketch/livesketch-2.jpg', caption: 'LiveSketch / NDI' },
          ],
          links: [
            { label: '▶ test in browser ↗', href: 'https://fernandocortes.dev/LiveSketch-Android/' },
            { label: '↓ download .apk ↗', href: LIVESKETCH_APK },
          ],
        },
      ] },
    ],
  },
  web: {
    slug: 'web',
    role: 'Web Developer | Creative Developer',
    bio: 'Production sites and real-time graphics for the browser. JavaScript, Astro, Three.js and GLSL, profiled until it runs on weak hardware.',
    titleA: 'Web Developer',
    titleB: 'Creative Developer',
    headline: 'Production sites and WebGL for the browser.',
    hue: 0.52,
    stack: ['JavaScript', 'Astro', 'Three.js', 'WebGL', 'GLSL', 'HTML5', 'CSS3', 'CMS', 'Linux', 'Python', 'Git'],
    exp: [
      { role: 'Web Developer', org: 'Universidad de Guanajuato, Posgrado en Biociencias (DICIVA)', date: 'Jan 2025 – Aug 2026', info: ["Built and launched the program's official website, now its main public presence.", 'Integrated a CMS so faculty publish news and updates without a developer.', 'Deployed the site on university servers in coordination with IT.', 'Organized program content into a clear structure for prospective students.'] },
      { role: 'Creative Developer', org: 'Independent · fernandocortes.dev', date: 'Ongoing', info: ['Designed Sin Fronteras, a migration-data map that uses Chernoff faces to show several variables at once.', "Created Fragment, a real-time generative visual system based on Freud's theory of the mind.", 'Built and deployed this portfolio with Astro.'] },
      { role: 'Graphics Programmer & Developer', org: 'Universidad de Guanajuato × Secretaría de Salud', date: 'Jan 2025 – Aug 2026', info: ['Built an AR/VR mental-health app in Unity and C#.', 'Owned the shader and rendering layer under a strict mobile frame budget.', 'Reduced shader instruction count and overdraw to stay within that budget.', 'Co-authored the resulting paper, accepted at PMW-2026.'] },
    ],
    sections: [
      { id: 'sites', title: 'production_sites', note: 'deployed, CMS-backed' },
      { id: 'webgl', title: 'webgl_&_creative_code', note: 'Three.js, GLSL' },
      { id: 'dataviz', title: 'data_visualization', note: 'maps, interactive data' },
    ],
  },
};

/** Placeholder cards rendered in sections with no projects. */
export const SLOTS_PER_SECTION = 3;

/**
 * /WebDeveloping is disabled for now. To bring it back: set this to true and
 * rename src/pages/_WebDeveloping.astro to WebDeveloping.astro.
 */
export const WEB_ENABLED = false;
