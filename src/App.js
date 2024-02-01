import './App.css';
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';

let stompClient;

const App = () => {
  const [msg, setMsg] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [chatRooms, setChatRooms] = useState([]);

  const [currentRoom, setCurrentRoom] = useState(null); // 현재 선택된 채팅방
  const [subscription, setSubscription] = useState(null); // 구독 상태를 저장

  useEffect(() => {
    connect();
    fetchChatRooms();
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
    // 연결이 성립되었을 때만 구독을 시작
    if (currentRoom) {
      setSubscription(stompClient.subscribe(`/topic/room/${currentRoom}`, onMessageReceived));
    }
  };


  const onError = (err) => {
    console.log(err);
  };

  const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    console.log(message); 
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
    if(messageContent && stompClient && stompClient.connected && currentRoom) {
      const chatMessage = {
        roomId: currentRoom, // 현재 선택된 채팅방 아이디를 사용
        sender: "user1", 
        content: typedMessage
      };

      stompClient.publish({
        destination: `/app/chat/${currentRoom}`,
        body: JSON.stringify(chatMessage)
      });

      setTypedMessage("");
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();

    const roomData = {
      name: roomName,
      type: roomType
    };

    try {
      // await axios.post('http://localhost:8080/chatrooms', roomData);
      await axios.post('http://15.165.144.39:8080/chatrooms', roomData);
      fetchChatRooms(); // 채팅방 생성 후 목록 재조회
      alert('채팅방이 생성되었습니다.');
    } catch (error) {
      console.error(error);
    }
  };

  const fetchChatRooms = async () => {
    try {
      // const response = await axios.get('http://localhost:8080/chatrooms');
      const response = await axios.get('http://15.165.144.39:8080/chatrooms');
      console.log(response); 
      setChatRooms(response.data.content);
    } catch (error) {
      console.error(error);
    }
  };


  const selectChatRoom = (roomId) => {
    setCurrentRoom(roomId); // 현재 선택된 채팅방을 설정
    setMsg([]); // 메시지 목록을 초기화
    // 채팅방을 바꿀 때마다 구독을 해지하고 다시 구독
    if (subscription) {
      subscription.unsubscribe();
    }
    setSubscription(stompClient.subscribe(`/topic/room.${roomId}`, onMessageReceived)); // 구독 상태를 업데이트합니다.
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {chatRooms.map((room) => (
              <p key={room.chatRoomId} onClick={() => selectChatRoom(room.chatRoomId)}>
                {room.name} ({room.type})
              </p>
            ))}
        </div>
        <ul>
          {msg.map((message, i) => 
            <li key={i}>
              {message.sender}: {message.content}
            </li>
          )}
        </ul>
        <form onSubmit={createRoom}>
          <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="채팅방 이름" />
          <input type="text" value={roomType} onChange={(e) => setRoomType(e.target.value)} placeholder="채팅방 타입" />
          <button type="submit">채팅방 생성</button>
        </form>
        <form onSubmit={sendMessage}>
          <input type="text" value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} />
          <button type="submit">전송</button>
        </form>
      </header>
    </div>
  );
};


export default App;



