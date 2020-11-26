import './index.css';

import { ClientStorage } from '@amatiasq/client-storage';
import { dom } from '@amatiasq/dom';

import { getControlsProps, getSidebarProps, onStateChange } from '../state';
import { Controls } from './Controls';
import { Hamburger } from './Hamburger';
import { html, render } from './render';
import { Sidebar } from './Sidebar';
import { Terminal } from './Terminal';

export function renderUserInterface(parent: HTMLElement) {
  const state = initState();
  const data = state.get()!;

  const terminal = new Terminal();

  const hamburger = new Hamburger(data.showControls);
  hamburger.onChange(onControlsToggle);

  const main = dom`
    <div class="container">
      ${terminal.render()}
    </div>
  `;

  onStateChange(renderComponents);
  renderComponents();

  function renderComponents() {
    render(
      html`
        <${Controls} ...${getControlsProps()} />
        <${Sidebar} ...${getSidebarProps()} />
      `,
      main,
    );
  }

  parent.appendChild(main);
  parent.appendChild(hamburger.render());

  onControlsToggle(data.showControls);

  return terminal;

  function onControlsToggle(value: boolean) {
    if (value) {
      main.classList.add('show-controls');
      data.showControls = true;
    } else {
      main.classList.remove('show-controls');
      data.showControls = false;
    }

    state.set(data);
  }
}

function initState() {
  const state = new ClientStorage<{ showControls: boolean }>('ui:state');
  const data = state.get();

  if (!data) {
    state.set({ showControls: false });
  }

  return state;
}
