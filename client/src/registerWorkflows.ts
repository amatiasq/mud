import { Mud } from './lib/Mud';
import { dope } from './workflows/dope';
import { drink } from './workflows/drink';
import { eat } from './workflows/eat';
import { fight } from './workflows/fight';
import { idle } from './workflows/idle';
import { rest } from './workflows/rest';
import { train } from './workflows/train';

export function registerWorkflows(mud: Mud) {
  mud.registerWorkflow(fight);
  mud.registerWorkflow(train);

  mud.runWorkflow(dope);
  mud.runWorkflow(drink);
  mud.runWorkflow(eat);
  mud.runWorkflow(idle);
  mud.runWorkflow(rest);
}
