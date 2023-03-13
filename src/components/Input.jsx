import React from "react";

function Input(props) {
  const { handleSubmit, newMessage, setNewMessage } = props;

  return (
    <div className="w-3/4 py-4">
      <form
        className="flex w-full"
        onSubmit={(event) => {
          handleSubmit(event);
        }}
      >
        <input
          className="w-full rounded-full py-3 px-4 mr-4 text-black focus:outline-none bg-white"
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
    </div>
  );
}

export default Input;
