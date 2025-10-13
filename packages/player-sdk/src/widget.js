/**
 * Trail Mixx Player Widget
 * Embeddable player that can be added to any website
 * 
 * Usage:
 * <div id="trail-mixx-player" data-hls="https://your-stream-url/live/index.m3u8" data-locale="en"></div>
 * <script src="https://your-domain.com/player.js"></script>
 */

(function () {
  'use strict';

  // Load HLS.js if needed
  function loadHlsJs(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = callback;
    document.head.appendChild(script);
  }

  function initPlayer(container, hlsUrl, locale = 'en') {
    const audio = document.createElement('audio');
    const button = document.createElement('button');
    const liveIndicator = document.createElement('span');
    const errorMsg = document.createElement('p');

    let isPlaying = false;
    let hlsInstance = null;

    // Styles
    container.style.cssText = `
      padding: 20px;
      background: linear-gradient(135deg, #1e3a20, #2d2d2d);
      border-radius: 12px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 400px;
    `;

    button.style.cssText = `
      background: var(--player-primary, #16a34a);
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    button.onmouseover = () => {
      button.style.background = 'var(--player-primary-hover, #15803d)';
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
    };

    button.onmouseout = () => {
      button.style.background = 'var(--player-primary, #16a34a)';
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    };

    liveIndicator.style.cssText = `
      display: none;
      margin-top: 12px;
      color: #ef4444;
      font-size: 14px;
      font-weight: 500;
    `;

    errorMsg.style.cssText = `
      color: #ef4444;
      font-size: 14px;
      margin-top: 8px;
      display: none;
    `;

    const text = {
      en: { play: 'Play', pause: 'Pause', live: '🔴 Live' },
      es: { play: 'Reproducir', pause: 'Pausar', live: '🔴 En vivo' },
    };

    const t = text[locale] || text.en;

    button.textContent = t.play;
    liveIndicator.textContent = t.live;

    function setupHls() {
      if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = hlsUrl;
      } else if (window.Hls && Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(hlsUrl);
        hlsInstance.attachMedia(audio);

        hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            errorMsg.textContent = 'Playback error';
            errorMsg.style.display = 'block';
          }
        });
      } else {
        errorMsg.textContent = 'HLS not supported';
        errorMsg.style.display = 'block';
      }
    }

    function togglePlay() {
      if (isPlaying) {
        audio.pause();
        button.textContent = t.play;
        liveIndicator.style.display = 'none';
        isPlaying = false;
      } else {
        audio.play().then(() => {
          button.textContent = t.pause;
          liveIndicator.style.display = 'block';
          isPlaying = true;
          errorMsg.style.display = 'none';
        }).catch((err) => {
          console.error('Play failed:', err);
          errorMsg.textContent = 'Playback failed';
          errorMsg.style.display = 'block';
        });
      }
    }

    button.onclick = togglePlay;

    container.appendChild(button);
    container.appendChild(liveIndicator);
    container.appendChild(errorMsg);
    container.appendChild(audio);

    loadHlsJs(setupHls);
  }

  // Auto-initialize
  document.addEventListener('DOMContentLoaded', function () {
    const containers = document.querySelectorAll('[data-hls]');
    containers.forEach((container) => {
      const hlsUrl = container.getAttribute('data-hls');
      const locale = container.getAttribute('data-locale') || 'en';
      if (hlsUrl) {
        initPlayer(container, hlsUrl, locale);
      }
    });
  });

  // Export for manual init
  window.TrailMixxPlayer = { init: initPlayer };
})();
