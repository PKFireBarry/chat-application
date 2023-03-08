import React from 'react'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore'

import { auth } from '../firebase'
import { signOut } from 'firebase/auth';
import Cookies from 'universal-cookie';

function Chat(props) {
    const { rooms, setIsAuth, setRooms } = props;
    const cookies = new Cookies();
  
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');
  
    const messagesRef = collection(db, 'messages');
  
    React.useEffect(() => {
      const queryMessages = query(messagesRef, where('room', '==', rooms), orderBy('createdAt'));
  
      const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setMessages(messages);
      });
  
      return unsubscribe;
    }, [messagesRef, rooms]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (newMessage === '') return;
      try {
        if (!auth.currentUser) {
          console.error('User not authenticated');
          return;
        }
        await addDoc(collection(db, 'messages'), {
          message: newMessage,
          createdAt: serverTimestamp(),
          user: auth.currentUser.displayName,
          userImage: auth.currentUser.photoURL,
          room: rooms,
        });
        setNewMessage('');
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    };
  
    const signOutUser = async () => {
      try {
        await signOut(auth);
        cookies.remove('auth_user');
        setIsAuth(false);
        setRooms(null);
      } catch (error) {
        console.log(error);
      }
    };
  


    return (
        
        <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-900 to-purple-700">
          <h1 className="text-4xl text-white mb-8 font-bold">{rooms.toUpperCase()}</h1>
          <div className="flex flex-col w-1/2 h-96 bg-white rounded-lg overflow-y-scroll">
            {messages.map(({ id, message, user, userImage, createdAt }) => (
              <div key={id} className="flex items-center p-4 border-b-2 border-gray-100">
                <p>
                  <img className="w-10 h-10 rounded-full mr-4" src={userImage} alt="" />
                  {user}
                  {new Date(createdAt?.seconds * 1000).toLocaleString()}
                </p>
                <p className="ml-4">{message}</p>
              </div>
            ))}
          </div>
          <form className="flex w-1/2" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-full py-3 px-4 mr-4 bg-gray-100 focus:outline-none"
              onChange={(e) => setNewMessage(e.target.value)}
              type="text"
              value={newMessage}
              placeholder="Enter your message"
            />
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 px-6 focus:outline-none"
              type="submit"
            >
              Send
            </button>
          </form>
          <div>
            <button onClick={signOutUser}>Logout</button>
          </div>
        </div>
      );
    }
    
    export default Chat;
