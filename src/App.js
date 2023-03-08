import React, { useState, useRef, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Cookies from "universal-cookie";
import Chat from "./components/Chat";
import { auth, db } from './firebase'
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';

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
      setRoomList(roomList => {
        // filter to only include unique room names
        const uniqueRooms = Array.from(new Set([...roomList, ...rooms]));
        return uniqueRooms;
      });
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
<div className="App bg-slate-600 ">
  <div className="flex justify-between items-center px-4 py-2 bg-gray-900 text-white">
    <h1 className="text-2xl font-bold">    <button className="px-4 py-2 rounded-lg hover:bg-gray-800">
      <a href="/" className="text-white  font-medium">Chat App</a>
    </button></h1>

      <div>
    <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-800" onClick={() => setIsAuth(null)}>Logout</button>
  </div>
  </div>

  {rooms ? (
    <h1><Chat setIsAuth={setIsAuth} setRooms={setRooms} rooms={rooms}/></h1>
  ) : (

<div className="relative min-h-screen">
  <div className="mb-20 p-4">
    <h2 className="text-center text-white text-3xl font-semibold py-8">Open Chat Rooms</h2>
    {roomList.map((room, index) => (
      <div className="bg-gray-800 rounded-lg my-4 px-4 h-14 py-4 hover:bg-gray-700 cursor-pointer" key={index} onClick={() => setRooms(room)}>
        <p className="text-white">Chat Room: <span className="font-bold">{room}</span> </p>
      </div>
    ))}
  </div>
  <div className="fixed bottom-0 w-full bg-gray-900">
    <div className="container mx-auto py-4">
      <h1 className="text-center text-4xl font-bold mb-4 text-white">Create New Room?</h1>
      <p className="text-center text-lg font-semibold mb-8 text-white">Welcome! This is the best place to find new people &amp; make new friendships!</p>
      <div className="flex items-center">
        <input type="text" ref={roomInputRef} placeholder="Room Name" className="rounded-lg px-4 py-2 mr-2 w-full " />
        <button onClick={handleCreateRoom} className="bg-gray-700 rounded-lg hover:bg-gray-800 text-white py-2 px-4">Create</button>
      </div>
    </div>
  </div>
</div>

  )}

</div>


    );
    
  }
}
