// Tsim Sha Tsui site atlas: the demo book for the flipbook theme. Swap this file (or the
// window.FB_BOOK block in a standalone build) to make a different book; see README.md.
// Land-cover shares come from pages/landcover.json and palettes from pages/palettes.json, both
// measured from the map exports in assets/user/.
window.FB_BOOK = {
  theme: 'atlas', // atlas | nocturne | blueprint, or { base: 'atlas', accent: '#...' }
  meta: {
    brand: 'Site Atlas', title: 'Tsim Sha Tsui', running: 'Tsim Sha Tsui · Site Atlas',
    date: '26 · 10 · 2026', footer: '22.2964° N  114.1725° E',
  },
  // disc: the circular map inside each plate as [cx, cy, r] (fractions of width/height; r of width).
  images: {
    colour: { src: 'assets/user/colour.jpg', disc: [0.5, 0.5, 0.5] },
    figure: { src: 'assets/user/figure.jpg', disc: [0.499, 0.477, 0.439] },
    blueprint: { src: 'assets/user/blueprint.jpg', disc: [0.499, 0.477, 0.439] },
    night: { src: 'assets/user/night.jpg', disc: [0.499, 0.477, 0.439] },
    beige: { src: 'assets/user/beige.jpg', disc: [0.499, 0.477, 0.439] },
    model3d: { src: 'assets/user/model3d.jpg' },
  },
  pages: [
    { layout: 'cover', title: 'Tsim Sha\nTsui', zh: '尖沙咀', subtitle: 'A site atlas in six map plates',
      plate: 'colour',
      meta: [['Position', 'Yau Tsim Mong, Kowloon'], ['Centre', '22.2964° N  114.1725° E'], ['Radius', '1000 m  ·  3.14 km²']] },

    { layout: 'contents', title: 'Contents', zh: '目錄', kicker: 'Contents',
      body: 'One kilometre around the tip of the Kowloon peninsula, read through six map styles and the land-cover mix measured from them.' },

    { layout: 'feature', title: 'Site location', zh: '位置', kicker: 'Location',
      plate: { img: 'colour', rings: [[0.25, '250 m'], [0.5, '500 m'], [0.75, '750 m']] },
      body: 'The circle is centred on Tsim Sha Tsui with a 1000 m radius, taking in the Nathan Road spine, the harbour front and Kowloon Park.',
      stats: [['40.0%', 'Built footprint'], ['14.7%', 'Green cover'], ['14.5%', 'Water'], ['3.14 km²', 'Analysis area']] },

    { layout: 'pair', title: 'Figure ground and blueprint', zh: '圖底關係', kicker: 'Figure ground',
      items: [
        { plate: 'figure', label: 'Figure ground', stat: '40.0% built', caption: 'Solid buildings against open ground; 40.0% of the circle is built footprint.' },
        { plate: 'blueprint', label: 'Blueprint', stat: '#183878', caption: 'The same footprint as outlines on a navy ground, with no fills.' },
      ] },

    { layout: 'pair', title: 'Night and warm beige', zh: '夜色與暖米', kicker: 'Night & beige',
      items: [
        { plate: 'night', label: 'Night', stat: '#181818', caption: 'Low-key plate: slate buildings, dark water and deep-green trees.' },
        { plate: 'beige', label: 'Warm beige', stat: '#F8F8E8', caption: 'Sand-toned plate with cast shadow streaks across the street grid.' },
      ] },

    { layout: 'grid', title: 'One site, six readings', zh: '六種讀法', kicker: 'Plates',
      body: 'Every plate is the same 1000 m circle. Each style pulls a different layer forward: mass, outline, light, ground or height.',
      items: [
        { plate: 'colour', label: 'Colour' }, { plate: 'figure', label: 'Figure' }, { plate: 'blueprint', label: 'Blueprint' },
        { plate: 'night', label: 'Night' }, { plate: 'beige', label: 'Beige' }, { plate: { img: 'model3d', shape: 'disc', z: 1.1 }, label: '3D' },
      ] },

    { layout: 'bars', title: 'Land cover mix', zh: '土地覆蓋', kicker: 'Land cover',
      figure: ['30.1%', 'Open space & streets'],
      body: 'Share of each colour class inside the 1000 m circle, counted pixel by pixel on the full-colour plate.',
      rows: [
        ['Open space & streets', 30.1, '#D8D3C4'], ['Buildings · commercial', 21.2, '#D9B98A'], ['Buildings · other', 18.8, '#B9B3B2'],
        ['Water', 14.5, '#8FC0E6'], ['Parks', 11.7, '#A9CF95'], ['Trees', 3.0, '#5E9E4A'], ['Arterial roads', 0.6, '#E8902A'],
      ] },

    { layout: 'statement', kicker: 'Density', text: 'Two fifths of the ground is building.', zh: '四成土地是建築',
      note: 'Commercial (21.2%) and other buildings (18.8%) together cover 40.0% of the circle, concentrated north of Salisbury Road.' },

    { layout: 'feature', side: 'right', title: 'Street context', zh: '街道肌理', kicker: 'Streets',
      plate: { img: 'colour', z: 2.2, fx: 0.5, fy: 0.55 },
      body: 'At 400 m the grid resolves: Nathan Road runs north from the waterfront, crossed by the tight east-west blocks of Peking, Hankow and Haiphong Roads.',
      stats: [['400 m', 'Window'], ['×2.2', 'Zoom']] },

    { layout: 'pair', title: 'The core, two ways', zh: '核心區', kicker: 'Core',
      items: [
        { plate: { img: 'figure', z: 1.35, fx: 0.55, fy: 0.45 }, label: 'Figure ground · core', caption: 'Building mass at the centre of the circle.' },
        { plate: { img: 'colour', z: 1.35, fx: 0.55, fy: 0.45 }, label: 'Full colour · core', caption: 'The same window with land-cover colours.' },
      ] },

    { layout: 'feature', title: 'Blueprint', zh: '藍圖', kicker: 'Blueprint',
      plate: 'blueprint', body: 'Outline only. With fills removed, block edges, podium setbacks and the reclaimed waterfront line carry the drawing.',
      stats: [['#183878', 'Ground'], ['#486898', 'Line']] },

    { layout: 'feature', side: 'right', title: 'Night', zh: '夜', kicker: 'Night',
      plate: 'night', body: 'A low-key plate. Water drops to near black, so the harbour edge reads as the strongest line in the composition.',
      stats: [['#181818', 'Ground'], ['#383848', 'Buildings']] },

    { layout: 'feature', title: 'Warm beige', zh: '暖米', kicker: 'Warm beige',
      plate: 'beige', body: 'Sand tones with long cast shadows: height shows up as streaks across the street grid instead of as massing.',
      stats: [['#F8F8E8', 'Ground'], ['#D8D8C8', 'Buildings']] },

    { layout: 'feature', side: 'right', title: '3D massing', zh: '體量', kicker: 'Massing',
      plate: { img: 'model3d', shape: 'rect' },
      body: 'The circle extruded. Towers cluster along Nathan Road and the harbour front; the park and the waterfront promenade stay low.' },

    { layout: 'palette', title: 'Style palettes', zh: '色板', kicker: 'Palettes',
      body: 'Four dominant colours of each plate, sampled from the exported maps.',
      rows: [
        ['Full colour', ['#F8F8F8', '#080808', '#D8C8A8', '#A8D8F8']], ['Figure ground', ['#F8F8F8', '#181818', '#D8D8D8', '#787878']],
        ['Blueprint', ['#183878', '#486898', '#6878A8', '#285888']], ['Night', ['#181818', '#383848', '#888898', '#686868']],
        ['Warm beige', ['#F8F8E8', '#D8D8C8', '#A8C8E8', '#C8B8B8']], ['3D massing', ['#F8F8E8', '#A8A898', '#988868', '#483828']],
      ] },

    { layout: 'grid', title: 'Quadrants', zh: '四象限', kicker: 'Quadrants',
      body: 'The colour plate split into its four quarters at twice the scale.',
      items: [['NW', 0.3, 0.3], ['NE', 0.7, 0.3], ['SW', 0.3, 0.7], ['SE', 0.7, 0.7]].map(([l, fx, fy]) => ({ plate: { img: 'colour', z: 2, fx, fy }, label: l })) },

    { layout: 'image', plate: { img: 'model3d', z: 1.15, fx: 0.55, fy: 0.5 }, caption: '3D massing · view from the south-west' },

    { layout: 'statement', kicker: 'Reading', text: 'Read the city in layers.', zh: '一層一層去讀城市',
      note: 'Six styles, one circle: each plate keeps the geometry and changes which layer comes forward.' },

    { layout: 'closing', title: 'Fin.', zh: '完', kicker: 'Colophon', plate: 'colour',
      lines: [['Area', 'Tsim Sha Tsui, Kowloon, Hong Kong'], ['Radius', '1000 m'], ['Plates', 'Six map styles from the author’s exports'], ['Motion', 'Flip timing measured frame by frame at 30 fps']] },
  ],
};
