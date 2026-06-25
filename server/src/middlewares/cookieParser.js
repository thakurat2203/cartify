// Convert the browser's Cookie header into req.cookies without exposing tokens
// to frontend JavaScript. Cookie values are URL-decoded when possible.
const cookieParser = (req, res, next) => {
  req.cookies = {};

  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    next();
    return;
  }

  for (const cookie of cookieHeader.split(";")) {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookie.slice(0, separatorIndex).trim();
    const rawValue = cookie.slice(separatorIndex + 1).trim();

    if (!name) {
      continue;
    }

    try {
      req.cookies[name] = decodeURIComponent(rawValue);
    } catch {
      req.cookies[name] = rawValue;
    }
  }

  next();
};

module.exports = cookieParser;
