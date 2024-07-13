const express = require('express'); // Import the Express.js framework to create and manage the server
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies in JSON format.
const { getAIResponse } = require('./chatbot'); // Import the getAIResponse function from the chatbot.js file
const dotenv = require('dotenv'); // Import the dotenv package to load environment variables from a .env file.
dotenv.config();

const app = express();
const port = process.env.PORT || 5000; // Curently there is no PORT environment variable.

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    // Get the AI response
    const botReply = await getAIResponse(userMessage);
    res.json({ reply: botReply });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
