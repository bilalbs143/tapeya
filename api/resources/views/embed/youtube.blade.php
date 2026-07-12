<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
    />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <title>Live Stream</title>
    <script>
      (function () {
        var params = new URLSearchParams(window.location.search);
        if (params.get('rotate') === '1') {
          document.documentElement.classList.add('immersive-rotate');
        }
      })();
    </script>
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

      #player-rotate-wrap {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }

      html.immersive-rotate #player-rotate-wrap {
        position: fixed;
        top: 50%;
        left: 50%;
        overflow: hidden;
        transform: translate(-50%, -50%) rotate(90deg);
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
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 0;
      }

      #touch-shield {
        position: fixed;
        inset: 0;
        z-index: 10;
        background: transparent;
        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
      }
    </style>
  </head>
  <body>
    <div id="player-rotate-wrap">
      <div id="player"></div>
    </div>
    <div id="touch-shield" aria-hidden="true"></div>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script>
      (function () {
        var rawSrc = @json($embedSrc);
        var youtubeOrigin = @json($youtubeEmbedOrigin);
        var pageOrigin = youtubeOrigin || window.location.origin;
        var urlParams = new URLSearchParams(window.location.search);

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

        if (pageOrigin) {
          playerVars.origin = pageOrigin;
        }

        var player = null;
        var playerInitStarted = false;
        var hostReadySent = false;
        var hostPlayingSent = false;

        function readEmbedFlags() {
          return {
            coverMode: urlParams.get('cover') === '1',
            rotateMode: urlParams.get('rotate') === '1',
          };
        }

        /** Pixel-size the rotate wrap — 100vh/vw is unreliable inside iOS WKWebView. */
        function applyRotateLayout() {
          var flags = readEmbedFlags();
          var wrap = document.getElementById('player-rotate-wrap');
          if (!wrap) {
            return flags;
          }

          if (flags.rotateMode) {
            document.documentElement.classList.add('immersive-rotate');
            var w = window.innerWidth || document.documentElement.clientWidth;
            var h = window.innerHeight || document.documentElement.clientHeight;
            wrap.style.width = h + 'px';
            wrap.style.height = w + 'px';
          } else {
            document.documentElement.classList.remove('immersive-rotate');
            wrap.style.width = '';
            wrap.style.height = '';
          }

          return flags;
        }

        window.applyRotateLayout = applyRotateLayout;

        function layoutViewport() {
          var flags = readEmbedFlags();
          var iw = window.innerWidth || document.documentElement.clientWidth;
          var ih = window.innerHeight || document.documentElement.clientHeight;
          if (flags.rotateMode) {
            return { cw: ih, ch: iw };
          }
          return { cw: iw, ch: ih };
        }

        function fitPlayerCover() {
          var flags = readEmbedFlags();
          if (!flags.coverMode) {
            return;
          }

          var viewport = layoutViewport();
          var cw = viewport.cw;
          var ch = viewport.ch;
          if (cw <= 0 || ch <= 0) {
            return;
          }

          var scale = Math.max(cw / 16, ch / 9);
          var frameW = 16 * scale;
          var frameH = 9 * scale;
          var el = document.getElementById('player');
          var iframe = el && el.querySelector('iframe');

          if (iframe) {
            iframe.style.width = frameW + 'px';
            iframe.style.height = frameH + 'px';
          }

          if (player && typeof player.setSize === 'function') {
            try {
              player.setSize(Math.ceil(frameW), Math.ceil(frameH));
            } catch (e) {}
          }
        }

        window.fitPlayerCover = fitPlayerCover;

        function startPlayback() {
          if (!player || typeof player.playVideo !== 'function') {
            return;
          }

          try {
            player.playVideo();
          } catch (e) {}
        }

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
          var flags = applyRotateLayout();
          var viewport = layoutViewport();

          player = new YT.Player('player', {
            videoId: videoId,
            host: 'https://www.youtube.com',
            width: viewport.cw,
            height: viewport.ch,
            playerVars: playerVars,
            events: {
              onReady: function () {
                applyRotateLayout();
                startPlayback();
                window.setTimeout(startPlayback, 500);
                if (flags.coverMode) {
                  fitPlayerCover();
                  window.setTimeout(fitPlayerCover, 250);
                  window.setTimeout(fitPlayerCover, 1000);
                }
                notifyHostReady();
              },
              onStateChange: function (event) {
                if (event.data === YT.PlayerState.PLAYING) {
                  notifyHost('playing');
                }
              },
              onError: function () {
                notifyHost('error');
              },
            },
          });

          window.addEventListener('resize', function () {
            applyRotateLayout();
            fitPlayerCover();
          });
        }

        applyRotateLayout();

        if (window.YT && window.YT.Player) {
          initPlayer();
        } else {
          window.onYouTubeIframeAPIReady = initPlayer;
        }
      })();
    </script>
  </body>
</html>
