export type ModeKey = 'unity' | 'web';

export interface Media {
  /** For 'youtube', src is the video id. */
  type: 'image' | 'video' | 'youtube';
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
  /** YouTube id: the card opens the YouTube modal. */
  yt?: string;
  /** Instagram post or reel URL: the card opens the Instagram embed. */
  ig?: string;
  /** Card thumbnail; defaults to the YouTube thumbnail. */
  img?: string;
  /** Local media: the card opens the gallery modal. Added after the embed when there is one (breakdowns). */
  media?: Media[];
  links?: ProjectLink[];
  /** Short muted loop played on the card on hover. */
  preview?: string;
  /** The media is a frame sequence shown as a drag-to-rotate turntable. */
  turntable?: boolean;
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
    bio: 'Shaders, VFX and cinematics in HDRP and URP, plus VR for Quest and mobile. Co-author at PMW-2026.',
    titleA: 'Technical Artist',
    titleB: 'Unity Developer',
    headline: 'Real-time rendering, shaders and tools for Unity.',
    hue: 0.36,
    // Rendering, then languages, platforms and tooling.
    stack: ['Unity URP | HDRP', 'HLSL', 'OpenGL ES', 'C#', 'C++', 'Python', 'Meta Quest 3', 'Android SDK', 'Git LFS'],
    exp: [
      { role: 'Technical Artist', org: 'Rassone Studios', date: 'Jun 2026 – Sep 2026', info: ['Wrote a custom two-pass toon shader to complete the game demo.', 'Built the animation and VFX setup, plus the C# editor tools behind it.', 'Removed 1,832 unused components after profiling, with no change to renderer or prefab counts.'] },
      { role: 'Graphics Programmer & Developer', org: 'Universidad de Guanajuato × Secretaría de Salud', date: 'Jan 2025 – Aug 2026', info: ['Built an AR/VR mental-health app in Unity and C#.', 'Owned the shader and rendering layer under a strict mobile frame budget.', 'Reduced shader instruction count and overdraw to stay within that budget.', 'Co-authored the resulting paper, accepted at PMW-2026.'] },
      { role: 'AR Developer', org: 'Universidad de Guanajuato, DICIS', date: 'Jan 2026 – Jun 2026', info: ['Built an interactive outreach app for university career fairs, run on-site by non-technical staff.'] },
    ],
    sections: [
      { id: 'cinematics', title: 'cinematics', note: 'HDRP, URP, timeline, cameras', projects: [
        { yt: 'n7X-pvLMr8U', title: 'Kriemhild Gretchen', desc: 'Interpretive cinematic in Unity HDRP: procedural model scaling, glitch and mist shaders, custom lighting, set and camera work.', tags: ['HDRP', 'Shaders', 'Lighting', 'Cameras'] },
        { yt: 'RcN1iPYncfM', title: 'Zelda: URP Cinematic', desc: 'Cannon beam, a reactive and destructible shield, and a procedural cinematic synced beat by beat to in-game music. Zelda uses IK and a custom camera.', tags: ['URP', 'VFX', 'IK', 'Custom camera'] },
        { yt: 'lanOS08ilwI', title: 'Hammer of Dawn: Cinematic', desc: 'Cinematic interpretation of the Hammer of Dawn attack from Gears of War.', tags: ['Cinematic', 'VFX'] },
      ] },
      { id: 'vfx', title: 'vfx', note: 'real-time effects, VFX Graph, HLSL', projects: [
        { ig: 'https://www.instagram.com/reel/DfBaB8wtLHK/', img: '/work/portal-bubbles/thumb.jpg', title: 'Portal Bubbles', desc: 'Portal bubbles recreated in Unity from a Blender concept, for the continuation of the Kriemhild reel.', tags: ['Unity VFX', 'Portals', 'Kriemhild'] },
        {
          img: '/assets/hammer-beam.jpg', title: 'Hammer of Dawn: Real-time VFX',
          desc: 'Real-time Hammer of Dawn effect: the beam strike with building destruction, and the burned atmosphere in the sky.',
          tags: ['Real-time', 'VFX', 'Destruction', 'Sky FX'],
          media: [
            { type: 'youtube', src: 'G93O6hxvWB8', caption: 'impact & destruction' },
            { type: 'youtube', src: 'T_bsac0WFsM', caption: 'sky' },
          ],
        },
      ] },
      { id: 'shaders', title: 'shaders & rendering', note: 'HLSL, URP, custom passes', projects: [
        { yt: 'HvoIC2wcSL4', img: '/assets/granted-wish.jpg', title: 'Granted Wish', desc: 'Ray-traced water, responsive drizzle, volumetric fog and clouds, and a custom skybox.', tags: ['Ray-traced water', 'Volumetrics', 'Skybox'] },
        {
          ig: 'https://www.instagram.com/p/DfDxSIjkaIo/', img: '/work/lancer-skins/thumb.jpg', title: 'Lancer Skins',
          desc: 'Gears of War Lancer skins fan art: a shader and VFX study in Unity, built with Shader Graph, subgraphs and VFX Graph.',
          tags: ['Shader Graph', 'Subgraphs', 'VFX Graph', 'Fan art'],
          media: [
            { type: 'image', src: '/work/lancer-skins/shader-graph.png', caption: 'breakdown: shader graph' },
            { type: 'video', src: '/work/lancer-skins/shader-graph.mp4', poster: '/work/lancer-skins/shader-graph-poster.jpg', caption: 'breakdown: graph + subgraphs' },
          ],
        },
      ] },
      { id: 'xr', title: 'xr / vr', note: 'Quest, mobile VR, AR', projects: [
        { yt: 'NvtyiGGKYJ8', title: 'Sentinela: VR Game Trailer', desc: 'Mental-health VR game made with the Guanajuato Secretaría de Salud (ISAPEG). Lead programmer and technical artist; owned shaders and rendering under a mobile VR frame budget. Paper accepted at PMW-2026.', tags: ['VR', 'Mental health', 'Lead programmer', 'Tech art'] },
      ] },
      { id: 'games', title: 'games & prototypes', note: 'demos and jams', projects: [
        { yt: 'EF1ZiQQhXeI', title: 'XibalHa', desc: '2D game for the INAH Game Jam 2026 about preserving underwater environments. Built the responsive controls: keyboard on desktop, on-screen on mobile.', tags: ['2D', 'Game jam', 'WebGL', 'Mobile controls'], links: [{ label: '▶ play on itch.io', href: 'https://luizaguilar001.itch.io/xibalha' }] },
        {
          title: 'Herrería Embrujada', img: '/work/herreria/thumb.jpg',
          desc: 'First-person horror experience set in a haunted forge. Shader Graph materials, VFX Graph effects and a Cinemachine camera.',
          tags: ['Shader Graph', 'VFX Graph', 'Cinemachine', 'First person'],
          media: [{ type: 'video', src: '/work/herreria/herreria.mp4', poster: '/work/herreria/poster.jpg', caption: 'Gameplay' }],
          preview: '/work/herreria/preview.mp4',
          links: [
            { label: '↓ windows', href: 'https://drive.google.com/file/d/1X6PIH3FpF-EKfCxxG9WZfrNNorN30u7q/view?usp=sharing' },
            { label: '↓ macos', href: 'https://drive.google.com/file/d/181SgMlX90peLIArG36QbY9R28TGhR_2h/view?usp=sharing' },
          ],
        },
        {
          title: 'La Llorona', img: '/work/la-llorona/thumb.jpg',
          desc: 'First-person horror minigame: survive by keeping La Llorona in your line of sight while you complete objectives.',
          tags: ['Horror', 'First person', 'AI behavior'],
          preview: '/work/la-llorona/preview.mp4',
          media: [
            { type: 'video', src: '/work/la-llorona/gameplay.mp4', poster: '/work/la-llorona/thumb.jpg', caption: 'Gameplay' },
            ...images([1, 2, 3, 4, 5].map((n) => `/work/la-llorona/shot-${n}.jpg`), (i) => `Screenshot 0${i + 1}`),
          ],
        },
      ] },
      { id: 'modeling', title: 'modeling & rigging', note: 'Maya, hard surface, rigging', projects: [
        {
          title: 'Knight', img: '/work/knight/thumb.jpg',
          desc: 'Medieval knight for an animated short: modeling, rigging and animation in Maya, with the final implementation in Unity.',
          tags: ['Maya', 'Modeling', 'Rigging', 'Unity'],
          preview: '/work/knight/preview.mp4',
          media: [
            { type: 'video', src: '/work/knight/knight.mp4', poster: '/work/knight/poster.jpg', caption: 'Knight / video' },
            ...images([1, 2, 3].map((n) => `/work/knight/knight-${n}.jpg`), (i) => `Knight / 0${i + 1}`),
          ],
        },
        {
          title: 'Robot Antg', img: '/work/robot-antg/thumb.jpg',
          desc: 'Hard-surface robot modeled in Maya. Drag to spin the 30-frame turntable.',
          tags: ['Maya', 'Modeling', 'Hard surface'],
          media: images(robotAntgFrames, (i) => `Frame ${String(i + 1).padStart(2, '0')}`),
          turntable: true,
        },
      ] },
      { id: 'texturing', title: 'texturing & lookdev', note: 'Substance Painter, baking, materials', projects: [
        {
          title: 'Samurai', img: '/work/samurai/thumb.jpg',
          desc: 'Character texturing in Substance Painter, with final lookdev renders.',
          tags: ['Substance Painter', 'Lookdev', 'Render'],
          media: images([1, 2, 3, 4].map((n) => `/work/samurai/samurai-${n}.jpg`), (i) => `Samurai / 0${i + 1}`),
        },
        {
          title: 'Mons 1 / 2 / 3', img: '/work/mons/thumb.jpg',
          desc: 'Horror creatures textured for Herrería Embrujada, with material variants.',
          tags: ['Texturing', 'Horror', 'Creature art'],
          media: monsImages,
        },
        {
          title: 'Robot Render', img: '/work/robot-render/thumb.jpg',
          desc: 'Lookdev and final render of a robot, focused on metallic materials.',
          tags: ['Texturing', 'Metal', 'Render'],
          media: [{ type: 'image', src: '/work/robot-render/robot-render.jpg', caption: 'Robot Render' }],
        },
      ] },
      { id: 'apps', title: 'apps', note: 'Android, OpenGL ES, NDI', projects: [
        {
          title: 'LiveSketch', img: '/work/livesketch/thumb.jpg',
          desc: 'Android drawing app (NativeActivity + OpenGL ES) that streams its canvas over the network via NDI.',
          tags: ['Android', 'NativeActivity', 'OpenGL ES', 'NDI', 'C++', 'Java'],
          media: [
            { type: 'image', src: '/work/livesketch/livesketch-1.jpg', caption: 'LiveSketch / canvas' },
            { type: 'image', src: '/work/livesketch/livesketch-2.jpg', caption: 'LiveSketch / NDI' },
          ],
          links: [
            { label: '▶ try in browser', href: 'https://fernandocortes.dev/LiveSketch-Android/' },
            { label: '↓ apk', href: LIVESKETCH_APK },
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
      { id: 'sites', title: 'production sites', note: 'deployed, CMS-backed' },
      { id: 'webgl', title: 'webgl & creative code', note: 'Three.js, GLSL' },
      { id: 'dataviz', title: 'data visualization', note: 'maps, interactive data' },
    ],
  },
};

/**
 * /WebDeveloping is disabled for now. To bring it back: set this to true and
 * rename src/pages/_WebDeveloping.astro to WebDeveloping.astro.
 */
export const WEB_ENABLED = false;
