import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type UpdateProgressEvent = CustomEvent<{ percent: number }>;

@customElement('replay-progress-bar')
export class ProgressBar extends LitElement {
  @property({ type: Number })
  value = 0;

  dispatchUpdateProgressEvent(e: MouseEvent) {
    const rect = this.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.dispatchEvent(
      new CustomEvent('update-progress', { detail: { percent }, bubbles: true, composed: true })
    );
  }

  protected render() {
    return html`<div class="progress-bar" @click="${this.dispatchUpdateProgressEvent}">
      <div class="value" style="width: ${this.value * 100}%"></div>
    </div>`;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      cursor: pointer;
    }

    .progress-bar:hover {
      background-color: #e9ecef40;
    }

    .value {
      height: 100%;
      background-color: #007bff;
    }
  `;
}
