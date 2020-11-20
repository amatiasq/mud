import { dom } from '@amatiasq/dom';

type Observable = (listener: (data: number) => void) => void;

export class Controls {
  private readonly $meters = dom`<div class="meters"></div>`;
  private readonly $el = dom`<header class="controls">${this.$meters}</div>`;

  render() {
    return this.$el;
  }

  addMeter(color: string, observable: Observable) {
    const el = dom`<div class="meter"><div class="bar"></div></div>`;

    el.style.setProperty('--color', color);
    el.style.setProperty('--value', '100%');

    observable(value => {
      const percent = Math.round(value * 100);
      el.style.setProperty('--value', `${percent}%`);
    });

    this.$meters.appendChild(el);
  }

  addButton(name: string, onClick: () => void) {
    const el = dom`<button class="ui-button">${name}</button>`;
    el.addEventListener('click', onClick);
    this.$el.appendChild(el);
  }
}
