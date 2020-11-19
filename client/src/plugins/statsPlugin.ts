import { PluginContext } from '../lib/PluginContext';
import { concatRegexes } from '../lib/util/concatRegexes';
import { int, toInt } from '../lib/util/int';

const SIZE = 3000;

const STATE_DETECTOR = (() => {
  type Args = Parameters<typeof concatRegexes>;
  const r = concatRegexes;
  const low = (x: string) => x.toLowerCase();

  const ANY = /(?:.|\n)+?/;
  const DASH = /\-{78}/;
  const SPACE = /\s+/;
  const PIPE = /\s+\|\s+/;
  const SPACER = /\|\|-{36}\+-{41}\|\|\n/;

  const row = (...content: Args) => r(/\|\|\s*/, ...content, /\s*\|\|\n/);
  const stat = (key: string) =>
    r(key, /\s+: /, int(low(key)), /\(/, int(`${low(key)}Base`), /\)/);

  const percent = (key: string) =>
    r(
      key,
      /\s+: /,
      int(low(key)),
      /\s+\//,
      int(`${low(key)}Base`),
      /\s+\(\s*/,
      int(`${low(key)}Regen`),
      /%\) (?:Regen)?/,
    );

  return r(
    DASH,
    /\n ?\/\s{78}\\\n/,
    row(/Ficha de (?<name>\w+)(?<principal> \(Personaje Principal\))\./),
    row(DASH),
    row(stat('FUE'), SPACE, stat('DES'), PIPE, percent('Vida')),
    row(stat('INT'), SPACE, stat('SAB'), PIPE, percent('Mana')),
    row(stat('CON'), SPACE, stat('CAR'), PIPE, percent('Mov')),
    row(stat('SUE'), SPACE, PIPE, SPACE),
    SPACER,
    r(/\|\|\s*Nivel\s+: /, int('level'), ANY),
    // ANY,
    // / \|\|\n\\\s{78}\/\n  /,
    // DASH,
  );

  /*
    ------------------------------------------------------------------------------
  /                                                                              \
  ||  Ficha de May (Personaje Principal).                                         ||
  ||------------------------------------------------------------------------------||
  || FUE      : 17(16)   DES   : 17(15) | Vida      : 362  /362   ( 0%) Regen     ||
  || INT      : 20(18)   SAB   : 17(16) | Mana      : 359  /359   ( 0%)           ||
  || CON      : 15(15)   CAR   : 15(15) | Mov       : 250  /250   ( 0%)           ||
  || SUE      : 14(14)                  |                                         ||
  ||------------------------------------+-----------------------------------------||
  || Nivel    : 15      Edad   : 68     | Profesion : Druida   Raza: Medio-Elfo   ||
  || Hitroll  : 19      Damroll: 18     | Objetos   : 1    /8                     ||
  || Armadura : -13     Alin   : 40     | Peso      : 36   /220                   ||
  || Impacto  : 22 %    Da�o   : 11     | Posicion  : de pie                      ||
  || Esquivar : 12 %    Parada : 12 %   | Estilo    : estandar                    ||
  || Huida    : 0       Horas  : 102    | Mision    : 0 /15   Quest: 0    (0 /50) ||
  ||------------------------------------+-----------------------------------------||
  || FISIC Da�o/Res/Crit:   0%/  0%/ 3% |            Salvaciones                  ||
  || MAGIA Da�o/Res/Crit:   0%/  0%/ 3% | Veneno       : 5        Fuego    : -3   ||
  || CURAS Dar / Recibir:   0%/  0%     | Acido/Paral  : 0        Frio     : 0    ||
  || EXP : 4,202,269     Pract : 12     | Energia/Elec : 0                        ||
  || ORO : 63,593        Entr  : 26     |                                         ||
  || Deidad   : Mittarna                | Favor        : amado        (2500 )     ||
  ||------------------------------------------------------------------------------||
  || Te sientes muy bien.                                                         ||
  ||------------------------------------------------------------------------------||
  ||                        -= Datos de Guerras =-                                ||
  || Rango           : Plebeya                     Gloria         : 0    /0       ||
  || Asesinatos      : 0                           Muertes        : 0             ||
  ||------------------------------------------------------------------------------||
  || Conclave:                                                                    ||
  ||  Avatar Matados : 336                         Otros Matados  : 136           ||
  ||  Avatar Muertos : 557                         Otros Muertos  : 366           ||
  \                                                                              /
    ------------------------------------------------------------------------------
  */
})();

export function statsPlugin({ when, write }: PluginContext) {
  let isInitiated = false;
  let name = '';
  let principal = false;

  const stats = {
    fue: 0,
    fueBase: 0,
    des: 0,
    desBase: 0,
    vida: 0,
    vidaBase: 0,
    vidaRegen: 0,
    int: 0,
    intBase: 0,
    sab: 0,
    sabBase: 0,
    mana: 0,
    manaBase: 0,
    manaRegen: 0,
    con: 0,
    conBase: 0,
    car: 0,
    carBase: 0,
    mov: 0,
    movBase: 0,
    movRegen: 0,
    sue: 0,
    sueBase: 0,
    level: 0,
  };

  when(
    STATE_DETECTOR,
    ({ groups }) => {
      for (const key of Object.keys(stats) as (keyof typeof stats)[]) {
        stats[key] = toInt(groups[key]) as any;
      }

      name = groups.name;
      principal = Boolean(groups.principal);
      isInitiated = true;
    },
    { captureLength: SIZE },
  );

  return {
    async getLevel() {
      await ensureInitiated();
      return stats.level;
    },
  };

  async function ensureInitiated() {
    if (!isInitiated) {
      write('estado');
      await when(STATE_DETECTOR, { captureLength: SIZE });
    }
  }
}
