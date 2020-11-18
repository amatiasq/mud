import ALL_AREAS from './areas-data';

type AreaBase = typeof ALL_AREAS[number];
type Arena = string | string[];

export type Realm = AreaBase['realm'];
export type AreaName = AreaBase['name'];
export type Area = AreaBase & { path?: string; arena?: Arena };

const sides = 'e2we';

const ARENAS: Partial<Record<AreaName, Arena>> = {
  // cadaver: { path: 'ru2sw'},
  'Academia de Darkhaven': ['Xse', 'Xne', 'Xse', 'Xne', 'Xs'],
  'El Gran Estadio': 'j',
  'El Imperio Orco': [
    `4n${sides}n`, // planta principal
    `ds${sides}s${sides}s${sides}s${sides}Xnu`, // sotano
    'uXs', // primer piso
    `un${sides}n${sides}Xs`, // segundo piso
    `un${sides}n${sides}nXsejk2whlen`, // tercer piso
    `u3n${sides}2nXs`, // cuarto piso
    `Xnu2s${sides}2ndXs`, // `Xnu2s${x}s3ndXs`, // cuarto piso parte 2 - we skip El Jefe
    `un${sides}n${sides}n${sides}n${sides}Xs`, // quinto piso
    `un${sides}n${sides}Xs`, // sexto piso
    'uns', // uXnXs', // septimo piso // cerrado con llave
    `un${sides}n${sides}2n`, // octavo piso
    'u', // techo
  ],
  'El Pantano Orco': [
    'wn2w',
    'n3esje4n4sw',
    '4nw3sw3nw3sw3nd',
    '3es3w3es3w',
    // 'Xs' // cerrado
  ],
  'La Mansion de Marmol': [
    'e2n', // entrada
    'n2d', // sotano
    [
      '3n3s',
      '3e3w', // prisionera
      '3w3e', // engendro
      '3s3n',
      '2us', // salir sotano
    ].join(''),
    '2e2w',
    '4w4e',
    '2unu', // Kivon & Nejane
  ],
  'La tumba de Damara': [
    'nnwes', // despensa
    'esn', // la prision
    '2ln',
  ],
};

export function getAreasForLevel(realm: Realm, level: number) {
  return (
    ALL_AREAS.filter(x => x.realm === realm && x.from <= level && x.to >= level)
      .sort((a, b) => a.to - b.to)
      // .sort((a, b) => avg(a, level) - avg(b, level))
      .map(getWithMetadata)
  );

  // function avg(area: AreaBase, level: number) {
  //   return Math.abs(level - area.from + (level - area.to));
  // }
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
