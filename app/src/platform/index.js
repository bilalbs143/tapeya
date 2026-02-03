/**
 * Platform utilities for Capacitor native features
 * Use these to detect and handle iOS, Android, and Web differences
 */

import { Capacitor } from '@capacitor/core';

/** @returns {'ios' | 'android' | 'web'} */
export const getPlatform = () => {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform();
  }
  return 'web';
};

export const isNative = () => Capacitor.isNativePlatform();
export const isIOS = () => getPlatform() === 'ios';
export const isAndroid = () => getPlatform() === 'android';
export const isWeb = () => getPlatform() === 'web';

/**
 * Run callback only on native (iOS/Android)
 * @param {() => void | Promise<void>} fn
 */
export const onNative = (fn) => {
  if (isNative()) fn();
};

/**
 * Run callback only on web
 * @param {() => void | Promise<void>} fn
 */
export const onWeb = (fn) => {
  if (isWeb()) fn();
};
