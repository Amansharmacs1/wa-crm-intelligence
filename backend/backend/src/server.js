const dns = require('dns');
// Fix for Node 18+ IPv6 DNS resolution issues with MongoDB SRV records MUST BE AT THE VERY TOP
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./services/mongodb.service');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
