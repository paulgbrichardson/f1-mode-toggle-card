/**
 * F1 Session Mode Toggle Card (custom:f1-mode-toggle-card)
 * Version: 2.1.1
 * 
 * Standalone segmented capsule pill button switching between Live Session and Replay Mode
 * with dynamic telemetry indicator pills ([SEEKING], [REPLAY PAUSED], REPLAY RUNNING).
 * Designed for the Formula 1 Pit Wall & Weekend Hub design system.
 */

async function ensureF1Fonts() {
  if (typeof window === 'undefined') return;
  if (window._f1FontsLoaded || document.querySelector('style[data-f1-fonts]')) {
    window._f1FontsLoaded = true;
    return;
  }
  try {
    const res = await fetch('/local/f1-sensor-live-data-card/f1-sensor-live-data-card.js');
    if (res.ok) {
      const txt = await res.text();
      const fontIdx = txt.indexOf('@font-face');
      const endIdx = txt.indexOf('`;', fontIdx);
      if (fontIdx !== -1 && endIdx !== -1) {
        const fontCss = txt.substring(fontIdx, endIdx);
        const style = document.createElement('style');
        style.setAttribute('data-f1-fonts', 'true');
        style.textContent = fontCss;
        document.head.appendChild(style);
        window._f1FontsLoaded = true;
      }
    }
  } catch (e) {
    // Gracefully fallback to system fonts
  }

  if (!document.querySelector('link[href*="Barlow+Condensed"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900&display=swap';
    document.head.appendChild(link);
  }
}
ensureF1Fonts();


class F1ModeToggleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getConfigElement() {
    return document.createElement('f1-mode-toggle-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'input_boolean.f1_replay_mode',
      status_entity: 'sensor.f1_replay_status',
    };
  }

  setConfig(config) {
    this._config = Object.assign({
      entity: 'input_boolean.f1_replay_mode',
      status_entity: 'sensor.f1_replay_status',
      live_label: 'LIVE SESSION',
      replay_label: 'REPLAY MODE',
    }, config || {});
    this._renderBase();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateContent();
  }

  _renderBase() {
    const style = `
      :host {
        display: block;
        width: 100%;
        box-sizing: border-box;
        font-family: var(--f1-card-display-font-family, 'Formula1 Display', sans-serif) !important;
      }

      * {
        box-sizing: border-box;
      }

      ha-card {
        height: 46px;
        min-height: 46px;
        border-radius: var(--ha-card-border-radius, 12px);
        background:
          radial-gradient(circle at 14% 10%, rgba(255, 255, 255, 0.04), transparent 44%),
          linear-gradient(160deg, #0b0b0d 0%, #131315 58%, #0a0a0a 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-left: 4px solid var(--f1-mode-accent, #ff3b30);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        padding: 4px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        align-items: stretch;
        cursor: pointer;
        user-select: none;
        transition: border-left-color 0.25s ease;
        box-sizing: border-box;
        overflow: hidden;
        container-type: inline-size;
      }

      ha-card.replay-active {
        --f1-mode-accent: #34c759;
      }

      .pill {
        min-width: 0;
        height: 100%;
        min-height: 36px;
        padding: 0 10px;
        border-radius: 999px;
        font-family: var(--f1-card-display-font-family, 'Formula1 Display', sans-serif) !important;
        font-weight: 800;
        font-size: 11px;
        letter-spacing: 0.04em;
        display: flex;
        align-items: center;
        justify-content: center;
        text-transform: uppercase;
        white-space: nowrap !important;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        color: rgba(255, 255, 255, 0.45);
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        cursor: pointer;
        box-sizing: border-box;
        line-height: 1;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }

      .pill span {
        white-space: nowrap !important;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pill:hover:not(.active) {
        background: rgba(255, 255, 255, 0.07);
        color: rgba(255, 255, 255, 0.75);
      }

      .pill.active {
        color: #ffffff;
      }

      .pill.active.live {
        color: #ffffff;
        background: color-mix(in srgb, #ff3b30 20%, rgba(255, 255, 255, 0.04));
        border: 1px solid color-mix(in srgb, #ff3b30 65%, transparent);
        box-shadow: 0 2px 10px rgba(255, 59, 48, 0.3);
      }

      .pill.active.replay {
        color: #ffffff;
        background: color-mix(in srgb, #34c759 20%, rgba(255, 255, 255, 0.04));
        border: 1px solid color-mix(in srgb, #34c759 65%, transparent);
        box-shadow: 0 2px 10px rgba(52, 199, 89, 0.3);
      }

      .pill.active.replay.seeking {
        color: #ffffff;
        background: color-mix(in srgb, #ff9500 20%, rgba(255, 255, 255, 0.04));
        border: 1px solid color-mix(in srgb, #ff9500 65%, transparent);
        box-shadow: 0 2px 10px rgba(255, 149, 0, 0.3);
      }

      .pill.active.replay.paused {
        color: #ffffff;
        background: color-mix(in srgb, #f59e0b 20%, rgba(255, 255, 255, 0.04));
        border: 1px solid color-mix(in srgb, #f59e0b 65%, transparent);
        box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
      }

      .pulse-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 8px currentColor;
        margin-right: 6px;
        flex-shrink: 0;
      }

      .pulse-dot.live-dot {
        background: #ff3b30;
        box-shadow: 0 0 8px #ff3b30;
      }

      .pulse-dot.replay-dot {
        background: #34c759;
        box-shadow: 0 0 8px #34c759;
      }

      .pulse-dot.seeking-dot {
        background: #ff9500;
        box-shadow: 0 0 8px #ff9500;
      }

      .pulse-dot.paused-dot {
        background: #f59e0b;
        box-shadow: 0 0 8px #f59e0b;
      }

      @container (max-width: 330px) {
        .pill {
          font-size: 9.5px;
          letter-spacing: 0.02em;
          padding: 0 6px;
        }
        .pulse-dot {
          margin-right: 4px;
        }
      }
    `;

    this.shadowRoot.innerHTML = `
      <style>${style}</style>
      <ha-card id="card">
        <div class="pill active live" id="live-pill">
          <span class="pulse-dot live-dot" id="live-dot"></span>
          <span>${this._config.live_label}</span>
        </div>
        <div class="pill" id="replay-pill">
          <span class="pulse-dot" id="replay-dot" style="display:none;"></span>
          <span id="replay-text">${this._config.replay_label}</span>
        </div>
      </ha-card>
    `;

    this.shadowRoot.getElementById('live-pill').addEventListener('click', (e) => {
      e.stopPropagation();
      this._setReplayMode(false);
    });

    this.shadowRoot.getElementById('replay-pill').addEventListener('click', (e) => {
      e.stopPropagation();
      this._setReplayMode(true);
    });

    this.shadowRoot.getElementById('card').addEventListener('click', () => {
      this._toggleMode();
    });
  }

  _setReplayMode(enableReplay) {
    if (!this._hass || !this._config.entity) return;
    const service = enableReplay ? 'turn_on' : 'turn_off';
    const domain = this._config.entity.split('.')[0] || 'input_boolean';
    this._hass.callService(domain, service, {
      entity_id: this._config.entity,
    });
  }

  _toggleMode() {
    if (!this._hass || !this._config.entity) return;
    const domain = this._config.entity.split('.')[0] || 'input_boolean';
    this._hass.callService(domain, 'toggle', {
      entity_id: this._config.entity,
    });
  }

  _updateContent() {
    if (!this._hass || !this.shadowRoot) return;
    const entity = this._hass.states[this._config.entity];
    const isReplay = entity && ['on', 'true', 'active'].includes(String(entity.state).toLowerCase());

    const statusEntity = this._hass.states[this._config.status_entity];
    const rStatus = statusEntity ? String(statusEntity.state).toLowerCase() : '';
    const isSeeking = rStatus === 'seeking' || rStatus === 'loading';
    const isPaused = rStatus === 'paused';

    const card = this.shadowRoot.getElementById('card');
    const livePill = this.shadowRoot.getElementById('live-pill');
    const replayPill = this.shadowRoot.getElementById('replay-pill');
    const liveDot = this.shadowRoot.getElementById('live-dot');
    const replayDot = this.shadowRoot.getElementById('replay-dot');
    const replayText = this.shadowRoot.getElementById('replay-text');

    if (card) {
      if (isReplay) {
        card.classList.add('replay-active');
      } else {
        card.classList.remove('replay-active');
      }
    }

    if (livePill && liveDot) {
      if (isReplay) {
        livePill.className = 'pill';
        liveDot.style.display = 'none';
      } else {
        livePill.className = 'pill active live';
        liveDot.className = 'pulse-dot live-dot';
        liveDot.style.display = 'inline-block';
      }
    }

    if (replayPill && replayText && replayDot) {
      if (!isReplay) {
        replayPill.className = 'pill';
        replayDot.style.display = 'none';
        replayText.textContent = this._config.replay_label;
      } else {
        if (isSeeking) {
          replayPill.className = 'pill active replay seeking';
          replayDot.className = 'pulse-dot seeking-dot';
          replayDot.style.display = 'inline-block';
          replayText.textContent = '[SEEKING]';
        } else if (isPaused) {
          replayPill.className = 'pill active replay paused';
          replayDot.className = 'pulse-dot paused-dot';
          replayDot.style.display = 'inline-block';
          replayText.textContent = 'REPLAY PAUSED';
        } else {
          replayPill.className = 'pill active replay';
          replayDot.className = 'pulse-dot replay-dot';
          replayDot.style.display = 'inline-block';
          replayText.textContent = this._config.replay_label;
        }
      }
    }
  }

  getCardSize() {
    return 1;
  }
}

class F1ModeToggleCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (!this._rendered) {
      this._renderBase();
      this._rendered = true;
    } else {
      this._updateContent();
    }
  }

  _isFocused(element) {
    if (!element) return false;
    try {
      if (element.matches && element.matches(':focus')) return true;
      if (document.activeElement === element) return true;
      const root = element.getRootNode();
      if (root && root.activeElement === element) return true;
    } catch (e) {}
    return false;
  }

  _updateContent() {
    if (!this._config) return;
    const fields = ['entity', 'status_entity', 'live_label', 'replay_label'];
    fields.forEach(id => {
      const el = this.querySelector(`#${id}`);
      if (el && !this._isFocused(el)) {
        const val = this._config[id] ?? '';
        if (el.value !== String(val)) {
          el.value = val;
        }
      }
    });
  }

  _renderBase() {
    this.innerHTML = `
      <style>
        .card-config {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 8px 0;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
        }
        .form-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-row label {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--secondary-text-color, #94a3b8);
        }
        .form-row input {
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid var(--divider-color, rgba(255,255,255,0.15));
          background: var(--card-background-color, #1a1a24);
          color: var(--primary-text-color, #fff);
          outline: none;
        }
        .form-row input:focus {
          border-color: #ff3b30;
        }
      </style>
      <div class="card-config">
        <div class="form-row">
          <label for="entity">Replay Mode Entity (input_boolean)</label>
          <input type="text" id="entity" value="${this._config.entity || 'input_boolean.f1_replay_mode'}">
        </div>
        <div class="form-row">
          <label for="status_entity">Replay Status Sensor</label>
          <input type="text" id="status_entity" value="${this._config.status_entity || 'sensor.f1_replay_status'}">
        </div>
        <div class="form-row">
          <label for="live_label">Live Button Label</label>
          <input type="text" id="live_label" value="${this._config.live_label || 'LIVE SESSION'}">
        </div>
        <div class="form-row">
          <label for="replay_label">Replay Button Label</label>
          <input type="text" id="replay_label" value="${this._config.replay_label || 'REPLAY MODE'}">
        </div>
      </div>
    `;

    this.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => this._valueChanged());
      inp.addEventListener('change', () => this._valueChanged());
    });
  }

  _valueChanged() {
    if (!this._config) return;
    const newConfig = Object.assign({}, this._config, {
      entity: this.querySelector('#entity')?.value ?? 'input_boolean.f1_replay_mode',
      status_entity: this.querySelector('#status_entity')?.value ?? 'sensor.f1_replay_status',
      live_label: this.querySelector('#live_label')?.value ?? 'LIVE SESSION',
      replay_label: this.querySelector('#replay_label')?.value ?? 'REPLAY MODE',
    });
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }
}

if (!customElements.get('f1-live-control-card-editor')) {
  customElements.define('f1-live-control-card-editor', F1LiveControlCardEditor);
}

if (!customElements.get('f1-live-control-card')) {
  customElements.define('f1-live-control-card', F1LiveControlCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'f1-live-control-card',
    name: 'F1 Live Control & Synchronisation Card',
    description: 'Live broadcast session synchronisation and delay calibration deck with Weekend Hub styling',
    preview: true,
  });
  console.info(
    '%c F1-LIVE-CONTROL-CARD %c v2.1.0 ',
    'color: white; background: #e10600; font-weight: 700;',
    'color: #040711; background: #38bdf8; font-weight: 700;'
  );
}


if (!customElements.get('f1-mode-toggle-card-editor')) {
  customElements.define('f1-mode-toggle-card-editor', F1ModeToggleCardEditor);
}

if (!customElements.get('f1-mode-toggle-card')) {
  customElements.define('f1-mode-toggle-card', F1ModeToggleCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'f1-mode-toggle-card',
    name: 'F1 Session Mode Toggle Card',
    description: 'Segmented capsule button switching between Live Session and Replay Mode with telemetry indicator',
    preview: true,
  });
  console.info(
    '%c F1-MODE-TOGGLE-CARD %c v2.1.1 ',
    'color: white; background: #e10600; font-weight: 700;',
    'color: #040711; background: #86efac; font-weight: 700;'
  );
}
