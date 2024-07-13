const express = require('express'); // Import the Express.js framework to create and manage the server
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies in JSON format.
const { getAIResponse } = require('./chatbot');
const dotenv = require('dotenv');
dotenv.config();

// Creeate express application
const app = express();
const port = process.env.PORT || 5000;


app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    const botReply = await getAIResponse(userMessage);
    res.json({ reply: botReply });
});                                   

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
