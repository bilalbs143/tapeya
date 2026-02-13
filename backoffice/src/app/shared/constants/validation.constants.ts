/**
 * Shared validation patterns for forms (e.g. Validators.pattern).
 */

/** Phone: required, must start with + and country code (e.g. +44...). E.164-style. */
export const PHONE_PATTERN = /^\+[1-9]\d{6,}$/;
