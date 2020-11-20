import { dom } from '@amatiasq/dom';

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

  render() {
    return this.$el;
  }

  setWorkflows(
    workflows: Workflow[],
    isRunning: (x: Workflow) => boolean,
    run: (x: Workflow) => Promise<any>,
    stop: (x: Workflow) => Promise<any>,
  ) {
    this.$workflows.innerHTML = '';

    for (const workflow of workflows) {
      const name = `${workflow.name} ${
        workflow.instancesRunning > 1 ? `(${workflow.instancesRunning})` : ''
      }`;

      const expand = button(icon('caret-down'), () =>
        el.classList.toggle('expaneded'),
      );
      const action = isRunning(workflow)
        ? button(icon('stop'), () => stop(workflow))
        : button(icon('play'), () => run(workflow));

      const el = dom`
        <li class="workflow ${isRunning(workflow) ? 'running' : ''}">
          <header>
            ${expand}
            <h3 class="name">${name}</h3>
            ${action}
          </header>

          <ul class="triggers">
            To be implemented...
          </ul>
        </li>
      `;

      this.$workflows.appendChild(el);
    }
  }
}

function button(
  content: HTMLElement | string,
  onClick: (event: MouseEvent) => void,
) {
  const el = dom`<button class="action">${content}</button>`;
  el.addEventListener('click', onClick);
  return el;
}

function icon(name: string) {
  return dom`<i class="fas fa-${name}"></i>`;
}
