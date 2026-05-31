// Handle 404 - Route not found
const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
};

module.exports = notFound;