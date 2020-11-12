import { PluginContext } from '../lib/PluginContext';
import { concatRegexes } from '../lib/util/concatRegexes';
import { int, toInt } from '../lib/util/int';

const HEADER =
  '  ------------------------------------------------------------------------------\n/                                                                              \\n||  Ficha de';
const FOOTER =
  ' ||\n \\                                                                              /\n  ------------------------------------------------------------------------------';

// prettier-ignore
const STATE_DETECTOR = concatRegexes(
  // HEADER,
  // /(?<name>\w+)(?<principal> \(Personaje Principal\))\.\s+\|\|\n/,
  // /\|\|\s+FUE\s+:\s+(?<fue>\d+)\((?<fueBase>\d+)\)\s+DES\s+:\s+(?<des>\d+)\((?<desBase>\d+)\)\s+\|\s+Vida\s+:\s+(?<vida>\d+)\s+\/(?<vidaBase>\d+)\s+\(\s+(?<regen>\d+)%\)\s+Regen\s+\|\|/,
  // /(.|�|\n)+/,
  /\|\| Nivel\s+: /, int('level'), /\s+/,
  // /(.|�|\n)+/,
  // FOOTER,
);

export function statsPlugin({ when, write }: PluginContext) {
  let isInitiated = false;
  const stats = {
    level: 0,
  };

  when(
    STATE_DETECTOR,
    ({ groups }) => {
      stats.level = toInt(groups.level);
      console.log(stats.level);
      isInitiated = true;
    },
    // { captureLength: 3000 },
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
      await when(FOOTER);
    }
  }
}

/*
<362/362hp 359/359m 250/250mv 522,731xp 63,593g> I estado

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
