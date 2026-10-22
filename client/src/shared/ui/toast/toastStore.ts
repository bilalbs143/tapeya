type ToastTone = 'success' | 'error' | 'info' | 'neutral';

export type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

export type ToastEntry = ToastInput & {
  id: string;
  tone: ToastTone;
};

let stack: ToastEntry[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

/** Imperative toasts outside React — `ToastHost` is the sole subscriber. */
export const toastStore = {
  getSnapshot: (): readonly ToastEntry[] => stack,

  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  push(input: ToastInput): string {
    const id = crypto.randomUUID();
    stack = [
      ...stack,
      {
        id,
        title: input.title,
        tone: input.tone ?? 'neutral',
        ...(input.description ? { description: input.description } : {}),
      },
    ];
    emit();
    return id;
  },

  dismiss(id: string): void {
    stack = stack.filter((entry) => entry.id !== id);
    emit();
  },

  clear(): void {
    stack = [];
    emit();
  },
};

export function toast(input: ToastInput): string {
  return toastStore.push(input);
}
