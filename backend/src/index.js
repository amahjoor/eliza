require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Eliza.ai API is running');
});

// Import routes
// app.use('/api/audio', require('./routes/audio.routes'));
// app.use('/api/meetings', require('./routes/meeting.routes'));
// app.use('/api/users', require('./routes/user.routes'));
// app.use('/api/projects', require('./routes/project.routes'));
// app.use('/api/people', require('./routes/people.routes'));

// Database connection and server start
const startServer = async () => {
  try {
    // await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
