import React from "react";
import httpClient from "../../httpClient";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FaDownload } from "react-icons/fa";
import { Row, Col } from "react-bootstrap"

const PGLeavePdfModal = ({ toast, from }) => {
  const [leave, setLeave] = useState(null);
  const { currentUser } = useAuth();
  let currentUrl =
    window.location.href.split("/")[window.location.href.split("/").length - 1];
  const leave_id = currentUrl;
  const [signatureDataURL, setSignatureDataUrl] = useState(null)
  const [downloadLink, setDownloadLink] = useState(null);
  const [leaveNature, setLeaveNature] = useState("")
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
    console.log(!sigUrl)
    if (!sigUrl) {
      binaryData = null;
    } else {
      let arrayBuffer = await dataURItoBlob(sigUrl)?.arrayBuffer();
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
      toast.error(error, toast.POSITION.BOTTOM_RIGHT);
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
    } catch (error) {
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
      toast.success("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  };

  const fetchLeaveInfo = async () => {
    try {
      const resp = await httpClient.post(
        `${process.env.REACT_APP_API_HOST}/get_leave_info_by_id`,
        { leave_id }
      );
      if (resp.data.status == "success") {
        let data = resp.data.data[0];
        if (currentUser?.signature && from == "check_applications") {
          setSigUrl(currentUser.signature)
        }
        setLeaveNature()
        setLeave(data);
        if (data.signature && data.signature[0]) {
          const imageUrl = "data:image/png;base64," + String(data.signature);
          setSignatureDataUrl(imageUrl);
        }
        if (data.filename) {
          await handleDownloadClick('leave_document', data.filename)
        }

      } else {
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

  function get_date(date) {
    if (!date) return null;
    date = new Date(date)
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    return formattedDate
  }

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

  function get_status_element(leave, position = null) {
    if (!leave) return ''
    let status = leave?.status.toLowerCase();
    let imageUrl = "";
    if (position == "ta_instructor" && leave.ta_sig && leave.ta_sig[0]) {
      imageUrl = "data:image/png;base64," + String(leave.ta_sig);
    } else if (position == "advisor" && leave.advisor_sig && leave.advisor_sig[0]) {
      imageUrl = "data:image/png;base64," + String(leave.advisor_sig);
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
    return leave?.int_status
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

  function DisplayNature(nature) {
    if (!nature) return;
    nature = nature.split(" ")[0].toUpperCase();

    return (
      <div className="nature-container">
        <span className="nature">{nature}</span>
        {nature === 'CASUAL' ? (
          <span className="arrow">&rarr;</span>
        ) : nature === 'DUTY' ? (
          <span className="arrow">&rarr;</span>
        ) : null}
      </div>
    );
  }

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
            <div
              className="row"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div className="col-1" style={{ flex: "0 0 auto" }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/f/f9/Indian_Institute_of_Technology_Ropar_logo.png"
                  // width="150px"
                  // height="150px"
                  height="100px"
                  width="auto"
                  // max-width="50px"
                  style={{ float: "left" }}
                />
              </div>
              <div
                className="col-11"
                style={{ flex: "1 1 auto", textAlign: "center" }}
              >
                {/* <h3 style={{ marginBottom: "0px" }}>
                  भारतीय प्रौद्योगिकी संस्थान रोपड़
                </h3> */}
                <h3 style={{ marginBottom: "0px" }}>
                  INDIAN INSTITUTE OF TECHNOLOGY ROPAR
                </h3>
                <h5>
                  LEAVE APPLICATION FORM FOR PG
                </h5>
                <h5>
                  {leave?.nature}
                </h5>
              </div>
            </div>


            <div className="leave-details text-center">
              <div className="row leave-details-heading">
                <div className="col-3"></div>
                <div className="col-12 text-center">

                </div>
              </div>

              <div
                className="row"
                style={{ marginTop: "15px", fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  1.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Name of the student
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  {leave?.name}
                </div>
              </div>
              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  2.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Entry No.
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  {leave?.entry_number?.toUpperCase()}
                </div>
              </div>
              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  3.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Purpose of leave(whether attending conference/workshop/seminar any other)
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  {leave?.purpose}
                </div>
              </div>
              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  4.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Name of Venue of the Conference/Workshop/Seminar (in case of Duty Leave)
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  <p>{leave?.venue}</p>
                  {/* <p>From: {leave?.start_date.split("00:00:0}से/To ___________ तक</p> */}
                </div>
              </div>

              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  5.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Actual Dates of Conference/Workshop/Seminar <br />
                </div>
                <div className="col-6" style={{ textAlign: "left" }}>
                  <div
                    className="row"
                    style={{ fontSize: "14px", minHeight: "38.6px" }}
                  >
                    <div
                      className="col-6"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      From:
                    </div>
                    <div
                      className="col-6"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      To:
                    </div>

                  </div>

                  <div
                    className="row"
                    style={{ fontSize: "14px", minHeight: "38.6px" }}
                  >
                    <div
                      className="col-6"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      {get_date(leave?.duty_start_date)}
                    </div>
                    <div
                      className="col-6"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      {get_date(leave?.duty_end_date)}
                    </div>

                  </div>
                  {/* <p>From: {leave?.start_date.split("00:00:0}से/To ___________ तक</p> */}
                </div>
              </div>

              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  6.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Period of Leave & No. of days <br />
                </div>
                <div className="col-6" style={{ textAlign: "left" }}>
                  <div
                    className="row"
                    style={{ fontSize: "14px", minHeight: "38.6px" }}
                  >
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      From:
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      To:
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      No. of days
                    </div>
                  </div>

                  <div
                    className="row"
                    style={{ fontSize: "14px", minHeight: "38.6px" }}
                  >
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      {get_date(leave?.start_date)}
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      {get_date(leave?.end_date)}
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{leave?.duration}</p>
                    </div>
                  </div>
                  {/* <p>From: {leave?.start_date.split("00:00:0}से/To ___________ तक</p> */}
                </div>
              </div>

              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  7.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Prefix/Suffix
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  {leave?.prefix_suffix}
                </div>
              </div>

              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  8.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Leave(s) availed till date<br></br>
                  (Except duty Leave)
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  {leave?.taken_pg_leaves}
                </div>
              </div>

              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  9.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Balance of Leave<br></br>
                  (Except duty Leave)
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  {leave?.total_pg_leaves - leave?.taken_pg_leaves}
                </div>
              </div>


              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >

                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  10.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Whether Station leave
                  is required
                </div>
                <div className="col-6" style={{ textAlign: "left" }}>
                  <div
                    className="row"
                    style={{ border: "1px solid", minHeight: "38.6px" }}
                  >
                    Yes /No : If yes :{" "}
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
                    <div className="col-3" style={{ textAlign: "left" }}>
                      From {get_date(leave?.station_start_date)}
                    </div>

                    <div className="col-3" style={{ textAlign: "left" }}>
                      To{" "}
                      {get_date(leave?.station_end_date)}
                    </div>

                  </div>
                </div>
              </div>


              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  11.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Address during the leave
                </div>
                <div className="col-6" style={{ textAlign: "left" }}>
                  <div
                    className="row"
                    style={{
                      height: "38px",
                      fontSize: "14px",
                      minHeight: "38.6px",
                    }}
                  >
                    <div
                      className="col-12"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      <p>{leave?.address}</p>
                    </div>
                  </div>
                  <div
                    className="row"
                    style={{
                      height: "38px",
                      fontSize: "14px",
                      minHeight: "38.6px",
                    }}
                  >
                    <div
                      className="col-8"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      <p></p>
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      PIN:
                    </div>
                  </div>

                  <div
                    className="row"
                    style={{
                      height: "38px",
                      fontSize: "14px",
                      minHeight: "38.6px",
                    }}
                  >
                    <div
                      className="col-12"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      <p>Contact No. {leave?.mobile}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="row"
                style={{ fontSize: "14px", minHeight: "38.6px" }}
              >
                <div
                  className="col-1"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  7.
                </div>
                <div
                  className="col-5"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  Remarks(if any)
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  {leave?.remarks}
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
                  Signature with date of the
                  applicant
                </div>
              </div>


            </div>

            {/* <hr /> */}


            <div
              className="establishment-office text-center"
              id={"leave-footer-" + leave?.leave_id}
            >
              <br />
              <br />
              <div className="row">
                <div className="col-4">
                  {get_status_element(leave, "advisor")}<br />
                  Signature of TA instructor
                </div>
                <div className="col-4">

                </div>
                <div className="col-4">
                  {get_status_element(leave, "ta_instructor")}<br />
                  Faculty Advisor
                </div>
              </div>


            </div>

            <hr />

            <div className="row" style={{ border: "1px solid" }}>
              <div className="col-4" style={{ border: "1px solid" }}>
                Balance as on Date /<br />
              </div>
              <div className="col-4" style={{ border: "1px solid" }}>
                Leave Applied For (No. of days) /<br />
              </div>
              <div className="col-4" style={{ border: "1px solid" }}>
                Balance / <br />
              </div>
            </div>
            <div className="row">
              <div className="col-4" style={{ border: "1px solid" }}>
                {leave ? (leave.total_pg_leaves - leave.taken_pg_leaves) : ""}
                { }
              </div>
              <div className="col-4" style={{ border: "1px solid" }}>
                {leave?.duration}
              </div>
              <div className="col-4" style={{ border: "1px solid" }}>
                {leave ? (leave.total_pg_leaves - leave.taken_pg_leaves - leave.duration) : ""}
              </div>
            </div>
            <hr />

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
                  disabled={disablButton}
                  style={{display: (leave?.status.toLowerCase().startsWith("approved")? "none": "")}}
                  className="btn btn-outline-success"
                  onClick={async () => {
                    setDisableButton(true);
                    await approveLeave(leave?.leave_id);
                    setDisableButton(true);
                  }}
                >
                  Approve
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button
                  type="button"
                  disabled={disablButton}
                  style={{display: (leave?.status.toLowerCase().startsWith("disapproved")? "none": "")}}
                  className="btn btn-outline-danger"
                  onClick={async () => {
                    setDisableButton(true);
                    await disapproveLeave(leave?.leave_id);
                    setDisableButton(false);
                  }}
                >
                  Disapprove
                </button>{" "}
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

export default PGLeavePdfModal;
