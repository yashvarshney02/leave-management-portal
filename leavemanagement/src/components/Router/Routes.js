import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard"
import Login from "../Login/Login";
import ApplyLeave from "../Forms/ApplyLeave";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import PastApplications from "../Forms/PastApplications";
import CheckLeaves from "../Forms/CheckLeaves";
import Dates from "../Forms/Dates";

const Paths = (props) => {
  return (
    <>
      <Routes>
        <Route path='/' element={<PrivateRoute user={"all"}/>}>
          <Route path="/" element={<Dashboard toast={props.toast}/>} />
        </Route>
        <Route path='/forms/applyleave' element={<PrivateRoute user={["all"]}/>}>
          <Route path="/forms/applyleave" element={<ApplyLeave toast={props.toast}/>} />
        </Route>
        <Route path='/forms/pastapplications' element={<PrivateRoute user={["all"]}/>}>
          <Route path="/forms/pastapplications" element={<PastApplications toast={props.toast}/>} />
        </Route>
        <Route path='/forms/dates' element={<PrivateRoute user={["all"]}/>}>
          <Route path="/forms/dates" element={<Dates toast={props.toast}/>} />
        </Route>
        <Route path='/forms/checkapplications' element={<PrivateRoute user={["dean", "hod", "faculty"]}/>}>
          <Route path="/forms/checkapplications" element={<CheckLeaves toast={props.toast}/>} />
        </Route>
        {/* <PrivateRoute component={Dashboard} path="/" exact /> */}
        {/* <Route path="/" element={<Dashboard />} /> */}
        <Route path='/login' element={<Login toast={props.toast}/>} />                  
      </Routes>
    </>
  );
};

export default Paths;