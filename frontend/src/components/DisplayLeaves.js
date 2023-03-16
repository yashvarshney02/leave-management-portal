import { Button, Dropdown } from 'react-bootstrap';
import React from 'react'
import { useState, useEffect } from 'react'
import httpClient from "../httpClient";
import '../css/DisplayLeaves.css';
import Table from './Table.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint } from '@fortawesome/free-solid-svg-icons'
import html2canvas from "html2canvas";
import { jsPDF } from 'jspdf';

export default function DisplayLeaves({ user }) {

  const [leaves, setLeaves] = useState([]);
  const [showLeaves, setShowLeaves] = useState([])
  const [headers, setHeaders] = useState(["Leave Id", "Nature", "Start Date", "Duration", "Status"]);
  const [data, setData] = useState([-1]);

  const fetchLeaves = async (e) => {
    try {
      const resp = await httpClient.post("http://localhost:5000//fetchLeaves");
      setLeaves(resp["data"]['result'])
      setShowLeaves(resp["data"]['result'])
      console.log(resp['data']['result'])
      return resp["data"]["result"]
      //   window.location.href = '/otpVerification';
    } catch (error) {
      if (error.response.status === 400) {
        alert("Error occured");
      }
    }
  }

  const updateData = (x) => {
    let temp = [];
    for (let i = 0; i < x.length; i++) {
      temp.push([x[i].id, x[i].nature, x[i].start_date.slice(0, -12), x[i].duration, x[i].status]);
    }
    setData(temp);
  }

  const saveLeave = (leave_id) => {
    // let doc = new jsPDF("landscape", "pt", "a3");
    // doc.html(document.querySelector("#modal-" + leave_id), {
    //   width: 200,

    //   callback: function (pdf) {
    //     pdf.save("leave-" + leave_id + ".pdf");
    //   }
    // });

    const pdf = new jsPDF("portrait", "pt", "a2");
    const input = document.getElementById("first-page-" + leave_id);
    html2canvas(input, {
      letterRendering: 1,
      allowTaint: true,
      logging: true,
      useCORS: true
    })
      //By passing this option in function Cross origin images will be rendered properly in the downloaded version of the PDF
      .then((canvas) => {
        // document.getElementById("leave-container-" + leave_id).parentNode.style.overflow = 'hidden';

        var imgData = canvas.toDataURL('image/png');
        // window.open(imgData, "toDataURL() image", "width=800, height=800");

        pdf.addImage(imgData, 'JPEG', 100, 50);

        const input1 = document.getElementById("second-page-" + leave_id);
        html2canvas(input1)
          .then((canvas) => {
            // document.getElementById("leave-container-" + leave_id).parentNode.style.overflow = 'hidden';

            var imgData = canvas.toDataURL('image/png');
            // window.open(imgData, "toDataURL() image", "width=800, height=800");
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 100, 50);
            pdf.save(`${"leave-" + leave_id}.pdf`);
          })
      })
  }



  console.log("Userrrr", user);

  useEffect(() => {
    (async () => {
      const xx = await fetchLeaves();
      updateData(xx);
      // console.log("xx", xx);
    })();
  }, []);


  return (
    <div>
      <h2>Applied Leaves</h2>

      {(data[0] != -1) ? (
        <Table headers={headers} initialData={data} />
      ) : (
        <p>loading...</p>
      )}

      {/* <div className='leaves_container'>
        <table className="table" id="tableID">
          <thead>
            <tr>
              <th>Leave Id</th>
              <th>Nature</th>
              <th>Request Date</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {showLeaves.map((leave) => (
              <tr className="cell-1" data-toggle="modal" data-target={"#modal-" + leave.id}>
                <td>{leave.id}</td>
                <td>{leave.nature}</td>
                <td>{leave.request_date}</td>
                <td>{leave.duration}</td>
                <td>{leave.status}</td>
              </tr>
            ))}
          </tbody>
        </table> */}
      {showLeaves.map((leave) => (
        <div className="modal fade" id={"modal-" + leave.id} tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel"
          aria-hidden="true">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Leave Details</h5>
                <div style={{ "margin": "3px 10px" }}>
                  <FontAwesomeIcon icon={faPrint} />
                </div>
                <button type="button" className="close" data-dismiss="modal-lg" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {/* <table className='table'>
                  <tbody>
                    <tr style={{ margin: "1px" }}>
                      <td><b>Leave Id:</b></td>
                      <td>{leave.id}</td>
                    </tr>
                    <tr>
                      <td><b>Nature of leave: </b></td>
                      <td>{leave.nature}</td>

                    </tr>
                    <tr>
                      <td><b>Start Date of leave: </b></td>
                      <td>{leave.start_date.slice(0, -12)}</td>
                    </tr>
                    <tr>
                      <td><b>End Date of leave: </b></td>
                      <td>{leave.end_date.slice(0, -12)}</td>
                    </tr>
                    <tr>
                      <td><b>Duration of leave: </b></td>
                      <td>{leave.duration}</td>
                    </tr>
                    <tr>
                      <td><b>Request Date of leave: </b></td>
                      <td>{leave.request_date.slice(0, -12)}</td>
                    </tr>
                    <tr>
                      <td><b>Purpose of leave: </b></td>
                      <td>{leave.purpose}</td>
                    </tr>
                    <tr>
                      <td><b>Status: </b> </td>
                      <td>{leave.status}</td>
                    </tr>
                    <tr>
                      <td><b>Authority Comment: </b></td>
                      <td>{leave.authority_comment}</td>
                    </tr>
                    <tr>
                      <td><b>Attached Document: </b></td>
                      <td><a href={leave.file_uploaded}>Attachement</a></td>
                    </tr>
                  </tbody>
                </table> */}
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
                      <div className="col-5">{user.firstName}</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">पदनाम/ विभाग<br />Designation / Department</div>
                      <div className="col-1">:</div>
                      <div className="col-5">{leave.department.toUpperCase()}</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">आवश्यक छुट्टी का स्वरूप : आकस्मिक छुट्टी / राज.अव./वि.आ.छुट्टी <br />Nature of Leave
                        Required : CL / RH / SCL/ ON DUTY</div>
                      <div className="col-1">:</div>
                      <div className="col-5">{leave.nature}</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">उद्देश्य / Purpose
                        (केवल विशेष आकस्मिक छुट्टी के लिये निमंत्रण पत्र की प्रती सलगन करे)
                        /<br />
                        (Copy of the invitation letter enclosed in case of SCL only)</div>
                      <div className="col-1">:</div>
                      <div className="col-5">{leave.purpose}</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">कक्षाएं, प्रशासनिक जिम्मेदारी आदि (यदि कोई हो तो) के लिए वैकल्पिक व्यवस्था /
                        /<br />
                        Alternative arrangements for classes, administrative responsibilities,
                        etc. (if any)</div>
                      <div className="col-1">:</div>
                      <div className="col-5">These are alternative arrangements</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">क्या स्टेशन छोड़ना अपेक्षित है?<br />
                        Whether Station leave is required?</div>
                      <div className="col-1">:</div>
                      <div className="col-5">{leave.is_station}</div>
                    </div>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-6">छुट्टी के दौरान का पता<br />
                        Address during the leave/on duty</div>
                      <div className="col-1">:</div>
                      <div className="col-5"></div>
                    </div>

                    <div className="row leave-details-signature">
                      <div className="col-6"></div>
                      <div className="col-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Signature_of_Ann_Miller.svg/1280px-Signature_of_Ann_Miller.svg.png"
                          witdh="80px" height="80px" /><br />
                        आवेदन के हस्ताक्षर दिनांक सहित/Signature with date of the applicant
                      </div>

                    </div>
                  </div>

                  <hr />

                </div>

                <div className='container' id={"second-page-" + leave.id}>
                  <div className="establishment-office text-center" id={"leave-footer-" + leave.id}>
                    <p><b>विभाग कार्यालय/ प्रशासनिक अनुभाग द्वारा प्रयोग हेतु/ For use by the Department Office /
                      Establishment Section</b></p>
                    <div className="row" style={{ border: "1px solid" }}>
                      <div className="col-4">Balance as on Date /<br />आज तक शेष</div>
                      <div className="col-4">Leave Applied For (No. of days) /<br />छुट्टी के लिए आवेदन(दिन)</div>
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
                        संबंधित सहायक(विभाग)/(स्थापना)/Dealing Asstt. (Deptt.)/(Estt.)
                      </div>
                      <div className="col-6">

                        <br />
                        <br />
                        <br />
                        अधी./सहा. कुलसचिव/उपकुलसचिव/Supdt./AR/DR
                      </div>

                    </div>
                  </div>
                  <hr />
                  <div className="footer">
                    <div className="row">
                      <div className="col-4"></div>
                      <div className="col-8">
                        <p>{leave.authority_comment}</p>
                        छुट्टी प्रदान करने के लिए सक्षम प्राधिकारी की टिप्पणी: स्वीकृत/अस्वीकृत<br />
                        Comments of the competent authority to grant leave: Sanctioned / Not Sanctioned
                      </div>
                    </div>
                    <br />
                    <br />
                    <div className="row">
                      <div className="col-4"></div>
                      <div className="col-8">
                        <p>{leave.status}</p>
                        (विभागाध्यक्ष/ कुलसचिव/ अधिष्ठता (संकाय मामले एव प्रशासन) / निदेशक)<br />
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
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => saveLeave(leave.id)}>Download PDF</button>
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                {/* <button type="button" className="btn btn-primary">Save changes</button> */}
              </div>
            </div>
          </div>
        </div>
      ))
      }
    </div >

    // </div >
  )
}   
