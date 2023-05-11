import React, { useState, useRef, useEffect } from 'react'
import httpClient from '../../httpClient';
import "./ApplyForm.css"
import LoadingIndicator from '../LoadingIndicator';
import { useAuth } from '../../contexts/AuthContext';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import "./Form.css";
import { useNavigate } from 'react-router-dom';

export default function PGApplyLeave({ toast }) {
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const [typesOfLeave, setTypesofLeave] = useState(["CASUAL LEAVE", "RESTRICTED HOLIDAY", "SPECIAL CASUAL LEAVE"])
	const [duration, setDuration] = useState(0);
	const [document, setDocument] = useState();
	const [fileName, setFileName] = useState("");
	const [displaySpecialFields, setDisplaySpecialFields] = useState("none");
	const [displayStationLeaveDates, setDisplayStationLeaveDates] = useState("")
	const [dateErrorMessage, setDateErrorMessage] = useState("");
	const [formLoading, setFormLoading] = useState(false);
	const [sigUrl, setSigUrl] = useState("");
	const [disablButton, setDisableButton] = useState(false);

	const sigPadRef = useRef();
	const formRef = useRef()

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

	function getToday() {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0"); // add leading zero if needed
		const day = String(today.getDate()).padStart(2, "0"); // add leading zero if needed
		const todayString = `${year}-${month}-${day}`;
		return todayString
	}

	const handleInputChange = async (e) => {
		return
	};

	const handleFileInputChange = (e) => {
		const file = e.target.files[0];
		const fileSize = file.size;
		setDocument(file)
		if (fileSize > 1 * 1024 * 1024) {
			alert("File size must be less than 1MB");
			return;
		}
		setFileName(`${currentUser.user_id}_${Date.now()}_${file.name}`);
	};

	const clear = () => {
		sigPadRef.current.clear();
	};

	useEffect(() => {
		setSigUrl(currentUser.signature)
	}, [])



	const handleSubmit = async (e) => {
		try {
			e.preventDefault();
			let form_data = {}
			formRef.current.querySelectorAll('input').forEach((input) => {
				if (input.type == "file") {
					return;
				}
				form_data[input.id] = input.value == '' ? null : input.value;
			});
			formRef.current.querySelectorAll('select').forEach((input) => {
				form_data[input.id] = input.value == '' ? null : input.value;
			});
			formRef.current.querySelectorAll('textarea').forEach((input) => {
				form_data[input.id] = input.value == '' ? null : input.value;
			});
			if (form_data['form_isStation'] == 'No') {
				form_data['form_station_sdate'] = null;
				form_data['form_station_edate'] = null;
			}
			form_data['form_rdate'] = getToday()
			form_data['form_advisor'] = currentUser.advisor
			form_data['form_ta_instructor'] = currentUser.ta_instructor
			if (!sigUrl) {
				form_data['signature'] = null;
				// toast.error("Signature can't be kept empty", toast.POSITION.BOTTOM_RIGHT);
				// setFormLoading(false);
				// return;
			} else {
				const arrayBuffer = await dataURItoBlob(sigUrl).arrayBuffer();
				const binaryData = new Uint8Array(arrayBuffer);			
				// return;
				form_data['signature'] = binaryData;
			}
			if (form_data['form_sdate'] && form_data['form_edate'] && (form_data['form_edate'] < form_data['form_sdate'])) {
				setDateErrorMessage('Start date must be less than end date');
				return;
			}			
			if (form_data['form_station_sdate'] && form_data['form_station_edate'] && (form_data['form_station_sdate'] > form_data['form_station_edate'])) {
				setDateErrorMessage('Station Start date must be less than end date');
				return;
			}
			if (form_data['form_duty_start'] && form_data['form_duty_end'] && (form_data['form_duty_start']  > form_data['form_duty_end'])) {
				setDateErrorMessage('Duty Start date must be less than end date');
				return;
			}
			// console.log(form_data);
			// return;
			setFormLoading(true);

			if (!sigUrl) {
				form_data['signature'] = null;
				// toast.error("Signature can't be kept empty", toast.POSITION.BOTTOM_RIGHT);
				// setFormLoading(false);
				// return;
			} else {
				const arrayBuffer = await dataURItoBlob(sigUrl).arrayBuffer();
				const binaryData = new Uint8Array(arrayBuffer);			
				// return;
				form_data['signature'] = binaryData;
			}
			form_data['form_filename'] = fileName;
			// return;
			const form = new FormData();
			form.append('data', JSON.stringify(form_data));
			form.append('file', document);
			try {
				const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/apply_leave`, form);
				if (resp.data.status == 'success') {
					toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
					setTimeout(() => {
						navigate("/navigate/pastapplications");
					}, 2000);
				} else {
					toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT)
				}
			} catch (error) {
				toast.error("Leave Application Unssucessful", toast.POSITION.BOTTOM_RIGHT)
			}
			setFormLoading(false);
		} catch (error) {
			console.log(error)
		}
	}


	const handleTypeOfLeave = (e) => {
		const propVal = e.target.value;
		if (propVal != "Duty Leave") {
			setDisplaySpecialFields("none")
		} else {
			setDisplaySpecialFields("")
		}
	}

	if (!currentUser?.name || currentUser?.name == '') {
		toast.error("You need to add you name on your profile section by clicking on edit icon", toast.POSITION.BOTTOM_RIGHT);
		setTimeout(() => {
			navigate("/");
		}, 3000);
	}


	return (
		<div className="container-al">
			<Card style={{ width: "100%" }}>
				<Card.Body style={{ width: "100%" }}>
					<Card.Title className="title-al" >Apply Leave</Card.Title>
					<Card.Text>
						<form ref={formRef} onSubmit={async (e) => { 
							setDisableButton(true);
							await handleSubmit(e);
							setDisableButton(false);
							}
						}							
						>
							<Container className="content-al">
								<div className="user-details-al">
									<div className="input-box-al">
										<div className="details-al">
											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_name" style={{ fontSize: "18px" }}>Name of the student <span style={{color: "red"}}>*</span></legend>
													<input required type="text" className="form-control" style={{ cursor: "not-allowed" }} id="form_name" value={currentUser.name} onChange={(e) => { handleInputChange(e) }} placeholder="Name" readonly disabled />
												</Col >
												<Col className="col-al">
													<legend htmlFor="form_email" style={{ fontSize: "18px" }}>Email <span style={{color: "red"}}>*</span></legend>
													<input required type="email" className="form-control" style={{ cursor: "not-allowed" }} id="form_email" value={currentUser.email} onChange={(e) => { handleInputChange(e) }} placeholder="Email" readonly disabled />
												</Col >
											</Row >
											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_entry_number" style={{ fontSize: "18px" }}>Entry Number <span style={{color: "red"}}>*</span></legend>
													<input required type="tel" className="form-control" style={{ cursor: "not-allowed" }} id="form_entry_number" defaultValue={currentUser.entry_number} onChange={(e) => { handleInputChange(e) }} placeholder="Entry Number" disabled />
												</Col >
												<Col className="col-al">
													<legend htmlFor="form_nature" style={{ fontSize: "18px" }}>Nature of leave <span style={{color: "red"}}>*</span></legend>
													<select required className="form-control" id="form_nature" onChange={(e) => { handleInputChange(e); handleTypeOfLeave(e) }}>
														<option value="">-- Select an option --</option>
														<option>Casual Leave</option>
														<option>Medical Leave</option>
														<option>Duty Leave</option>
													</select>
												</Col >
											</Row >
											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_isStation" style={{ fontSize: "18px" }}>Is it a station leave?</legend>
													<select required className="form-control" id="form_isStation" onChange={(e) => {
														if (e.target.value == 'Yes') {
															setDisplayStationLeaveDates("");
														} else {
															setDisplayStationLeaveDates("none")
														}
													}}>
														<option>Yes</option>
														<option>No</option>
													</select>
												</Col >
												<Col className="col-al">
													<legend htmlFor="form_duration" style={{ fontSize: "18px" }}>Duration of leave <span style={{color: "red"}}>*</span></legend>
													<input required type="number" className="form-control" id="form_duration" placeholder="Duration" />
												</Col >
											</Row >
											{
												displayStationLeaveDates == "none" ? "" : (
													<Row className="row-al" style={{ display: displayStationLeaveDates }}>
														<Col className="col-al">
															<legend htmlFor="form_station_sdate" style={{ fontSize: "18px" }}>Station Leave Start Date </legend>
															<input required type="date" id="form_station_sdate" placeholder="Pick start date" className="form-control" onChange={async (e) => { handleInputChange(e) }}></input>
														</Col >
														<Col className="col-al">
															<legend htmlFor="form_station_edate" style={{ fontSize: "18px" }}>Station Leave End Date</legend>
															<input required type="date" id="form_station_edate" placeholder="Pick end date" className="form-control" onChange={async (e) => { handleInputChange(e) }}></input>
														</Col >
													</Row >
												)
											}

											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_sdate" style={{ fontSize: "18px" }}>Start Date <span style={{color: "red"}}>*</span></legend>
													<input required type="date" id="form_sdate" placeholder="Pick start date" className="form-control" onChange={async (e) => { handleInputChange(e) }}></input>
												</Col >
												<Col className="col-al">
													<legend htmlFor="form_edate" style={{ fontSize: "18px" }}>End Date <span style={{color: "red"}}>*</span></legend>
													<input required type="date" id="form_edate" placeholder="Pick end date" className="form-control" onChange={async (e) => { handleInputChange(e) }} ></input>
												</Col >
											</Row >

											{
												displaySpecialFields == "none" ? "" : (
													<>
														<Row className="row-al" style={{ display: displaySpecialFields }}>
															<Col className="col-12">
																<p style={{ textAlign: "left", marginBottom: "2px", textDecoration: "underline" }}>Actual Dates of Conference/Workshop/Seminar(in case of Duty Leave) </p>
															</Col >

														</Row >

														<Row className="row-al" style={{ display: displaySpecialFields }}>
															<Col className="col-6">
																<legend htmlFor="form_duty_start" style={{ fontSize: "16px" }}>Start Date </legend>
																<input type="date" id="form_duty_start" placeholder="Pick start date" className="form-control" onChange={async (e) => { handleInputChange(e) }}></input>
															</Col >
															<Col className="col-6">
																<legend htmlFor="form_duty_end" style={{ fontSize: "16px" }}>End Date</legend>
																<input type="date" id="form_duty_end" placeholder="Pick end date" className="form-control" onChange={async (e) => { handleInputChange(e) }}></input>
															</Col >
														</Row >
													</>
												)
											}


											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_purpose" style={{ fontSize: "18px" }}>Purpose of leave </legend>
													<textarea id="form_purpose" className="form-control" onChange={(e) => { handleInputChange(e) }}>

													</textarea>
												</Col>
												<Col className="col-al">
													<legend htmlFor="form_prefix_suffix" style={{ fontSize: "18px" }}>Prefix/Suffix</legend>
													<textarea id="form_prefix_suffix" className="form-control" onChange={(e) => { handleInputChange(e) }}>

													</textarea>
												</Col>
											</Row>
											<Row className='row-al' style={{ display: displaySpecialFields }}>
												<Col className="col-al">
													<legend htmlFor="form_venue" style={{ fontSize: "18px" }}>Name of the venue of Conference/Workshop (in case of Duty Leave)</legend>
													<textarea id="form_venue" className="form-control" onChange={(e) => { handleInputChange(e) }}>

													</textarea>
												</Col>
											</Row>

											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_address" style={{ fontSize: "18px" }}>Address During Leave</legend>
													<textarea id="form_address" className="form-control" onChange={(e) => { handleInputChange(e) }}>

													</textarea>
												</Col>
											</Row>
											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_remarks" style={{ fontSize: "18px" }}>Remarks(if any) </legend>
													<textarea id="form_remarks" className="form-control" onChange={(e) => { handleInputChange(e) }}>

													</textarea>
												</Col>
											</Row>
											<div
												style={{
													textAlign: "left",
												}}
											>
												<input
													type="file"
													accept=".pdf"
													style={{ border: "none" }}
													max="1000000"
													onChange={handleFileInputChange}
												/>

											</div>

											<br />

											<Row className="row-al">
												<span style={{ textAlign: "left" }}>Your signature will appear here if you have updated this in you profile section<br /></span>
											</Row>

											<Row className='row-al'>
												<div className='signature-box'>
													<img src={sigUrl} style={{
														maxHeight: "60px",
														maxWidth: "450px",
														width: "40%",
													}}>
													</img>
												</div>
											</Row>
											<Row className="row-al">
												<Col>
													<button disabled={disablButton} type="submit" className="btn btn-primary btn-block">{formLoading ? <LoadingIndicator color={"white"}></LoadingIndicator> : "Apply Leave"}</button>
													<span style={{ color: "red" }}><br /> {dateErrorMessage}</span>
												</Col>
											</Row>
										</div>
									</div>
								</div>
							</Container>
						</form>
					</Card.Text>
				</Card.Body>
			</Card>
		</div >


	)
}
