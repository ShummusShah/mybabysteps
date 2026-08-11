import type { ImperativeRouter } from 'expo-router';

/**
 * router.back() is a no-op when the screen has no back-history (e.g. reached
 * via a deep link, or as the restored root after an app relaunch). Falls
 * back to replacing with a known-good route instead of doing nothing.
 */
export function safeBack(router: ImperativeRouter, fallback: string) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as Parameters<ImperativeRouter['replace']>[0]);
  }
}
