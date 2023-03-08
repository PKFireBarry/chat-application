import React from 'react'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore'

import { auth } from '../firebase'
import { signOut } from 'firebase/auth';
import Cookies from 'universal-cookie';
import Header from './Header';
import Input from './Input';

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
          email: auth.currentUser.email,
          room: rooms,
        });
        setNewMessage('');
      } catch (error) {
        console.error('Error adding document: ', error);
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
        <>
<div className=" flex flex-col bg-slate-600 h-screen justify-center items-center bg-gradient-to-r from-indigo-500 via-purple-500 to-red-500">
    <Header setIsAuth={setIsAuth} />
  <h1 className="text-4xl text-white  m-4 font-bold">Room: {rooms.toLowerCase()} </h1>
  <div className="flex flex-col w-3/4 flex-grow bg-gradient-to-r from-indigo-600 to-slate-900 border-4 border-white rounded-lg">
  {messages.map(({ id, message, user, userImage, createdAt }) => (
    <div key={id} className="flex flex-col p-4 pb-2 text-white rounded">
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
            () => handleDelete(id)
          } className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full focus:outline-none">
            Delete
          </button>
        </div>
      </div>
      <p className="ml-16 text-md">{message}</p>
    </div>
  ))}
  
</div>


  <Input handleSubmit={handleSubmit} newMessage={newMessage} setNewMessage={setNewMessage}/>
</div>
</>
      );
        
    }
    export default Chat;
