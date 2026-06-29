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

      #proxy-debug-banner {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        max-height: 40%;
        overflow-y: auto;
        padding: 6px 8px;
        font:
          10px/1.35 ui-monospace,
          monospace;
        color: #0f0;
        background: rgba(0, 0, 0, 0.85);
        pointer-events: none;
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <div id="proxy-debug-banner"></div>
    <div id="player"></div>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script>
      (function () {
        var PROXY_VERSION = '2026-06-29-yt-api-v2';
        var MESSAGE_TYPE = 'tapeya-youtube-proxy-debug';
        var params = new URLSearchParams(window.location.search);
        var showBanner = params.get('_dbg') === '1';
        var bannerEl = document.getElementById('proxy-debug-banner');
        var bannerLines = [];

        if (showBanner && bannerEl) {
          bannerEl.style.display = 'block';
        }

        function stateName(code) {
          var map = {
            '-1': 'UNSTARTED',
            0: 'ENDED',
            1: 'PLAYING',
            2: 'PAUSED',
            3: 'BUFFERING',
            5: 'CUED',
          };
          return map[String(code)] || 'UNKNOWN(' + code + ')';
        }

        function errorName(code) {
          var map = {
            2: 'INVALID_PARAMETER',
            5: 'HTML5_ERROR',
            100: 'NOT_FOUND',
            101: 'NOT_EMBEDDABLE',
            150: 'NOT_EMBEDDABLE',
            153: 'CONFIGURATION_ERROR',
          };
          return map[code] || 'UNKNOWN(' + code + ')';
        }

        function proxyLog(tag, payload) {
          var entry = {
            tag: tag,
            payload: payload || {},
            ts: new Date().toISOString(),
            href: window.location.href,
            proxyVersion: PROXY_VERSION,
          };

          try {
            console.warn('[tapeya-proxy:' + tag + ']', payload);
          } catch (e) {}

          if (showBanner && bannerEl) {
            bannerLines.push(tag + ': ' + JSON.stringify(payload));
            if (bannerLines.length > 12) {
              bannerLines.shift();
            }
            bannerEl.textContent = bannerLines.join('\n');
          }

          try {
            if (window.parent && window.parent !== window) {
              window.parent.postMessage(
                {
                  type: MESSAGE_TYPE,
                  tag: tag,
                  payload: payload || {},
                  ts: entry.ts,
                  proxyVersion: PROXY_VERSION,
                  href: entry.href,
                },
                '*',
              );
            }
          } catch (e) {
            proxyLogInternal('postmessage-failed', { message: String(e) });
          }
        }

        function proxyLogInternal(tag, payload) {
          try {
            console.warn('[tapeya-proxy:' + tag + ']', payload);
          } catch (e) {}
        }

        var rawSrc = @json($embedSrc);
        var youtubeOrigin = @json($youtubeEmbedOrigin);
        var pageOrigin = youtubeOrigin || window.location.origin;

        proxyLog('boot', {
          rawSrc: rawSrc,
          youtubeOrigin: youtubeOrigin,
          pageOrigin: pageOrigin,
          showBanner: showBanner,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
          parentIsSelf: !window.parent || window.parent === window,
        });

        var videoId = null;
        try {
          var match = rawSrc.match(/\/embed\/([^?/]+)/);
          if (match) {
            videoId = match[1];
          }
        } catch (e) {
          proxyLog('video-id-parse-error', { message: String(e) });
        }

        if (!videoId) {
          proxyLog('video-id-missing', { rawSrc: rawSrc });
          return;
        }

        proxyLog('video-id-ok', { videoId: videoId });

        var playerVars = {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          controls: 1,
          playsinline: 1,
          fs: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          mute: 1,
        };

        if (pageOrigin) {
          playerVars.origin = pageOrigin;
        }

        var player = null;
        var playerInitStarted = false;

        function describePlayer() {
          if (!player || typeof player.getPlayerState !== 'function') {
            return { ready: false };
          }

          try {
            return {
              ready: true,
              state: player.getPlayerState(),
              stateName: stateName(player.getPlayerState()),
              currentTime: player.getCurrentTime(),
              duration: player.getDuration(),
              videoUrl: player.getVideoUrl(),
            };
          } catch (e) {
            return { ready: true, describeError: String(e) };
          }
        }

        function tryPlay(reason) {
          if (!player || typeof player.playVideo !== 'function') {
            proxyLog('play-skipped-no-player', { reason: reason });
            return;
          }

          try {
            player.unMute();
            player.playVideo();
            proxyLog('play-called', { reason: reason, player: describePlayer() });
          } catch (e) {
            proxyLog('play-error', { reason: reason, message: String(e) });
          }
        }

        function initPlayer(apiPath) {
          if (playerInitStarted) {
            proxyLog('init-skipped-duplicate', { apiPath: apiPath });
            return;
          }

          playerInitStarted = true;
          proxyLog('yt-api-init', { apiPath: apiPath, videoId: videoId, playerVars: playerVars });

          try {
            player = new YT.Player('player', {
              videoId: videoId,
              host: 'https://www.youtube.com',
              width: '100%',
              height: '100%',
              playerVars: playerVars,
              events: {
                onReady: function (event) {
                  proxyLog('yt-on-ready', { player: describePlayer() });
                  tryPlay('onReady');
                  window.setTimeout(function () {
                    tryPlay('onReady+500ms');
                  }, 500);
                  window.setTimeout(function () {
                    tryPlay('onReady+1500ms');
                    proxyLog('yt-status-1500ms', { player: describePlayer() });
                  }, 1500);
                },
                onStateChange: function (event) {
                  proxyLog('yt-state-change', {
                    state: event.data,
                    stateName: stateName(event.data),
                    player: describePlayer(),
                  });
                },
                onError: function (event) {
                  proxyLog('yt-error', {
                    code: event.data,
                    codeName: errorName(event.data),
                    videoId: videoId,
                    pageOrigin: pageOrigin,
                  });
                },
              },
            });
            proxyLog('yt-player-constructed', {});
          } catch (e) {
            proxyLog('yt-player-construct-error', { message: String(e) });
          }
        }

        if (window.YT && window.YT.Player) {
          initPlayer('immediate');
        } else {
          proxyLog('yt-api-waiting', { hasYT: !!window.YT });
          window.onYouTubeIframeAPIReady = function () {
            proxyLog('yt-api-ready-callback', { hasPlayer: !!(window.YT && window.YT.Player) });
            initPlayer('callback');
          };
        }

        window.setTimeout(function () {
          if (!playerInitStarted) {
            proxyLog('yt-api-timeout', {
              hasYT: !!window.YT,
              hasPlayer: !!(window.YT && window.YT.Player),
            });
          } else {
            proxyLog('yt-status-8s', { player: describePlayer() });
          }
        }, 8000);
      })();
    </script>
  </body>
</html>
