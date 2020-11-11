import { defend } from './daemons/defend';
import { dope } from './daemons/dope';
import { drink } from './daemons/drink';
import { eat } from './daemons/eat';
import { idle } from './daemons/idle';
import { rest } from './daemons/rest';
import { Mud } from './lib/Mud';
import { afk } from './workflows/afk';
import { bank } from './workflows/bank';
import { cast } from './workflows/cast';
import { donations } from './workflows/donations';
import { go } from './workflows/go';
import { kill } from './workflows/kill';
import { train } from './workflows/train';

export function registerWorkflows(mud: Mud) {
  mud.workflow('afk', afk);
  mud.workflow('bank', bank);
  mud.workflow('cast', cast);
  mud.workflow('donations', donations);
  mud.workflow('kill', kill);
  mud.workflow('go', go);
  mud.workflow('train', train);

  mud.daemon('defend', defend);
  mud.daemon('dope', dope);
  mud.daemon('drink', drink);
  mud.daemon('eat', eat);
  mud.daemon('idle', idle);
  mud.daemon('rest', rest);
}
