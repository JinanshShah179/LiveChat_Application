import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import Signup from './components/Signup';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Users from './pages/Users';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import GroupCreate from './pages/GroupCreate';
import GroupChat from "./pages/GroupChat";
import AdminPanel from "./pages/AdminPanel";
import CreateUser from "./pages/CreateUser";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route  path='/login' element={<Login/>}/>
        <Route  path='/signup' element={<Signup/>}/>
        <Route path='/admin' element={<ProtectedRoute><AdminPanel></AdminPanel></ProtectedRoute>}/>
        <Route path='/create-user' element={<ProtectedRoute><CreateUser></CreateUser></ProtectedRoute>}/>
        <Route path="/users" element={<ProtectedRoute><Users/></ProtectedRoute>}/>
        <Route path="/chat/:recipientId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
        <Route path="/group-create" element={<ProtectedRoute><GroupCreate /></ProtectedRoute>} />
        <Route path="/group-chat/:groupId" element={<ProtectedRoute><GroupChat/></ProtectedRoute>}></Route>
      </Routes>    
    </BrowserRouter>  
  );
}

export default App;
