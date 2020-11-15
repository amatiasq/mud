import REALMS from './realms';

const ALL_AREAS = Object.values(REALMS).flat();

type AreaBase = typeof ALL_AREAS[number];
export type AreaName = AreaBase['name'];
export type AreaMetadata = { path?: string; arena?: string | string[] };
export type Area = AreaBase & AreaMetadata;

const ARENAS: Partial<Record<AreaName, AreaMetadata['arena']>> = {
  // cadaver: { path: 'ru2sw'},
  'Academia de Darkhaven': ['Xse', 'Xne', 'Xse', 'Xne', 'Xs'],
  'El Gran Estadio': 'j',
  'El Imperio Orco': [
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
  'La Mansion de Marmol': [
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
};

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
  if (area.name in ARENAS) {
    return { ...area, arena: ARENAS[area.name] };
  }

  return area;
}
