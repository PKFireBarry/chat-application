import React from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { auth } from "../firebase";
import Header from "./Header";
import Input from "./Input";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HomeIcon,ArrowLeftOnRectangleIcon,UserGroupIcon } from '@heroicons/react/24/solid'

function Chat(props) {
  const { rooms, setIsAuth } = props;
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [hasNewMessage, setHasNewMessage] = React.useState(false);
  const [lastMessageId, setLastMessageId] = React.useState("");
  const [currentUser, setCurrentUser] = React.useState("");

  const messagesRef = collection(db, "messages");

  const notify = React.useCallback(
    () =>
      toast.success("New message added", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }),
    []
  );

  React.useEffect(() => {
    if (auth.currentUser) {
      setCurrentUser(auth.currentUser.displayName);
    }
  }, []);

  React.useEffect(() => {
    if (!hasNewMessage) {
      return;
    }
    // check if the user is not the one who sent the message
    if (messages[0].user !== currentUser) {
      notify();
    }
    setHasNewMessage(false);
  }, [hasNewMessage, notify]);

  React.useEffect(() => {
    const queryMessages = query(
      messagesRef,
      where("room", "==", rooms),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setMessages(messages);

      // Check if last message id is the same as the id of the last message in the snapshot
      if (lastMessageId !== messages[0]?.id) {
        setLastMessageId(messages[0]?.id);
        setHasNewMessage(true);
      }
    });

    return unsubscribe;
  }, [messagesRef, rooms, lastMessageId]);

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

  const handleDelete = async (messageId) => {
    try {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;
      if (auth.currentUser.displayName !== message.user) {
        console.error("User not authorized to delete this message");
        return;
      }
      await deleteDoc(doc(db, "messages", messageId));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  return (
<main className="fixed">
  
  <Header setIsAuth={setIsAuth} className="" />
  <div className="flex flex-row h-screen bg-[#8338ec]">
    
    <div className=" p-6 xs:hidden md:w-1/4 lg:w-1/4 xl:w-1/4">

      <div className="flex justify-center">   
        <UserGroupIcon className="w-8 h-8 mr-2 text-white"/>
        <p className="text-3xl text-white font-bold">{rooms.toUpperCase()}</p>
      </div>

      <div className="flex justify-center mt-4">
        <img 
        className="w-10 y-10 mr-2 rounded-full"
        src={auth.currentUser.photoURL}
        alt="ProfilePic"
        />        
        <p className="text-2xl text-white font-bold">
          {currentUser.toUpperCase()}
        </p>
      </div>
      <div className="flex">

      </div>
      <div className="flex mx-2 flex-row items-center bottom-0 fixed justify-start ">
        <a href="/" className="px-4 py-2 rounded-lg text-center hover:bg-gray-800">
          <HomeIcon className="w-12 h-14 text-white"/>
          Home
        </a>
        <button className="px-4 py-2 rounded-lg hover:bg-gray-800" onClick={() => setIsAuth(null)}>
          <ArrowLeftOnRectangleIcon className="text-white"/>
              Logout
        </button>        
      </div>
    </div>

    <div className="w-3/4 p-6">
      <div className="flex justify-between">
        <h1 className="font-bold text-white text-4xl pb-4">Messages</h1>
        <a className="hover:underline" href="/">Create A New Chatroom?</a>
      </div>
      
      <div className="bg-slate-800 h-[82.5%] border-4 border-black rounded-lg smooth-scroll overflow-auto">
        {messages.map(({ id, message, user, userImage, createdAt }) => (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ backgroundColor: '#6B7280', transitionDelay: 0.2 }}
              key={id}
              className="flex flex-col p-4 pb-2 text-white rounded"
            >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div className="flex  items-center">
                <img className="w-12 h-12 rounded-full mr-4" src={userImage} alt="" />
                <div>
                  <p className="font-medium">{user}</p>
                  <p className="text-sm text-white">
                    {new Date(createdAt?.seconds * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
              {auth.currentUser?.displayName === user && (
                <button
                  onClick={() => handleDelete(id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full focus:outline-none"
                >
                  Delete
                </button>
              )}
            </motion.div>
            <p className="mt-2">{message}</p>
          </motion.div>
        ))}

      </div>
        <div className="w-[132%]">
          <Input
            handleSubmit={handleSubmit}
            notify={notify}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            
          />
        </div>
    </div>

  </div>

  <ToastContainer
    position="top-right"
    autoClose={1200}
    limit={1}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="dark"
  />
</main>

  );
}
export default Chat;
