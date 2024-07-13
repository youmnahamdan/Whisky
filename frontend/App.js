import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
//import jlogo  from './logos/Whisky.png';
import sendIcon  from './logos/icons8-send-48.png';
//import sendIcon  from './logos/send.png';

const App = () => {

  // SelectedService is the name of the service selected by the user
  const [selectedService, setSelectedService] = useState('');

  // Prompt is a flag to check if the user made a prompt
  const [prompt, setPrompt] = useState(false);

  // messages is a list of message objects: {message content: user input, sender: 'user' or 'bot'}
  const [messages, setMessages] = useState([]);

  // userInput is the user input
  const [userInput, setUserInput] = useState('');

  // State variable to control the visibility of the menu
  const [showMenu, setShowMenu] = useState(true);

  const chatboxRef = useRef(null);
  //const [processing, setProcessing] = useState(false); // New state for processing status

  // Menu of selectable services
  const [menuItems, setItems] = useState([
    { id: 1, name: 'Internet Services'},
    { id: 2, name: 'Jawal Tawjihi'},
    { id: 3, name: 'Our Campaigns' },
    { id: 4, name: 'Service' },
    { id: 5, name: 'Service Service' }
  ]);

  const sendService = async (service) => {
    setUserInput('');
    addMessage(service, 'user');
    // Send message to backend
    try {
      const response = await axios.post('/api/chat', { message: service });
      addMessage(response.data.reply, 'bot');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
  // Function to send message to the backend and get the AI response
  const sendMessage = async () => {
    console.log('input: ',userInput)
    let uInput = userInput;
    // Clear user input {no latency}
    setUserInput('');

    if (uInput.trim() === '') return;
    
    // Append message object to messages array
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

  // Allow the usage of enter key to send a message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  /*New Code */
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


  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);


  return (
    <div className='app'>


    {/* Header */}

      <div className='header'>
            {/*<img src={jlogo} alt='logo' />*/}
            <h1>Whisky</h1>
      </div>



    {/* Chat Container */}
      <div className='chat-container'>
        <div className='chatbox' ref={chatboxRef}>
        <div className='message bot'>
              {'Hello, I am Whisky, your AI assistant. How can I help you?'}
            </div>
          {messages.map((msg, index) => (
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
    



  /* 

  Previous Verfication Loop

  // Function to check if the service is yet to be selected
  const verificationLoop = () => {
    // Hide menu if user has selected a service, or the user prompted somthing
    if (selectedService != '' || prompt) {
      setShowMenu(false);
      console.log('HideMenu');
      // Stop the interval once the service is selected
    } else {
      clearInterval(checkInterval); 
      console.log('Menu must appear');
    }
  }

  // Set up the interval to check every second (500 milliseconds)
  const checkInterval = setInterval(verificationLoop, 200);
  
  */