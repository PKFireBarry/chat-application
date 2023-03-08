import React from 'react'
import { auth, provider } from '../firebase'
import { signInWithPopup } from 'firebase/auth'
import Cookies from 'universal-cookie'


const cookies = new Cookies()

function LoginPage(props) {
    const { setIsAuth } = props;
    
    const signInWithGoogle = async () => {
    try{
    const result = await  signInWithPopup(auth, provider)
    cookies.set("auth_user", result.user.refreshToken)
    setIsAuth(true)
    }catch(error){
        console.log(error)
    }
    }

  return (
<div class="bg-gray-600 flex justify-center items-center h-screen">
    <div class="w-full max-w-sm mx-auto p-6 bg-white rounded-md shadow-md">
        <h1 class="text-2xl font-bold mb-4">Login Page</h1>
        <p class="text-gray-600 mb-6">Sign in with your Google account</p>
        <button class="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition duration-300 ease-in-out" onClick={signInWithGoogle}>
            <svg class="w-6 h-6 mr-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M18.293 8.485a7 7 0 10-9.899 0 7 7 0 009.899 0zm-1.414-1.414a5 5 0 11-7.071 0 5 5 0 017.071 0z" />
            </svg>
            <span>Sign in with Google</span>
        </button>
    </div>
</div>

  )
}

export default LoginPage