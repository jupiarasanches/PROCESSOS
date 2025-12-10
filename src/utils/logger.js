export const apiLogger = (...args) => {
  try {
    console.debug('[api]', ...args);
  } catch (_) {}
};

export const uiLogger = (...args) => {
  try {
    console.debug('[ui]', ...args);
  } catch (_) {}
};

export { apiLogger, uiLogger };
