import React, { useRef } from "react";
import httpClient from "../../httpClient";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FaDownload } from "react-icons/fa";
import { Row, Col } from "react-bootstrap"
import SignaturePad from 'react-signature-canvas';
import { map } from "../../global constants/constants";

const LeavePDFModals = ({ toast, from }) => {
  const [leave, setLeave] = useState(null);
  const { currentUser } = useAuth();
  let currentUrl =
    window.location.href.split("/")[window.location.href.split("/").length - 1];
  const leave_id = currentUrl;
  const [signatureDataURL, setSignatureDataUrl] = useState(null)
  const [downloadLink, setDownloadLink] = useState(null);
  const [sigUrl, setSigUrl] = useState();
  const [disablButton, setDisableButton] = useState(false);

  function dataURItoBlob(dataURI) {
    try {
      const byteString = atob(dataURI.split(',')[1]);
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch {
      return null
    }
  }

  const approveLeave = async (leave_id) => {
    let binaryData = "";
    console.log(sigUrl)
    if (!sigUrl) {
      binaryData = null;
    } else {
      let arrayBuffer = await dataURItoBlob(sigUrl).arrayBuffer();
      binaryData = new Uint8Array(arrayBuffer);
    }
    try {

      const resp = await httpClient.post(
        `${process.env.REACT_APP_API_HOST}/approve_leave`,
        { leave_id, level: currentUser.level, signature: binaryData, applicant_id: leave.user_id }
      );
      if (resp.data.status == "error") {
        toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
      } else {
        toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
      }
      setTimeout(() => {
        window.location.reload()
      }, 3000);
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  };


  const submitOfficeSignature = async (leave_id) => {
    if (!sigUrl) {
      toast.error("Signature can't be kept empty in approval", toast.POSITION.BOTTOM_RIGHT);
      return;
    }
    try {
      const arrayBuffer = await dataURItoBlob(sigUrl).arrayBuffer();
      const binaryData = new Uint8Array(arrayBuffer);
      const resp = await httpClient.post(
        `${process.env.REACT_APP_API_HOST}/submit_office_signature`,
        { leave_id, signature: binaryData }
      );
      if (resp.data.status == "error") {
        toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
      } else {
        toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
      }
      setTimeout(() => {
        window.location.reload()
      }, 3000);
    } catch (error) {
      toast.error("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  };
  const addComment = async (leave_id) => {
    try {
      const uid = "comment-" + leave_id;
      const comment = document.getElementById(uid).value;
      const resp = await httpClient.post(
        `${process.env.REACT_APP_API_HOST}/add_comment`,
        { comment, leave_id, applicant_id: leave.user_id }
      );
      if (resp.data.status == "error") {
        toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
      } else {
        toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
      }
      setTimeout(() => {
        window.location.reload()
      }, 3000);
    } catch (error) {
      toast.error("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  };

  const fetchLeaveInfo = async () => {
    try {
      const resp = await httpClient.post(
        `${process.env.REACT_APP_API_HOST}/get_leave_info_by_id`,
        { leave_id }
      );
      if (resp.data.status === "success") {
        let data = resp.data.data[0];
        if (currentUser?.signature && from == "check_applications") {
          setSigUrl(currentUser.signature)
        }
        setLeave(data);
        if (data.signature && data.signature[0]) {
          const imageUrl = "data:image/png;base64," + String(data.signature);
          setSignatureDataUrl(imageUrl);
        }

        if (data.filename) {
          await handleDownloadClick('leave_document', data.filename)
        }

      } else {
        // console.log(error)
      }
    } catch (error) {
      toast.error("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  };

  const disapproveLeave = async (leave_id) => {
    try {
      const resp = await httpClient.post(
        `${process.env.REACT_APP_API_HOST}/disapprove_leave`,
        { leave_id, applicant_id: leave.user_id }
      );
      if (resp.data.status == "error") {
        toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
      } else {
        toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
      }
      setTimeout(() => {
        window.location.reload()
      }, 3000);
    } catch (error) {
      toast.error("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  };

  const handleDownloadClick = async (query, file_name = null) => {
    const response = await fetch(`${process.env.REACT_APP_API_HOST}/sample_csvs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
        // Add any other necessary headers
      },
      body: JSON.stringify({
        "name": query,
        "file_name": file_name
      }),
      withCredentials: true,
    });
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob);
    setDownloadLink(url);
  };

  const saveLeave = (leave_id) => {
    const pdf = new jsPDF("portrait", "pt", "a2");
    const input = document.getElementById("first-page-" + leave_id);
    html2canvas(input, {
      letterRendering: 1,
      allowTaint: true,
      logging: true,
      useCORS: true,
    })
      //By passing this option in function Cross origin images will be rendered properly in the downloaded version of the PDF
      .then((canvas) => {
        // document.getElementById("leave-container-" + leave_id).parentNode.style.overflow = 'hidden';

        var imgData = canvas.toDataURL("image/png");
        // window.open(imgData, "toDataURL() image", "width=800, height=800");

        pdf.addImage(imgData, "JPEG", 100, 50);

        pdf.save(`${"leave-" + leave_id}.pdf`);
      });
  };

  function get_date(date) {
    if (!date) {
      return null;
    }
    date = new Date(date);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    return formattedDate
  }

  function get_status_element(leave) {
    if (!leave) return ''
    let status = leave?.status.toLowerCase();
    let imageUrl = "";
    if (status.startsWith("approved") && status.includes("hod")) {
      if (leave.hod_sig && leave.hod_sig[0]) {
        imageUrl = "data:image/png;base64," + String(leave.hod_sig);
      }
    } else if (status.startsWith("approved") && status.includes("dean")) {
      if (leave.dean_sig && leave.dean_sig[0]) {
        imageUrl = "data:image/png;base64," + String(leave.dean_sig);
      }
    }
    if (imageUrl.length) {
      return (
        <img
          style={{
            maxHeight: "60px",
            maxWidth: "450px",
            width: "40%",
          }}
          src={imageUrl}
          alt="Signature"
        />
      )
    }
    return leave?.status
  }

  function get_office_status_element(leave) {
    if (!leave) return ''
    let imageUrl = "";
    if (leave.office_sig && leave.office_sig[0]) {
      imageUrl = "data:image/png;base64," + String(leave.office_sig);
    }
    if (imageUrl.length) {
      return (
        <img
          style={{
            maxHeight: "60px",
            maxWidth: "450px",
            width: "40%",
          }}
          src={imageUrl}
          alt="Signature"
        />
      )
    }
    return '';

  }

  useEffect(() => {
    async function test() {
      await fetchLeaveInfo();
    }
    test();
  }, []);
  return (
    <>
      {true ? (
        <div>
          Download pdf{" "}
          <FaDownload
            style={{ cursor: "pointer" }}
            onClick={() => saveLeave(leave?.leave_id)}
          />
          <div
            className="container"
            style={{ width: "1000px" }}
            id={"first-page-" + leave?.leave_id}
          >
            <br />
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ flex: "0 0 auto" }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/f/f9/Indian_Institute_of_Technology_Ropar_logo.png"
                  width="150px"
                  height="150px"
                  style={{ float: "left" }}
                />
              </div>
              <div style={{ flex: "1 1 auto", textAlign: "center" }}>
                <h3>भारतीय प्रौद्योगिकी संस्थान रोपड़</h3>
                <h3>INDIAN INSTITUTE OF TECHNOLOGY ROPAR</h3>
                <p>
                  नंगल विभाग रूपनगर,पंजाब-140001 / Nangal Road, Rupnagar,
                  Punjab-140001
                </p>
                <p>दूरभाष/Tele:+91-1881-227088, फेक्स/Fax :+91-1881-223395</p>
              </div>
            </div>

            <hr />

            <div className="leave-details text-center">
              <div className="row leave-details-heading">
                <div className="col-3"></div>
                <div className="col-6 text-center">
                  <p>
                    आकस्मिक छुट्टी/ राजपत्रित अवकाश / विशेष आकस्मिक छुट्टि हेतू
                    आवेदन पत्र APPLICATION FORM FOR CASUAL LEAVE / RESTRICTED
                    HOLIDAY / SPECIAL CASUAL LEAVE / ON DUTY
                  </p>
                </div>
              </div>

              <div className="row" style={{ border: "1px solid" }}>
                <div className="col-6" style={{ textAlign: "left" }}>
                  नाम / Name
                </div>
                <div className="col-1" style={{ textAlign: "left" }}>
                  :
                </div>
                <div className="col-5" style={{ textAlign: "left" }}>
                  {leave?.name}
                </div>
              </div>
              <div className="row" style={{ border: "1px solid" }}>
                <div className="col-6" style={{ textAlign: "left" }}>
                  पदनाम/ विभाग
                  <br />
                  Designation / Department
                </div>
                <div className="col-1" style={{ textAlign: "left" }}>
                  :
                </div>
                <div className="col-5" style={{ textAlign: "left" }}>
                  {leave?.position?.toUpperCase()}/
                  {leave?.department?.toUpperCase()}
                </div>
              </div>
              <div className="row" style={{ border: "1px solid" }}>
                <div className="col-6" style={{ textAlign: "left" }}>
                  आवश्यक छुट्टी का मवरूऩ : आकस्मिक छुट्टी/ राजपत्रित अवकाश / विशेष आकस्मिक छुट्टि <br />
                  Nature of Leave Required : CL / RH / SCL/ OD
                </div>
                <div className="col-1" style={{ textAlign: "left" }}>
                  :
                </div>
                <div className="col-5" style={{ textAlign: "left" }}>
                  <p>
                    दिनों की संख्या / No of days&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {leave?.duration}
                  </p>
                  <p>
                    {leave?.type_of_leave[0]}
                    {leave?.type_of_leave.split(" ")[1][0]}
                  </p>
                  <p>
                    From: {get_date(leave?.start_date)} से/To{" "}
                    {get_date(leave?.end_date)} तक
                  </p>
                </div>
              </div>
              <div className="row" style={{ border: "1px solid" }}>
                <div className="col-6" style={{ textAlign: "left" }}>
                  उद्देश्य / Purpose (केवल विशेष आकस्मिक छुट्टि के मामले में संलग्न आमंत्रण पत्र की प्रति) /<br />
                  (Copy of the invitation letter enclosed in case of SCL only)
                </div>
                <div className="col-1" style={{ textAlign: "left" }}>
                  :
                </div>
                <div className="col-5" style={{ textAlign: "left" }}>
                  {leave?.purpose}
                </div>
              </div>
              <div className="row" style={{ border: "1px solid" }}>
                <div className="col-6" style={{ textAlign: "left" }}>

                  कक्षाओं, प्रशासनिक उत्तरदायित्वों आदि के लिए वैकल्पिक व्यवस्था (यदि कोई हो) /<br />
                  Alternative arrangements for classes, administrative
                  responsibilities, etc. (if any)
                  <br />
                </div>
                <div className="col-1" style={{ textAlign: "left" }}>
                  :
                </div>
                <div className="col-5" style={{ textAlign: "left" }}>
                  {leave?.alt_arrangements}
                </div>
              </div>
              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  11. क्या स्टेशन छुट्टी की आवश्यकता है/Whether Station leave is
                  required
                </div>
                <div className="col-6" style={{ textAlign: "left" }}>
                  <div
                    className="row"
                    style={{ border: "1px solid", minHeight: "38.6px" }}
                  >
                    हाँ या नहीं /Yes /No : यदि हाँ तो /If yes :{" "}
                    {leave?.is_station}
                  </div>
                  <div
                    className="row"
                    style={{
                      border: "1px solid",
                      fontSize: "14px",
                      minHeight: "38.6px",
                    }}
                  >
                    से/From {get_date(leave?.station_start_date)} तक /To{" "}
                    {get_date(leave?.station_end_date)}
                  </div>
                </div>
              </div>
              <div className="row" style={{ border: "1px solid" }}>
                <div className="col-6" style={{ textAlign: "left" }}>
                  छुट्टी के दौरान/ड्यूटी पर पता
                  <br />
                  Address during the leave/on duty
                </div>
                <div className="col-1" style={{ textAlign: "left" }}>
                  :
                </div>
                <div className="col-5" style={{ textAlign: "left" }}>
                  {leave?.address}
                  <br />
                  दरूभाष / Phone No. {leave?.mobile}
                </div>
              </div>

              <div className="row leave-details-signature">
                <div className="col-6"></div>
                <div
                  className="col-6"
                  id="signature-container"
                  style={{ alignItems: "center", padding: "10px" }}
                >
                  <div className="img-cont">
                    {
                      signatureDataURL ? (
                        <img
                          style={{
                            maxHeight: "60px",
                            maxWidth: "450px",
                            width: "40%",
                          }}
                          src={signatureDataURL}
                          alt="Signature"
                        />
                      ) : (<b>{leave?.name}</b>)
                    }
                  </div>
                  <br />
                  आवेदक के हस्ताक्षर तारीख साहित/Signature with date of the
                  applicant
                </div>
              </div>
            </div>

            <hr />
            <div
              className="establishment-office text-center"
              id={"leave-footer-" + leave?.leave_id}
            >
              <p>
                <b>
                  विभाग कार्यालय / प्रशासलनक अनुभाग द्वारा प्रयोग हेतु/ For use
                  by the Department Office / Establishment Section
                </b>
              </p>
              <div className="row" style={{ border: "1px solid" }}>
                <div className="col-4">
                  Balance as on Date /<br />
                  आज तक शेष
                </div>
                <div className="col-4">
                  Leave Applied For (No. of days) /<br />
                  छुट्टी के लिये आवेदन (ददन)
                </div>
                <div className="col-4">
                  Balance / <br />
                  शेष
                </div>
              </div>
              <div className="row">
                <div className="col-4" style={{ border: "1px solid" }}>
                  {leave ? (leave[map[leave.type_of_leave][0]] - leave[map[leave.type_of_leave][1]]) : ""}
                  { }
                </div>
                <div className="col-4" style={{ border: "1px solid" }}>
                  {leave?.duration}
                </div>
                <div className="col-4" style={{ border: "1px solid" }}>
                  {leave ? (leave[map[leave.type_of_leave][0]] - leave[map[leave.type_of_leave][1]] - leave.duration) : ""}
                </div>
              </div>
              <br />
              <div className="row">
                <div className="col-6">
                  <br />
                  <br />
                  <br />
                  {get_office_status_element(leave)}
                  <br />
                  सम्बंधित सहायक (विभाग)/(अनुमानित)/Dealing Asstt.
                  (Deptt.)/(Estt.)
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
                  <p>{leave?.authority_comment}</p>

                  छुट्टी प्रदान करने के लिए सक्षम प्राधिकारी की टिप्पणियाँ: स्वीकृत / स्वीकृत नहीं<br />
                  Comments of the competent authority to grant leave: Sanctioned
                  / Not Sanctioned
                </div>
              </div>
              <br />
              <br />
              <div className="row">
                <div className="col-4"></div>
                <div className="col-8">
                  <p>{get_status_element(leave)}</p>
                  ((एचओडी / रजिस्ट्रार / डीन (संकाय मामले और प्रशासन)))
                  <br />
                  (HoD / Registrar / Dean(Faculty Affairs & Administration) )
                </div>
              </div>
            </div>
            <hr />
            {leave?.filename}
            {leave?.filename == "" || leave?.filename == undefined ? (
              <p>Attached Documents: No document attached</p>
            ) : (
              <p>
                Attached Documents:{" "}
                {downloadLink && (
                  <a href={downloadLink} download={leave?.filename}>
                    {leave?.filename}
                  </a>
                )}
              </p>
            )}
            <hr />
          </div>
          <div>
            {(from === "check_applications" && ['hod', 'dean', 'faculty'].includes(currentUser?.position)) ? (
              <>
                <Row>
                  <Col>
                    <div className="text-center">
                      <textarea
                        id={"comment-" + leave?.leave_id}
                        placeholder="Add Comment"
                        style={{ width: "250px" }}
                      ></textarea>
                    </div>
                  </Col>
                  <Col>
                    <span style={{ textAlign: "left" }}>Your signature will appear here if you have updated this in you profile section<br /></span>
                    <div className={"signature-box"}>
                      <img src={sigUrl} />
                    </div>
                  </Col>

                </Row>

                <button
                  disabled={disablButton}
                  style={{display: (leave?.status.toLowerCase().startsWith("approved") ? "none": "")}}
                  type="button"
                  className="btn btn-outline-success"
                  onClick={async () => {
                    setDisableButton(true);
                    await approveLeave(leave?.leave_id);
                    setDisableButton(false);
                  }}
                >
                  Approve
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button
                  disabled={disablButton}
                  style={{display: (leave?.status.toLowerCase().startsWith("disapproved")? "none": "")}}
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={async () => {
                    setDisableButton(true);
                    await disapproveLeave(leave?.leave_id);
                    setDisableButton(false);
                  }}
                >
                  Disapprove
                </button>{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button
                  type="button"
                  disabled={disablButton}
                  className="btn btn-outline-primary"
                  onClick={async () => {
                    setDisableButton(true);
                    await addComment(leave?.leave_id);
                    setDisableButton(false);
                  }}
                >
                  Add Comment
                </button>
              </>
            ) : (
              ""
            )}
            {(from === "check_applications" && ['office'].includes(currentUser?.position)) ? (
              <>
                <Row>
                  <Col>
                    <span style={{ textAlign: "left" }}>Your signature will appear here if you have updated this in you profile section<br /></span>
                    <div className={"signature-box"}>
                      <img src={sigUrl} style={{
                        maxHeight: "60px",
                        maxWidth: "450px",
                        width: "40%",
                      }} />
                    </div>
                  </Col>
                </Row>

                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={async () => {
                    await submitOfficeSignature(leave?.leave_id);
                  }}
                >
                  Submit your signature
                </button>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default LeavePDFModals;
