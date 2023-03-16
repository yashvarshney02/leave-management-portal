import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import httpClient from "./httpClient";
import Intro from "./components/Intro.js"
import Dashboard from "./components/Dashboard.js"
import LoginForm from "./components/LoginForm.js"
import OtpVerification from "./components/OtpVerification.js"
import LeaveForm from "./components/LeaveForm.js"
import DisplayLeaves from "./components/DisplayLeaves.js"
import CheckLeaves from "./components/CheckLeaves.js"
import DeanDashboard from "./components/Dashboard.js"
import Navbar from './components/Navbar.js'
import './css/App.css';

function App() {
  const [user, setUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    imageURL: "",
    level: "",
  });
  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("http://localhost:5000//@me");
        const data = resp.data;
        setUser(prevUser => ({ ...prevUser, imageURL: data['imageURL'] }));
        setUser(prevUser => ({ ...prevUser, level: data['level'] }));
        setUser(prevUser => ({ ...prevUser, firstName: data['name'] }));
        setUser(prevUser => ({ ...prevUser, email: data['email'] }));
        console.log("USER ", user);
      } catch (error) {
        console.log(error);
        console.log("Not authenticated");
      }
    })();
  }, []);

  return (
    <div className="App">
      <Navbar user={user} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" exact element={<LoginForm />} />
          <Route path="/otpVerification" exact element={<OtpVerification />} />

          {(user.email == "" || user.email == undefined) ? (<Route path="/" exact element={<LoginForm />} />) : (
            <>
              <Route path="/" exact element={<Dashboard  user = {user}/>} />
              <Route path="/dashboard" exact element={<Dashboard  user = {user} />} />
              <Route path="/leaveForm" exact element={<LeaveForm user={user} />} />
              <Route path="/displayLeaves" exact element={<DisplayLeaves user={user}/>} />
              <Route path="/checkLeaves" exact element={<CheckLeaves user = {user} />} />
            </>
          )}

          {/* <Route component={NotFound} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
