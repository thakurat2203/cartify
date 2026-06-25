const config = require("../config");

const isProduction = config.nodeEnv === "production";

const sharedCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const getAccessCookieOptions = () => ({
  ...sharedCookieOptions,
  path: "/",
  maxAge: config.accessTokenMaxAgeMs,
});

const getRefreshCookieOptions = () => ({
  ...sharedCookieOptions,
  path: "/api/auth",
  maxAge: config.refreshSessionMaxAgeMs,
});

const removeMaxAge = (options) => {
  const { maxAge, ...clearOptions } = options;
  return clearOptions;
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(
    config.accessCookieName,
    accessToken,
    getAccessCookieOptions(),
  );

  res.cookie(
    config.refreshCookieName,
    refreshToken,
    getRefreshCookieOptions(),
  );
};

const clearAuthCookies = (res) => {
  res.clearCookie(
    config.accessCookieName,
    removeMaxAge(getAccessCookieOptions()),
  );

  res.clearCookie(
    config.refreshCookieName,
    removeMaxAge(getRefreshCookieOptions()),
  );
};

module.exports = {
  setAuthCookies,
  clearAuthCookies,
  getAccessCookieOptions,
  getRefreshCookieOptions,
};