import { Keyboard, type KeyboardInfo } from '@capacitor/keyboard';

import { isNativePlatform } from '@/shared/platform/platform';

/** Single keyboard inset for `Keyboard.resize: 'none'` — publishes `--keyboard-inset`; disables native scroll while open. */

const CSS_VAR = '--keyboard-inset';

type Listener = () => void;

let heightPx = 0;
let started = false;
let nativeHandles: Array<{ remove: () => Promise<void> }> = [];
const listeners = new Set<Listener>();

function publish(next: number) {
  const rounded = Math.max(0, Math.round(next));
  if (rounded === heightPx) return;
  heightPx = rounded;
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty(CSS_VAR, `${heightPx}px`);
  }
  for (const listener of listeners) listener();
}

async function setNativeScrollDisabled(disabled: boolean) {
  if (!isNativePlatform()) return;
  try {
    await Keyboard.setScroll({ isDisabled: disabled });
  } catch {
    /* plugin missing in some web shells */
  }
}

function onKeyboardShow(info: KeyboardInfo) {
  void setNativeScrollDisabled(true);
  publish(info.keyboardHeight);
}

function onKeyboardHide() {
  publish(0);
  void setNativeScrollDisabled(false);
}

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return el.isContentEditable;
}

/** Web: only publish inset while an editable is focused (ignore URL-bar viewport shrink). */
function bindWebVisualViewport() {
  const vv = window.visualViewport;
  if (!vv) return () => undefined;

  const sync = () => {
    if (!isEditableTarget(document.activeElement)) {
      publish(0);
      return;
    }
    publish(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
  };

  vv.addEventListener('resize', sync);
  vv.addEventListener('scroll', sync);
  document.addEventListener('focusin', sync);
  document.addEventListener('focusout', sync);
  return () => {
    vv.removeEventListener('resize', sync);
    vv.removeEventListener('scroll', sync);
    document.removeEventListener('focusin', sync);
    document.removeEventListener('focusout', sync);
  };
}

/** Start once from `KeyboardInsetProvider` — safe to call repeatedly. */
export function startKeyboardInsetTracking(): () => void {
  if (started) return () => undefined;
  started = true;

  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty(CSS_VAR, '0px');
  }

  if (isNativePlatform()) {
    let cancelled = false;
    void Keyboard.addListener('keyboardWillShow', onKeyboardShow).then((h) => {
      if (cancelled) void h.remove();
      else nativeHandles.push(h);
    });
    void Keyboard.addListener('keyboardDidShow', onKeyboardShow).then((h) => {
      if (cancelled) void h.remove();
      else nativeHandles.push(h);
    });
    void Keyboard.addListener('keyboardWillHide', onKeyboardHide).then((h) => {
      if (cancelled) void h.remove();
      else nativeHandles.push(h);
    });
    void Keyboard.addListener('keyboardDidHide', onKeyboardHide).then((h) => {
      if (cancelled) void h.remove();
      else nativeHandles.push(h);
    });

    return () => {
      cancelled = true;
      for (const h of nativeHandles) void h.remove();
      nativeHandles = [];
      void setNativeScrollDisabled(false);
      publish(0);
      started = false;
    };
  }

  const unbindWeb = bindWebVisualViewport();
  return () => {
    unbindWeb();
    publish(0);
    started = false;
  };
}

export function getKeyboardInset(): number {
  return heightPx;
}

export function subscribeKeyboardInset(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
