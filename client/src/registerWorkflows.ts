import { Mud } from './lib/Mud';
import { drink } from './workflows/drink';
import { eat } from './workflows/eat';
import { fight } from './workflows/fight';
import { heal } from './workflows/heal';
import { idle } from './workflows/idle';
import { rest } from './workflows/rest';
import { train } from './workflows/train';

export function registerWorkflows(mud: Mud) {
  mud.registerWorkflow(fight);
  mud.registerWorkflow(train);

  mud.runWorkflow(drink);
  mud.runWorkflow(eat);
  mud.runWorkflow(idle);
  mud.runWorkflow(heal);
  mud.runWorkflow(rest);
}
