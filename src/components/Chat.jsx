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
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
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
    <>
      <div className=" flex flex-col bg-slate-600 h-screen justify-center items-center bg-gradient-to-r from-indigo-500 via-purple-500 to-red-500">
        <Header setIsAuth={setIsAuth} />
        <h1 className="text-4xl text-white  m-4 font-bold">
          Room: {rooms.toLowerCase()}{" "}
        </h1>
        <div className="flex flex-col w-3/4 flex-grow bg-gradient-to-r from-indigo-600 to-slate-900 border-4 border-white rounded-lg overflow-y-auto">
          {messages.map(({ id, message, user, userImage, createdAt }) => (
            <>
              <ToastContainer />
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                key={id}
                className="flex flex-col p-4 pb-2 text-white rounded"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <img
                      className="w-12 h-12 rounded-full  mr-4"
                      src={userImage}
                      alt=""
                    />
                    <div>
                      <p className="font-medium">{user}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(createdAt?.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleDelete(id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full focus:outline-none"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
                <p className="ml-16 text-md">{message}</p>
              </motion.div>
              <ToastContainer />
            </>
          ))}
        </div>
        <Input
          handleSubmit={handleSubmit}
          notify={notify}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
        />
      </div>
    </>
  );
}
export default Chat;
