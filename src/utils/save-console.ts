export const everything: any[] = [];

export function saveConsole() {
  if (typeof console === "undefined") return;

  const defaultLog = console.log.bind(console);
  const defaultError = console.error.bind(console);
  const defaultWarn = console.warn.bind(console);
  const defaultDebug = console.debug.bind(console);

  console.log = function () {
    everything.push({ color: "", value: arguments });
    defaultLog.apply(console, arguments as any);
  };
  console.debug = function () {
    everything.push({ color: "#0ea5e9", value: arguments });
    defaultDebug.apply(console, arguments as any);
  };
  console.warn = function () {
    everything.push({ color: "#f97316", value: arguments });
    defaultWarn.apply(console, arguments as any);
  };
  console.error = function () {
    everything.push({ color: "#ef4444", value: arguments });
    defaultError.apply(console, arguments as any);
  };
}
