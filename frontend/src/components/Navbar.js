import React from 'react'
import httpClient from "../httpClient";

export default function Navbar({ user }) {
  // console.log(user);
  const logout = async (e) => {
    await httpClient.get("http://localhost:5000//logout");
    window.location.href = "/";
  }
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <a className="navbar-brand" href="#">Leave Portal</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item px-2 active">
              <a className="nav-link" href="/" style={{"color": "white"}}>Home <span className="sr-only">(current)</span></a>
            </li>
            {(user.email == "" || user.email == undefined) ? ('') : (<><li className="nav-item px-2"> <a className="nav-link" href="/dashboard" style={{"color": "white"}}>Dashboard</a> </li>
            <li className="nav-item px-2 dropdown" >
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                data-toggle="dropdown" aria-expanded="false" style={{"color": "white"}} >
                Navigate
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <a className="dropdown-item" href="/leaveForm">Apply Leave</a>
                <a className="dropdown-item" href="displayLeaves">Applied Leaves</a>
                {(user.level == "hod") ? (
                  <>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="/checkLeaves">Check Leaves</a>
                  </>
                ) : ('')}
              </div>
            </li></>
            )}
            {/* <li className="nav-item px-2"><a className="nav-link disabled">Disabled</a></li> */}
            {/* <li className="nav-item px-2">
              <form className="form-inline my-2 my-lg-0">
                <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
                <button className="btn btn-outline-secondary btn-light my-2 my-sm-0" type="submit">Search</button>
              </form>
            </li> */}
          </ul>
          {(user.email == "" || user.email == undefined) ? (
            <ul className="navbar-nav justify-content-right">
              <li className="nav-item px-2"> <a className="nav-link" href="login" style={{"color": "white"}}>Login</a> </li>
              {/* <li className="nav-item px-2"> <a className="nav-link" href="register">Register</a> </li> */}
            </ul>
          ) :
            (
              <ul className="navbar-nav justify-content-right">
                <li className="nav-item px-2"> <a className="nav-link" href="dashboard" style={{"color": "white"}}>{user.firstName}</a> </li>
                <li className="nav-item px-2"> <a className="nav-link" href="#" onClick={logout} style={{"color": "white"}}>Logout</a> </li>
              </ul>
            )}
        </div>
      </div>
    </nav>
  )
}
