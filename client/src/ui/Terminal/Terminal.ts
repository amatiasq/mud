import './Terminal.css';

import Convert from 'ansi-to-html';

import { ClientStorage } from '@amatiasq/client-storage';
import { emitter } from '@amatiasq/emitter';

import { render } from '../render';
import html from './Terminal.html';

const convert = new Convert();
const history = new ClientStorage<string[]>('mud:command-history');

export class Terminal {
  private readonly fragment = render(html);
  private readonly $log = this.fragment.$('.log');
  private readonly $input = this.fragment.$<HTMLInputElement>('input');
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

  render(parent: HTMLElement) {
    this.fragment
      .$('.terminal')
      .addEventListener('click', () =>
        setTimeout(() => !userHasSelectedText() && this.$input.focus(), 80),
      );

    this.$input.addEventListener('keydown', this.onKeyDown);
    this.$input.addEventListener('keyup', this.onKeyUp);
    parent.appendChild(this.fragment);
  }

  write(data: string) {
    const content = `${this.lastChunk}${fixLineEndings(data)}`.split(/\n\n+/);
    this.lastChunk = content.pop()!;

    for (const block of content) {
      this.$log.before(render(`<p>${asciiToHtml(block)}</p>`));
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
    this.$input.size = value.length + 3;
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
