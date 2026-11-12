/** Layout helpers for the iOS native YouTube overlay. */

export type OverlayFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OverlayStackOptions = {
  isLandscape?: boolean | undefined;
  /** Above Cap (VOD). False = underlay (live/watch — badges/chat/Exit). */
  interactive?: boolean | undefined;
};

export type NativeOverlayLayout = {
  underlay: boolean;
  immersiveFullscreen: boolean;
  userInteractionEnabled: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export function readElementLayoutRect(element: Element): OverlayFrame {
  const rect = element.getBoundingClientRect();
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
}

export function buildNativeStackLayout({ isLandscape = false, interactive = false }: OverlayStackOptions = {}): Pick<
  NativeOverlayLayout,
  'underlay' | 'immersiveFullscreen' | 'userInteractionEnabled'
> {
  return {
    underlay: !interactive,
    immersiveFullscreen: Boolean(isLandscape),
    userInteractionEnabled: Boolean(interactive),
  };
}

/** Portrait: placeholder rect. Landscape: stack only (native fills host). */
export function buildNativeOverlayLayout(placeholder: Element, options: OverlayStackOptions = {}): NativeOverlayLayout {
  const stack = buildNativeStackLayout(options);
  if (options.isLandscape) return stack;
  return { ...readElementLayoutRect(placeholder), ...stack };
}

export function hasValidOverlayFrame(layout: NativeOverlayLayout): boolean {
  if (layout.immersiveFullscreen) return true;
  return (layout.width ?? 0) > 0 && (layout.height ?? 0) > 0;
}

/** Embed rotate/cover for Full; optional controls for VOD. */
export function withIosNativeEmbedParams(
  proxyUrl: string,
  { landscape = false, showControls = false }: { landscape?: boolean; showControls?: boolean } = {}
): string {
  try {
    const url = new URL(proxyUrl);
    if (landscape) {
      url.searchParams.set('cover', '1');
      url.searchParams.set('rotate', '1');
      url.searchParams.set('_yt', 'r1');
    } else {
      url.searchParams.delete('cover');
      url.searchParams.delete('rotate');
      url.searchParams.delete('_yt');
    }
    if (showControls) url.searchParams.set('controls', '1');
    return url.toString();
  } catch {
    return proxyUrl;
  }
}
