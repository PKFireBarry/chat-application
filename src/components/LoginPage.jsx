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
<div class="bg-gray-100 flex justify-center items-center h-screen">
    <div class="w-full max-w-sm mx-auto p-6 bg-white rounded-md shadow-md">
        <h1 class="text-2xl font-bold mb-4">Login Page</h1>
        <p class="text-gray-600 mb-6">Sign in with your Google account</p>
        <button class="w-full flex items-center justify-center px-4 py-2 text-white bg-red-600 hover:bg-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" onClick={signInWithGoogle}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 mr-2">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm3.76 14.29l-1.52 1.52c-.512.513-1.333.513-1.846 0L10 12.846l-1.394 1.935c-.512.513-1.333.513-1.846 0l-1.52-1.52c-.512-.512-.513-1.333 0-1.846l1.935-1.394L5.29 7.76c-.513-.512-.513-1.333 0-1.846l1.52-1.52c.512-.513 1.333-.513 1.846 0L10 7.154l1.394-1.935c.512-.513 1.333-.513 1.846 0l1.52 1.52c.513.512.513 1.333 0 1.846l-1.935 1.394 1.935 1.394c.513.512.513 1.333 0 1.846z"/>
            </svg>
            Sign in with Google
        </button>
    </div>
</div>
  )
}

export default LoginPage