import { html } from './render';

type Meter = { color: string; value: number };
type Button = { name: string; onClick: () => void };

export type ControlProps = { meters: Meter[]; buttons: Button[] };

export function Controls(props: ControlProps) {
  const meters = props.meters.map(
    x => html`
      <div class="meter">
        <div
          class="bar"
          style="
          width: ${Math.round(x.value * 100)}%;
          background-color: ${x.color}
        "
        ></div>
      </div>
    `,
  );

  const buttons = props.buttons.map(
    x => html`
      <button class="ui-button" onclick="${x.onClick}">${x.name}</button>
    `,
  );

  return html`
    <header class="controls">
      <div class="meters">
        ${meters}
      </div>

      ${buttons}
    </div>
  `;
}
