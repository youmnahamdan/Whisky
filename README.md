# Whisky
Whisky is a chatbot designed to interact with users and provide helpful assistance regarding queries about services provided by Jawal. This is an initial version of Whisky. Currently, the goal is to receive input from the user or a selection from a menu of services and send it to a chat model built using LangChain.

## WARNING:
PLEASE DON'T ATTEMPT TO COMMIT CHANGES DIRECTLY TO MAIN BRANCH.

### Project Setup
PLEASE CHECK PROJECT SETUP.TXT FILE FOR SETUP INSTRUCTIONS.
Below, you'll find setup instructions if you are interested in running the code yourself. Initially, you must install Node.js and npm.

#### Frontend Setup
<li>run: npm init -y</li>
<li>run: <code>npm create-react-app frontend</code> or <code>npx create-react-app frontend</code> to install dependencies and initiate a directory.</li>

#### Backend Setup
<li>run: <code>npm init -y</code> to initiate npm</li>
<li>run: <code>npm install express dotenv</code></li>
<li>run: <code>npm i --save-dev nodemon</code></li>
<li>run: <code>npm i '@langchain/openai'</code></li>
<br>
<p>Feel free to ask if you need any further adjustments!</p>

### How to start chatting?
<ol>
  <li>Via the terminal, navigate to the backend folder using cd backend, then start the server by running node server.js. Now that our server is running at port 5000, we need to start our website.</li>
  <li>Open another terminal and navigate to the frontend folder using cd frontend, then simply run npm start. The website will run on port 3000 if nothing else is using the port.</li>  
</ol>
