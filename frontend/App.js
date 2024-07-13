import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import sendIcon  from './logos/icons8-send-48.png';

const App = () => {

  const [selectedService, setSelectedService] = useState(''); // SelectedService is the name of the service selected by the user via the menu.
  const [prompt, setPrompt] = useState(false); // Prompt is a flag to check if the user has made a prompt.
  const [messages, setMessages] = useState([]); // messages is a list of message objects: {message content: user input, sender: 'user' or 'bot'}
  const [userInput, setUserInput] = useState('');
  const [showMenu, setShowMenu] = useState(true); // State variable to control the visibility of the menu.
  const chatboxRef = useRef(null); // Auto scroll down.

  // Menu of selectable services
  const [menuItems, setItems] = useState([
    { id: 1, name: 'Internet Services'},
    { id: 2, name: 'Jawal Tawjihi'},
    { id: 3, name: 'Our Campaigns' },
    { id: 4, name: 'Service' },
    { id: 5, name: 'Service Service' }
  ]);

  // Function to send aa selected service from the menu to the backend.
  const sendService = async (service) => {
    setUserInput(''); // Clear user input {no latency}
    addMessage(service, 'user');

    // Send message to backend
    try {
      const response = await axios.post('/api/chat', { message: service });
      addMessage(response.data.reply, 'bot');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  // Function to send message from input field to the backend.
  const sendMessage = async () => {
    let uInput = userInput;
    setUserInput(''); // Clear user input {no latency}.

    // Handel empty input.
    if (uInput.trim() === '') return;
    
    // Append message object to messages array.
    addMessage(uInput, 'user');

    // Send message to backend
    try {
      const response = await axios.post('/api/chat', { message: uInput });
      addMessage(response.data.reply, 'bot');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Function to append a message object to the messages array via calling setMessages to update the state of messages.
    const addMessage = (message, sender) => {
    setMessages(prevMessages => [...prevMessages, { text: message, sender }]);
    setPrompt(true);
  };

  // Allow the usage of enter key to send a message.
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // useEffect to monitor changes in selectedService and prompt
  useEffect(() => {
    // Hide menu if user has selected a service or the prompt is false
    if (selectedService !== '' || prompt) {
      setShowMenu(false);
      console.log('HideMenu');
    } else {
      console.log('Menu must appear');
    }
  }, [selectedService, prompt]);

  // Auto scroll down
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);


  return (
    <div className='app'>
      
      {/* Header */}
      <div className='header'>
            <h1>Whisky</h1>
      </div>


      {/* Chat Container */}
      <div className='chat-container'>
        <div className='chatbox' ref={chatboxRef}>
          <div className='message bot'>
                {'Hello, I am Whisky, your AI assistant. How can I help you?'}
          </div>
          {messages.map((msg, index) => (     // Render messages.
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}

          {/* Show menu only at the beginning before any user query */}
          {showMenu && (  // Using the state variable showMenu to control menu visability
          <div className='menu-container'>
            {menuItems.map(item => (
              <div key={item.id} className='menu-wrapper'>
                <button className='dynamic-menu-item' onClick={() =>{
                  setSelectedService(item.name);
                  sendService(item.name);
                }}>
                  {item.name}
                </button>
              </div>
            ))}
          </div>)}
        </div>

        <div className='input-container'>
          <textarea
            type='text'
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Type your message...'
          />
          <button id='send-button' onClick={sendMessage}><img className ='send-icon'  src={sendIcon} alt='send'/></button>
        </div>
      </div>
    </div>
    );
  };
  
  
  export default App;