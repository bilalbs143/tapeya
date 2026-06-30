/**
 * Fixed on-screen overlay debugger for vMix / OBS when DevTools is unavailable.
 * Enable with ?overlayDebug=1 on the overlay URL.
 */
import { useEffect, useMemo, useState } from 'react';

import { getThemeCommandComponent, getThemeMeta } from '../exit/themeRegistry';
import { useGraphicEcho } from './GraphicEchoProvider';
import {
  collectEnvironmentDiagnostics,
  describeGateBlock,
  installOverlayDiagnosticsCapture,
  pushOverlayLog,
  subscribeOverlayDiagnostics,
} from './overlayDiagnostics';
import { useGraphicController } from './useGraphicController';

/**
 * @param {{ ok: boolean, label: string, detail?: string }} props
 */
function StatusRow({ ok, label, detail }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'flex-start' }}>
      <span style={{ color: ok ? '#6f6' : '#f66', fontWeight: 700, minWidth: 28 }}>{ok ? 'OK' : 'FAIL'}</span>
      <span style={{ color: '#ddd' }}>
        {label}
        {detail ? (
          <>
            {' '}
            <span style={{ color: '#9cf' }}>{detail}</span>
          </>
        ) : null}
      </span>
    </div>
  );
}

/**
 * @param {{
 *   matchId?: string,
 *   searchParams: URLSearchParams,
 *   gateStatus: {
 *     blockReason?: string,
 *     assetsReady?: boolean,
 *     assetsError?: string | null,
 *     themeSlug?: string,
 *   },
 *   contentStatus: {
 *     hasRenderPlan?: boolean,
 *     commandKey?: string | null,
 *     commandType?: string | null,
 *     displayMode?: string | null,
 *     rendererBlock?: string | null,
 *   },
 * }} props
 */
export function OverlayDiagnosticsPanel({ matchId, searchParams, gateStatus, contentStatus }) {
  const { snapshot, renderPlan, themeSlug, isLoading, isError, sessionError } = useGraphicController();
  const echo = useGraphicEcho();
  const [env, setEnv] = useState(() => collectEnvironmentDiagnostics());
  const [ring, setRing] = useState({ logs: [], errors: [] });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    installOverlayDiagnosticsCapture();
    pushOverlayLog('panel', 'OverlayDiagnosticsPanel mounted');

    const bootEl = document.getElementById('overlay-debug-boot');
    if (bootEl) {
      bootEl.textContent = 'React diagnostics panel active';
      bootEl.style.background = 'rgba(0,80,0,0.92)';
    }

    const unsub = subscribeOverlayDiagnostics(setRing);
    const interval = window.setInterval(() => {
      setEnv(collectEnvironmentDiagnostics());
      setTick((n) => n + 1);
    }, 1500);

    return () => {
      unsub();
      window.clearInterval(interval);
    };
  }, []);

  const expires = searchParams.get('expires');
  const signature = searchParams.get('signature');
  const signedUrl = Boolean(expires && signature);

  const blockReason = contentStatus.hasRenderPlan === false && gateStatus.blockReason === 'ready'
    ? 'no_render_plan'
    : gateStatus.blockReason ?? 'boot';

  const pipelineOk =
    Boolean(matchId) &&
    !isError &&
    Boolean(snapshot) &&
    Boolean(themeSlug) &&
    gateStatus.assetsReady &&
    Boolean(contentStatus.hasRenderPlan) &&
    !contentStatus.rendererBlock;

  const rows = useMemo(
    () => [
      {
        ok: Boolean(matchId),
        label: 'matchId in route',
        detail: matchId ?? '(missing)',
      },
      {
        ok: signedUrl || !isError,
        label: signedUrl ? 'Signed overlay URL' : 'Session auth mode',
        detail: signedUrl ? `expires=${expires?.slice(0, 8)}…` : 'no expires/signature in URL',
      },
      {
        ok: !isLoading || Boolean(snapshot),
        label: 'Session HTTP',
        detail: isLoading ? 'loading…' : isError ? 'error' : snapshot ? 'loaded' : 'empty',
      },
      {
        ok: !isError,
        label: 'Session error flag',
        detail: sessionError ?? (isError ? 'isError=true' : 'none'),
      },
      {
        ok: Boolean(themeSlug),
        label: 'theme.slug',
        detail: themeSlug || snapshot?.themeSlug || '(empty)',
      },
      {
        ok: Boolean(gateStatus.assetsReady),
        label: 'Theme assets (CSS/fonts)',
        detail: gateStatus.assetsError ?? (gateStatus.assetsReady ? 'ready' : 'loading…'),
      },
      {
        ok: Boolean(contentStatus.hasRenderPlan),
        label: 'renderPlan',
        detail: contentStatus.commandKey ?? '(no commandKey)',
      },
      {
        ok: !contentStatus.rendererBlock,
        label: 'Renderer component',
        detail: contentStatus.rendererBlock ?? 'resolved',
      },
      {
        ok: Boolean(echo),
        label: 'Reverb Echo',
        detail: echo ? 'connected' : 'not created (optional for first paint)',
      },
      {
        ok: env.colorMixSupported === false,
        label: 'color-mix() unsupported (expected on vMix 24)',
        detail: String(env.colorMixSupported),
      },
      {
        ok: typeof env.accentMixHex === 'string' && !env.accentMixHex.startsWith('color-mix'),
        label: 'accentMix hex path',
        detail: String(env.accentMixHex),
      },
      {
        ok: typeof env.accentMixVar === 'string' && !env.accentMixVar.startsWith('color-mix'),
        label: 'accentMix var(--accentA)',
        detail: String(env.accentMixVar),
      },
    ],
    [
      matchId,
      signedUrl,
      expires,
      isLoading,
      isError,
      snapshot,
      sessionError,
      themeSlug,
      gateStatus.assetsReady,
      gateStatus.assetsError,
      contentStatus.hasRenderPlan,
      contentStatus.commandKey,
      contentStatus.rendererBlock,
      echo,
      env.colorMixSupported,
      env.accentMixHex,
      env.accentMixVar,
    ],
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483646,
        pointerEvents: 'none',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 11,
        lineHeight: 1.45,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          left: 8,
          bottom: 8,
          maxWidth: 'min(520px, calc(100vw - 16px))',
          maxHeight: 'min(70vh, 640px)',
          overflow: 'auto',
          pointerEvents: 'auto',
          background: 'rgba(0, 0, 0, 0.92)',
          color: '#cfc',
          border: `2px solid ${pipelineOk ? '#393' : '#933'}`,
          borderRadius: 6,
          padding: '10px 12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, color: pipelineOk ? '#8f8' : '#f88' }}>
          Overlay debug {pipelineOk ? '· pipeline OK' : '· BLOCKED'} · tick {tick}
        </div>

        <div style={{ color: '#9aa', marginBottom: 8 }}>
          Append <span style={{ color: '#ff9' }}>&overlayDebug=1</span> to hide in production. Block:{' '}
          <span style={{ color: '#fc9' }}>{describeGateBlock(blockReason)}</span>
        </div>

        <div style={{ marginBottom: 10, padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
          <div style={{ color: '#adf', marginBottom: 4 }}>Environment</div>
          <div>Chrome {env.chromeMajor ?? '?'} · {env.viewport} · overlayRoute={String(env.overlayRouteAttr)}</div>
          <div style={{ wordBreak: 'break-all', color: '#aaa', marginTop: 4 }}>{env.userAgent}</div>
          <div style={{ marginTop: 6 }}>
            command: {contentStatus.commandKey ?? '—'} / {contentStatus.commandType ?? '—'} /{' '}
            {contentStatus.displayMode ?? '—'}
          </div>
          <div>contextHash: {snapshot?.contextHash ?? '—'}</div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ color: '#adf', marginBottom: 6 }}>Pipeline</div>
          {rows.map((row) => (
            <StatusRow key={row.label} ok={row.ok} label={row.label} detail={row.detail} />
          ))}
        </div>

        <div style={{ marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#adf' }}>Color swatch</span>
          <span
            title={`accentMix var: ${env.accentMixVar}`}
            style={{
              width: 48,
              height: 24,
              borderRadius: 4,
              border: `2px solid ${env.accentMixVar}`,
              background: `linear-gradient(100deg, ${env.accentMixVar}, transparent)`,
            }}
          />
          <span style={{ color: '#9cf' }}>{env.computedAccentA}</span>
        </div>

        {ring.errors.length > 0 ? (
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: '#f88', marginBottom: 4 }}>Errors ({ring.errors.length})</div>
            {ring.errors.slice(-6).map((entry) => (
              <div key={`${entry.at}-${entry.source}`} style={{ color: '#faa', marginBottom: 2 }}>
                [{entry.source}] {entry.message}
              </div>
            ))}
          </div>
        ) : null}

        <div>
          <div style={{ color: '#adf', marginBottom: 4 }}>Log ({ring.logs.length})</div>
          {ring.logs.slice(-8).map((entry) => (
            <div key={`${entry.at}-${entry.tag}`} style={{ color: '#8a8', marginBottom: 2 }}>
              {entry.tag}: {entry.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Resolve renderer block reason (mirrors GraphicRenderer checks).
 * @param {import('../types.js').GraphicRenderPlan | null | undefined} plan
 */
export function resolveRendererBlockReason(plan) {
  if (!plan) return 'no_plan';

  const GraphicComponent = getThemeCommandComponent(plan.themeSlug, plan.commandType, plan.commandKey);
  if (!GraphicComponent) {
    return `no_component:${plan.themeSlug}/${plan.commandType}/${plan.commandKey}`;
  }

  const themeMeta = getThemeMeta(plan.themeSlug);
  if (!themeMeta?.ThemeRoot) {
    return `no_theme_root:${plan.themeSlug}`;
  }

  return null;
}
