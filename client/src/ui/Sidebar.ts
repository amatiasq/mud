import { dom } from '@amatiasq/dom';
import { Mud } from '../lib/Mud';

import { Workflow } from '../lib/workflow/Workflow';

export class Sidebar {
  private readonly $workflows = dom`<ul class="workflow-list"></ul>`;
  private readonly $el = dom`
    <aside class="sidebar">
      <div class="workflows">
        <h1 class="title">Workflows</h1>
        ${this.$workflows}
      </div>
    </aside>
  `;

  private refresh = () => {};
  private readonly subscriptions = new Set<Function>();

  render() {
    return this.$el;
  }

  clear() {
    this.$workflows.innerHTML = '';
    this.subscriptions.forEach(x => x());
    this.subscriptions.clear();
  }

  setWorkflows(workflows: Workflow[], mud: Mud) {
    this.clear();
    this.refresh = () => this.setWorkflows(workflows, mud);

    for (const workflow of workflows) {
      this.$workflows.appendChild(
        this.renderWorkflow(workflow, () => mud.run(workflow)),
      );
    }
  }

  private renderWorkflow(workflow: Workflow, run: () => void) {
    const { isEnabled, isRunning, instancesRunning } = workflow;
    const instances = instancesRunning > 1 ? ` (${instancesRunning})` : '';
    const name = `${workflow.name}${instances}`;

    this.subscriptions.add(workflow.onChange(this.refresh));

    const expand = button(icon('caret-right'), () =>
      el.classList.toggle('expaneded'),
    );

    const classes = [
      'workflow',
      isRunning ? 'running' : 'idle',
      isEnabled ? 'enabled' : 'disabled',
    ];

    const el = dom`
      <li class="${classes}">
        <div class="workflow-content">
          <header>
            ${expand}
            <h3 class="name">${name}</h3>
            ${this.getWorkflowActions(workflow, run)}
          </header>

          <!--
          <ul class="triggers">
            To be implemented...
          </ul>
          -->
        </div>
      </li>
    `;

    return el;
  }

  private getWorkflowActions(workflow: Workflow, run: () => void) {
    const { isEnabled, isRunning } = workflow;

    const enabler = isEnabled
      ? button([icon('check'), icon('times')], () => workflow.disable())
      : button([icon('times'), icon('check')], () => workflow.enable());

    enabler.classList.add('enable-control');

    const actions = [enabler];

    if (isEnabled) {
      actions.push(
        isRunning
          ? button(icon('stop'), () => workflow.stop())
          : button(icon('play'), run),
      );
    }

    return actions;
  }
}

function button(
  content: HTMLElement[] | HTMLElement | string,
  onClick: (event: MouseEvent) => void,
) {
  const el = dom`<button class="action">${content}</button>`;
  el.addEventListener('click', onClick);
  return el;
}

function icon(name: string) {
  return dom`<i class="fas fa-${name}"></i>`;
}
