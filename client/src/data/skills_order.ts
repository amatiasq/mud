import { SkillName } from './spells';

export const SKILL_LEARN_ORDER: (SkillName | SkillName[])[] = [
  'estilo evasivo',
  'armas impacto',

  // Basicos
  ['crear manantial', 'crear agua'],
  ['crear baya', 'crear comida', 'saciar hambre'],
  'luz eterna',
  'refrescar',
  [
    'invocar oso',
    'invocar jaguar',
    'invocar lobo',
    'invocar aguila',
    'invocar lince',
    'invocar armadillo',
  ],
  'identificar',
  'meditar',
  'proteccion', // dope pero en el lugar
  'polimorfar',
  'viajar',
  'dormir',

  // Cura
  ['sanar', 'curar criticas', 'curar graves', 'curar leves'],
  'curar ceguera',
  'curar veneno',

  // Ofensivas
  'danyo incrementado',
  ['cuarto ataque', 'tercer ataque', 'segundo ataque'],
  ['parada', 'esquivar'],
  ['manotazo', 'patada', 'pisoton', 'agarron impactante'],
  ['causar fatales', 'causar critica', 'causar grave', 'causar leve'],
  ['ceguera', 'veneno', 'maldecir', 'debilitar', 'desarmar', 'relentizar'],
  ['terremoto', 'maremoto'],
  [
    'tormenta hielo',
    'rafaga viento',
    'relampago helado',
    'relampago',
    'llamar rayo',
    'bola fuego',
    'misil magico',
    'golpe flamigero',
    'rayo solar',
    'drenar energia',
    'metal ardiente',
    'enredo vegetal',
  ],
  ['punyo_helado', 'punyo_electrico'],

  // Dope,
  ['esconderse', 'invisibilidad'],
  'armadura',
  'bendecir',
  ['piel petrea', 'piel robliza'],
  ['volar', 'flotar'],
  'vision verdadera', // vale por infravision, detectar invisible y detectar oculto
  'detectar invisible',
  'detectar escondido',
  'detectar magia',
  'detectar maldad',
  'detectar trampas',
  'sigilo',
  'respiracion acuatica',
  'fuerza vampirica',
  'atravesar puerta',
  'furia naturaleza',
  ['escudo electrico', 'escudo hielo', 'escudo flamigero'], // requiere baya en inventario,
  'encantar arma', // requiere <arma>
  'santuario', // requiere <personaje>
  'atravesar vegetacion',
  'escudo',
  'delirio caotico',

  // Meh,
  'cavar',
  'cartografia',
  'despellejar',
  'carpinteria',
  'fuego espectral',
  'montar',
  'crear fuego',
  'buscar',
  'escalar',
  'primeros auxilios',
  'conocer alineamiento',
  'niebla espectral',
  'disipar maldad',
  'control climatico',
  'detectar veneno',
  'localizar objeto',
  'disipar magia',
  'retirar invisibilidad',
  'otear',
  'retirar maldicion',
  'sonyar',
  'vista distancia',
  'estilo defensivo',
  'retirar trampa',
  'invisibilidad grupo',
  'invocar regreso',
  'rastrear',
  'vara robliza',
  'clonacion',

  // // No,
  // 'cocinar',
  // 'estilo estandar',
  // 'forjar',
  // 'minar',
  // 'pescar',
  // 'talar',
  // 'tallar',
  // 'tejer',
  // 'armas cortas',
  // 'armas flexibles',
  // 'armas largas',
  // 'garras',
  // 'pugilismo',
  // 'enano',
  // 'goblin',
  // 'ogro',
  // 'orco',
  // 'troll',
  // 'estilo agresivo',
  // 'rescatar',
  // 'estilo berserk',
  // 'transporte arboreo',
  // 'crear arbol',
  // 'teleportar',
  // 'cantico',
  // 'destruir maldad',
];
