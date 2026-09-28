import { BrowserRouter, Routes, Route, } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar'; 
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import ProtectedRoute from './ProtectedRoute';

function App() {

  return (
    
      <BrowserRouter>
       <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resume" element={<ResumeUpload />} />
        </Routes>
      </BrowserRouter>
   
  )
}

export default App;
