import React, { useState, useRef, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Cookies from "universal-cookie";
import Chat from "./components/Chat";
import { auth, db } from './firebase'
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';

export default function App() {
  const cookies = new Cookies();
  const [isAuth, setIsAuth] = useState(cookies.get("auth_user") || null);
  const [rooms, setRooms] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const roomInputRef = useRef(null);

  const handleCreateRoom = () => {
    setRooms(roomInputRef.current.value);
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      cookies.remove("auth_user");
      setIsAuth(false);
      setRooms(null);
    } catch (error) {
      console.log(error);
    }
  };

  const getRooms = async () => {
    try {
      const roomRef = collection(db, 'messages');
      const roomSnapshot = await getDocs(roomRef);
      const roomSet = new Set();
      roomSnapshot.docs.forEach((doc) => {
        const roomName = doc.data().name;
        if (!roomSet.has(roomName)) {
          roomSet.add(roomName);
        }
      });
      const roomList = [...roomSet];
      console.log("Room list:", roomList);
      setRoomList(roomList);
    } catch (error) {
      console.error("Error getting rooms:", error);
    }
  };
  
  

  useEffect(() => {
    const roomRef = collection(db, 'messages');
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const rooms = snapshot.docs.map((doc) => doc.data().room);
      console.log("Rooms:", rooms);
      setRoomList(rooms);
    }, (error) => {
      console.error("Error getting rooms:", error);
    });
    return unsubscribe;
  }, []);

  if (!isAuth) {
    return (
      <div className="App bg-slate-200 w-screen h-screen">
        <LoginPage setIsAuth={setIsAuth} />
      </div>
    );
  } else {
    return (
      <div className="App bg-slate-200 w-screen h-screen">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-900 text-white">
          <h1 className="text-2xl font-bold">Chat App</h1>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-800">
            <a href="/" className="text-white font-medium">Home</a>
          </button>
        </div>
    
        {rooms ? (
          <h1><Chat setIsAuth={setIsAuth} setRooms={setRooms} rooms={rooms}/></h1>
        ) : (
          <div>
            <h1>Create Room</h1>
            <input type="text" ref={roomInputRef} placeholder="Room Name" />
            <button onClick={handleCreateRoom}>Create</button>
            <h2>Chat Rooms</h2>
            <ul>
              {roomList.map((room, index) => (
                <li key={index} onClick={() => setRooms(room)}>Room: {room} </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <button onClick={() => setIsAuth(null)}>Logout</button>
        </div>
      </div>
    );
    
  }
}
