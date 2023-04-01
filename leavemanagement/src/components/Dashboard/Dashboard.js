
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


export default function Dashboard({ toast }) {

  const { currentUser, refresh_user, editProfile } = useAuth();
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leavesData, setLeavesData] = useState();
  const [name, setName] = useState(currentUser.name)
  const [mobile, setMobile] = useState(currentUser.mobile)
  const handleEdit = () => setShowEditProfileModal(!showEditProfileModal);
  const navigate = useNavigate();

  async function fetchRemainingNumberOfLeaves() {
    const resp = await httpClient.get(`${process.env.REACT_APP_API_HOST}/fetch_remaining_leaves`);
    if (resp.data.status == "success") {      
      setLeavesData(resp.data.data);
    } else {
      return;
    }
  }

  useEffect(() => {
    async function test() {
      await fetchRemainingNumberOfLeaves();
    }
    test();
  }, [])



  const [month, setMonth] = useState(new Date());
  const numDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  let data = [];
  for (let i = 0; i < numDays; i++) {
    if (i % 2) data.push({ day: i + 1, isLeaveTaken: false });
    else data.push({ day: i + 1, isLeaveTaken: true });
  }

  const weeks = [];
  let week = [];
  for (let j = 0; j < firstDay; j++) {
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
                {
                  leavesData ? <PieChart
                    total={leavesData?.total_casual_leaves}
                    taken={leavesData?.taken_casual_leaves}
                    leaveType="casual-leave"
                    endValue={50}
                    speed={20}
                  /> : ('')
                }
                {
                  leavesData ? <PieChart
                    total={leavesData?.total_non_casual_leave}
                    taken={leavesData?.taken_non_casual_leave}
                    leavesTaken={28}
                    leaveType="non-casual-leave"
                    endValue={28}
                    speed={20}
                  /> : ('')
                }
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
                        className={`day ${day.isLeaveTaken ? "taken" : "not-taken"
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

