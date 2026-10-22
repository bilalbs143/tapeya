<!doctype html>
<html lang="en" @if(!empty($allowControls)) class="allow-controls" @endif>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
    />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <title>Live Stream</title>
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
      }

      #player,
      #player iframe {
        background: #000;
      }

      #player-wrap {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }

      #player {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      #player iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }

      /* Live: block taps so React chrome above the underlay receives them. VOD: omit/remove. */
      #touch-shield {
        position: fixed;
        inset: 0;
        z-index: 10;
        background: transparent;
        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
      }

      html.allow-controls #touch-shield {
        display: none !important;
        pointer-events: none !important;
      }
    </style>
  </head>
  <body>
    <div id="player-wrap">
      <div id="player"></div>
    </div>
    @if(empty($allowControls))
      <div id="touch-shield" aria-hidden="true"></div>
    @endif
    <script src="https://www.youtube.com/iframe_api"></script>
    <script>
      (function () {
        var rawSrc = @json($embedSrc);
        // YouTube `origin` MUST match the page that hosts the iframe (Error 153 otherwise).
        // This proxy is served from the API host, so always use location.origin — not the
        // Public Website URL (e.g. dev.tapeya.com vs dev-api.tapeya.com).
        var pageOrigin = window.location.origin;
        var urlParams = new URLSearchParams(window.location.search);
        var allowControls =
          @json(!empty($allowControls)) ||
          urlParams.get('controls') === '1';

        var videoId = null;
        try {
          var match = rawSrc.match(/\/embed\/([^?/]+)/);
          if (match) {
            videoId = match[1];
          }
        } catch (e) {}

        if (!videoId) {
          return;
        }

        var playerVars = {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          fs: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          enablejsapi: 1,
        };

        // Highlights / VOD — YouTube chrome + scrubbing.
        // Mute for Capacitor: parent Play tap is not a gesture inside this iframe,
        // so unmuted autoplay is blocked (second YouTube Play button).
        if (allowControls) {
          document.documentElement.classList.add('allow-controls');
          playerVars.controls = 1;
          playerVars.disablekb = 0;
          playerVars.fs = 1;
          playerVars.mute = 1;
          var shield = document.getElementById('touch-shield');
          if (shield && shield.parentNode) {
            shield.parentNode.removeChild(shield);
          }
        }

        if (pageOrigin) {
          playerVars.origin = pageOrigin;
        }

        var player = null;
        var playerInitStarted = false;
        var hostReadySent = false;
        var hostPlayingSent = false;
        var playRetryTimers = [];

        /** Keep YT pixel size in sync with the iframe viewport (tilt / resize). */
        function fitPlayerToViewport() {
          var cw = window.innerWidth || document.documentElement.clientWidth;
          var ch = window.innerHeight || document.documentElement.clientHeight;
          if (cw <= 0 || ch <= 0) {
            return;
          }

          var el = document.getElementById('player');
          var iframe = el && el.querySelector('iframe');
          if (iframe) {
            iframe.style.width = cw + 'px';
            iframe.style.height = ch + 'px';
          }

          if (player && typeof player.setSize === 'function') {
            try {
              player.setSize(Math.ceil(cw), Math.ceil(ch));
            } catch (e) {}
          }
        }

        window.fitPlayerToViewport = fitPlayerToViewport;

        function clearPlayRetries() {
          for (var i = 0; i < playRetryTimers.length; i++) {
            window.clearTimeout(playRetryTimers[i]);
          }
          playRetryTimers = [];
        }

        function startPlayback() {
          if (!player || typeof player.playVideo !== 'function') {
            return;
          }

          // Do not call mute() here — playerVars.mute handles the initial mute.
          // Retries after PLAYING used to re-mute right after unmute.
          try {
            player.playVideo();
          } catch (e) {}
        }

        // iOS native host calls this after the WKWebView is unhidden. YouTube will not
        // enter PLAYING while the overlay webview is still hidden.
        window.tapeyaStartPlayback = startPlayback;

        function notifyHost(event) {
          if (event === 'ready' && hostReadySent) {
            return;
          }
          if (event === 'ready') {
            hostReadySent = true;
          }
          if (event === 'playing' && hostPlayingSent) {
            return;
          }
          if (event === 'playing') {
            hostPlayingSent = true;
          }

          try {
            if (
              window.webkit &&
              window.webkit.messageHandlers &&
              window.webkit.messageHandlers.tapeyaStream
            ) {
              window.webkit.messageHandlers.tapeyaStream.postMessage(event);
            }
          } catch (e) {}

          // Parent iframe (Android Capacitor / web proxy) — ready alone is not playback.
          var parentMessageType =
            event === 'ready'
              ? 'tapeya-youtube-ready'
              : event === 'playing'
                ? 'tapeya-youtube-playing'
                : event === 'error'
                  ? 'tapeya-youtube-error'
                  : null;
          if (parentMessageType) {
            try {
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: parentMessageType }, '*');
              }
            } catch (e) {}
          }
        }

        function notifyHostReady() {
          notifyHost('ready');
        }

        function initPlayer() {
          if (playerInitStarted) {
            return;
          }

          playerInitStarted = true;
          var cw = window.innerWidth || document.documentElement.clientWidth;
          var ch = window.innerHeight || document.documentElement.clientHeight;

          player = new YT.Player('player', {
            videoId: videoId,
            host: 'https://www.youtube.com',
            width: cw,
            height: ch,
            playerVars: playerVars,
            events: {
              onReady: function () {
                // Tell the native host first so it can unhide, then play.
                // iOS also re-invokes tapeyaStartPlayback after reveal (authoritative).
                // Visible embeds (Android iframe) rely on these play calls directly.
                notifyHostReady();
                startPlayback();
                playRetryTimers.push(window.setTimeout(startPlayback, 350));
                playRetryTimers.push(window.setTimeout(startPlayback, 1200));
                fitPlayerToViewport();
                window.setTimeout(fitPlayerToViewport, 250);
                window.setTimeout(fitPlayerToViewport, 1000);
              },
              onStateChange: function (event) {
                if (event.data === YT.PlayerState.PLAYING) {
                  clearPlayRetries();
                  // Unmute once after muted autoplay — not on every PLAYING (pause/resume/buffer).
                  if (allowControls && player && !hostPlayingSent) {
                    try {
                      if (typeof player.unMute === 'function') {
                        player.unMute();
                      }
                      if (typeof player.setVolume === 'function') {
                        player.setVolume(100);
                      }
                    } catch (e) {}
                  }
                  notifyHost('playing');
                }
              },
              onError: function () {
                notifyHost('error');
              },
            },
          });

          window.addEventListener('resize', fitPlayerToViewport);
          window.addEventListener('orientationchange', fitPlayerToViewport);
          if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', fitPlayerToViewport);
          }
        }

        if (window.YT && window.YT.Player) {
          initPlayer();
        } else {
          window.onYouTubeIframeAPIReady = initPlayer;
        }
      })();
    </script>
  </body>
</html>
