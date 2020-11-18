import { ClientStorage } from '@amatiasq/client-storage';
import './index.css';

import { Controls } from './Controls/Controls';
import { Hamburger } from './Hamburger/Hamburger';
import html from './index.html';
import { render } from './render';
import { Sidebar } from './Sidebar/Sidebar';
import { Terminal } from './Terminal/Terminal';

export function renderUserInterface(parent: HTMLElement) {
  const state = initState();
  const data = state.get()!;

  const dom = render(html);
  const main = dom.$('.container');

  const sidebar = new Sidebar();
  sidebar.render(main);

  const controls = new Controls();
  controls.render(main);

  const terminal = new Terminal();
  terminal.render(main);

  parent.appendChild(dom);

  const hamburger = new Hamburger(data.showControls);
  hamburger.render(parent);

  hamburger.onChange(onControlsToggle);
  onControlsToggle(data.showControls);

  return { controls, sidebar, terminal };

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
