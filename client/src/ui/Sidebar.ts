import { ComponentChildren } from 'preact';

import { SinglePattern } from '../lib/triggers/Pattern';
import { PatternMatcher } from '../lib/triggers/PatternMatcher';
import { Workflow } from '../lib/workflow/Workflow';
import { html } from './render';

export type SidebarProps = {
  workflows: Workflow[];
};

export function Sidebar(props: SidebarProps) {
  return html`
    <aside class="sidebar">
      <div class="workflows">
        <h1 class="title">Workflows</h1>
        <ul class="workflow-list">
          ${props.workflows.map(
            x => html`<${WorkflowComponent} workflow=${x} />`,
          )}
        </ul>
      </div>
    </aside>
  `;
}

type WorkflowProp = { workflow: Workflow };

function WorkflowComponent({ workflow }: WorkflowProp) {
  const { isEnabled, isRunning, instancesRunning } = workflow;
  const instances = instancesRunning > 1 ? ` (${instancesRunning})` : '';
  const name = `${workflow.name}${instances}`;

  const classes = [
    'workflow',
    isRunning ? 'running' : 'idle',
    isEnabled ? 'enabled' : 'disabled',
    'expanded',
    // this.expanded.has(workflow) ? 'expanded' : null,
  ];

  return html`
    <li class="${classes.join(' ')}">
      <div class="workflow-content">
        <header>
          <h3 class="name">${name}</h3>
          <${WorkflowActions} workflow=${workflow} />
        </header>

        <${WorkflowTriggers} workflow=${workflow} />
      </div>
    </li>
  `;
}

function WorkflowActions({ workflow }: WorkflowProp) {
  const { isEnabled, isRunning } = workflow;

  const actions = [
    isEnabled
      ? html`
        <${Action} className="enable-control" onClick=${() =>
          workflow.disable()}>
          <${Icon} name="check" />
          <${Icon} name="times" />
        </Button>
      `
      : html`
        <${Action} className="enable-control" onClick=${() =>
          workflow.enable()}>
          <${Icon} name="times" />
          <${Icon} name="check" />
        </Button>
      `,
  ];

  if (isEnabled) {
    actions.push(
      isRunning
        ? html`
          <${Action} onClick=${() => workflow.stop()}>
            <${Icon} name="stop" />
          </Button>
        `
        : html`
          <${Action} onClick=${() => workflow.execute()}>
            <${Icon} name="play" />
          </Button>
        `,
    );
  }

  return actions;
}

const listening = new WeakMap<PatternMatcher, true>();

function WorkflowTriggers({ workflow: { triggers } }: WorkflowProp) {
  const items = triggers.map(matcher => {
    const rows = matcher.patterns.map(x => {
      const blink = blinking.has(x) ? 'blink' : '';
      return html`<span class="pattern ${blink}">${x}</span>`;
    });

    if (!listening.has(matcher)) {
      matcher.onMatch(({ patterns }) => patterns.forEach(blink));
      listening.set(matcher, true);
    }

    return html`<li class="trigger">${rows}</li>`;
  });

  return html`<ul class="triggers">
    ${items}
  </ul>`;
}

type ButtonProps = {
  className?: string;
  children: ComponentChildren;
  onClick: (event: MouseEvent) => void;
};

function Action({ children, className, onClick }: ButtonProps) {
  return html`
    <button class="action ${className}" onClick="${onClick}">
      ${children}
    </button>
  `;
}

function Icon({ name }: { name: string }) {
  return html`<i class="fas fa-${name}"></i>`;
}

const blinking = new Map<SinglePattern, any>();

function blink(pattern: SinglePattern) {
  if (blinking.has(pattern)) {
    clearTimeout(blinking.get(pattern));
  }

  blinking.set(
    pattern,
    setTimeout(() => blinking.delete(pattern)),
  );
}
