import { Context } from './../lib/workflow/Context';

type ItemName = typeof ITEM_NAMES[number];

const ITEM_NAMES = [
  'anillo',
  'anteojos',
  // 'armadura',
  'baculo',
  'baston',
  'botas',
  // 'brazaletes',
  'capa',
  'casco',
  'coderas',
  'colgante',
  'collar',
  // 'cota',
  'daga',
  'escudo',
  'espada',
  'grebas',
  'guanteletes',
  'guantes',
  'hacha',
  'lanza',
  'mangas',
  'manoplas',
  'martillo',
  'maza',
  'mocasines',
  'pendiente',
  'perneras',
  'ropaje',
  'peto',
  'pica',
  'polainas',
  'pulsera',
  'somprero',
  'tobillera',
  'vara',
  'varita',
  'visera',
  'yelmo',
] as const;

const EQUIPMENT: Record<string, ItemName[]> = {
  weapon: [
    'baculo',
    'baston',
    'vara',
    'varita',
    'daga',
    'pica',
    'lanza',
    'espada',
    'hacha',
    'martillo',
    'maza',
  ],
  body: ['ropaje' /*'armadura', 'capa', 'cota', 'peto'*/],
  hands: [
    // 'brazaletes',
    'coderas',
    'guanteletes',
    'guantes',
    'mangas',
    'manoplas',
    'pulsera',
  ],
  feet: ['botas', 'grebas', 'mocasines', 'perneras', 'polainas', 'tobillera'],
  head: ['anteojos', 'casco', 'somprero', 'visera', 'yelmo'],
  complements: ['anillo', 'colgante', 'collar', 'pendiente'],
  shield: ['escudo'],
};

export async function donations({
  when,
  write,
  plugins: { navigation: nav },
}: Context) {
  write('estado');
  const { captured: levelMatch } = await when(/\|\| Nivel\s+: (\d+)\s+/);
  const level = parseInt(levelMatch[1], 10);

  const rooms = [
    { from: 31, to: 40, path: '4wn' },
    { from: 21, to: 30, path: '3wn' },
    { from: 11, to: 20, path: '2wn' },
    { from: 1, to: 10, path: 'wn' },
    { from: 41, to: 50, path: 'en' },
    { from: 51, to: 60, path: '2en' },
    { from: 61, to: 70, path: '3en' },
    { from: 71, to: 80, path: '4en' },
  ];

  const room = rooms.find(x => x.from <= level && x.to <= level);

  if (!room) {
    throw new Error(`No room for level "${level}"`);
  }

  await nav.execute('rh2w4n');

  const promise = when(/Salidas: sur\.\n\n((?:.|\n)*)\n\n/, {
    captureLength: Number.MAX_VALUE,
  });

  await nav.execute(room.path);

  const { captured: itemsMatch } = await promise;
  const list = itemsMatch[1].split('\n').map(x => x.trim());

  for (const items of Object.values(EQUIPMENT)) {
    for (const item of items) {
      if (list.some(x => x.includes(item)) && (await wear(item))) {
        break;
      }
    }
  }

  await nav.recall();

  async function wear(item: ItemName) {
    const LEVEL = false;
    const MISSING = null;
    const SUCCESS = true;

    write(`coger ${item}`);
    await when(/Coges /);
    write(`vestir ${item}`);

    const result = await Promise.any([
      when(/Debes ser nivel \d+ para usar este objeto/).then(() => LEVEL),
      when(['No hay ningun', 'no puedes llevar tantos objetos']).then(
        () => MISSING,
      ),
      when([
        'Blandes ',
        'Sostienes ',
        'Te pones ',
        'Te colocas ',
        'Usas ',
      ]).then(() => SUCCESS),
    ]);

    if (result === LEVEL) {
      write(`tirar ${item}`);
      await when('Tiras ');
    }

    return Boolean(result);
  }
}
