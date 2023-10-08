const express = require('express');
const bodyParser = require('body-parser');
const creatorRoutes = require('./routes/creatorRotes');
const studentRoutes = require('./routes/studentRoute');
const courseRoutes = require('./routes/courseRoutes');
const curriculumRoutes = require('./routes/curriculumRoutes')
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Add CORS to request api's to your frontend
require('dotenv').config();


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS if needed for your frontend

// Include creator routes
app.use('/api', creatorRoutes);

// Include student routes
app.use('/api', studentRoutes);

// Include courses routes
app.use('/api', courseRoutes);

// Include courriculum routes
app.use('/api', curriculumRoutes);

// Initialize socket.io on your Express app
app.io = io;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
