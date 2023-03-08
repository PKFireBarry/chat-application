import React from 'react'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'

import { auth } from '../firebase'
import { signOut } from 'firebase/auth';
import Cookies from 'universal-cookie';

function Chat(props) {
    const { rooms, setIsAuth, setRooms } = props;
    const cookies = new Cookies();
  
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [editMessage, setEditMessage] = React.useState(null);
  
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
  
    const handleEdit = async (messageId) => {
      if (editMessage !== null) return;
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;
      setEditMessage(message);
    };
  
    const handleUpdate = async (e) => {
      e.preventDefault();
      if (editMessage === null) return;
      try {
        await updateDoc(doc(db, 'messages', editMessage.id), {
          message: newMessage,
          createdAt: serverTimestamp(),
        });
        setEditMessage(null);
        setNewMessage('');
      } catch (error) {
        console.error('Error updating document: ', error);
      }
    };
  
    const handleDelete = async (messageId) => {
        try {
          const message = messages.find((m) => m.id === messageId);
          if (!message) return;
          if (auth.currentUser.displayName !== message.user) {
            console.error('User not authorized to delete this message');
            return;
          }
          await deleteDoc(doc(db, 'messages', messageId));
        } catch (error) {
          console.error('Error deleting document: ', error);
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
<div className=" flex flex-col bg-slate-600 p-8 justify-center items-center ">
  <h1 className="text-4xl text-white  mb-8 font-bold">Room: {rooms.toUpperCase()} </h1>
  <div className="flex flex-col w-full h-screen flex-grow bg-white sticky rounded-lg overflow-y-hidden">
  {messages.map(({ id, message, user, userImage, createdAt }) => (
    <div key={id} className="flex flex-col p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img className="w-12 h-12 rounded-full  mr-4" src={userImage} alt="" />
          <div>
            <p className="font-medium">{user}</p>
            <p className="text-sm text-gray-500">{new Date(createdAt?.seconds * 1000).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center">
          <button onClick={
            () => handleEdit(id)
          } className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-full mr-2 focus:outline-none">
            Edit
          </button>
          <button onClick={
            () => handleDelete(id)
          } className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full focus:outline-none">
            Delete
          </button>
        </div>
      </div>
      <p className="ml-16">{message}</p>
    </div>
  ))}
</div>

  <form className="flex-shrink-0 w-1/2 bottom-0 fixed flex items-end" onSubmit={handleSubmit}>
    <input
      className="w-full rounded-full py-3 px-4 mr-4 bg-gray-100 focus:outline-none"
      onChange={(e) => setNewMessage(e.target.value)}
      type="text"
      value={newMessage}
      placeholder="Enter your message"
    />
    <button
      className="bg-blue-600 hover:bg-sky-500 text-white rounded-full py-3 px-6 focus:outline-none"
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
