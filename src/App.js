import logo from './logo.svg';
import './App.css';
import React from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';


let stompClient;

const App = () => {
  const [msg, setMsg] = React.useState([]);
  const [typedMessage, setTypedMessage] = React.useState("");

  React.useEffect(() => {
    connect();
    return () => {
      disconnect();
    }
  }, []);

  const connect = () => {
    // const socket = new SockJS('http://localhost:8080/ws');
    const socket = new SockJS('http://15.165.144.39:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    stompClient.subscribe('/topic/room', onMessageReceived);
  };

  const onError = (err) => {
    console.log(err);
  };

  const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    setMsg((prevMsgs) => [...prevMsgs, message]);
  };

  const disconnect = () => {
    if (stompClient) {
      stompClient.deactivate();
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();

    const messageContent = typedMessage.trim();
    
    if(messageContent && stompClient && stompClient.connected) {
      const chatMessage = {
        roomId: "room1", // Set this to the ID of the room the user is in
        sender: "user1", // Set this to the username of the user
        content: typedMessage
      };

      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify(chatMessage)
      });

      setTypedMessage("");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <ul>
          {msg.map((message, i) => 
            <li key={i}>
              {message.sender}: {message.content}
            </li>
          )}
        </ul>
        <form onSubmit={sendMessage}>
          <input type="text" value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} />
          <button type="submit">전송</button>
        </form>
      </header>
    </div>
  );
};

export default App;