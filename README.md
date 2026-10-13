# F1 Session Mode Toggle Card (`custom:f1-mode-toggle-card`)

> Vibe coded with Antigravity.  Code has been reviewed and could probably be refactored in places.  Tested on both desktop and mobile app, happy for feedback and issues

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/default)
[![version](https://img.shields.io/badge/version-2.1.1-green.svg)](https://github.com/paulgbrichardson/f1-mode-toggle-card)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.1%2B-blue.svg)](https://www.home-assistant.io)

A standalone segmented capsule button designed for Formula 1 Pit Wall dashboards in Home Assistant, enabling seamless one-touch switching between **Live Session** and **Replay Mode**.

Engineered to match the authentic **Formula 1 Weekend Hub** design system (`Nicxe/f1_sensor`):
- **46px Standardized Height**: Perfectly aligns with the Weekend Hub action button height and row grids.
- **Triple-Gradient Carbon Chassis**: Sleek dark carbon finish with subtle radial glow and razor-sharp border definition.
- **Reactive Left Indicator Accent**: Dynamic 4px left border stripe shifting from racing red (`#ff3b30`) in Live Session mode to emerald green (`#34c759`) when Replay Mode is active.
- **Dynamic Telemetry Status Indicators**: Real-time neon status dots and label indicators reflecting `sensor.f1_replay_status`:
  - `● LIVE SESSION`: High-intensity racing red dot (`#ff3b30`) with animated pulse.
  - `● REPLAY RUNNING`: Vivid emerald green dot (`#34c759`) with active playback pulse.
  - `● [REPLAY PAUSED]`: Caution amber dot (`#f59e0b`).
  - `● [SEEKING]`: Warning orange dot (`#ff9500`).
- **Full Card Fill & Zero Vertical Clipping**: Symmetrical 50/50 dual-pill button layout designed for both desktop pitwalls and mobile screens.

---

## Installation

### Installation via HACS (Custom Repository)
1. In Home Assistant, open **HACS** → **Frontend**.
2. Click the three dots in the top right corner and choose **Custom repositories**.
3. Add the repository URL:
   - **Repository**: `https://github.com/paulgbrichardson/f1-mode-toggle-card`
   - **Type**: `Dashboard` (or `Lovelace`)
4. Click **Add**, find **F1 Session Mode Toggle Card**, and click **Download**.
5. Reload your browser window.

### Manual Installation
1. Copy `f1-mode-toggle-card.js` (or `f1-mode-toggle-card.min.js`) into your Home Assistant `/config/www/` directory.
2. In Home Assistant, go to **Settings** → **Dashboards** → **Resources** (top right three dots).
3. Click **Add Resource**:
   - **URL**: `/local/f1-mode-toggle-card.js`
   - **Resource Type**: `JavaScript Module`

---

## Configuration

### Visual UI Editor
This card includes a full visual GUI configuration editor. When editing your dashboard, simply search for **F1 Session Mode Toggle Card** to configure entity targets and labels visually.

### YAML Configuration

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` | **Required** | Must be `custom:f1-mode-toggle-card` |
| `entity` | `string` | `input_boolean.f1_replay_mode` | Target boolean entity controlling replay mode state |
| `status_entity` | `string` | `sensor.f1_replay_status` | Status sensor for dynamic replay state badge |
| `live_label` | `string` | `LIVE SESSION` | Text label for the Live button |
| `replay_label` | `string` | `REPLAY MODE` | Fallback text label for the Replay button |

### Example YAML

```yaml
type: custom:f1-mode-toggle-card
entity: input_boolean.f1_replay_mode
status_entity: sensor.f1_replay_status
```

## 🏎️ Complete Pit Wall Dashboard

For the complete production layout, full YAML configuration, and matching modular styles for `custom:f1-sensor-card`, visit the **[f1-pitwall-dashboard](https://github.com/paulgbrichardson/f1-pitwall-dashboard)** showcase repository.

---

## License

MIT © [Paul](LICENSE)
