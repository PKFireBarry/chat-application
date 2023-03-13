import React from "react";

function Header(props) {
  return (
    <div className="w-screen">
      <div className=" flex justify-between items-center px-4 py-2 bg-gray-900 text-white">
        <h1 className="text-2xl font-bold">
          <button className="px-4 py-2 rounded-lg">
            <a href="/" className="text-white font-extrabold">
              Swakabilly's Chat
            </a>
          </button>
        </h1>
        {/*
        list of the rooms
        */}
      </div>
    </div>
  );
}

export default Header;
