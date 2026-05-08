module.exports = (err, req, res, next) => {
  require('fs').appendFileSync('error.log', err.stack + '\n');
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
};
