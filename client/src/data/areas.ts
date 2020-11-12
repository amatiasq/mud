import REALMS from './realms';

const ALL_AREAS = Object.values(REALMS).flat();

type AreaBase = typeof ALL_AREAS[number];
export type AreaName = AreaBase['name'];

export interface AreaMetadata {
  path: string;
  arena?: string;
}

export type Area = AreaBase & Partial<AreaMetadata>;

const METADATA: Partial<Record<AreaName, AreaMetadata>> = {
  // cadaver: { path: 'ru2sw'},
  'Academia de Darkhaven': {
    path: 'rds',
    arena: 'XseXneXseXneXse',
  },
  'El Cementerio': { path: 'r4wXs' },
  'El Gran Estadio': {
    path: 'r8e2n4el3e2s2jn',
    arena: 'j',
  },
  'El Campamento Goblin': { path: 'r10s4en3e2n' },
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
  const [first, ...candidates] = ALL_AREAS.filter(x =>
    x.name.includes(areaName),
  );

  if (candidates.length) {
    console.warn(
      `Many areas detected for ${areaName}:\n- ${candidates
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
