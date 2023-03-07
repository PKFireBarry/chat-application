import './App.css';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection} from "react-firebase-hooks/firestore"
import { useEffect, useState } from "react"

function App() {
  const [message, setMessage] = useState('');
  const [chatRooms, setChatRooms] = useState([]);
  const [currentChatRoom, setCurrentChatRoom] = useState(null);
  const [newChatRoomName, setNewChatRoomName] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'chat_rooms'), orderBy('time'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatRooms = [];
      querySnapshot.forEach((doc) => {
        chatRooms.push({ id: doc.id, ...doc.data() });
      });
      setChatRooms(chatRooms);
    });
    return unsubscribe;
  }, []);

  const createChatRoom = async () => {
    const docRef = await addDoc(collection(db, 'chat_rooms'), {
      name: newChatRoomName,
      messages: [],
      time: serverTimestamp(),
    });
    setCurrentChatRoom({ id: docRef.id, name: newChatRoomName });
    setNewChatRoomName('');
  }

  const deleteChatRoom = async (chatRoom) => {
    if (chatRoom.id === currentChatRoom?.id) {
      setCurrentChatRoom(null);
    }
    await deleteDoc(doc(db, 'chat_rooms', chatRoom.id));
  }

  const addMessage = async () => {
    if (currentChatRoom) {
      await updateDoc(doc(db, 'chat_rooms', currentChatRoom.id), {
        messages: [...currentChatRoom.messages, message],
      });
      setMessage('');
    }
  }

  const deleteMessage = async (messageIndex) => {
    if (currentChatRoom) {
      const messages = [...currentChatRoom.messages];
      messages.splice(messageIndex, 1);
      await updateDoc(doc(db, 'chat_rooms', currentChatRoom.id), {
        messages: messages,
      });
    }
  }



  //show all messages in current chat room

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>Chat Rooms</h1>
          <ul>
            {chatRooms.map((chatRoom) => (
              <li key={chatRoom.id}>
                <button onClick={() => setCurrentChatRoom(chatRoom)}>
                  {chatRoom.name || `Chat Room ${chatRoom.id}`}
                </button>
                <button onClick={() => deleteChatRoom(chatRoom)}>Delete</button>
              </li>
            ))}
          </ul>
          <div>
            <input type="text" value={newChatRoomName} onChange={(e) => setNewChatRoomName(e.target.value)} />
            <button onClick={createChatRoom}>Create Chat Room</button>
          </div>
        </div>
        {currentChatRoom && (
          <div>
            <h1>{currentChatRoom.name || `Chat Room ${currentChatRoom.id}`}</h1>
            <ul>
              {currentChatRoom?.messages.map((message, index) => (
                <li key={index}>
                  <button onClick={() => deleteMessage(index)}>Delete</button>
                  {message}
                </li>
              ))}
            </ul>
            <div>
              <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
              <button onClick={addMessage}>Send</button>
            </div>
          </div>
        )}
        {currentChatRoom && (
          <div>
            <h2>All Messages in {currentChatRoom.name || `Chat Room ${currentChatRoom.id}`}</h2>
            <ul>
              {currentChatRoom.messages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
  

}

export default App;
