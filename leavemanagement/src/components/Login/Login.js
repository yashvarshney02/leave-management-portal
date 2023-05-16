import { useState, useEffect } from "react";
import { Col, Button, Row, Container, Card, Form } from "react-bootstrap";

import "./Login.css";
import httpClient from "../../httpClient";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import jwt_deconde from "jwt-decode";
import { useAuth } from "../../contexts/AuthContext";


export default function Login(props) {
  const [displayOTPBox, setDisplayOTPBox] = useState("none");
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");  
  const {send_otp, validate_otp, refresh_user} = useAuth();
  const [disablButton, setDisableButton] = useState(false);

  const navigate = useNavigate();  

  async function sendOTP(e) {
    try {
      setDisableButton(true);
      e.preventDefault();
      if (email == "") {
        props.toast.error("Email field can't be empty", {
          position: props.toast.POSITION.BOTTOM_RIGHT
        });
        setDisableButton(false);
        return;
      }
      let res = await send_otp(email); 
      if (res.data['status'] == 'success') {
        props.toast.success(res.data['data'], {
          position: props.toast.POSITION.BOTTOM_RIGHT
        });
        setDisplayOTPBox("");
      } else {
        props.toast.error(`${res.data['emsg']}`, {
          position: props.toast.POSITION.BOTTOM_RIGHT
        });
      }      
    } catch(error) {      
      props.toast.error("Something went wrong!!"+error, {
        position: props.toast.POSITION.BOTTOM_RIGHT
      });
    }
    setDisableButton(false);
  }

  async function verifyOTP(e) {
    try {      
      e.preventDefault();
      if (otp == "") {
        props.toast.error("OTP can't be empty", {
          position: props.toast.POSITION.BOTTOM_RIGHT
        });        
        return;
      }
      let res = await validate_otp(email, otp)
      if (res.data['status'] == 'success') {
        props.toast.success(res.data['data'], {
          position: props.toast.POSITION.BOTTOM_RIGHT
        });
        await refresh_user();
        navigate("/")
      } else {
        props.toast.error(`${res.data['emsg']}`, {
          position: props.toast.POSITION.BOTTOM_RIGHT
        });
      }
    } catch {
      props.toast.error("Something went wrong!!", {
        position: props.toast.POSITION.BOTTOM_RIGHT
      });
    }
  }

  function handleGoogleLoginFailure() {
    try {
      props.toast.error("Login With Google Failed!!", {
        position: props.toast.POSITION.BOTTOM_RIGHT
      });
    } catch {
      props.toast.error("Something went wrong!!", {
        position: props.toast.POSITION.BOTTOM_RIGHT
      });
    }
  }

  async function handleLoginWithGoogle(data) {
    try {      
      let info = jwt_deconde(data.credential);
      let res = await httpClient.post(`${process.env.REACT_APP_API_HOST}/login_oauth`, {
        data: info,
      });      
      if (res.data['status'] == 'success') {
        props.toast.success(res.data['data'], {
          position: props.toast.POSITION.BOTTOM_RIGHT
        });         
        await refresh_user();       
        navigate("/")
      } else {
        props.toast.error(`${res.data['emsg']}`, {
          position: props.toast.POSITION.BOTTOM_RIGHT
        });
      }
    } catch(error) {
      props.toast.error("Something went wrong!!", {
        position: props.toast.POSITION.BOTTOM_RIGHT
      });
    }
  }  

  return (
    <div>      
      <div className="background-image">
        <Container>
          <Row className="vh-100 d-flex justify-content-center align-items-center">
            <Col md={8} lg={6} xs={12}>
              <Card className="shadow" style={{backgroundColor: "black"}}>
                <Card.Body className="cont">
                  <div className="mb-3 mt-md-4">
                    <h2 className="fw-bold mb-2 text-uppercase " style={{color: "white"}}>Leave Management Portal</h2>
                    {/* <p className=" mb-5" style={{color:"white"}}>Please enter your email</p> */}
                    <div className="mb-3">
                      <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                          <Form.Label className="text-center" style={{color: "white"}}>
                            Email address
                          </Form.Label>
                          <div className="mb-33">
                          <Form.Control type="email" value={email} placeholder="Enter email" style={{width:"80%"}} onChange={(e) => { setEmail(e.target.value) }} />
                          </div>
                          
                        </Form.Group>

                        <Form.Group
                          className="mb-3"
                          controlId="formBasicPassword"
                          style={{ display: displayOTPBox }}
                        >
                          <Form.Label style={{color:"white"}}>OTP</Form.Label>
                          <div className="mb-33">
                          <Form.Control type="text" style={{width:"80%"}} placeholder="OTP" onChange={(e) => { setOTP(e.target.value) }} />
                          </div>
                          
                        </Form.Group>
                        <Form.Group
                          className="mb-3"
                          controlId="formBasicCheckbox"
                        >
                        </Form.Group>
                        <div className="d-grid submit-button" >
                          <Button disabled={disablButton} variant="primary" type="submit" style={{ width: "100px" }} onClick={
                            (e) => {
                              if (displayOTPBox == "none") {                                
                                sendOTP(e);                                
                              } else {
                                setDisableButton(true);
                                verifyOTP(e);
                                setDisableButton(false);
                              }
                            }
                          }>
                            Login
                          </Button>
                        </div>
                        <span style={{color:"white"}}>or</span>
                        <div className="d-grid submit-button" >
                          <GoogleLogin
                            onSuccess={(data) => { handleLoginWithGoogle(data) }}
                            onError={handleGoogleLoginFailure}
                            useOneTap
                          />
                        </div>
                      </Form>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

    </div>
  );
}
