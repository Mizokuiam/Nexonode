// Example code for the code generation demo
const express = require('express');
const app = express();

// AI is suggesting a route handler
app.get('/api/users', async (req, res) => {
    try {
        // AI suggests database query
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// AI suggests error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});
