import React, { useState, useRef, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Cookies from "universal-cookie";
import Chat from "./components/Chat";
import { auth, db } from "./firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function App() {
  const cookies = new Cookies();
  const [isAuth, setIsAuth] = useState(cookies.get("auth_user") || null);
  const [rooms, setRooms] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [newMessage, setNewMessage] = React.useState("");
  const roomInputRef = useRef(null);

  const handleCreateRoom = () => {
    setRooms(roomInputRef.current.value);
  };

  useEffect(() => {
    const roomRef = collection(db, "messages");
    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        const rooms = snapshot.docs.map((doc) => doc.data().room);
        console.log("Rooms:", rooms);
        setRoomList((roomList) => {
          // filter to only include unique room names
          const uniqueRooms = Array.from(new Set([...roomList, ...rooms]));
          return uniqueRooms;
        });
      },
      (error) => {
        console.error("Error getting rooms:", error);
      }
    );
    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage === "") return;
    try {
      if (!auth.currentUser) {
        console.error("User not authenticated");
        return;
      }
      await addDoc(collection(db, "messages"), {
        message: newMessage,
        createdAt: serverTimestamp(),
        user: auth.currentUser.displayName,
        userImage: auth.currentUser.photoURL,
        email: auth.currentUser.email,
        room: rooms,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  if (!isAuth) {
    return (
      <div className="App bg-slate-200 w-screen over h-screen bg-gradient-to-r from-indigo-200 via-purple-700 to-red-500">
        <LoginPage setIsAuth={setIsAuth} />
      </div>
    );
  } else {
    return (
      <div className="App bg-slate-200 w-screen over h-screen bg-gradient-to-r from-indigo-200 via-purple-700 to-red-500">
        {!isAuth ? (
          <LoginPage setIsAuth={setIsAuth} />
        ) : (
          <div className=" bg-slate-600 ">
            {rooms ? (
              <div>
                <Chat
                  setIsAuth={setIsAuth}
                  handleSubmit={handleSubmit}
                  setRooms={setRooms}
                  rooms={rooms}
                />
              </div>
            ) : (
              <div className="relative min-h-screen bg-gradient-to-r from-indigo-700 via-purple-500 to-red-500">
                <div className="mb-20 p-4">
                  <h2 className="text-center text-white text-3xl font-semibold py-8 underline">
                    Open Chat Rooms
                  </h2>
                  <p className="text-white text-center">
                    To join a chat room, click on the room name. To create a new
                    room, enter a name in the input field below and click the
                    "Create" button.
                  </p>
                  {roomList.map((room, index) => (
                    <div
                      className="bg-gray-800 rounded-lg my-4 px-4 h-14 py-4 hover:bg-gray-700 cursor-pointer"
                      key={index}
                      onClick={() => setRooms(room)}
                    >
                      <p className="text-white">
                        Chat Room:
                        <span className="font-bold">{room}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="fixed bottom-0 w-full bg-gray-900">
                  <div className="container mx-auto py-4">
                    <h1 className="text-center text-4xl font-bold mb-4 text-white">
                      Create New Room?
                    </h1>
                    <p className="text-center text-lg font-semibold mb-8 underline text-white">
                      Welcome! This is the best place to find new people &amp;
                      make new friendships!
                    </p>
                    <div className="flex items-center ">
                      <button
                        className="px-4 py-2 mr-2 bg-gray-700 rounded-lg text-white hover:bg-gray-800"
                        onClick={() => setIsAuth(null)}
                      >
                        Logout
                      </button>
                      <input
                        type="text"
                        ref={roomInputRef}
                        placeholder="Room Name"
                        className="rounded-lg px-4 py-2 mr-2 w-full "
                      />
                      <button
                        onClick={handleCreateRoom}
                        className="bg-gray-700 rounded-lg hover:bg-gray-800 text-white py-2 px-4"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
    return (
      <div className=" bg-slate-600 ">
        {rooms ? (
          <div>
            <Chat
              setIsAuth={setIsAuth}
              handleSubmit={handleSubmit}
              setRooms={setRooms}
              rooms={rooms}
            />
          </div>
        ) : (
          <div className="relative min-h-screen bg-gradient-to-r from-indigo-700 via-purple-500 to-red-500">
            <div className="mb-20 p-4">
              <h2 className="text-center text-white text-3xl font-semibold py-8 underline">
                Open Chat Rooms
              </h2>
              <p className="text-white text-center">
                To join a chat room, click on the room name. To create a new
                room, enter a name in the input field below and click the
                "Create" button.
              </p>
              {roomList.map((room, index) => (
                <div
                  className="bg-gray-800 rounded-lg my-4 px-4 h-14 py-4 hover:bg-gray-700 cursor-pointer"
                  key={index}
                  onClick={() => setRooms(room)}
                >
                  <p className="text-white">
                    Chat Room:
                    <span className="font-bold">{room}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="fixed bottom-0 w-full bg-gray-900">
              <div className="container mx-auto py-4">
                <h1 className="text-center text-4xl font-bold mb-4 text-white">
                  Create New Room?
                </h1>
                <p className="text-center text-lg font-semibold mb-8 underline text-white">
                  Welcome! This is the best place to find new people &amp; make
                  new friendships!
                </p>

                <div className="flex items-center ">
                  <button
                    className="px-4 py-2 mr-2 bg-gray-700 rounded-lg text-white hover:bg-gray-800"
                    onClick={() => setIsAuth(null)}
                  >
                    Logout
                  </button>
                  <input
                    type="text"
                    ref={roomInputRef}
                    placeholder="Room Name"
                    className="rounded-lg px-4 py-2 mr-2 w-full "
                  />
                  <button
                    onClick={handleCreateRoom}
                    className="bg-gray-700 rounded-lg hover:bg-gray-800 text-white py-2 px-4"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
