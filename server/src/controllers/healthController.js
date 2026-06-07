// Lightweight endpoint used to confirm that the API process is alive.
const healthCheck = (req, res) => {
  res.json({ status: "ok" });
};
module.exports = { healthCheck };
