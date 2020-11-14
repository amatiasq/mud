const x = [
  {
    level: 1,
    type: 'Hechizo',
    name: 'armadura',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 1,
    type: 'Hechizo',
    name: 'causar leve',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'carpinteria',
    minPos: 'de pie',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'cocinar',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'despellejar',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'estilo estandar',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'estilo evasivo',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'forjar',
    minPos: 'de pie',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'minar',
    minPos: 'de pie',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'pescar',
    minPos: 'de pie',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'talar',
    minPos: 'de pie',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'tallar',
    minPos: 'de pie',
  },
  {
    level: 1,
    type: 'Habilidad',
    name: 'tejer',
    minPos: 'de pie',
  },
  {
    level: 1,
    type: 'Arma',
    name: 'armas cortas',
  },
  {
    level: 1,
    type: 'Arma',
    name: 'armas flexibles',
  },
  {
    level: 1,
    type: 'Arma',
    name: 'armas impacto',
  },
  {
    level: 1,
    type: 'Arma',
    name: 'armas largas',
  },
  {
    level: 1,
    type: 'Arma',
    name: 'garras',
  },
  {
    level: 1,
    type: 'Arma',
    name: 'pugilismo',
  },
  { level: 1, type: 'Idioma', name: 'comun' },
  { level: 1, type: 'Idioma', name: 'elfico' },
  {
    level: 1,
    type: 'Idioma',
    name: 'enano',
  },
  {
    level: 1,
    type: 'Idioma',
    name: 'goblin',
  },
  {
    level: 1,
    type: 'Idioma',
    name: 'ogro',
  },
  {
    level: 1,
    type: 'Idioma',
    name: 'orco',
  },
  {
    level: 1,
    type: 'Idioma',
    name: 'troll',
  },
  {
    level: 2,
    type: 'Hechizo',
    name: 'crear agua',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 2,
    type: 'Hechizo',
    name: 'curar leves',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 2,
    type: 'Hechizo',
    name: 'luz eterna',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 2,
    type: 'Habilidad',
    name: 'cartografia',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 2,
    type: 'Habilidad',
    name: 'cavar',
    minPos: 'de pie',
  },
  {
    level: 3,
    type: 'Hechizo',
    name: 'crear comida',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 3,
    type: 'Hechizo',
    name: 'detectar magia',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 4,
    type: 'Hechizo',
    name: 'detectar invisible',
    minPos: 'luchando (berserk)',
  },
  {
    level: 4,
    type: 'Hechizo',
    name: 'fuego espectral',
    minPos: 'luchando',
  },
  {
    level: 4,
    type: 'Habilidad',
    name: 'montar',
    minPos: 'de pie',
  },
  {
    level: 5,
    type: 'Hechizo',
    name: 'bendecir',
    minPos: 'luchando',
  },
  {
    level: 5,
    type: 'Hechizo',
    name: 'causar grave',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 5,
    type: 'Hechizo',
    name: 'ceguera',
    minPos: 'luchando (berserk)',
  },
  {
    level: 5,
    type: 'Hechizo',
    name: 'curar ceguera',
    minPos: 'luchando',
  },
  {
    level: 5,
    type: 'Hechizo',
    name: 'detectar maldad',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 6,
    type: 'Hechizo',
    name: 'crear fuego',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 6,
    type: 'Hechizo',
    name: 'flotar',
    minPos: 'luchando',
  },
  {
    level: 6,
    type: 'Habilidad',
    name: 'buscar',
    minPos: 'de pie',
  },
  {
    level: 6,
    type: 'Habilidad',
    name: 'escalar',
    minPos: 'de pie',
  },
  {
    level: 6,
    type: 'Habilidad',
    name: 'patada',
    minPos: 'luchando (berserk)',
  },
  {
    level: 6,
    type: 'Habilidad',
    name: 'primeros auxilios',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 7,
    type: 'Hechizo',
    name: 'refrescar',
    minPos: 'luchando',
  },
  {
    level: 7,
    type: 'Habilidad',
    name: 'danyo incrementado',
    minPos: 'luchando (berserk)',
  },
  {
    level: 7,
    type: 'Habilidad',
    name: 'estilo agresivo',
  },
  {
    level: 8,
    type: 'Hechizo',
    name: 'curar veneno',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 8,
    type: 'Hechizo',
    name: 'detectar escondido',
    minPos: 'de pie',
  },
  {
    level: 8,
    type: 'Hechizo',
    name: 'detectar trampas',
    minPos: 'de pie',
  },
  {
    level: 8,
    type: 'Hechizo',
    name: 'terremoto',
    minPos: 'luchando',
  },
  {
    level: 9,
    type: 'Hechizo',
    name: 'causar critica',
    minPos: 'luchando',
  },
  {
    level: 9,
    type: 'Hechizo',
    name: 'conocer alineamiento',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 9,
    type: 'Hechizo',
    name: 'misil magico',
    minPos: 'luchando',
  },
  {
    level: 9,
    type: 'Hechizo',
    name: 'volar',
    minPos: 'luchando',
  },
  {
    level: 10,
    type: 'Hechizo',
    name: 'crear baya',
    minPos: 'ninguna',
  },
  {
    level: 10,
    type: 'Hechizo',
    name: 'crear manantial',
    minPos: 'luchando',
  },
  {
    level: 10,
    type: 'Hechizo',
    name: 'curar graves',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 10,
    type: 'Hechizo',
    name: 'invisibilidad',
    minPos: 'de pie',
  },
  {
    level: 10,
    type: 'Hechizo',
    name: 'invocar armadillo',
    minPos: 'de pie',
  },
  {
    level: 10,
    type: 'Hechizo',
    name: 'veneno',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 11,
    type: 'Hechizo',
    name: 'niebla espectral',
    minPos: 'de pie',
  },
  {
    level: 11,
    type: 'Hechizo',
    name: 'proteccion',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 12,
    type: 'Hechizo',
    name: 'curar criticas',
    minPos: 'luchando',
  },
  {
    level: 12,
    type: 'Hechizo',
    name: 'disipar maldad',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 12,
    type: 'Hechizo',
    name: 'llamar rayo',
    minPos: 'luchando',
  },
  {
    level: 12,
    type: 'Hechizo',
    name: 'maldecir',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 13,
    type: 'Hechizo',
    name: 'bola fuego',
    minPos: 'luchando',
  },
  {
    level: 13,
    type: 'Hechizo',
    name: 'control climatico',
    minPos: 'de pie',
  },
  {
    level: 13,
    type: 'Hechizo',
    name: 'detectar veneno',
    minPos: 'de pie',
  },
  {
    level: 13,
    type: 'Hechizo',
    name: 'identificar',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 13,
    type: 'Hechizo',
    name: 'localizar objeto',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 14,
    type: 'Hechizo',
    name: 'disipar magia',
    minPos: 'luchando',
  },
  {
    level: 14,
    type: 'Hechizo',
    name: 'piel robliza',
    minPos: 'de pie',
  },
  {
    level: 14,
    type: 'Hechizo',
    name: 'retirar invisibilidad',
    minPos: 'de pie',
  },
  {
    level: 14,
    type: 'Hechizo',
    name: 'saciar hambre',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 15,
    type: 'Hechizo',
    name: 'debilitar',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 15,
    type: 'Hechizo',
    name: 'relampago',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 15,
    type: 'Habilidad',
    name: 'manotazo',
    minPos: 'luchando',
  },
  {
    level: 15,
    type: 'Habilidad',
    name: 'otear',
    minPos: 'de pie',
  },
  {
    level: 15,
    type: 'Habilidad',
    name: 'pisoton',
    minPos: 'luchando (berserk)',
  },
  {
    level: 15,
    type: 'Habilidad',
    name: 'segundo ataque',
    minPos: 'luchando (berserk)',
  },
  {
    level: 16,
    type: 'Hechizo',
    name: 'golpe flamigero',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 16,
    type: 'Habilidad',
    name: 'meditar',
    minPos: 'descansando',
  },
  {
    level: 17,
    type: 'Hechizo',
    name: 'causar fatales',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 17,
    type: 'Hechizo',
    name: 'retirar maldicion',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 17,
    type: 'Hechizo',
    name: 'sonyar',
    minPos: 'de pie',
  },
  {
    level: 17,
    type: 'Hechizo',
    name: 'vista distancia',
    minPos: 'luchando',
  },
  {
    level: 17,
    type: 'Habilidad',
    name: 'estilo defensivo',
  },
  {
    level: 17,
    type: 'Habilidad',
    name: 'sigilo',
    minPos: 'de pie',
  },
  {
    level: 18,
    type: 'Hechizo',
    name: 'agarron impactante',
    minPos: 'luchando (berserk)',
  },
  {
    level: 18,
    type: 'Hechizo',
    name: 'respiracion acuatica',
    minPos: 'de pie',
  },
  {
    level: 18,
    type: 'Hechizo',
    name: 'retirar trampa',
    minPos: 'de pie',
  },
  {
    level: 19,
    type: 'Hechizo',
    name: 'sanar',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 20,
    type: 'Hechizo',
    name: 'fuerza vampirica',
    minPos: 'luchando',
  },
  {
    level: 20,
    type: 'Hechizo',
    name: 'invisibilidad grupo',
    minPos: 'de pie',
  },
  {
    level: 20,
    type: 'Hechizo',
    name: 'invocar lince',
    minPos: 'de pie',
  },
  {
    level: 20,
    type: 'Hechizo',
    name: 'invocar regreso',
    minPos: 'descansando',
  },
  {
    level: 20,
    type: 'Hechizo',
    name: 'polimorfar',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 20,
    type: 'Habilidad',
    name: 'rescatar',
    minPos: 'luchando (berserk)',
  },
  {
    level: 21,
    type: 'Habilidad',
    name: 'desarmar',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 22,
    type: 'Hechizo',
    name: 'rayo solar',
    minPos: 'luchando (berserk)',
  },
  {
    level: 24,
    type: 'Hechizo',
    name: 'atravesar puerta',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 24,
    type: 'Hechizo',
    name: 'furia naturaleza',
    minPos: 'ninguna',
  },
  {
    level: 25,
    type: 'Hechizo',
    name: 'escudo hielo',
    minPos: 'de pie',
  },
  {
    level: 26,
    type: 'Habilidad',
    name: 'esquivar',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 28,
    type: 'Habilidad',
    name: 'estilo berserk',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 30,
    type: 'Hechizo',
    name: 'encantar arma',
    minPos: 'de pie',
  },
  {
    level: 30,
    type: 'Hechizo',
    name: 'invocar aguila',
    minPos: 'de pie',
  },
  {
    level: 30,
    type: 'Hechizo',
    name: 'santuario',
    minPos: 'de pie',
  },
  {
    level: 30,
    type: 'Habilidad',
    name: 'tercer ataque',
    minPos: 'luchando (berserk)',
  },
  {
    level: 31,
    type: 'Hechizo',
    name: 'viajar',
    minPos: 'de pie',
  },
  {
    level: 32,
    type: 'Hechizo',
    name: 'relentizar',
    minPos: 'luchando',
  },
  {
    level: 34,
    type: 'Hechizo',
    name: 'dormir',
    minPos: 'de pie',
  },
  {
    level: 35,
    type: 'Hechizo',
    name: 'atravesar vegetacion',
    minPos: 'de pie',
  },
  {
    level: 35,
    type: 'Hechizo',
    name: 'drenar energia',
    minPos: 'luchando',
  },
  {
    level: 35,
    type: 'Hechizo',
    name: 'escudo flamigero',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 35,
    type: 'Hechizo',
    name: 'metal ardiente',
    minPos: 'luchando',
  },
  {
    level: 35,
    type: 'Hechizo',
    name: 'piel petrea',
    minPos: 'luchando',
  },
  {
    level: 35,
    type: 'Habilidad',
    name: 'rastrear',
    minPos: 'de pie',
  },
  {
    level: 40,
    type: 'Hechizo',
    name: 'escudo',
    minPos: 'luchando',
  },
  {
    level: 40,
    type: 'Hechizo',
    name: 'invocar lobo',
    minPos: 'de pie',
  },
  {
    level: 40,
    type: 'Habilidad',
    name: 'parada',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 42,
    type: 'Hechizo',
    name: 'enredo vegetal',
    minPos: 'ninguna',
  },
  {
    level: 43,
    type: 'Hechizo',
    name: 'transporte arboreo',
    minPos: 'ninguna',
  },
  {
    level: 45,
    type: 'Hechizo',
    name: 'escudo electrico',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 45,
    type: 'Hechizo',
    name: 'nube aturdidora',
    minPos: 'de pie',
  },
  {
    level: 45,
    type: 'Habilidad',
    name: 'cuarto ataque',
    minPos: 'luchando (berserk)',
  },
  {
    level: 45,
    type: 'Habilidad',
    name: 'esconderse',
    minPos: 'de pie',
  },
  {
    level: 48,
    type: 'Hechizo',
    name: 'vision verdadera',
    minPos: 'de pie',
  },
  {
    level: 50,
    type: 'Hechizo',
    name: 'invocar jaguar',
    minPos: 'de pie',
  },
  {
    level: 50,
    type: 'Hechizo',
    name: 'teleportar',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 51,
    type: 'Hechizo',
    name: 'cantico',
    minPos: 'luchando (evasivo)',
  },
  {
    level: 51,
    type: 'Habilidad',
    name: 'punyo_helado',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 52,
    type: 'Hechizo',
    name: 'crear arbol',
    minPos: 'ninguna',
  },
  {
    level: 52,
    type: 'Hechizo',
    name: 'destruir maldad',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 52,
    type: 'Habilidad',
    name: 'punyo_electrico',
    minPos: 'luchando (agresivo)',
  },
  {
    level: 54,
    type: 'Hechizo',
    name: 'maremoto',
    minPos: 'luchando',
  },
  {
    level: 57,
    type: 'Hechizo',
    name: 'vara robliza',
    minPos: 'ninguna',
  },
  {
    level: 60,
    type: 'Hechizo',
    name: 'delirio caotico',
    minPos: 'luchando',
  },
  {
    level: 60,
    type: 'Hechizo',
    name: 'invocar oso',
    minPos: 'de pie',
  },
  {
    level: 60,
    type: 'Hechizo',
    name: 'rafaga viento',
    minPos: 'luchando',
  },
  {
    level: 62,
    type: 'Hechizo',
    name: 'relampago helado',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 63,
    type: 'Hechizo',
    name: 'clonacion',
    minPos: 'luchando (defensivo)',
  },
  {
    level: 67,
    type: 'Hechizo',
    name: 'tormenta hielo',
    minPos: 'luchando (berserk)',
  },
] as const;

type Item = typeof x[number];

// prettier-ignore
export const languageList = x.filter(x => x.type === 'Idioma') as LanguageBase[];
export const skillList = x.filter(x => x.type === 'Habilidad') as SkillBase[];
export const spellList = x.filter(x => x.type === 'Hechizo') as SpellBase[];
export const weaponList = x.filter(x => x.type === 'Arma') as WeaponBase[];

export type LanguageBase = Extract<Item, { type: 'Idioma' }>;
export type SkillBase = Extract<Item, { type: 'Habilidad' }>;
export type SpellBase = Extract<Item, { type: 'Hechizo' }>;
export type WeaponBase = Extract<Item, { type: 'Arma' }>;

export type LanguageName = LanguageBase['name'];
export type SkillName = SkillBase['name'];
export type SpellName = SpellBase['name'];
export type WeaponName = WeaponBase['name'];
