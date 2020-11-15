import { defend } from './daemons/defend';
import { dope } from './daemons/dope';
import { drink } from './daemons/drink';
import { eat } from './daemons/eat';
import { idle } from './daemons/idle';
import { quest } from './daemons/quest';
import { repair } from './daemons/repair';
import { rest } from './daemons/rest';
import { Mud } from './lib/Mud';
import { afk } from './workflows/afk';
import { bank } from './workflows/bank';
import { cast } from './workflows/cast';
import { donations } from './workflows/donations';
import { go } from './workflows/go';
import { kill } from './workflows/kill';
import { recover } from './workflows/recover';
import { train } from './workflows/train';
import { wear } from './workflows/wear';

export function registerWorkflows(mud: Mud) {
  mud.workflow('afk', afk);
  mud.workflow('bank', bank);
  mud.workflow('cast', cast);
  mud.workflow('donations', donations);
  mud.workflow('kill', kill);
  mud.workflow('go', go);
  mud.workflow('recover', recover);
  mud.workflow('train', train);
  mud.workflow('wear', wear);

  mud.daemon('defend', defend);
  mud.daemon('dope', dope);
  mud.daemon('drink', drink);
  mud.daemon('eat', eat);
  mud.daemon('idle', idle);
  mud.daemon('quest', quest);
  mud.daemon('repair', repair);
  mud.daemon('rest', rest);
}
