import REALMS from './realms';

const ALL_AREAS = Object.values(REALMS).flat();

type AreaBase = typeof ALL_AREAS[number];
export type AreaName = AreaBase['name'];

export interface AreaMetadata {
  path: string;
  arena?: string | string[];
}

export type Area = AreaBase & Partial<AreaMetadata>;

const METADATA: Partial<Record<AreaName, AreaMetadata>> = {
  // cadaver: { path: 'ru2sw'},
  'Academia de Darkhaven': {
    path: 'rd',
    arena: ['Xse', 'Xne', 'Xse', 'Xne', 'Xs'],
  },
  'Bosque de las Hadas': { path: 'r6w2nwk2wh' },
  'Catacumbas de la Capilla': { path: 'r6w8se7s' },
  'Cementerio Oscuro': { path: 'r4s4ws' },
  'Ciudad Imperial': { path: 'r8e2n4el3e2sj' },
  DarkHaven: { path: 'r' },
  'El Campamento Goblin': { path: 'r10s4en3e2n' },
  'El Cementerio': { path: 'r6w8ses' },
  'El Centinela': { path: 'r7ws' },
  'El Gran Estadio': {
    path: 'r8e2n4el3e2s2jn',
    arena: 'j',
  },
  'El Imperio Orco': {
    path: 'r13s2wn',
    arena: [
      '4ne2wen', // planta principal
      'dse2wese2wese2wese2weXnu', // sotano
      'uXs', // primer piso
      'une2wene2weXs', // segundo piso
      'une2wene2wenXsejk2whlen', // tercer piso
      'u3ne2we2n', // cuarto piso
      // 'u2se2wes3nd', // cuarto piso parte 2
      // 'Xsune2wene2wene2wene2weXs', // quinto piso
      // 'une2wene2weXs', // sexto piso
      // 'uXnXs', // septimo piso
      // 'une2wene2we2n', // octavo piso
      // 'u', // techo
    ],
  },
  'El Jardin de los Heroes': { path: 'r8e2n4el3e2s2j8l8e5j4els' },
  'El Pantano Orco': { path: 'r13s2en' },
  'El Refugio Destruido': { path: 'r8e2ne' },
  'Exportaciones de Dragones': { path: 'r4sen' },
  'Foire de Reves': { path: 'r8n3ene' },
  'Galeria de arte': { path: 'r4swn' },
  'Guarderia Enana': { path: 'r8ejs' },
  'Haon Dor': { path: 'r7w' },
  'Holy Grove': { path: 'r9e' },
  'La Fortaleza de Valor': { path: 'r11n2en' },
  'La Mansion de Marmol': {
    path: 'r9w3s',
    arena: [
      'e2n', // entrada
      'n2d', // sotano
      '3n3s',
      '3e3w', // prisionera
      // '3w3e', engendro
      '3s3n',
      '2us', // salir sotano
      '2e2w',
      '4w4e',
      // '2un', // Kivon & Nejane
    ],
  },
  'La Mansion de Tullfuhrzky': { path: 'r6w2nwk2wh4nj' },
  'La Torre del Brujo': { path: 'r9w2sese2s' },
  'Las Alcantarillas': { path: 'r4sd' },
  'Las Llanuras del Norte': { path: 'r7n' },
  "Miden'nir": { path: 'r7s' },
};

// export function getAreaName(name: string) {
//   return Object.keys(ALL_AREAS).find(x => x.includes(name));
// }

export function getAreasForLevel(level: number) {
  return REALMS.Calimhar.filter(x => x.from <= level && x.to >= level)
    .sort((a, b) => avg(a, level) - avg(b, level))
    .map(getWithMetadata);
}

function avg(area: AreaBase, level: number) {
  return Math.abs(level - area.from + (level - area.to));
}

export function getAreaMetadata(areaName: string) {
  const lower = areaName.toLowerCase();
  const [first, ...candidates] = ALL_AREAS.filter(x =>
    x.name.toLocaleLowerCase().includes(lower),
  );

  if (candidates.length) {
    console.warn(
      `Many areas detected for ${areaName}:\n- ${[first, ...candidates]
        .map(x => x.name)
        .join('\n- ')}`,
    );
  }

  return first && getWithMetadata(first);
}

function getWithMetadata(area: AreaBase): Area {
  if (area.name in METADATA) {
    return { ...area, ...METADATA[area.name] };
  }

  return area;
}
