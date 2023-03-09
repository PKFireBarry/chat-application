import React from "react";

function Header(props) {
  const { setIsAuth } = props;

  return (
    <div className="w-screen">
      <div className=" flex justify-between items-center px-4 py-2 bg-gray-900 text-white">
        <h1 className="text-2xl font-bold">
          <button className="px-4 py-2 rounded-lg hover:bg-blue-500">
            <a href="/" className="text-white font-extrabold animate-pulse">
              Swakabilly's Chat
            </a>
          </button>
        </h1>

        <div>
          <button
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-800"
            onClick={() => setIsAuth(null)}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
