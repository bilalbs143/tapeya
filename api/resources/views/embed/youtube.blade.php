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

        // Extract the video/broadcast ID from the embed URL.
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
          controls: 1,
          playsinline: 1,
          fs: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
        };

        if (pageOrigin) {
          playerVars.origin = pageOrigin;
        }

        function initPlayer() {
          player = new YT.Player('player', {
            videoId: videoId,
            host: 'https://www.youtube.com',
            playerVars: playerVars,
            events: {
              onReady: function (event) {
                event.target.playVideo();
              },
            },
          });
        }

        // iframe_api.js may load before or after this script runs.
        if (window.YT && window.YT.Player) {
          initPlayer();
        } else {
          window.onYouTubeIframeAPIReady = initPlayer;
        }
      })();
    </script>
  </body>
</html>
