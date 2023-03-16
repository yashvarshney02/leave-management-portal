import React from 'react';
import httpClient from "../httpClient";
import '../css/Login.css';
import GoogleLogin from 'react-google-login';
// import Footer from './Footer.js'

export default function LoginForm() {
  const responseGoogle = async (res) => {
    try {
      console.log(res);
      const user_info = res.profileObj
      const resp = await httpClient.post("http://localhost:5000//login_oauth", { user_info });
      console.log(resp);
      window.location.href = "/dashboard";
    } catch (error) {
      if (error.response.status === 400) {
        alert("Invalid credentials");
      }
    }
  }
  const otpLogin = async (e) => {
    try {
      e.preventDefault()
      const email = document.getElementById("Username").value;
      const resp = await httpClient.post("http://localhost:5000//login_otp", { email });
      console.log(resp)
      window.location.href = '/otpVerification';
    } catch (error) {
      if (error.response.status === 400) {
        alert("Invalid credentials");
      }
    }
  }
  return (
    <div className='container-fluid'>


      <div className="row">

        <div className="col-4 contentt" style={{ "padding": "0px", margin: "0px" }}>

          <form className="card-body cardbody-color px-3 " method="POST" style={{ "padding": "0px", margin: "0px", backgroundColor:"white" }}>
            <h2 className="text-center text-dark">Login</h2>
            <div className="text-center" style={{ marginTop: "20px" }}>
              <img src="https://3.bp.blogspot.com/-Ba775bzRzaI/XFPU7I9PP0I/AAAAAAAAAoU/f28LkdKBzzISBVd0r4ORbXgU259tn9dZwCLcBGAs/s1600/iitrprlogo1.png"
                className="img-fluid profile-image-pic img-thumbnail rounded-circle my-3"
                alt="profile" />
            </div>

            <div className="mb-3 p-6" style={{ marginTop: "50px" }}>
              <input type="text" className="form-control border border-dark rounded" name="email" id="Username" aria-describedby="emailHelp"
                placeholder="Email Id" />
            </div>
            <div className="text-center"><button onClick={otpLogin}
              className="btn btn-primary  mb-5 w-100 rounded-pill" >Send OTP</button></div>
            <GoogleLogin clientId="145347950197-k36hp883k0ic0afktgi06h1v0kokjb7g.apps.googleusercontent.com"
              buttonText="Login with Google"
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
              cookiePolicy={'single_host_origin'}
              className="rounded"
            />
            
          </form>

        </div>


        <div className="col-8 block"></div>



      </div>



    {/* <Footer /> */}
    </div>
  )
}
