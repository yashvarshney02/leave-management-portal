import React from "react";
import httpClient from "../../httpClient";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FaDownload } from "react-icons/fa";
import { Row, Col } from "react-bootstrap"
import SignaturePad from 'react-signature-canvas';
import { useNavigate } from "react-router-dom";

const LeavePDFModalsNonCasual = ({ toast, from }) => {
  const [leave, setLeave] = useState(null);
  const { currentUser } = useAuth();
  let currentUrl =
    window.location.href.split("/")[window.location.href.split("/").length - 1];
  const leave_id = currentUrl;
  const [signatureDataURL, setSignatureDataUrl] = useState(null)
  const [downloadLink, setDownloadLink] = useState(null);
  const navigate = useNavigate();
  const [disablButton, setDisableButton] = useState(false);

  const [sigUrl, setSigUrl] = useState();


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
    if (!sigUrl) {
      binaryData = null;
    } else {
      let arrayBuffer = await dataURItoBlob(sigUrl).arrayBuffer();
      binaryData = new Uint8Array(arrayBuffer);
    }
    try {
      const arrayBuffer = await dataURItoBlob(sigUrl).arrayBuffer();
      const binaryData = new Uint8Array(arrayBuffer);
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
        if (from == "past_applications" && data.email != currentUser.email) {
          navigate("/navigate/pastapplications");
        }
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

      });
  };

  function get_status_element(leave, position = null) {
    if (!leave) return ''
    let status = leave?.status.toLowerCase();
    let imageUrl = "";
    if (position == "hod" && leave.hod_sig && leave.hod_sig[0]) {
      imageUrl = "data:image/png;base64," + String(leave.hod_sig);
    } else if (position == "dean" && leave.dean_sig && leave.dean_sig[0]) {
      imageUrl = "data:image/png;base64," + String(leave.dean_sig);
    } else if (!position && status.startsWith("approved") && status.includes("hod")) {
      if (leave.hod_sig && leave.hod_sig[0]) {
        imageUrl = "data:image/png;base64," + String(leave.hod_sig);
      }
    } else if (!position && status.startsWith("approved") && status.includes("dean")) {
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
                <h3 style={{ marginBottom: "0px" }}>
                  भारतीय प्रौद्योगिकी संस्थान रोपड़
                </h3>
                <h3 style={{ marginBottom: "0px" }}>
                  INDIAN INSTITUTE OF TECHNOLOGY ROPAR
                </h3>
                <p style={{ marginBottom: "0px" }}>
                  <span style={{ fontWeight: "bold" }}>
                    नंगल विभाग रूपनगर,पंजाब-140001
                  </span>{" "}
                  / Nangal Road, Rupnagar, Punjab-140001
                </p>
                <p style={{ marginBottom: "0px" }}>
                  दूरभाष/Tele:+91-1881-227088, फेक्स/Fax :+91-1881-223395
                </p>
              </div>
            </div>

            <hr
              style={{
                border: "2px solid #000000",
                borderColor: "black",
                margin: "2px",
              }}
            />

            <div className="leave-details text-center">
              <div className="row leave-details-heading">
                <div className="col-3"></div>
                <div className="col-12 text-center">
                  <p
                    style={{
                      fontSize: "15px",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    छुट्टी केललए अथवा छुट्टी बढाने हेतु आवेदन / Application for
                    leave or Extension of Leave
                  </p>
                  <p
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >

                    (अर्जित अवकाश/अर्ध वेतन अवकाश/असाधारण अवकाश/परिवर्तित अवकाश/अवकाश/प्रसूति अवकाश/पितृत्व अवकाश/बाल देखभाल अवकाश)
                  </p>
                  <p
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >
                    (Earned Leave/Half Pay Leave/Extra Ordinary Leave/Commuted
                    Leave/Vacation/Maternity Leave/Paternity Leave/Child Care
                    Leave)
                  </p>
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
                  1. आवेदक का नाम/ Name of the applicant
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
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  2. पद धारित / Post held
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  {leave?.position.toUpperCase()}
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
                  3.विभाग/कार्यालय/अनुभाग/Department./Office/Section
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  {leave?.department?.toUpperCase()}
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
                  4. आवेवदत छुट्टी का प्रकार/ Nature of Leave applied for
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  <p>{leave?.type_of_leave}</p>
                  {/* <p>From: {leave?.start_date.split("00:00:0}से/To ___________ तक</p> */}
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
                  5. छुट्टी की अवधि/ Period of Leave <br />
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
                      से/ From:
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      तक/To:
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "12px",
                      }}
                    >
                      दिनों की संख्या/No. of days
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
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  6. रविवार और अवकाश, यदि कोई हो, को छुट्टी के पहले/प्रत्यय में लगाने का प्रस्ताव है
                  <br></br>
                  Sunday and Holiday, if any, proposed to be prefixed/suffixed
                  to leave
                </div>
                <div className="col-6" style={{ textAlign: "left" }}>
                  <div
                    className="row"
                    style={{ fontSize: "14px", minHeight: "38.6px" }}
                  >
                    <div
                      className="col-2"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >

                      प्रत्यय
                      <br />
                      Suffix
                    </div>
                    <div
                      className="col-2"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      से/ From:
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      तक/To:
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "12px",
                      }}
                    >
                      दिनों की संख्या/No. of days
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
                      {get_date(leave?.suffix_start_date)}
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      {get_date(leave?.suffix_end_date)}
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

                  <div
                    className="row"
                    style={{ fontSize: "14px", minHeight: "38.6px" }}
                  >
                    <div
                      className="col-2"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      के पूर्व
                      <br />
                      Prefix
                    </div>
                    <div
                      className="col-2"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      से/ From:
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      तक/To:
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "12px",
                      }}
                    >
                      दिनों की संख्या/No. of days
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
                      {get_date(leave?.prefix_start_date)}
                    </div>
                    <div
                      className="col-4"
                      style={{
                        textAlign: "left",
                        border: "1px solid",
                        fontSize: "14px",
                      }}
                    >
                      {get_date(leave?.prefix_end_date)}
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
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  7. उद्देश्य / Purpose
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
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  8. कक्षाओं, प्रशासनिक जिम्मेदारियों के लिए वैकल्पिक व्यवस्था,
                  आदि (यदि कोई हो)/<br />
                  Alternative arrangements for classes, administrative
                  responsibilities, etc. (if any)
                </div>
                <div
                  className="col-6"
                  style={{ textAlign: "left", border: "1px solid" }}
                >
                  These are alternative arrangements
                  <br />
                  {leave?.alt_arrangements}
                </div>
              </div>

              <div
                className="row"
                style={{
                  border: "1px solid",
                  fontSize: "14px",
                  minHeight: "38.6px",
                }}
              >
                <div className="col-12" style={{ textAlign: "left" }}>
                  9.
                  मैं अवकाश के दौरान ब्लॉक वर्षों के लिए अवकाश यात्रा रियायत का लाभ लेने का प्रस्ताव करता हूं/नहीं करता हूं। / I
                  propose/do not propose to avail myself of Leave Travel
                  Concession for the block years__________________ during the
                  leave.
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
                  10. छुट्टी के दौरान पता / Address during the leave
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
                      <p></p>
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
                      वपन/PIN:
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
                      <p>दरूभाष/ Contact No. {leave?.mobile}</p>
                    </div>
                  </div>
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
                  11. क्या स्टेशन छुट्टी की आवश्यकता है/Whether Station leave
                  is required
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
          </div>
          <hr />

          <div className='container' id={"second-page-" + leave?.leave_id} style={{ width: "1000px" }}>
            <div>
              <p style={{ fontWeight: "bold", textDecoration: "underline	" }}>

                नियंत्रण अधिकारी की अभ्युक्तियां और सिफारिशें
                / Remarks and
                Recommendations of the controlling officer
              </p>
              <div className="row">
                <p style={{ textAlign: "right" }}>
                  अनुशंसित / अनुशंसित नहीं
                  <br />
                  Recommended/not recommended
                </p>
              </div>
              <div className="row">
                <p>
                  <br />
                  <br />
                </p>
              </div>
              <div className="row">
                <p style={{ textAlign: "right" }}>{get_status_element(leave, "hod")}</p>
                <p style={{ textAlign: "right" }}>
                  दिनांक सहित हस्ताक्षर विभागाध्यक्ष/अनुभाग प्रभारी
                  <br />
                  Signature with date Head of Department/Section In-charge
                </p>
              </div>
            </div>

            <hr />
            <div
              className="establishment-office text-center"
              id={"leave-footer-" + leave?.leave_id}
            >
              <p>
                <b style={{ textDecoration: "underline" }}>
                  प्रशासन अनुभाग द्वारा उपयोग के लिए/ For use by the
                  Administration Section
                </b>
              </p>
              <p style={{ textAlign: "left" }}>

                प्रमाणित किया जाता है कि <u>{get_date(leave?.start_date)}</u> से <u>{get_date(leave?.end_date)}</u> की <u>{leave?.duration}</u> (अवधि) के लिए <u>{leave?.type_of_leave}</u> (अवकाश की प्रकृति) के लिए निम्नलिखित विवरण के अनुसार उपलब्ध है:<br />
                Certified that <u>{leave?.nature}</u> (nature of leave) for <u>{leave?.duration}</u>
                period, from <u>{get_date(leave?.start_date)}</u> To <u>{get_date(leave?.end_date)}</u> is available as per
                following details:
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
                  {leave?.total_casual_leaves - leave?.taken_casual_leaves}
                </div>
                <div className="col-4" style={{ border: "1px solid" }}>
                  {leave?.duration}
                </div>
                <div className="col-4" style={{ border: "1px solid" }}>
                  {leave?.total_casual_leaves -
                    leave?.taken_casual_leaves -
                    leave?.duration}
                </div>
              </div>
              <br />

              <br />
              <br />
              <br />
              <div className="row">
                <div className="col-4">
                  {get_office_status_element(leave)}<br />
                  सम्बंधित सहायक (विभाग)/(अनुमानित)/Dealing Asstt.
                  (Deptt.)/(Estt.)
                </div>
                <div className="col-4">
                  अधी./सहा.कु ऱसलिव/उऩकु ऱसलिव/Supdt./AR/DR
                </div>
                <div className="col-4">रजिस्ट्रार/Registrar</div>
              </div>
            </div>
            <hr />
            <div className="footer">
              <div className="row" style={{ textAlign: "right" }}>
                <div className="col-4"></div>
                <div className="col-8">
                  <p>{leave?.authority_comment}</p>
                  छुट्टी प्रदान करने के लिए सक्षम प्राधिकारी की टिप्पणियाँ: स्वीकृत
                  / स्वीकृत नहीं<br />
                  Comments of the competent authority to grant leave: Sanctioned
                  / Not Sanctioned
                  <br />
                  <p>{get_status_element(leave, "dean")}</p>
                </div>
              </div>
              <br />
              <br />
              <div className="row" style={{ textAlign: "right" }}>
                <div className="col-4"></div>
                <div className="col-8">
                  कुलसवाव/अवधष्ठाता (संकार् मामलेएवं प्रशासन)/वनदेशक के
                  हस्ताक्षि
                  <br />
                  Signature of Registrar / Dean(Faculty Affairs &
                  Administration) / Director
                </div>
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
                    setDisableButton(false);
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
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button
                  disabled={disablButton}
                  type="button"
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

export default LeavePDFModalsNonCasual;
