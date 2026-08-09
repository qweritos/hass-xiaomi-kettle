import { css } from 'lit';

export const dialogStyles = css`
  :host {
    display: block;
    min-width: 0;
    --kettle-radius: var(--ha-card-border-radius, 12px);
    --kettle-surface: var(--secondary-background-color);
    --kettle-muted: var(--secondary-text-color);
  }

  * {
    box-sizing: border-box;
  }

  .shell {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding: 10px 14px 18px;
    overflow-x: hidden;
    color: var(--primary-text-color);
  }

  .shell.card-mode {
    padding-top: 8px;
  }

  .hero {
    --state-color: var(--primary-color);
    display: grid;
    grid-template-columns: minmax(0, 1fr) 72px;
    min-height: 104px;
    padding: 11px 16px;
    overflow: hidden;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    background: var(--card-background-color);
  }

  .hero.hot {
    --state-color: var(--warning-color, #ff9800);
  }

  .hero.cool {
    --state-color: var(--info-color, var(--primary-color));
  }

  .hero.warm {
    --state-color: var(--success-color, #4caf50);
  }

  .hero.fault {
    --state-color: var(--error-color);
  }

  .hero.lifted {
    --state-color: var(--accent-color, var(--primary-color));
  }

  .temperature {
    z-index: 1;
    align-self: center;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 0 18px;
    min-width: 0;
  }

  .temperature-value {
    min-width: 0;
    padding: 0;
    border: 0;
    border-radius: 8px;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .temperature-value:hover {
    color: var(--state-color);
  }

  .temperature-value:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 4px;
  }

  .temperature-value > strong {
    display: block;
    font-size: 54px;
    line-height: 0.95;
    letter-spacing: -4px;
  }

  .temperature-value > strong small {
    margin-left: 4px;
    font-size: 21px;
    letter-spacing: 0;
    opacity: 0.8;
  }

  .temperature-copy {
    min-width: 0;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--state-color);
    font-size: 15px;
    font-weight: 650;
  }

  .status-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-dot {
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentcolor;
  }

  .status.action-armed {
    color: var(--warning-color, #ff9800);
  }

  .hero-meta {
    margin-top: 7px;
    overflow: hidden;
    color: var(--secondary-text-color);
    font-size: 12px;
    line-height: 1.35;
    text-overflow: ellipsis;
  }

  .hero-meta.preview {
    color: color-mix(in srgb, var(--warning-color, #ff9800) 48%, var(--secondary-text-color));
  }

  .kettle-action {
    align-self: center;
    justify-self: end;
    position: relative;
    width: 62px;
    height: 62px;
  }

  .kettle-art {
    --kettle-steam-offset: 4.75px;
    display: grid;
    place-items: center;
    width: 62px;
    height: 62px;
    padding: 0;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    color: var(--state-color);
    background: var(--secondary-background-color);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .kettle-art:focus-visible {
    outline: 2px solid var(--warning-color, #ff9800);
    outline-offset: 2px;
  }

  .kettle-art:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .kettle-art.armed {
    border-color: var(--warning-color, #ff9800);
    color: var(--warning-color, #ff9800);
    background: color-mix(
      in srgb,
      var(--warning-color, #ff9800) 12%,
      var(--secondary-background-color)
    );
  }

  .kettle-art ha-icon {
    --mdc-icon-size: 38px;
  }

  .kettle-art ha-icon[icon='mdi:kettle-steam'] {
    translate: var(--kettle-steam-offset) 0;
  }

  .hero.hot .kettle-art ha-icon {
    animation: kettle-pulse 1.8s ease-in-out infinite;
  }

  .hero.hot .kettle-art.armed ha-icon {
    animation: none;
  }

  @keyframes kettle-pulse {
    50% {
      transform: translateY(-3px);
    }
  }

  summary ha-icon,
  .setting-icon ha-icon {
    color: var(--primary-color);
  }

  .programs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    min-width: 0;
    margin-top: 10px;
  }

  button {
    font: inherit;
  }

  .program {
    min-width: 0;
    width: 100%;
    padding: 10px 6px 9px;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    color: var(--primary-text-color);
    background: var(--card-background-color);
    cursor: pointer;
    transition:
      transform 0.16s ease,
      border-color 0.16s ease,
      background 0.16s ease;
  }

  .program:hover {
    transform: translateY(-1px);
    border-color: var(--primary-color);
    background: var(--kettle-surface);
  }

  .program:active {
    transform: scale(0.97);
  }

  .program:disabled,
  .button:disabled {
    cursor: wait;
    opacity: 0.6;
    transform: none;
  }

  .program.armed,
  .button.armed {
    border-color: var(--primary-color);
    color: var(--text-primary-color);
    background: var(--primary-color);
  }

  .program ha-icon {
    display: block;
    margin: 0 auto 5px;
    color: var(--primary-color);
    --mdc-icon-size: 23px;
  }

  .program.armed ha-icon,
  .program.armed small {
    color: currentcolor;
  }

  .program strong,
  .program small {
    display: block;
    overflow: hidden;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .program small {
    margin-top: 2px;
    color: var(--kettle-muted);
  }

  .empty-programs {
    grid-column: 1 / -1;
    margin: 0;
    padding: 10px 12px;
    color: var(--kettle-muted);
    font-size: 12px;
  }

  .control-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px 12px;
    align-items: center;
    min-width: 0;
    margin-top: 8px;
    padding: 12px 14px;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    background: var(--card-background-color);
  }

  .control-card.disabled {
    opacity: 0.55;
  }

  .control-copy,
  .setting-copy {
    min-width: 0;
  }

  .control-copy strong,
  .control-copy small,
  .setting-copy strong,
  .setting-copy small {
    display: block;
  }

  .control-copy strong,
  .setting-copy strong {
    font-size: 13px;
  }

  .control-copy small,
  .setting-copy small {
    margin-top: 3px;
    color: var(--kettle-muted);
    font-size: 11px;
  }

  .control-value {
    color: var(--primary-color);
    font-size: 14px;
    font-weight: 700;
  }

  input[type='range'] {
    grid-column: 1 / -1;
    width: 100%;
    min-width: 0;
    height: 5px;
    margin: 3px 0 0;
    border-radius: 99px;
    accent-color: var(--primary-color);
    cursor: pointer;
  }

  input[type='range']:disabled {
    cursor: not-allowed;
  }

  .keep-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
    min-width: 0;
    margin-top: 8px;
  }

  .keep-grid .control-card {
    min-width: 0;
    margin: 0;
  }

  .switch-card {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .switch-card .control-copy {
    flex: 1;
  }

  .switch-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .switch {
    position: relative;
    flex: 0 0 auto;
    width: 42px;
    height: 24px;
    border-radius: 99px;
    background: var(--disabled-color);
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .switch::after {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 6px rgb(0 0 0 / 25%);
    content: '';
    transition: transform 0.2s ease;
  }

  .switch-input:checked + .switch {
    background: var(--primary-color);
  }

  .switch-input:checked + .switch::after {
    transform: translateX(18px);
  }

  .actions {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr;
    gap: 8px;
    min-width: 0;
    margin-top: 10px;
  }

  .actions.card-actions {
    grid-template-columns: 1fr 1fr;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 0;
    min-height: 44px;
    padding: 0 11px;
    overflow: hidden;
    border: 0;
    border-radius: var(--kettle-radius);
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    transition: transform 0.14s ease;
  }

  .button:active {
    transform: scale(0.98);
  }

  .button ha-icon {
    --mdc-icon-size: 19px;
  }

  .button.primary {
    color: var(--text-primary-color);
    background: var(--primary-color);
  }

  .button.boil {
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    background: var(--card-background-color);
  }

  .button.stop {
    border: 1px solid var(--divider-color);
    color: var(--error-color);
    background: var(--card-background-color);
  }

  details {
    margin-top: 10px;
    overflow: hidden;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    background: var(--card-background-color);
  }

  summary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 13px 14px;
    font-size: 13px;
    font-weight: 650;
    list-style: none;
    cursor: pointer;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary .chevron {
    margin-left: auto;
    color: var(--kettle-muted);
    transition: transform 0.18s ease;
  }

  details[open] summary .chevron {
    transform: rotate(180deg);
  }

  .settings {
    padding: 0 11px 7px;
  }

  .setting-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 50px;
    padding: 6px 3px;
  }

  label.setting-row {
    cursor: pointer;
  }

  .setting-row + .setting-row {
    border-top: 1px solid var(--divider-color);
  }

  .setting-icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: var(--secondary-background-color);
  }

  .setting-icon ha-icon {
    --mdc-icon-size: 17px;
  }

  .setting-copy {
    flex: 1;
  }

  .notice {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 9px;
    padding: 10px 12px;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    color: var(--error-color);
    background: var(--card-background-color);
    font-size: 12px;
  }

  .notice ha-icon {
    --mdc-icon-size: 19px;
  }

  .offline {
    pointer-events: none;
    opacity: 0.56;
    filter: grayscale(0.25);
  }

  @media (max-width: 600px) {
    .shell {
      padding: 8px 10px calc(12px + env(safe-area-inset-bottom));
    }

    .hero {
      grid-template-columns: minmax(0, 1fr) 54px;
      min-height: 86px;
      padding: 8px 12px;
    }

    .temperature {
      gap: 0 11px;
    }

    .temperature-value > strong {
      font-size: 44px;
      letter-spacing: -3px;
    }

    .temperature-value > strong small {
      font-size: 18px;
    }

    .status {
      font-size: 13px;
    }

    .hero-meta {
      margin-top: 5px;
      font-size: 10px;
    }

    .kettle-action,
    .kettle-art {
      width: 48px;
      height: 48px;
      border-radius: 14px;
    }

    .kettle-art {
      --kettle-steam-offset: 3.75px;
    }

    .kettle-art ha-icon {
      --mdc-icon-size: 30px;
    }

    .programs {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
    }

    .program {
      padding: 8px 5px 7px;
    }

    .control-card {
      gap: 6px 8px;
      padding: 10px 11px;
    }

    .control-copy small {
      display: none;
    }

    .actions {
      grid-template-columns: 1.15fr 0.9fr 0.9fr;
      gap: 6px;
    }

    .button {
      min-height: 42px;
      padding: 0 7px;
      gap: 4px;
      font-size: 12px;
    }

    summary {
      padding: 11px 12px;
    }
  }
`;
