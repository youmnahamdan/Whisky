import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import sendIcon  from './logos/icons8-sent-64.png';  
import logo from './logos/whisky.png'; 
//import sendIcon  from './logos/icons8-slide-up-64.png'; 

// TODO: add a waiting for response indication.
/*
logic:
if the user send a message we can check or use useeffect for checking if we have a newreponse
then we display this messaenger like waiting sign
*/


//TODO
/*
                  // check if item id is 3 [ask for place of residance]                             >>>>>>>
                // display bot message and show menu items for selection                             >>>>>>>
Send service function:
if item id is 3
  append bot message to ask for place of residence [shouldn't this be done in the back end?]
  display POR menu

if item.id is 5
  ask if they would like to pay via reflect or jawal pay
  [maybe make a mini doc to let the bot ask for it self]
if any other service then just send service to backend


*/


const App = () => {

  const [selectedService, setSelectedService] = useState(''); // SelectedService is the name of the service selected by the user via the menu.
  const [prompt, setPrompt] = useState(false); // Prompt is a flag to check if the user has made a prompt.
  const [messages, setMessages] = useState([]); // messages is a list of message objects: {message content: user input, sender: 'user' or 'bot'}
  const [userInput, setUserInput] = useState('');
  const [showMenu, setShowMenu] = useState(true); // State variable to control the visibility of the menu.
  const [showPOR, setShowPOR] = useState(false);
  const chatboxRef = useRef(null); // Auto scroll down.

  // Menu of selectable services
  const [menuItems, setItems] = useState([
    { id: 1, name: 'Internet Services'},
    { id: 2, name: 'Jawal Tawjihi'},
    { id: 3, name: 'Campaigns and Offers' },    // Depends on POR
    { id: 4, name: 'Giga Fiber' },
    { id: 5, name: 'Yallah Shabab' },  // Exclusive for west bank
    { id: 6, name: '3G' }
  ]);

  // POR "Place Of Residance" menu
  const [POR, setPOR] = useState([
    { id: 101, name: 'West Bank'},
    { id: 102, name: 'Gaza Strip'}
  ]);  

  //let messageContentRef.current = '';
  const messageContentRef = useRef('');

  // Function to send message from input field to the backend.
  const sendMessage = async () => {
    //messageContentRef.current = userInput;
    console.log(messageContentRef.current);
    // Handel empty input.
    if (messageContentRef.current.trim() === '') return;
    
    // Append message object to messages array.
    addMessage(messageContentRef.current, 'user');
    addMessage('...', 'bot');
    // Send message to backend
    try {
      const response = await axios.post('/api/chat', { message: messageContentRef.current });
      removeMessage('...');
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

  // Function to remove a message from the state variable 'messages'
  const removeMessage = (message) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg.text !== message));
  };




  const sendButtonClick = () => {
    messageContentRef.current = userInput;
    setUserInput(''); // Clear user input {no latency}
    setShowPOR(false);
    sendMessage();
  }


  // Allow the usage of enter key to send a message.
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendButtonClick();
    }
  };




  // useEffect to monitor changes in selectedService and prompt
  useEffect(() => {
    // Hide menu if user has selected a service or the prompt is false
    if (selectedService !== '' || prompt || selectedService.id === 3) {
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
            <h1>Whisky <span>at you service...</span></h1>
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
                  messageContentRef.current = item.name;
                  console.log("messageContentRef.current: ",messageContentRef.current);

                  if(item.id === 3) // User chose campaigns and offers and must prompt place of residance
                      setShowPOR(true);
                  else
                    sendMessage();
                }}>
                  {item.name}
                </button>
              </div>
            ))}
          </div>)}

          {showPOR && (  // Using the state variable showPOR to control menu visability
          <div className='menu-container'>
            {POR.map(place => (
              <div key={place.id} className='menu-wrapper'>
                <button className='dynamic-menu-item' onClick={() =>{
                  setSelectedService(place.name);
                  messageContentRef.current += ' in '+place.name;
                  //const newmessageContent = messageContentRef.current.concat(' in ' + place.name);
                  console.log("messageContentRef.current: ",messageContentRef.current);
                  sendMessage();
                  setShowPOR(false);
                  
                }}>
                  {place.name}
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
          <button id='send-button' className='send-button' onClick={sendButtonClick}><img className ='send-icon'  src={sendIcon} alt='send'/></button>
        </div>
      </div>
    </div>
    );
  };
  
  
  export default App;