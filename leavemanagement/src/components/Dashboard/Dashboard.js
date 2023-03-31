
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
import PieChart from './PieChart';


export default function Dashboard({toast}) {

  const { currentUser, refresh_user, editProfile } = useAuth();
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(currentUser.name)
  const [mobile, setMobile] = useState(currentUser.mobile)
  const handleEdit = () => setShowEditProfileModal(!showEditProfileModal);
  const navigate = useNavigate();

  // const [leaveValObject, setLeaveValObject] = useState({
  //   casual: 50,
  //   casual_value: 50,
  //   vacations: 0,
  //   vacations_value: 0,
  //   restricted : 0,
  //   restricted_value : 0,
  //   earned : 0,
  //   earned_value : 0,
  //   study : 0,
  //   study_value : 0
  // })


  let progressValue = 0;
  let casual_end_value = 50;
  let vacations_end_value = 84;
  let restricted_end_value = 24;
  let earned_end_value = 42;
  let study_end_value = 96;
  let speed = 20;

  const [progress, setProgress] = useState();
  useEffect(() => {
    let casual = document.querySelector(".casual-leaves");
    let casual_value = document.querySelector(".value-casual-leaves");
    let vacations = document.querySelector(".vacation-leaves");
    let vacations_value = document.querySelector(".value-vacation-leaves");
    let restricted = document.querySelector(".restricted-leaves");
    let restricted_value = document.querySelector(".value-restricted-leaves");
    let earned = document.querySelector(".earned-leaves");
    let earned_value = document.querySelector(".value-earned-leaves");
    let study = document.querySelector(".study-leaves");
    let study_value = document.querySelector(".value-study-leaves");
    setProgress(setInterval(() => {
      progressValue++;
      if (progressValue <= casual_end_value) {
        casual_value.textContent = `${progressValue}%`;
        casual.style.background = `conic-gradient(
        #4d5bf9 ${progressValue * 3.6}deg,
        #cadcff ${progressValue * 3.6}deg
      )`;
      }
      if (progressValue <= vacations_end_value) {
        vacations_value.textContent = `${progressValue}%`;
        vacations.style.background = `conic-gradient(
        #4d5bf9 ${progressValue * 3.6}deg,
        #cadcff ${progressValue * 3.6}deg
      )`;
      }
      if (progressValue <= restricted_end_value) {
        restricted_value.textContent = `${progressValue}%`;
        restricted.style.background = `conic-gradient(
        #4d5bf9 ${progressValue * 3.6}deg,
        #cadcff ${progressValue * 3.6}deg
      )`;
      }
      if (progressValue <= earned_end_value) {
        earned_value.textContent = `${progressValue}%`;
        earned.style.background = `conic-gradient(
        #4d5bf9 ${progressValue * 3.6}deg,
        #cadcff ${progressValue * 3.6}deg
      )`;
      }
      if (progressValue <= study_end_value) {
        study_value.textContent = `${progressValue}%`;
        study.style.background = `conic-gradient(
        #4d5bf9 ${progressValue * 3.6}deg,
        #cadcff ${progressValue * 3.6}deg
      )`;
      }
      if (progressValue == 100) {
        clearInterval(progress);
      }
    }, speed));
    
  },[])
  

  const [month, setMonth] = useState(new Date());
  const numDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  let data = [];

  console.log("first Day = " + firstDay)
  for (let i = 0; i < numDays; i++){
    if (i % 2) data.push({ day: i + 1, isLeaveTaken: false });
    else data.push({ day: i + 1, isLeaveTaken: true });
  }

  // const data = [
  //   { day: 1, isLeaveTaken: false },
  //   { day: 2, isLeaveTaken: true },
  //   { day: 3, isLeaveTaken: false },
  //   { day: 4, isLeaveTaken: true },
  //   { day: 5, isLeaveTaken: false }, 
  //   { day: 6, isLeaveTaken: false }, 
  //   { day: 7, isLeaveTaken: true }, 
  //   { day: 8, isLeaveTaken: true }, 
  //   { day: 9, isLeaveTaken: true }, 
  //   { day: 10, isLeaveTaken: false }, 
  //   { day: 11, isLeaveTaken: false },
  //   { day: 12, isLeaveTaken: true },
  //   { day: 13, isLeaveTaken: false },
  //   { day: 14, isLeaveTaken: true },
  //   { day: 15, isLeaveTaken: false }, 
  //   { day: 16, isLeaveTaken: false }, 
  //   { day: 17, isLeaveTaken: true }, 
  //   { day: 18, isLeaveTaken: true }, 
  //   { day: 19, isLeaveTaken: true }, 
  //   { day: 20, isLeaveTaken: false }, 
  //   { day: 21, isLeaveTaken: false },
  //   { day: 22, isLeaveTaken: true },
  //   { day: 23, isLeaveTaken: false },
  //   { day: 24, isLeaveTaken: true },
  //   { day: 25, isLeaveTaken: false }, 
  //   { day: 26, isLeaveTaken: false }, 
  //   { day: 27, isLeaveTaken: true }, 
  //   { day: 28, isLeaveTaken: true }, 
  //   { day: 29, isLeaveTaken: true }, 
  //   { day: 30, isLeaveTaken: false }, 
  // ];

  const weeks = [];
  let week = [];

  // Group the data into weeks
  // data.forEach((day, index) => {
  //   week.push(day);
  //   if (index % 7 === 6) {
  //     weeks.push(week);
  //     week = [];
  //   }
  // });
  for (let j = 0; j < firstDay; j++){
    week.push(0);
  }

  data.forEach((day, index) => {
    week.push(day);
    if (index === data.length - 1) {
      while (week.length != 7) {
        week.push(0);
      }
    }
    if (index === data.length - 1 || (week.length) % 7 === 0) {
      weeks.push(week);
      week = [];
    }
  });

  // if (weeks.length > 0 && weeks[weeks.length - 1].length < 7) {
  //   const lastWeek = weeks[weeks.length - 1];
  //   const emptyCells = 7 - lastWeek.length;
  //   lastWeek.push(...Array.from({ length: emptyCells }, () => null));
  // }

  console.log(weeks)

  useEffect(() => {
  }, []);

  return (
    // <div className="dashboard" style={{ height: "100vh", backgroundImage: `url(${background})`, backgroundPosition: "fixed", backgroundRepeat: "None", backgroundSize: "cover" }}>
    <div
      className="dashboard"
      style={{ margin: "0px", height: "100vh", backgroundColor: "aliceblue" }}
    >
      {/* <div className="Dashboard"> */}
      {/* <header className="jumbotron text-center"> */}
      {/* <h2 className="heading">Dashboard</h2> */}
      {/* <div className="heading-line"></div> */}

      <div className="container">
        <div className="main-body">
          {/* edit profile modal */}
          <Modal show={showEditProfileModal} onHide={handleEdit}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    autoFocus
                  />
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value);
                    }}
                    autoFocus
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleEdit}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  let res = await editProfile(name, mobile);
                  setLoading(true);
                  await refresh_user();
                  if (res.data.status == "success") {
                    toast.success(res.data.data, toast.POSITION.BOTTOM_RIGHT);
                  } else {
                    toast.success(
                      "Edit Profile Failed",
                      toast.POSITION.BOTTOM_RIGHT
                    );
                  }
                  setLoading(false);
                  handleEdit();
                }}
              >
                {loading ? (
                  <LoadingIndicator color={"white"} />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
          <div className="row gutters-sm">
            <div className="col-md-4 mb-3" id="profile_parent">
              <div
                className="card"
                id="profile"
                style={{ border: "2px solid grey" }}
              >
                <div className="card-body">
                  <div className="d-flex flex-column align-items-center text-center">
                    {currentUser.picture == "" ? (
                      <img
                        src={require("../../img/loginIcon.png")}
                        alt="Admin"
                        className="rounded-circle"
                        width="150"
                      />
                    ) : (
                      <img
                        src={currentUser.picture}
                        alt="Admin"
                        className="rounded-circle"
                        width="150"
                      />
                    )}
                    <div className="mt-4">
                      {/* <Badge pill bg="light" text="dark">{currentUser.name.toUpperCase()} <FaEdit style={{ cursor: 'pointer' }} onClick={handleEdit}></FaEdit></Badge>< br/> */}
                      {/* <Badge pill bg="light" text="dark">{currentUser.position.toUpperCase()}</Badge><br /> */}
                      {/* <Badge pill bg="light" text="dark">{currentUser.department.toUpperCase()}</Badge><br /> */}
                      {/* <Badge pill bg="light" text="dark">{currentUser.email}</Badge><br /> */}
                      {/* {(currentUser.mobile) ? (<div><FaMobileAlt></FaMobileAlt><Badge pill bg="light" text="dark">{currentUser.mobile.toUpperCase()}</Badge><br /></div>) : ''}                       */}
                      <span>
                        {currentUser.name.toUpperCase()}{" "}
                        <FaEdit
                          style={{ cursor: "pointer" }}
                          onClick={handleEdit}
                        ></FaEdit>
                      </span>
                      <br />
                      <span>{currentUser.position.toUpperCase()}</span>
                      <br />
                      <span>{currentUser.department.toUpperCase()}</span>
                      <br />
                      {currentUser.mobile ? (
                        <div>
                          <span>
                            <FaMobileAlt></FaMobileAlt>
                            {currentUser.mobile.toUpperCase()}
                          </span>
                          <br />
                        </div>
                      ) : (
                        ""
                      )}
                      <span>{currentUser.email}</span>
                      <br />
                      <button
                        type="button"
                        class="btn btn-primary"
                        onClick={() => {
                          navigate("/forms/applyleave");
                        }}
                      >
                        Apply Leave
                      </button>
                      <br />
                      <button
                        type="button"
                        class="btn btn-success"
                        onClick={() => {
                          navigate("/forms/pastapplications");
                        }}
                      >
                        Past Applications
                      </button>
                      {/* {(currentUser.position == "faculty" || currentUser.position == "staff" || currentUser.position == "hod") ? (
                        <Badge bg="info" text="dark" style={{cursor: "pointer"}} onClick={() => { navigate('/forms/applyleave') }}>Apply Leave</Badge>
                      ) : ('')} */}
                      <br />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div class="Leaves-remaining container">
                <PieChart
                  leavesTaken={28}
                  leaveType="casual-leave"
                  endValue={50}
                  speed={20}
                />
                <PieChart
                  leavesTaken={28}
                  leaveType="non-casual-leave"
                  endValue={28}
                  speed={20}
                />
              </div>
              <br />
              <div className="calendar">
                <div className="week">
                  <span className="day header">Sun</span>
                  <span className="day header">Mon</span>
                  <span className="day header">Tue</span>
                  <span className="day header">Wed</span>
                  <span className="day header">Thu</span>
                  <span className="day header">Fri</span>
                  <span className="day header">Sat</span>
                </div>
                {weeks.map((week, index) => (
                  <div className="week" key={index}>
                    {week.map((day) => (
                      <span
                        key={day.day}
                        className={`day ${
                          day.isLeaveTaken ? "taken" : "not-taken"
                        }`}
                      >
                        {day.day}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <br />
              <div class="recent-box">
                <span>Recent Application </span>
                <div class="recent-application card">
                  <div class="card-header">Casual Leave</div>
                  <div class="card-body">
                    <div class="content">
                      <div class="dates">
                        <div>
                          <h5 class="card-title text-primary">Start Date</h5>
                          <h5>2023-03-31</h5>
                        </div>
                        <div>
                          <h5 class="card-title text-primary">End Date</h5>
                          <h5>2023-04-02</h5>
                        </div>
                      </div>
                      <div class="buttons">
                        <button type="button" class="btn btn-primary btn-sm">
                          View
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm">
                          Withdraw
                        </button>
                      </div>
                    </div>
                    {/* <h6 class="card-title">Duration</h6>
                    <h5>3</h5> */}
                    <div>Status: Pending </div>
                  </div>
                </div>
              </div>
              {/* <div class="card" style="width: 18rem;">
                  <div class="card-body">
                    <h5 class="card-title">Card title</h5>
                    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="#" class="btn btn-primary">Go somewhere</a>
                  </div>
              </div> */}
              {/* {weeks.length > 0 && weeks[weeks.length - 1].length < 7 && (
                <div className="week">
                  {Array.from({ length: 7 }, (_, index) => (
                    <span key={index} className="day"></span>
                  ))}
                </div>
              )} */}
              {/* {(currentUser.position == "admin") ? ('') : (
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
                          <div className="progress-bar" role="progressbar" style={{ "width": 100 - ((currentUser.taken_casual_leaves * 100) / currentUser.total_casual_leaves) + "%" }}>
                            Remaining - {currentUser.total_casual_leaves - currentUser.taken_casual_leaves}
                          </div>
                          <div className="progress-bar bg-danger" role="progressbar" style={{ "width": ((currentUser.taken_casual_leaves) * 100) / currentUser.total_casual_leaves + "%" }}>
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

                        <div className="progress">
                          <div className="progress-bar" role="progressbar" style={{ "width": 100 - ((currentUser.taken_restricted_leaves * 100) / currentUser.total_restricted_leaves) + "%" }}>
                            Remaining - {currentUser.total_restricted_leaves - currentUser.taken_restricted_leaves}
                          </div>
                          <div className="progress-bar bg-danger" role="progressbar" style={{ "width": ((currentUser.taken_restricted_leaves) * 100) / currentUser.total_restricted_leaves + "%" }}>
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
                          <div className="progress-bar" role="progressbar" style={{ "width": 100 - ((currentUser.taken_earned_leaves * 100) / currentUser.total_earned_leaves) + "%" }}>
                            Remaining - {currentUser.total_earned_leaves - currentUser.taken_earned_leaves}
                          </div>
                          <div className="progress-bar bg-danger" role="progressbar" style={{ "width": ((currentUser.taken_earned_leaves) * 100) / currentUser.total_earned_leaves + "%" }}>
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
                          <div className="progress-bar" role="progressbar" style={{ "width": 100 - ((currentUser.taken_vacation_leaves * 100) / currentUser.total_vacation_leaves) + "%" }}>
                            Remaining - {currentUser.total_vacation_leaves - currentUser.taken_vacation_leaves}
                          </div>
                          <div className="progress-bar bg-danger" role="progressbar" style={{ "width": ((currentUser.taken_vacation_leaves) * 100) / currentUser.total_vacation_leaves + "%" }}>
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
                          <div className="progress-bar" role="progressbar" style={{ "width": 100 - ((currentUser.taken_study_leaves * 100) / currentUser.total_study_leaves) + "%" }}>
                            Remaining - {currentUser.total_study_leaves - currentUser.taken_study_leaves}
                          </div>
                          <div className="progress-bar bg-danger" role="progressbar" style={{ "width": ((currentUser.taken_study_leaves) * 100) / currentUser.total_study_leaves + "%" }}>
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
              )} */}

              {currentUser.position == "admin" ||
              currentUser.position == "admin" ? (
                <div className="card mb-3" style={{ border: "2px solid grey" }}>
                  <div className="card-body">
                    <h2>Add Users</h2>
                    <div className="row">
                      <div
                        className="col-sm-12"
                        style={{ padding: "0px", margin: "0px" }}
                      >
                        <form>
                          <input type="file" />
                          <input type="submit" value="Upload" />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

