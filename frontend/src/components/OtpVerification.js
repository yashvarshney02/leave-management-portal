import React from 'react';
import httpClient from "../httpClient";
import '../css/Login.css';

export default function LoginForm() {
  const otpVerify = async (e) => {
    try {
      e.preventDefault()
      const otp = document.getElementById("Password").value
      const resp = await httpClient.post("https://yashiitrpr.pythonanywhere.com/validate_otp", {otp});
      window.location.href="dashboard";
    } catch (error) {
      if (error.response.status === 400) {
        alert("Invalid OTP!");
      }
    }
  }
  return (
    <div className='container-fluid'>
      <div className="row">
        <div className="col-4 contentt" style={{ "padding": "0px", margin: "0px", height: "100vh" }}>
          
            <form className="card-body cardbody-color px-5 " method="POST" style={{backgroundColor:"white"}}>
              <h2 className="text-center text-dark ">OTP Verification</h2>
              <div className="text-center">
                <img src="https://3.bp.blogspot.com/-Ba775bzRzaI/XFPU7I9PP0I/AAAAAAAAAoU/f28LkdKBzzISBVd0r4ORbXgU259tn9dZwCLcBGAs/s1600/iitrprlogo1.png"
                  className="img-fluid profile-image-pic img-thumbnail rounded-circle my-3" width="200px"
                  alt="profile" />
              </div>

              <div className="mb-3 p-6">
                <input type="password" className="form-control" name="email" id="Password" aria-describedby="emailHelp"
                  placeholder="Enter OTP" />
              </div>
              <div className="text-center"><button onClick={otpVerify}
                className="btn btn-primary px-5 mb-5 w-100">Verify</button></div>
             
            </form>
          
        </div>
        <div className="col-8 block"></div>
      </div>
    </div>
  )
}
