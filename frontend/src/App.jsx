import { useState } from 'react'

import './App.css'

// react router dom
import { Routes, Route } from "react-router-dom";

//components
import Navbar from './components/Navbar';

// screen 
import Login from './screens/login';
import Signup from './screens/signup';
import UserProfile from './screens/UserProfile';
import UpdateProfile from './screens/UpdateProfile';

import Home from './screens/Home';

import CreatePost from './screens/CreatePost';
import PostDetail from './screens/PostDetail';
import UpdatePost from './screens/UpdatePost';

// context
import { AuthProvider } from "./context/AuthContext";
import Report from './screens/Report';

function App() {

  return (
    <>
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>} />

        <Route path="/search" element={<Home />} />

        <Route path='/createpost' element={<CreatePost/>}/>
        <Route path='/updatepost/:id' element={<UpdatePost/>}/>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path='/profile/:id' element={<UserProfile/>}/>
        <Route path='/profile/update/:id' element={<UpdateProfile/>}/>
        <Route path="/post/:id" element={<PostDetail />} />

        <Route path='/report' element={<Report/>} />
      </Routes>
    </AuthProvider>
      
    </>
  )
}

export default App

