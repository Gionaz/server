import errors from "./errors";
const Sentry = require("@sentry/node");
Sentry.init({
  dsn: process.env.dsn,
});
export const sendTosentry = (name: string, error: any) => {
  const message = (errors as any)[name] + ": " + error;
  Sentry.captureException(message);
};
