import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import events from '../assets/debugger-events.json';
import { Player } from '@mood/replay';
import './progress-bar.js';

@customElement('replay-player')
export class ReplayPlayer extends LitElement {
  @property({ type: Number })
  width = 800;
  @property({ type: Number })
  height = 600;

  @state()
  progress = 0;
  @state()
  player: Player | null = null;

  @property({ type: Array })
  events = events;

  @query('#root')
  root!: HTMLDivElement;
  @query('#iframe')
  iframe!: HTMLIFrameElement;

  protected firstUpdated() {
    this.player = new Player(this.events as Array<any>, {
      root: this.root,
      iframe: this.iframe,
      onProgress: percent => (this.progress = percent)
    });
    this.player.play();
  }

  handlePlayerSeeked(e: CustomEvent<{ percent: number }>) {
    const totalTime = this.player?.metaData.totalTime || 0;
    const playing = this.player?.playing;

    this.player?.seek(e.detail.percent * totalTime);
    if (playing) this.player?.play();
  }

  getIframeStyle() {
    const meta = this.events.filter(e => e.type === 'META');
    const maxHeight = Math.max(...meta.map(e => e.height || 0));
    const maxWidth = Math.max(...meta.map(e => e.width || 0));

    if (maxWidth / this.width > maxHeight / this.height) {
      return `
      zoom: ${this.width / maxWidth}; 
      position: absolute; 
      top: 50%; 
      left: 50%; 
      transform: translate(-50%, -50%);
      background: #fff;
      border: none;
      outline: none;
      `;
    } else {
      return `
      zoom: ${this.height / maxHeight}; 
      position: absolute; 
      top: 50%; 
      left: 50%; 
      transform: translate(-50%, -50%);
      background: #fff;
      border: none;
      outline: none;
      `;
    }
  }

  render() {
    return html`
      <div
        id="root"
        style="width: ${this.width}px; height: ${this.height}px; box-sizing: border-box;"
      >
        <iframe id="iframe" style="${this.getIframeStyle()}"></iframe>
        <replay-progress-bar
          value="${this.progress}"
          style="position: absolute; bottom: 0; left: 0; right: 0;"
          @update-progress="${this.handlePlayerSeeked}"
        ></replay-progress-bar>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: inline-block;
    }
    #root {
      display: flex;
      background: #000;
      align-items: center;
      justify-content: center;
      position: relative;
    }
  `;
}
