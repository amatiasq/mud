import { dom } from '@amatiasq/dom';

import { Mud } from '../lib/Mud';
import { PatternMatcher } from '../lib/triggers/PatternMatcher';
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

  private readonly subscriptions = new Set<Function>();
  // private readonly expanded = new Set<Workflow>();

  render() {
    this.renderWorkflow = this.renderWorkflow.bind(this);
    this.renderTriggers = this.renderTriggers.bind(this);
    return this.$el;
  }

  clear() {
    this.$workflows.innerHTML = '';
    this.subscriptions.forEach(x => x());
    this.subscriptions.clear();
  }

  setWorkflows(workflows: Workflow[], mud: Mud) {
    this.clear();

    for (const workflow of workflows) {
      const el = this.keepUpdated(
        workflow,
        'onChange',
        workflow,
        this.renderWorkflow,
      );

      this.$workflows.appendChild(el);
    }
  }

  private renderWorkflow(workflow: Workflow) {
    const { isEnabled, isRunning, instancesRunning } = workflow;
    const instances = instancesRunning > 1 ? ` (${instancesRunning})` : '';
    const name = `${workflow.name}${instances}`;

    // const expand = button(icon('caret-right'), () => {
    //   if (this.expanded.has(workflow)) {
    //     this.expanded.delete(workflow);
    //     el.classList.remove('expanded');
    //   } else {
    //     this.expanded.add(workflow);
    //     el.classList.add('expanded');
    //   }
    // });

    const classes = [
      'workflow',
      isRunning ? 'running' : 'idle',
      isEnabled ? 'enabled' : 'disabled',
      'expanded',
      // this.expanded.has(workflow) ? 'expanded' : null,
    ];

    const triggers = this.keepUpdated(
      workflow,
      'onTriggersChange',
      workflow.triggers,
      this.renderTriggers,
    );

    const el = dom`
      <li class="${classes}">
        <div class="workflow-content">
          <header>
            <h3 class="name">${name}</h3>
            ${this.getWorkflowActions(workflow)}
          </header>

          ${triggers}
        </div>
      </li>
    `;

    return el;
  }

  private getWorkflowActions(workflow: Workflow) {
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
          : button(icon('play'), () => workflow.execute()),
      );
    }

    return actions;
  }

  private renderTriggers(triggers: PatternMatcher[]) {
    const items = triggers.map(matcher => {
      const rows = matcher.patterns.map(
        x => dom`<span class="pattern">${x.toString()}</span>`,
      );

      this.subscriptions.add(
        matcher.onMatch(({ patterns }) =>
          patterns
            .map(x => {
              if (matcher.patterns === null) debugger;
              return matcher.patterns.indexOf(x);
            })
            .forEach(i => blink(rows[i])),
        ),
      );

      const result = dom`<li class="trigger">${rows}</li>`;
      return result;
    });
    return dom`<ul class="triggers">${items}</ul>`;
  }

  private keepUpdated<T>(
    workflow: Workflow,
    event: 'onChange' | 'onTriggersChange',
    initial: T,
    renderer: (value: T) => HTMLElement,
  ) {
    let el = renderer(initial);

    this.subscriptions.add(
      workflow[event]((event: any) => {
        const updated = renderer(event);
        el.replaceWith(updated);
        el = updated;
      }),
    );

    return el;
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

function blink(el: HTMLElement) {
  el.style.animation = 'highlight 1s linear';
  el.addEventListener('animationend', clear);

  function clear() {
    el.style.animation = '';
    el.removeEventListener('animationend', clear);
  }
}
