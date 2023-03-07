
import React, { useEffect, useState } from 'react';
import httpClient from '../../httpClient';
import "./Dashboard.css";
import LoadingIndicator from '../LoadingIndicator';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { Badge } from 'react-bootstrap';
import { FaEdit, FaMobileAlt } from 'react-icons/fa';


export default function Dashboard({toast}) {

  const { currentUser, refresh_user, editProfile } = useAuth();
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(currentUser.name)
  const [mobile, setMobile] = useState(currentUser.mobile)
  const handleEdit = () => setShowEditProfileModal(!showEditProfileModal);
  const navigate = useNavigate();

  useEffect(() => {
  }, []);

  return (
    // <div className="dashboard" style={{ height: "100vh", backgroundImage: `url(${background})`, backgroundPosition: "fixed", backgroundRepeat: "None", backgroundSize: "cover" }}>
    <div className="dashboard" style={{ margin: "0px", height: "100vh", backgroundColor: "aliceblue" }}>
      {/* <div className="Dashboard"> */}
      {/* <header className="jumbotron text-center"> */}
      <h2 className="heading">Dashboard</h2>
      <div className="heading-line"></div>

      <div className="container">
        <div className="main-body">
          {/* edit profile modal */}
          <Modal show={showEditProfileModal} onHide={handleEdit}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>Name</Form.Label>
                <Form.Control                  
                  value={name}
                  onChange={(e)=>{setName(e.target.value)}}
                  autoFocus                  
                />
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control                  
                  value={mobile}
                  onChange={(e)=>{setMobile(e.target.value)}}
                  autoFocus                  
                />
              </Form.Group>
            </Form></Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleEdit}>
                Close
              </Button>
              <Button variant="primary" onClick={async ()=>{
                let res = await editProfile(name, mobile);
                setLoading(true);
                await refresh_user();
                if (res.data.status == 'success') {
                  toast.success(res.data.data, toast.POSITION.BOTTOM_RIGHT);
                } else {
                  toast.success("Edit Profile Failed", toast.POSITION.BOTTOM_RIGHT);
                }
                setLoading(false);
                handleEdit();
              }}>
              {
                (loading) ? (<LoadingIndicator color={"white"} />) : ("Save Changes")
              }                
              </Button>
            </Modal.Footer>
          </Modal>
          <div className="row gutters-sm">
            <div className="col-md-4 mb-3">
              <div className="card" style={{ "border": "2px solid grey" }}>
                <div className="card-body">
                  <div className="d-flex flex-column align-items-center text-center">
                    {(currentUser.picture == "") ? (<img src={require("../../img/loginIcon.png")} alt="Admin" className="rounded-circle" width="150" />) : (<img src={currentUser.picture} alt="Admin" className="rounded-circle" width="150" />)}
                    <div className="mt-3">
                      <Badge pill bg="light" text="dark">{currentUser.name.toUpperCase()} <FaEdit style={{ cursor: 'pointer' }} onClick={handleEdit}></FaEdit></Badge>< br/>
                      <Badge pill bg="light" text="dark">{currentUser.position.toUpperCase()}</Badge><br />
                      <Badge pill bg="light" text="dark">{currentUser.department.toUpperCase()}</Badge><br />
                      {(currentUser.mobile) ? (<div><FaMobileAlt></FaMobileAlt><Badge pill bg="light" text="dark">{currentUser.mobile.toUpperCase()}</Badge><br /></div>) : ''}                      
                     <Badge pill bg="light" text="dark">{currentUser.email}</Badge><br />
                      {(currentUser.position == "faculty" || currentUser.position == "staff" || currentUser.position == "hod") ? (
                        <Badge bg="info" text="dark" style={{cursor: "pointer"}} onClick={() => { navigate('/forms/applyleave') }}>Apply Leave</Badge>
                      ) : ('')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              {(currentUser.position == "admin") ? ('') : (
                <div className="card mb-3" style={{ "border": "2px solid grey" }}>
                  <div className="card-body" >
                    <div className="row">
                      <div className="col-sm-6">
                        <h6 className="mb-0"><b>Leave Type</b></h6>
                      </div>
                      <div className="col-sm-3">
                        <h6 className="mb-0"><b>Remaining</b></h6>
                      </div>
                      <div className="col-sm-3">
                        <h6 className="mb-0"><b>Taken</b></h6>
                      </div>
                    </div>
                    <hr />
                    <div className='row'>
                      <div className="col-sm-6">
                        <h6 className="mb-0">Casual Leaves</h6>
                      </div>
                      <div className="col-sm-6">

                        <div className="progress">
                          <div class="progress-bar" role="progressbar" style={{ "width": 100 - ((currentUser.taken_casual_leaves * 100) / currentUser.total_casual_leaves) + "%" }}>
                            Remaining - {currentUser.total_casual_leaves - currentUser.taken_casual_leaves}
                          </div>
                          <div class="progress-bar bg-danger" role="progressbar" style={{ "width": ((currentUser.taken_casual_leaves) * 100) / currentUser.total_casual_leaves + "%" }}>
                            Taken - {currentUser.taken_casual_leaves}
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr />

                    <div className="row">
                      <div className="col-sm-6">
                        <h6 className="mb-0">Restricted Leaves</h6>
                      </div>
                      <div className="col-sm-6">

                        <div class="progress">
                          <div class="progress-bar" role="progressbar" style={{ "width": 100 - ((currentUser.taken_restricted_leaves * 100) / currentUser.total_restricted_leaves) + "%" }}>
                            Remaining - {currentUser.total_restricted_leaves - currentUser.taken_restricted_leaves}
                          </div>
                          <div class="progress-bar bg-danger" role="progressbar" style={{ "width": ((currentUser.taken_restricted_leaves) * 100) / currentUser.total_restricted_leaves + "%" }}>
                            Taken - {currentUser.taken_restricted_leaves}
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-6">
                        <h6 className="mb-0">Earned Leaves</h6>
                      </div>
                      <div className="col-sm-6">

                        <div className="progress">
                          <div class="progress-bar" role="progressbar" style={{ "width": 100 - ((currentUser.taken_earned_leaves * 100) / currentUser.total_earned_leaves) + "%" }}>
                            Remaining - {currentUser.total_earned_leaves - currentUser.taken_earned_leaves}
                          </div>
                          <div class="progress-bar bg-danger" role="progressbar" style={{ "width": ((currentUser.taken_earned_leaves) * 100) / currentUser.total_earned_leaves + "%" }}>
                            Taken - {currentUser.taken_earned_leaves}
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-6">
                        <h6 className="mb-0">Vacation Leaves</h6>
                      </div>
                      <div className="col-sm-6">

                        <div className="progress">
                          <div class="progress-bar" role="progressbar" style={{ "width": 100 - ((currentUser.taken_vacation_leaves * 100) / currentUser.total_vacation_leaves) + "%" }}>
                            Remaining - {currentUser.total_vacation_leaves - currentUser.taken_vacation_leaves}
                          </div>
                          <div class="progress-bar bg-danger" role="progressbar" style={{ "width": ((currentUser.taken_vacation_leaves) * 100) / currentUser.total_vacation_leaves + "%" }}>
                            Taken - {currentUser.taken_vacation_leaves}
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-6">
                        <h6 className="mb-0">Study Leaves</h6>
                      </div>
                      <div className="col-sm-6">

                        <div className="progress">
                          <div class="progress-bar" role="progressbar" style={{ "width": 100 - ((currentUser.taken_study_leaves * 100) / currentUser.total_study_leaves) + "%" }}>
                            Remaining - {currentUser.total_study_leaves - currentUser.taken_study_leaves}
                          </div>
                          <div class="progress-bar bg-danger" role="progressbar" style={{ "width": ((currentUser.taken_study_leaves) * 100) / currentUser.total_study_leaves + "%" }}>
                            Taken - {currentUser.taken_study_leaves}
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-12" >
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(currentUser.position == "admin" || currentUser.position == "admin") ? (
                <div className="card mb-3" style={{ "border": "2px solid grey" }}>
                  <div className="card-body" >
                    <h2>Add Users</h2>
                    <div className="row">
                      <div className="col-sm-12" style={{ "padding": "0px", "margin": "0px" }}>
                        <form>
                          <input type="file" />
                          <input type="submit" value="Upload" />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                ''
              )}




            </div>
          </div>

        </div>
      </div>

    </div >
  );
}

