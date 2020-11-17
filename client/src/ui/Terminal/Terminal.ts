import { ClientStorage } from '@amatiasq/client-storage';
import './Terminal.css';

import Convert from 'ansi-to-html';

import { emitter } from '@amatiasq/emitter';

import { render } from '../render';
import html from './Terminal.html';

const convert = new Convert();
const history = new ClientStorage<string[]>('mud:command-history');

export class Terminal {
  private readonly dom = render(html);
  private readonly $log = this.dom.$('.log');
  private readonly $input = this.dom.$<HTMLInputElement>('input');
  private readonly log: string[] = [];
  private readonly history: string[] = history.get() || [];
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
    this.dom.$('.terminal').addEventListener('click', () => {
      if (!userHasSelectedText()) {
        this.$input.focus();
      }
    });

    this.$input.addEventListener('keydown', this.onKeyDown);
    this.$input.addEventListener('keyup', this.onKeyUp);
    parent.appendChild(this.dom);
  }

  write(data: string) {
    const $parent = this.$log.parentElement!;
    const prev = this.log.length ? this.log.pop() : '';
    const content = `${prev}${fixLineEndings(data)}`.split(/\n\n+/);
    const last = content.pop()!;

    for (const block of content) {
      this.log.push(block);

      const p = document.createElement('p');
      p.innerHTML = asciiToHtml(block);
      $parent.insertBefore(p, this.$log);
    }

    this.log.push(last);
    this.$log.innerHTML = asciiToHtml(last);

    if (!userHasSelectedText()) {
      $parent.scrollTop = $parent.scrollHeight;
    }
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
  }

  private onKeyUp(event: KeyboardEvent) {
    this.$input.size = this.$input.value.length + 3;
  }

  private submit() {
    const { value } = this.$input;
    this.$input.value = '';
    this.histPos = 0;

    if (value) {
      this.history.shift();
      this.history.unshift(value);
      this.history.unshift('');
      history.set(this.history);
    }

    for (const command of value.split(/;/)) {
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
