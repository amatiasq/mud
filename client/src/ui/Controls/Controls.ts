import './Controls.css';

import { render } from '../render';
import html from './Controls.html';

type Observable = (listener: (data: number) => void) => void;

export class Controls {
  private readonly fragment = render(html);
  private readonly el = this.fragment.$('.controls');
  private readonly meters = this.fragment.$('.meters');
  private readonly meterTpl = this.fragment.$('.meter-template')!;
  private readonly buttonTpl = this.fragment.$('.button-template')!;

  render(parent: HTMLElement) {
    parent.appendChild(this.fragment);
  }

  addMeter(color: string, observable: Observable) {
    const fragment = render(this.meterTpl, {
      '.meter': x => {
        x.style.setProperty('--color', color);
        x.style.setProperty('--value', '100%');

        observable(value => {
          const percent = Math.round(value * 100);
          x.style.setProperty('--value', `${percent}%`);
        });
      },
    });

    this.meters.appendChild(fragment);
  }

  addButton(name: string, onClick: () => void) {
    const fragment = render(this.buttonTpl, {
      button: x => {
        x.textContent = name;
        x.addEventListener('click', onClick);
      },
    });

    this.el.appendChild(fragment);
  }
}
