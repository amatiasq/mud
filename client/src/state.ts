import { emitter } from '@amatiasq/emitter';

import { Mud } from './lib/Mud';
import { Workflow } from './lib/workflow/Workflow';
import { ControlProps } from './ui/Controls';
import { SidebarProps } from './ui/Sidebar';

const listening = new WeakMap<Workflow, true>();

const emitStateChange = emitter<void>();
export const onStateChange = emitStateChange.subscribe;

export function bindViewTo(mud: Mud) {
  mud.onWorkflowsChange(x => {
    workflows = x.sort((a, b) => (a.name < b.name ? -1 : 1));
    workflows.forEach(workflow => {
      if (listening.has(workflow)) return;
      listening.set(workflow, true);
      workflow.onChange(() => emitStateChange());
    });

    emitStateChange();
  });

  mud.getPlugin('prompt').onUpdate(x => {
    hp = x.hp.percent;
    mana = x.mana.percent;
    mv = x.mv.percent;
    emitStateChange();
  });
}

let hp = 1;
let mana = 1;
let mv = 1;

export function getControlsProps(): ControlProps {
  return {
    buttons: [],
    meters: [
      { color: '550000', value: hp },
      { color: '000055', value: mana },
      { color: '005500', value: mv },
    ],
  };
}

let workflows: Workflow[] = [];

export function getSidebarProps(): SidebarProps {
  return { workflows };
}
