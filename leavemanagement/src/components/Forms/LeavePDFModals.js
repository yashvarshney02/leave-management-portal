import React from "react";
import httpClient from "../../httpClient";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Document, Page } from 'react-pdf';

const LeavePDFModals = ({ toast, from }) => {
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
                  आवश्यक छुट्टी का मवरूऩ : आकस्ममक छुट्टी /
                  राज.अव./त्रव.आ.छुट्टी <br />
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
                  उद्देश्य / Purpose (के वऱ त्रवशेष आकस्ममक छुट्टी के लऱए लनमॊिण
                  ऩि की प्रलत सॊऱगन करं) /<br />
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
                  कऺाएॊ, प्रशासलनक स्जम्मेदारी आदद (यदद कोई हो तो) के लऱए
                  वैकस्पऩक व्यवमथा /<br />
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
                  छुट्टी के दौरान का ऩता
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
              <div className="row">
                <div className="col-6">
                  <br />
                  <br />
                  <br />
                  सॊबॊलधत सहायक (त्रवभाग)/(मथाऩना)/Dealing Asstt.
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
                  छुट्टी प्रदान करनेके लऱए सऺम प्रालधकारी की दटप्ऩणी: मवीकृ
                  त/अमवीकृ त<br />
                  Comments of the competent authority to grant leave: Sanctioned
                  / Not Sanctioned
                </div>
              </div>
              <br />
              <br />
              <div className="row">
                <div className="col-4"></div>
                <div className="col-8">
                  <p>{leave?.status}</p>
                  (त्रवभागाध्यऺ / कु ऱसलिव / अलधष्ठाता (सॊकाय मामऱेएवॊप्रशासन) /
                  लनदेशक)
                  <br />
                  (HoD / Registrar / Dean(Faculty Affairs & Administration) )
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

export default LeavePDFModals;
