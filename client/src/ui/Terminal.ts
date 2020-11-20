import Convert from 'ansi-to-html';

import { ClientStorage } from '@amatiasq/client-storage';
import { dom } from '@amatiasq/dom';
import { emitter } from '@amatiasq/emitter';

const convert = new Convert();
const history = new ClientStorage<string[]>('mud:command-history');
const MIN_INPUT_SIZE = 3;

export class Terminal {
  private readonly $log = dom`<span class="log"></span>`;
  private readonly $input = dom<
    HTMLInputElement
  >`<input type="text" size="${MIN_INPUT_SIZE}" autofocus>`;
  private readonly $el = dom`
    <main class="terminal">
      <div class="scroll-bottom">
        ${this.$log}
        ${this.$input}
      </div>
    </main>
  `;

  private readonly history: string[] = history.get() || [];
  private lastChunk: string = '';
  private histPos = 0;

  private readonly emitSubmit = emitter<string>();
  readonly onSubmit = this.emitSubmit.subscribe;

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  focus() {
    this.$input.focus();
  }

  render() {
    this.$el.addEventListener('click', () =>
      setTimeout(() => !userHasSelectedText() && this.$input.focus(), 80),
    );

    this.$input.addEventListener('keydown', this.onKeyDown);
    this.$input.addEventListener('keyup', this.onKeyUp);

    return this.$el;
  }

  write(data: string) {
    const content = `${this.lastChunk}${fixLineEndings(data)}`.split(/\n\n+/);
    this.lastChunk = content.pop()!;

    for (const block of content) {
      this.$log.before(dom`<p>${{ __html__: asciiToHtml(block) }}</p>`);
    }

    this.$log.innerHTML = asciiToHtml(this.lastChunk);
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      this.submit();
    }

    if (event.code === 'ArrowUp') {
      this.loadHistory(1);
    }

    if (event.code === 'ArrowDown') {
      this.loadHistory(-1);
    }

    this.onKeyUp(event);
  }

  private onKeyUp(event: KeyboardEvent) {
    const value = this.$input.value;
    this.history[0] = value;
    this.$input.size = value.length + MIN_INPUT_SIZE;
  }

  private submit() {
    const { value } = this.$input;
    this.$input.value = '';
    this.histPos = 0;

    if (value && value !== this.history[1]) {
      this.history.shift();
      this.history.unshift(value);
      this.history.unshift('');
      history.set(this.history);
    }

    for (const command of value.split(/;\s+/)) {
      this.emitSubmit(command);
    }
  }

  private loadHistory(modifier: 1 | -1) {
    if (!this.history.length) {
      return;
    }

    this.history[this.histPos] = this.$input.value;
    this.histPos = clamp(this.histPos + modifier, 0, this.history.length - 1);
    this.$input.value = this.history[this.histPos];
  }
}

function asciiToHtml(text: string) {
  const escaped = escapeHtml(text);
  const html = convert.toHtml(escaped);
  return html.replace(/\n/g, '<br>');
}

function fixLineEndings(text: string) {
  return text.replace(/\r/g, '');
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/  +/g, x => '&nbsp;'.repeat(x.length));
}

function userHasSelectedText() {
  const selection = getSelection();
  return selection && selection.type === 'Range';
}

function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}
