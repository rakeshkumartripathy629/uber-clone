const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db'); // Database connection

const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');

const { initializeSocket } = require('./socket'); // Import the socket initialization

const app = express();
const port = process.env.PORT || 3000;

// Connect to the database
connectToDb();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cookieParser()); // Parse cookies

// Routes
app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
