
import React from 'react'
import { useState, useEffect } from 'react'
import httpClient from '../../httpClient';
import "./CheckLeaves.css"
import Table from '../Table';
import { useAuth } from '../../contexts/AuthContext';
import LoadingIndicator from '../LoadingIndicator';

export default function CheckLeaves({ toast }) {

  const [leaves, setLeaves] = useState([]);
  const [headers, setHeaders] = useState(["Leave Id", "Nature", "Name", "Start Date", "Status"]);
  const [headers2, setHeaders2] = useState(["Email ID", "Name", "Position", "Department", "Casual Leaves"]);
  const [data, setData] = useState([-1]);
  const [numberOfLeaves, setNumberOfLeaves] = useState([-1]);
  const { currentUser } = useAuth()

  const fetchLeaves = async (e) => {
    try {
      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/check_applications`);
      if (resp.data.status == "success") {
        // toast.success("Leaves fetched Successfully", toast.POSITION.BOTTOM_RIGHT);
      } else {
        // toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
        return;
      }
      let temp = [], data = resp.data.data;
      for (let i = 0; i < data.length; i++) {
        temp.push([data[i].id, data[i].nature, data[i].name, data[i].start_date.slice(0, -12), data[i].status]);
      }
      setData(temp);
    } catch (error) {
      // toast.error("something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  }
  const fetchNumberOfLeaves = async (e) => {
    try {
      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/fetch_number_of_leaves`);      
      if (resp.data.status == "success") {
        // toast.success("Leaves fetched Successfully", toast.POSITION.BOTTOM_RIGHT);
      } else {
        // toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
        return;
      }
      setNumberOfLeaves(resp.data.data);

    } catch (error) {
      // toast.error("something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  }

  useEffect(() => {
    async function test() {
      await fetchLeaves();
      await fetchNumberOfLeaves();
    }
    test();
  }, []);

  const approveLeave = async (leave_id) => {
    try {
      console.log("Leave Id: ", leave_id);
      console.log("Leaves", leaves);
      let temp = leaves;
      for (let i = 0; i < temp.length; i++) {
        if (temp[i].id == leave_id) {
          temp[i].status = "Approved by Hod";
        }
      }
      setLeaves(temp);
      console.log(leaves);

      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/approve_leave`, { leave_id, level: currentUser.level });
      window.location.reload();
    } catch (error) {
      alert("Some error occurred");
    }
  }

  const disapproveLeave = async (leave_id) => {
    try {
      console.log("Leave Id: ", leave_id);
      console.log("Leaves", leaves);
      let temp = leaves;
      for (let i = 0; i < temp.length; i++) {
        if (temp[i].id == leave_id) {
          temp[i].status = "Disapproved by Hod";
        }
      }
      setLeaves(temp);
      console.log(leaves);

      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/disapprove_leave`, { leave_id });
      window.location.reload();
    } catch (error) {
      alert("Some error occurred");
    }
  }

  const addComment = async (leave_id) => {
    try {
      const uid = "comment-" + leave_id;
      const comment = document.getElementById(uid).value;
      console.log("Comment:", comment);
      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/add_comment`, { comment, leave_id });
      window.location.reload();
    } catch (error) {
      alert("Some error occurred");
    }
  }

  const styles = {
    border: '1px solid black',
    color: 'white',
    backgroundColor: 'black'
  };

  return (
    <div>
      <h2>Check Leaves</h2>

      {(data[0] != -1) ? (
        <Table headers={headers} initialData={data} />
      ) : (
        <LoadingIndicator color={"blue"}/>
      )}
      {(numberOfLeaves[0] != -1) ? (
        <Table headers={headers2} initialData={numberOfLeaves} />
      ) : (
        <LoadingIndicator color={"blue"}/>
      )}

      {leaves.map((leave) => (
        <div className="modal fade" id={"modal-" + leave.id} tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel"
          aria-hidden="true">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Leave Details</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="container" id={"first-page-" + leave.id}>
                  <br />

                  <div className="row header text-center">
                    <div className="col-3 header-left">
                      <img src="https://upload.wikimedia.org/wikipedia/en/f/f9/Indian_Institute_of_Technology_Ropar_logo.png"
                        width="150px" height="150px" />
                    </div>
                    <div className="col-9 header-right">
                      <h3>भारतीय प्रौद्योगिकी संस्थान रोपड़</h3>
                      <h3>INDIAN INSTITUTE OF TECHNOLOGY ROPAR</h3>
                      <p>नंगल विभाग रूपनगर,पंजाब-140001 / Nangal Road, Rupnagar, Punjab-140001</p>
                      <p>दूरभाष/Tele:+91-1881-227088, फेक्स/Fax :+91-1881-223395</p>
                    </div>
                  </div>
                  <hr />

                  <div className="leave-details text-center">
                    <div className="row leave-details-heading">
                      <div className="col-3"></div>
                      <div className="col-6 text-center">
                        <p>आकस्मिक छुट्टी/ राजपत्रित अवकाश / विशेष आकस्मिक छुट्टि हेतू आवेदन पत्र
                          APPLICATION FORM FOR CASUAL LEAVE / RESTRICTED HOLIDAY /
                          SPECIAL CASUAL LEAVE / ON DUTY</p>
                      </div>
                    </div>

                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">नाम / Name</div>
                      <div className="col-1">:</div>
                      <div className="col-5">{currentUser.firstName}</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">पदनाम/ विभाग<br />Designation / Department</div>
                      <div className="col-1">:</div>
                      <div className="col-5">{leave.department.toUpperCase()}</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">आवश्यक छुट्टी का मवरूऩ : आकस्ममक छुट्टी / राज.अव./त्रव.आ.छुट्टी <br />Nature of Leave
                        Required : CL / RH / SCL/ ON DUTY</div>
                      <div className="col-1">:</div>
                      <div className="col-5">{leave.nature}</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">उद्देश्य / Purpose
                        (के वऱ त्रवशेष आकस्ममक छुट्टी के लऱए लनमॊिण ऩि की प्रलत सॊऱगन करं)
                        /<br />
                        (Copy of the invitation letter enclosed in case of SCL only)</div>
                      <div className="col-1">:</div>
                      <div className="col-5">{leave.purpose}</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">कऺाएॊ, प्रशासलनक स्जम्मेदारी आदद (यदद कोई हो तो) के लऱए वैकस्पऩक
                        व्यवमथा /<br />
                        Alternative arrangements for classes, administrative responsibilities,
                        etc. (if any)</div>
                      <div className="col-1">:</div>
                      <div className="col-5">These are alternative arrangements</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">क्या मटेशन छोडना अऩेस्ऺत है?<br />
                        Whether Station leave is required?</div>
                      <div className="col-1">:</div>
                      <div className="col-5">{leave.is_station}</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">छुट्टी के दौरान का ऩता<br />
                        Address during the leave/on duty</div>
                      <div className="col-1">:</div>
                      <div className="col-5"></div>
                    </div>

                    <div className="row leave-details-signature">
                      <div className="col-6"></div>
                      <div className="col-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Signature_of_Ann_Miller.svg/1280px-Signature_of_Ann_Miller.svg.png"
                          witdh="80px" height="80px" /><br />
                        आवेदक के हमताऺर ददनाॊक सदहत/Signature with date of the applicant
                      </div>

                    </div>
                  </div>

                  <hr />

                </div>

                <div className='container' id={"second-page-" + leave.id}>
                  <div className="establishment-office text-center" id={"leave-footer-" + leave.id}>
                    <p><b>त्रवभाग कायााऱय / प्रशासलनक अनुभाग द्वारा प्रयोग हेतु/ For use by the Department Office /
                      Establishment Section</b></p>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-4">Balance as on Date /<br />आज तक शेष</div>
                      <div className="col-4">Leave Applied For (No. of days) /<br />छुट्टी के लऱए आवेदन (ददन)</div>
                      <div className="col-4">Balance / <br />शेष</div>
                    </div>
                    <div className="row">
                      <div className="col-4" style={{ border: "1px solid" }}>{leave[leave.key1] - leave[leave.key2]}</div>
                      <div className="col-4" style={{ border: "1px solid" }}>{leave.duration}</div>
                      <div className="col-4" style={{ border: "1px solid" }}>{leave[leave.key1] - leave[leave.key2]}</div>
                    </div>
                    <br />
                    <div className="row">
                      <div className="col-6">

                        <br />
                        <br />
                        <br />
                        सॊबॊलधत सहायक (त्रवभाग)/(मथाऩना)/Dealing Asstt. (Deptt.)/(Estt.)
                      </div>
                      <div className="col-6">

                        <br />
                        <br />
                        <br />
                        अधी./सहा.कु ऱसलिव/उऩकु ऱसलिव/Supdt./AR/DR
                      </div>

                    </div>
                  </div>
                  <hr />
                  <div className="footer">
                    <div className="row">
                      <div className="col-4"></div>
                      <div className="col-8">
                        <p>{leave.authority_comment}</p>
                        छुट्टी प्रदान करनेके लऱए सऺम प्रालधकारी की दटप्ऩणी: मवीकृ त/अमवीकृ त<br />
                        Comments of the competent authority to grant leave: Sanctioned / Not Sanctioned
                      </div>
                    </div>
                    <br />
                    <br />
                    <div className="row">
                      <div className="col-4"></div>
                      <div className="col-8">
                        <p>{leave.status}</p>
                        (त्रवभागाध्यऺ / कु ऱसलिव / अलधष्ठाता (सॊकाय मामऱेएवॊप्रशासन) / लनदेशक)<br />
                        (HoD / Registrar / Dean(Faculty Affairs & Administration) )
                      </div>
                    </div>
                  </div>
                  <hr />
                  {(leave.attached_documents == "" || leave.attached_documents == undefined) ? (
                    <p>Attached Documents: No document attached</p>
                  ) : (
                    <p>Attached Documents: <a target="_blank" href={leave.attached_documents}>Link</a></p>
                  )
                  }
                  <hr />
                </div>
              </div>
              <div className='text-center'>
                <textarea id={"comment-" + leave.id} placeholder="Add Comment" style={{ "width": "250px" }}></textarea>
              </div>
              <div className="modal-footer">
                {(leave.status == "Pending" || (currentUser.level == "dean" && leave.status == "Approved By Hod")) ? (
                  <>
                    <button type="button" className="btn btn-outline-success" onClick={() => { approveLeave(leave.id) }}>Approve</button>
                    <button type="button" className="btn btn-outline-danger" onClick={() => { disapproveLeave(leave.id) }}>Disapprove</button>
                  </>
                ) : (leave.status)
                }
                <button type="button" className="btn btn-outline-primary" onClick={() => { addComment(leave.id) }}>Add Comment</button>
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      ))
      }

    </div >
  )
}
