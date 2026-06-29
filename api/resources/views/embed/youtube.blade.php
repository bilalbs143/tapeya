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

      iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
    </style>
  </head>
  <body>
    <script>
      (function () {
        var rawSrc = @json($embedSrc);

        try {
          var embedUrl = new URL(rawSrc);
          var youtubeOrigin = @json($youtubeEmbedOrigin);
          if (youtubeOrigin) {
            embedUrl.searchParams.set('origin', youtubeOrigin);
            embedUrl.searchParams.set('widget_referrer', youtubeOrigin + '/embed/youtube');
          }
          embedUrl.searchParams.set('playsinline', '1');
          if (!embedUrl.searchParams.has('enablejsapi')) {
            embedUrl.searchParams.set('enablejsapi', '1');
          }

          var frame = document.createElement('iframe');
          frame.src = embedUrl.toString();
          frame.title = 'Live Match';
          frame.allow =
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
          frame.allowFullscreen = true;
          frame.setAttribute('playsinline', '');
          frame.setAttribute('webkit-playsinline', '');
          document.body.appendChild(frame);
        } catch (error) {
          /* ignore invalid src */
        }
      })();
    </script>
  </body>
</html>
