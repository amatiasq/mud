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
      const name = `${workflow.name} ${
        isRunning(workflow) ? `(${workflow.instancesRunning})` : ''
      }`;

      const fragment = render(this.workflowTpl, {
        '.name': x => (x.textContent = name),
        '.workflow': x => x.classList.toggle('running', isRunning(workflow)),
        '.triggers': x => (x.textContent = 'To be implemented...'),
        '.action.run': x => x.addEventListener('click', () => run(workflow)),
        '.action.stop': x => x.addEventListener('click', () => stop(workflow)),
        '.expand': x => {
          x.addEventListener('click', () =>
            fragment.$('.workflow').classList.toggle('expanded'),
          );
        },
      });

      this.workflows.appendChild(fragment);
    }
  }
}
