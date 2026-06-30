<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
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

      #player {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script>
      (function () {
        var rawSrc = @json($embedSrc);
        var youtubeOrigin = @json($youtubeEmbedOrigin);
        var pageOrigin = youtubeOrigin || window.location.origin;

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
        };

        if (pageOrigin) {
          playerVars.origin = pageOrigin;
        }

        var player = null;
        var playerInitStarted = false;
        var hostReadySent = false;

        function startPlayback() {
          if (!player || typeof player.playVideo !== 'function') {
            return;
          }

          try {
            player.playVideo();
          } catch (e) {}
        }

        function notifyHostReady() {
          if (hostReadySent) {
            return;
          }
          hostReadySent = true;

          try {
            if (
              window.webkit &&
              window.webkit.messageHandlers &&
              window.webkit.messageHandlers.tapeyaStream
            ) {
              window.webkit.messageHandlers.tapeyaStream.postMessage('ready');
            }
          } catch (e) {}

          try {
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ type: 'tapeya-youtube-ready' }, '*');
            }
          } catch (e) {}
        }

        function initPlayer() {
          if (playerInitStarted) {
            return;
          }

          playerInitStarted = true;

          player = new YT.Player('player', {
            videoId: videoId,
            host: 'https://www.youtube.com',
            width: '100%',
            height: '100%',
            playerVars: playerVars,
            events: {
              onReady: function () {
                startPlayback();
                window.setTimeout(startPlayback, 500);
                notifyHostReady();
              },
            },
          });
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
