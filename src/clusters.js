export const AREAS = {
  desk: { label: 'Desk', hint: 'click to enter' },
  floor: { label: 'Floor', hint: 'click to enter' },
  bookshelf: { label: 'Bookshelf', hint: 'click to enter' },
};

export const CLUSTERS = {
  code: {
    label: 'Python & Coding',
    area: 'desk',
    view: 'desk',
    members: ['LapTop_Cube002'],
  },
  electronics: {
    label: 'Electronics',
    area: 'desk',
    view: 'desk',
    members: ['uno-', 'circut_part', 'Multmeter_Cube'],
  },
  coffee: {
    label: 'Coffee',
    area: 'desk',
    view: 'desk',
    members: ['coffee'],
  },
  photo: {
    label: 'Photography',
    area: 'desk',
    view: 'desk',
    members: ['Camera_mesh'],
  },
  flower: {
    label: 'Flower Making',
    area: 'desk',
    view: 'desk',
    members: ['flower'],
  },
  corkboard: {
    label: 'Bulletin Board',
    area: 'desk',
    view: 'desk-corkboard',
    members: ['Wall_corkboard'],
  },
  camping: {
    label: 'Camping & Fly Fishing',
    area: 'floor',
    view: 'floor',
    members: [
      'FishingRod_Lvl2',
      'Lure_',
      'tacklebox',
      'Rope_NurbsPath',
      'backpack',
    ],
  },
  forging: {
    label: 'Forging & Metal Casting',
    area: 'floor',
    view: 'floor',
    members: [
      'Anvil',
      'hammer',
      'WoodLog',
      'GoldBar_Cube',
      'Short_Sword_sword_Cube',
    ],
  },
  weights: {
    label: 'Weightlifting',
    area: 'floor',
    view: 'floor',
    members: ['dumbbellhandel', 'dumbbellwight'],
  },
  football: {
    label: 'Football',
    area: 'bookshelf',
    view: 'bookshelf',
    members: ['football'],
  },
  rcvehicles: {
    label: 'RC Vehicles',
    area: 'bookshelf',
    view: 'bookshelf',
    members: ['rover', 'drone', 'dronepart'],
  },
  lego: {
    label: 'LEGO',
    area: 'bookshelf',
    view: 'bookshelf',
    members: ['lego2x2', 'lego2x4', 'legoroverset_part'],
  },
  brain: {
    label: 'AI Agents (the brain on the shelf)',
    area: 'bookshelf',
    view: 'bookshelf',
    members: ['brain'],
  },
  music: {
    label: 'Music & Live Sound',
    area: 'bookshelf',
    view: 'bookshelf',
    members: ['midi'],
  },
  fabrication: {
    label: '3D Printing',
    area: 'bookshelf',
    view: 'bookshelf',
    members: ['3dprinter_part'],
  },
  reading: {
    label: 'Reading',
    area: 'bookshelf',
    view: 'bookshelf',
    members: ['bookstack', 'book1', 'book2', 'book3', 'book4', 'book5', 'book6'],
  },
  travel: {
    label: 'Travel',
    area: 'bookshelf',
    view: 'bookshelf',
    members: ['map'],
  },
  cross: {
    label: 'Prayer',
    area: 'bookshelf',
    view: 'bookshelf',
    members: ['cross'],
  },
};

const DECORATION_PREFIXES = [
  'flag',
  'hattop',
  'hatdecal',
  'hatbrim',
  'desklamp',
  'jarwithdesktools',
  'beanbag',
  'bed',
  'carpet',
  'painting',
  'Wall_Painting',
  'Wall_Art',
  'window',
  'windowcurt',
  'antlers',
  'chairpart',
  'burrito',
  'shelf_wall',
  'openbook',
  'Outlet',
  'screw',
  'screwdriver',
  'robotarm_part',
  'wrench',
  'tape',
  'Tool_box_Cube',
  'GoldBar_Cube',
];

export function isDecoration(name) {
  if (!name) return false;
  return DECORATION_PREFIXES.some((p) => name === p || name.startsWith(p));
}

export function clusterForName(name) {
  if (!name) return null;
  for (const [id, cluster] of Object.entries(CLUSTERS)) {
    if (cluster.members.some((m) => name === m || name.startsWith(m))) {
      return id;
    }
  }
  return null;
}

export function buildAreaRegistry(clusterRegistry) {
  const areas = { desk: [], floor: [], bookshelf: [] };
  for (const [id, meshes] of Object.entries(clusterRegistry)) {
    const area = CLUSTERS[id]?.area;
    if (area && areas[area]) areas[area].push(...meshes);
  }
  return areas;
}
