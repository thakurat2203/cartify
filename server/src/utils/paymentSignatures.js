const crypto = require("crypto");

const SHA256_HEX_LENGTH = 64;

const createHmacSha256Signature = (payload, secret) => {
  if (!secret) {
    throw new Error("HMAC secret is required");
  }

  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

const isSha256HexDigest = (value) =>
  typeof value === "string" &&
  value.length === SHA256_HEX_LENGTH &&
  /^[a-f0-9]+$/i.test(value);

const timingSafeEqualHex = (expected, actual) => {
  if (!isSha256HexDigest(expected) || !isSha256HexDigest(actual)) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(actual, "hex"),
  );
};

const verifyHmacSha256Signature = ({ payload, signature, secret }) => {
  if (!payload || !signature || !secret) {
    return false;
  }

  const expected = createHmacSha256Signature(payload, secret);
  return timingSafeEqualHex(expected, signature.trim());
};

const verifyRazorpayCheckoutSignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  keySecret,
}) => {
  if (!razorpayOrderId || !razorpayPaymentId) {
    return false;
  }

  return verifyHmacSha256Signature({
    payload: `${razorpayOrderId}|${razorpayPaymentId}`,
    signature: razorpaySignature,
    secret: keySecret,
  });
};

module.exports = {
  createHmacSha256Signature,
  verifyHmacSha256Signature,
  verifyRazorpayCheckoutSignature,
};
