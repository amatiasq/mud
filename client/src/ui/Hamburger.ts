import { dom } from '@amatiasq/dom';
import { emitter } from '@amatiasq/emitter';

export class Hamburger {
  private readonly $checkbox = dom<HTMLInputElement>`<input type="checkbox" />`;
  private readonly $el = dom`
    <div class="hamburger">
      ${this.$checkbox}
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  private readonly emitChange = emitter<boolean>();
  readonly onChange = this.emitChange.subscribe;

  constructor(initialState = false) {
    this.toggle = this.toggle.bind(this);
    this.$checkbox.checked = initialState;
  }

  render() {
    this.$checkbox.addEventListener('change', this.toggle);

    if (this.$checkbox.checked) {
      this.toggle();
    }

    return this.$el;
  }

  toggle() {
    this.emitChange(this.$checkbox.checked);
  }
}
