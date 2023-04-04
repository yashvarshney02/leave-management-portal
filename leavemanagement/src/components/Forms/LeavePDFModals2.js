import React from "react";
import httpClient from "../../httpClient";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Document, Page } from 'react-pdf';

const LeavePDFModalsNonCasual = ({ toast, from }) => {
	const [leave, setLeave] = useState(null);
	const { currentUser } = useAuth();
	let currentUrl =
		window.location.href.split("/")[window.location.href.split("/").length - 1];
	const leave_id = parseInt(currentUrl);
	const [signatureDataURL, setSignatureDataUrl] = useState(null)
	const [downloadLink, setDownloadLink] = useState(null);

	const approveLeave = async (leave_id) => {
		try {
			const resp = await httpClient.post(
				`${process.env.REACT_APP_API_HOST}/approve_leave`,
				{ leave_id, level: currentUser.level }
			);
			if (resp.data.status == "error") {
				toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
			} else {
				toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
			}
		} catch (error) {
			toast.success("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
		}
	};
	const addComment = async (leave_id) => {
		try {
			const uid = "comment-" + leave_id;
			const comment = document.getElementById(uid).value;
			const resp = await httpClient.post(
				`${process.env.REACT_APP_API_HOST}/add_comment`,
				{ comment, leave_id }
			);
			if (resp.data.status == "error") {
				toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
			} else {
				toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
			}
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
				let data = resp.data.data[0]					
				setLeave(data);
				const imageUrl = "data:image/png;base64," + String(data.signature);
				setSignatureDataUrl(imageUrl);
				if (data.file_name) {
					await handleDownloadClick('leave_document', data.file_name)
				}

			} else {
			}
		} catch (error) {
			console.log(error);
			toast.success("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
		}
	};

	const disapproveLeave = async (leave_id) => {
		try {
			const resp = await httpClient.post(
				`${process.env.REACT_APP_API_HOST}/disapprove_leave`,
				{ leave_id }
			);
			if (resp.data.status == "error") {
				toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
			} else {
				toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
			}
		} catch (error) {
			toast.success("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
		}
	};

	const handleDownloadClick = async (query, file_name = null) => {
		const response = await httpClient.post(`${process.env.REACT_APP_API_HOST}/sample_csvs`, {
			name: query,
			file_name: file_name
		})
		const encodedData = response.data.data;
		const decodedData = atob(encodedData);
		const blob = new Blob([response.data], { type: 'application/pdf' });
		const url = window.URL.createObjectURL(blob);
		setDownloadLink(url);
	};

	function get_date(date) {	
		if (!date)	return null;
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
                    छुट्टी केललए अथवा छुट्टी बढानेहेतुआवेदन / Application for
                    leave or Extension of Leave
                  </p>
                  <p
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >
                    आकस्मिक छुट्टी/ राजपत्रित अवकाश / विशेष आकस्मिक छुट्टि
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
                  3.ववभाग/कार्ाालर्/अनुभाग/Department./Office/Section
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
                  4. आवेवदत छुट्टी का प्रकाि/ Nature of Leave applied for
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
                  5. छुट्टी की अववध/ Period of Leave <br />
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
                      वदनों की संख्र्ा/No. of days
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
                  6. र्वद कोई, िवववाि औि अवकाश, छुट्टी सेपूवार्ा पश्ाात म /वलए
                  जा िहे हैं
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
                      के पश् ाात
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
                      वदनों की संख्र्ा/No. of days
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
                      केपूवा
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
                      वदनों की संख्र्ा/No. of days
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
                  7. उद्देश्र् / Purpose
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
                  8. कऺाएॊ, प्रशासलनक स्जम्मेदारी आदद (यदद कोई हो तो) के लऱए
                  वैकस्पऩक व्यवमथा /<br />
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
                  9. मैं_______________ब्लॉक वर्ाकी छुट्टी केदौिान छुट्टी
                  र्ात्रा रिर्ार्त लेनेहतेुइच्छुक ह ूँ/ नहीं ह ूँ। / I
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
                  10. छुट्टी केदौिान का पता / Address during the leave
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
                      <p>सपं कानं./ Contact No. {leave?.mobile}</p>
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
                  11. क्र्ा स्टेशन छोड़ने की आवश्र्कता है/Whether Station leave
                  is required
                </div>
                <div className="col-6" style={{ textAlign: "left" }}>
                  <div
                    className="row"
                    style={{ border: "1px solid", minHeight: "38.6px" }}
                  >
                    हाूँ/ना /Yes /No : र्वद हाूँ तो /If yes :{" "}
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
                    {signatureDataURL && (
                      <img
                        style={{
                          maxHeight: "60px",
                          maxWidth: "450px",
                          width: "40%",
                        }}
                        src={signatureDataURL}
                        alt="Signature"
                      />
                    )}
                  </div>
                  <br />
                  आवेदक के हस्ताक्षर तारीख साहित/Signature with date of the
                  applicant
                </div>
              </div>
            </div>

            <hr />

            <div>
              <p style={{ fontWeight: "bold", textDecoration: "underline	" }}>
                लनयंत्रक अलर्कारी की लिप्पणी एवंलसफाररश/ Remarks and
                Recommendations of the controlling officer
              </p>
              <div className="row">
                <p style={{ textAlign: "right" }}>
                  वसफारिश की गई/वसफारिश नहीं की गई
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
                <p style={{ textAlign: "right" }}>
                  ववभागाध्र्क्ष एवंअनुभाग प्रभािी केहस्ताक्षि वदनांक सवहत
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
                  प्रशासलनक अनुभाग द्वारा प्रयोग हेतु/ For use by the
                  Administration Section
                </b>
              </p>
              <p style={{ textAlign: "left" }}>
                प्रमावित वकर्ा जाता है वक _______________ से
                ______________की______________(अववध) के वलए______________(छुट्टी
                का प्रकाि) वनम्न वदए गए ववविि केअनुसाि स्वीकाि की जाती है।
                Certified that ____________ (nature of leave) for_____________
                period, from____________ To____________ is available as per
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
                  सॊबॊलधत सहायक (त्रवभाग)/(मथाऩना)/Dealing Asstt.
                  (Deptt.)/(Estt.)
                </div>
                <div className="col-4">
                  अधी./सहा.कु ऱसलिव/उऩकु ऱसलिव/Supdt./AR/DR
                </div>
                <div className="col-4">कुलसवाव/Registrar</div>
              </div>
            </div>
            <hr />
            <div className="footer">
              <div className="row" style={{ textAlign: "right" }}>
                <div className="col-4"></div>
                <div className="col-8">
                  <p>{leave?.authority_comment}</p>
                  छुट्टी प्रदान करनेके लऱए सऺम प्रालधकारी की दटप्ऩणी: मवीकृ
                  त/अमवीकृ त<br />
                  Comments of the competent authority to grant leave: Sanctioned
                  / Not Sanctioned
                  <br />
                  <p style={{ color: "green", fontWeight: "bold" }}>
                    {leave?.status}
                  </p>
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
            {leave?.file_name == "" || leave?.file_name == undefined ? (
              <p>Attached Documents: No document attached</p>
            ) : (
              <p>
                Attached Documents:{" "}
                {downloadLink && (
                  <a href={downloadLink} download={leave?.file_name}>
                    {leave?.file_name}
                  </a>
                )}
              </p>
            )}
            <hr />
          </div>
          {from === "check_application" ? (
            <div className="text-center">
              <textarea
                id={"comment-" + leave?.leave_id}
                placeholder="Add Comment"
                style={{ width: "250px" }}
              ></textarea>
            </div>
          ) : (
            ""
          )}
          <div>
            {from === "check_applications" ? (
              <>
                <div className="text-center">
                  <textarea
                    id={"comment-" + leave?.leave_id}
                    placeholder="Add Comment"
                    style={{ width: "250px" }}
                  ></textarea>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={async () => {
                    await approveLeave(leave?.leave_id);
                  }}
                >
                  Approve
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={async () => {
                    await disapproveLeave(leave?.leave_id);
                  }}
                >
                  Disapprove
                </button>{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    addComment(leave?.leave_id);
                  }}
                >
                  Add Comment
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
