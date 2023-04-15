import './App.css';
import Paths from './components/Router/Routes';
import Sidebar from './components/Sidebar/Sidebar';
import { ToastContainer, toast } from "react-toastify";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <div className="App">
      <GoogleOAuthProvider clientId="145347950197-k36hp883k0ic0afktgi06h1v0kokjb7g.apps.googleusercontent.com">
        <AuthProvider>
          <ToastContainer />
          <Sidebar />
          <Paths toast={toast} />
        </AuthProvider>
      </GoogleOAuthProvider>
    </div>
  )
}

export default App;
