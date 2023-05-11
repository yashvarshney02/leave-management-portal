
import React, { useEffect, useState } from 'react';
import httpClient from '../../httpClient';
import "./Dashboard.css";
import LoadingIndicator from '../LoadingIndicator';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { FaEdit, FaMobileAlt } from 'react-icons/fa';
import CustomCalendar from './Calendar';
import NoData from '../NoData';
import ProgressBar from './ProgressBar';


import "react-datepicker/dist/react-datepicker.css";

export default function Dashboard({ toast }) {
  const { currentUser, refresh_user, editProfile } = useAuth();
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leavesData, setLeavesData] = useState();
  const [name, setName] = useState(currentUser.name ? currentUser.name : "");
  const [mobile, setMobile] = useState(currentUser.mobile ? currentUser.mobile : "");
  const [entryNumber, setEntryNumber] = useState(currentUser.entry_number ? currentUser.entry_number : "");
  const [TAInstructor, setTAInstructor] = useState(currentUser.ta_instructor ? currentUser.ta_instructor : "");
  const [advisor, setTAdvisor] = useState(currentUser.advisor ? currentUser.advisor : "");
  const [leavesStatus, setLeavesStatus] = useState({})
  const [recentApplication, setRecentApplication] = useState(null);
  const [sigUrl, setSigUrl] = useState("");
  const [binarySig, setBinarySig] = useState(null);
  const handleEdit = () => setShowEditProfileModal(!showEditProfileModal);
  const navigate = useNavigate();

  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  async function fetchRemainingNumberOfLeaves() {
    const resp = await httpClient.get(`${process.env.REACT_APP_API_HOST}/fetch_remaining_leaves`);
    if (resp.data.status == "success") {
      setLeavesData(resp.data.data);
    } else {
      return;
    }
  }

  const fetchLeaves = async (e) => {
    try {
      const resp = await httpClient.post(
        `${process.env.REACT_APP_API_HOST}/past_applications`
      );
      if (resp.data.status == "success") {
      } else {
        return;
      }
      const temp_data = resp.data.data;
      let dic = {};
      for (let i = 0; i < temp_data.length; i++) {
        let start_date = new Date(temp_data[i].start_date);
        start_date.setDate(start_date.getDate() - 1);
        let end_date = new Date(temp_data[i].end_date);
        end_date.setDate(end_date.getDate() - 1);
        
        let status = temp_data[i].status
        while (start_date <= end_date) {
          let currentDate = start_date.toISOString().slice(0, 10);
          console.log(currentDate)
          dic[currentDate] = status
          start_date.setDate(start_date.getDate() + 1);
        }
      }
      setLeavesStatus(dic);
      if (temp_data.length) {
        setRecentApplication(temp_data[0]);
      }
      // setData(temp);
    } catch (error) {
      toast.error("something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const arrayBuffer = await dataURItoBlob(reader.result).arrayBuffer();
      const binaryData = new Uint8Array(arrayBuffer);
      setBinarySig(binaryData)
    }
  };


  useEffect(() => {
    async function test() {
      await fetchRemainingNumberOfLeaves();
      await fetchLeaves();
      setSigUrl(currentUser.signature);
    }
    test();
  }, []);



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
    <div
      class="dashboard"
      style={{ margin: "0px", height: "100%", backgroundColor: "aliceblue" }}
    >

      <div class="container">
        <div class="main-body">
          {/* edit profile modal */}
          <Modal show={showEditProfileModal} onHide={handleEdit}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group class="mb-3" controlId="exampleForm.ControlInput1">
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
                  {
                    currentUser?.position.includes('pg') ? (
                      <div>
                        <Form.Label>Entry Number</Form.Label>
                        <Form.Control
                          value={entryNumber}
                          onChange={(e) => {
                            setEntryNumber(e.target.value);
                          }}
                          autoFocus
                        />
                      </div>
                    ) : ('')
                  }
                  {
                    currentUser?.position.includes('pg') ? (
                      <div>
                        <Form.Label>TA instructor(Email ID)</Form.Label>
                        <Form.Control
                          value={TAInstructor}
                          onChange={(e) => {
                            setTAInstructor(e.target.value);
                          }}
                          autoFocus
                        />
                      </div>
                    ) : ('')
                  }
                  {
                    currentUser?.position.includes('pg') ? (
                      <div>
                        <Form.Label>Advisor(Email ID)</Form.Label>
                        <Form.Control
                          value={advisor}
                          onChange={(e) => {
                            setTAdvisor(e.target.value);
                          }}
                          autoFocus
                        />
                      </div>
                    ) : ('')
                  }

                  <Form.Label>Your signature</Form.Label>
                  <div className='signature-box'>
                     <img
                      style={{
                        maxHeight: "60px",
                        maxWidth: "450px",
                        width: "40%",
                      }}
                      src={sigUrl}
                      alt="Signature"
                    />
                    <br />
                    <br />
                    <input
                      type="file"
                      accept=".png"
                      style={{ border: "none" }}
                      onChange={handleImageChange}
                    />
                    {/* <a>Clear your signature ?</a> */}
                  </div>
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
                  let res = await editProfile(name, mobile, binarySig, entryNumber, TAInstructor, advisor);
                  setLoading(true);
                  await refresh_user();
                  if (res.data.status == "success") {
                    toast.success(res.data.data, toast.POSITION.BOTTOM_RIGHT);
                    setTimeout(() => {
                      window.location.reload()
                    }, 2000);
                  } else {
                    toast.error(
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
          <div class="row gutters-sm">
            <div class="col-md-4 mb-3" id="profile_parent">
              <div
                class="card"
                id="profile"
                style={{ border: "1px solid grey" }}
              >
                <div class="card-body">
                  <div class="d-flex flex-column align-items-center text-center">
                    {currentUser.picture == "" ? (
                      <img
                        src={require("../../img/loginIcon.png")}
                        alt="Admin"
                        class="rounded-circle"
                        width="150"
                      />
                    ) : (
                      <img
                        src={currentUser.picture}
                        alt="Admin"
                        class="rounded-circle"
                        width="150"
                      />
                    )}
                    <div class="mt-4">
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
                      {/* {
                        (currentUser?.mobile == undefined || currentUser?.mobile.length == 0 || currentUser?.ta_instructor==undefined 
                        || currentUser?.advisor==undefined 
                        || currentUser?.ta_instructor.length == 0
                        || currentUser?.advisor.length == 0
                        || currentUser?.entryNumber == undefined
                        || currentUser?.entry_number.length == 0 ) ? (<span style={{'color': "red"}}><br />Please Complete Your Profile</span>) : ('')
                      } */}
                      <br />
                      {
                        currentUser?.position.includes('pg') ? (
                          <ProgressBar value={leavesData?.total_pg_leaves - leavesData?.taken_pg_leaves} max={leavesData?.total_pg_leaves} type="Leaves" />
                        ) : (
                          <>
                            <ProgressBar value={leavesData?.total_casual_leaves - leavesData?.taken_casual_leaves} max={leavesData?.total_casual_leaves} type="CL" />
                            <ProgressBar value={leavesData?.total_restricted_leaves - leavesData?.taken_restricted_leaves} max={leavesData?.total_restricted_leaves} type="RH" />
                            <ProgressBar value={leavesData?.total_scl_leaves - leavesData?.taken_scl_leaves} max={leavesData?.total_scl_leaves} type="SCL" />
                            <ProgressBar value={leavesData?.total_casual_leaves - leavesData?.taken_non_casual_leave} max={leavesData?.total_non_casual_leave} type="NCL" />
                          </>
                        )
                      }
                      <br />
                      {
                        (currentUser.position == 'hod' || currentUser.position == 'faculty' || currentUser.position.includes('pg')) ? (<button
                          type="button"
                          class="btn btn-success"
                          onClick={() => {
                            navigate("/navigate/applyleave");
                          }}
                        >
                          Apply Leave
                        </button>) : ''
                      }
                      <br />
                      {
                        (currentUser.position == 'hod' || currentUser.position == 'faculty' || currentUser.position.includes('pg')) ? (<button
                          type="button"
                          class="btn btn-success"
                          onClick={() => {
                            navigate("/navigate/pastapplications");
                          }}
                        >
                          Past Applications
                        </button>) : ''
                      }
                      {
                        (currentUser.position == 'dean' || currentUser.position == 'office') ? (<button
                          type="button"
                          class="btn btn-success"
                          onClick={() => {
                            navigate("/navigate/checkapplications");
                          }}
                        >
                          Process Applications
                        </button>) : ''
                      }

                      {/* {(currentUser.position == "faculty" || currentUser.position == "staff" || currentUser.position == "hod") ? (
                        <Badge bg="info" text="dark" style={{cursor: "pointer"}} onClick={() => { navigate('/forms/applyleave') }}>Apply Leave</Badge>
                      ) : ('')} */}
                      <br />
                    </div>
                  </div>
                </div>

              </div>

            </div>
            <div class="col-md-8">
              <CustomCalendar data={leavesStatus} />
              <br />
              <span className='recent-application-title'>Recent Application </span>
              <div class="recent-box">

                {recentApplication ? (


                  <div class="recent-application card">
                    <div class="card-header">
                      {recentApplication.nature}
                    </div>
                    <div class="card-body">
                      <div class="content">
                        <div class="dates">
                          <div>
                            <div class="card-title text-primary">
                              Start Date
                            </div>
                            <div class="date">
                              {new Date(
                                recentApplication.start_date
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div class="card-title text-primary">End Date</div>
                            <div class="date">
                              {new Date(
                                recentApplication.end_date
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div class="buttons_dashboard">
                          <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            onClick={() => {
                              let url;
                              if (recentApplication.leave_id.startsWith("LMP")) {
                                url = "/past_applications/";
                                url += recentApplication.nature
                                  .toLowerCase()
                                  .startsWith("casual")
                                  ? "casual/"
                                  : "non_casual/";
                              } else {
                                url = "/past_applications/";
                                url += "pg_applications/";
                              }
                              url += recentApplication.leave_id;
                              navigate(url);
                            }}
                          >
                            View
                          </button>
                          {/* <button
                            type="button"
                            class="btn btn-secondary btn-sm"
                          >
                            Withdraw
                          </button> */}
                        </div>
                      </div>
                      <span className="status">Status: {recentApplication.status} </span>
                    </div>
                  </div>

                ) : <NoData />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}