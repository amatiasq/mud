import { dope } from './daemons/dope';
import { drink } from './daemons/drink';
import { eat } from './daemons/eat';
import { idle } from './daemons/idle';
import { rest } from './daemons/rest';
import { Mud } from './lib/Mud';
import { afk } from './workflows/afk';
import { bank } from './workflows/bank';
import { donations } from './workflows/donations';
import { kill } from './workflows/kill';
import { go } from './workflows/go';
import { train } from './workflows/train';

export function registerWorkflows(mud: Mud) {
  mud.workflow('afk', afk);
  mud.workflow('bank', bank);
  mud.workflow('donations', donations);
  mud.workflow('kill', kill);
  mud.workflow('go', go);
  mud.workflow('train', train);

  mud.daemon('dope', dope);
  mud.daemon('drink', drink);
  mud.daemon('eat', eat);
  mud.daemon('idle', idle);
  mud.daemon('rest', rest);
}
