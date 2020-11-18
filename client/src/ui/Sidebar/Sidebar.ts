import './Sidebar.css';

import { render } from '../render';
import html from './Sidebar.html';
import { Workflow } from '../../lib/workflow/Workflow';

export class Sidebar {
  private readonly dom = render(html);
  private readonly workflowTpl = this.dom.$('.workflow-template');
  private readonly workflows = this.dom.$('.workflow-list');

  render(parent: HTMLElement) {
    parent.appendChild(this.dom);
  }

  setWorkflows(
    workflows: Workflow[],
    isRunning: (x: Workflow) => boolean,
    run: (x: Workflow) => Promise<any>,
    stop: (x: Workflow) => Promise<any>,
  ) {
    this.workflows.innerHTML = '';

    for (const workflow of workflows) {
      const fragment = render(this.workflowTpl, {
        '.name': x => (x.textContent = workflow.name),
        '.workflow': x => x.classList.toggle('running', isRunning(workflow)),
        '.triggers': x => (x.textContent = 'To be implemented...'),
        '.expand': x => {
          x.addEventListener('click', () =>
            fragment.$('.workflow').classList.toggle('expanded'),
          );
        },
        '.runner': x => {
          if (isRunning(workflow)) {
            x.textContent = `stop (${workflow.instancesRunning})`;
            x.addEventListener('click', () => stop(workflow));
          } else {
            x.textContent = 'run';
            x.addEventListener('click', () => run(workflow));
          }
        },
      });

      this.workflows.appendChild(fragment);
    }
  }
}
