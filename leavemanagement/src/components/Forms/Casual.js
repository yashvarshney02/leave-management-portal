import React, { useState, useRef } from 'react'
import httpClient from '../../httpClient';
import "./ApplyForm.css"
import LoadingIndicator from '../LoadingIndicator';
import { useAuth } from '../../contexts/AuthContext';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import SignaturePad from 'react-signature-canvas'
import "./Form.css";

export default function ApplyLeave({ toast }) {
	const { currentUser } = useAuth();
	const [typesOfLeave, setTypesofLeave] = useState(["CASUAL LEAVE", "RESTRICTED HOLIDAY", "SPECIAL CASUAL LEAVE", "ON DUTY"])
	const [duration, setDuration] = useState(0);
	const [document, setDocument] = useState()
	const [formData, setFormData] = useState({
		"form_duration": 0,
		"form_name": currentUser.name,
		"form_email": currentUser.email,
		"form_nature": "Casual Leave",
		"form_type_of_leave": "CASUAL LEAVE",
		"form_isStation": "Yes"
	});
	const [formLoading, setFormLoading] = useState(false);

	const sigPadRef = useRef();

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

	const handleInputChange = async (e) => {
		const propName = e.target.id;
		const propVal = e.target.value;
		setFormData({ ...formData, [propName]: propVal });
	};

	const handleFileInputChange = (e) => {
		const file = e.target.files[0];
		const fileSize = file.size;
		setDocument(file)
		if (fileSize > 1 * 1024 * 1024) {
			alert("File size must be less than 1MB");
			return;
		}
		setFormLoading(true);
		setFormData({ ...formData, "form_filename": `${currentUser.user_id}_${Date.now()}_${file.name}` });
	};

	const clear = () => {
		sigPadRef.current.clear();
	};



	const handleSubmit = async (e) => {
		try {
			e.preventDefault();
			// console.log(formData)		
			let dur = adjustDuration();
			if (isNaN(formData.form_duration)) {
				toast.error("Error, Check the duration again", toast.POSITION.BOTTOM_RIGHT);
				return;
			}
			else if (parseInt(formData.form_duration * 10) % (5) != 0) {
				toast.error("Error, Check the duration again", toast.POSITION.BOTTOM_RIGHT);
				return;
			}
			setFormLoading(true);
			const trimmedDataURL = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
			const arrayBuffer = await dataURItoBlob(trimmedDataURL).arrayBuffer();
			const binaryData = new Uint8Array(arrayBuffer);
			let form_data = formData
			form_data['form_duration'] = dur;
			form_data['signature'] = binaryData;
			const form = new FormData();
			form.append('data', JSON.stringify(form_data));
			form.append('file', document);
			try {
				const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/apply_leave`, form);
				if (resp.data.status == 'success') {
					toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT)
				} else {
					toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT)
				}
			} catch (error) {
				toast.error("Leave Application Unssucessful", toast.POSITION.BOTTOM_RIGHT)
			}
			setFormLoading(false);
		} catch (error) {
		}
	}

	const adjustDuration = (e) => {
		let startDate, endDate;
		endDate = new Date(formData.form_edate)
		startDate = new Date(formData.form_sdate);
		if (startDate && endDate && endDate >= startDate) {
			const differenceInMs = endDate.getTime() - startDate.getTime();
			const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);
			setDuration(differenceInDays + 1)
			setFormData({ ...formData, "form_duration": differenceInDays + 1 });
			return differenceInDays + 1
		}
		return 0;
	}

	const handleTypeOfLeave = (e) => {
		const propVal = e.target.value;
		if (propVal == "Casual Leave") {
			setTypesofLeave(["CASUAL LEAVE", "RESTRICTED HOLIDAY", "SPECIAL CASUAL LEAVE", "ON DUTY"])
		} else {
			setTypesofLeave(["Earned Leave", "Half Pay Leave", "Extra Ordinary Leave", "Commuted Leave", "Vacation", "Maternity Leave", "Paternity Leave", "Child Care Leave"])
		}
	}

	return (
		<div className="container-al">
			<Card style={{ width: "100%" }}>
				<Card.Body style={{ width: "100%" }}>
					<Card.Title className="title-al" >Casual Leave</Card.Title>
					<Card.Text>
						<form onSubmit={async (e) => { await handleSubmit(e) }}>
							<Container className="content-al">
								<div className="user-details-al">
									<div className="input-box-al">
										<div className="details-al">
											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_name" style={{ fontSize: "18px" }}>Name</legend>
													<input type="text" className="form-control" style={{ cursor: "not-allowed" }} id="form_name" value={currentUser.name} onChange={(e) => { handleInputChange(e) }} placeholder="Name" readonly disabled />
												</Col >
												<Col className="col-al">
													<legend htmlFor="form_email" style={{ fontSize: "18px" }}>Email</legend>
													<input type="email" className="form-control" id="form_email" defaultValue={currentUser.email} onChange={(e) => { handleInputChange(e) }} placeholder="Email" readonly required />
												</Col >
											</Row >
											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_phone" style={{ fontSize: "18px" }}>Phone Number</legend>
													<input type="tel" className="form-control" id="form_phone" defaultValue={currentUser.mobile} onChange={(e) => { handleInputChange(e) }} placeholder="Phone Number" required />
												</Col >
												<Col className="col-al">
													<legend htmlFor="form_nature" style={{ fontSize: "18px" }}>Nature of leave</legend>
													<select className="form-control" id="form_nature" onChange={(e) => { handleInputChange(e); handleTypeOfLeave(e) }} required>
														<option>Casual Leave</option>
														<option>Non Casual Leave</option>
													</select>
												</Col >
											</Row >
											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_type_of_leave" style={{ fontSize: "18px" }}>Type of leave</legend>
													<select className="form-control" id="form_type_of_leave" onChange={(e) => { handleInputChange(e) }} required>
														{
															typesOfLeave.map((item, key) => {
																return (
																	<option key={key}>{item}</option>
																)
															})
														}
													</select>
												</Col >
												<Col className="col-al">
													<legend htmlFor="form_isStation" style={{ fontSize: "18px" }}>Is it a station leave?</legend>
													<select className="form-control" id="form_isStation" defaultValue={"Yes"} onChange={(e) => { handleInputChange(e) }}>
														<option>Yes</option>
														<option>No</option>
													</select>
												</Col >
												<Col className="col-al">
													<legend htmlFor="form_duration" style={{ fontSize: "18px" }}>Duration of leave</legend>
													<input type="number" className="form-control" id="form_duration" placeholder="Duration" disabled value={duration} required />
												</Col >
											</Row >
											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_sdate" style={{ fontSize: "18px" }}>Start Date</legend>
													<input type="date" id="form_sdate" placeholder="Pick start date" className="form-control" onChange={async (e) => { handleInputChange(e) }} required></input>
												</Col >
												<Col className="col-al">
													<legend htmlFor="form_edate" style={{ fontSize: "18px" }}>End Date</legend>
													<input type="date" id="form_edate" placeholder="Pick end date" className="form-control" onChange={async (e) => { handleInputChange(e) }} required></input>
												</Col >
											</Row >
											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_purpose" style={{ fontSize: "18px" }}>Purpose of leave </legend>
													<textarea id="form_purpose" className="form-control" onChange={(e) => { handleInputChange(e) }}>

													</textarea>
												</Col>
												<Col className="col-al">
													<legend htmlFor="form_altArrangements" style={{ fontSize: "18px" }}>Alternative Arrangements</legend>
													<textarea id="form_altArrangements" className="form-control" onChange={(e) => { handleInputChange(e) }}>

													</textarea>
												</Col>
											</Row>
											<br />
											<Row className="row-al">
												<Col className="col-al">
													<legend htmlFor="form_document" style={{ fontSize: "18px" }}>Document</legend>
													<input
														type="file"
														id="pdfFileInput"
														accept=".pdf"
														onChange={handleFileInputChange}
													/>
												</Col >
											</Row>
											<br />

											<Row className="row-al">
												<span style={{ textAlign: "left" }}>Use your mouse to place your signature here</span>
											</Row>

											<Row className='row-al'>
												<div className={"sigContainer"}>
													<SignaturePad canvasProps={{ className: 'sigPad' }} ref={sigPadRef} onChange={(e) => { }} />
												</div>
											</Row>
											<Row className="row-al">
												<span onClick={clear} style={{ textAlign: "left", cursor: "pointer" }}>Clear</span>
											</Row>
											<Row className="row-al">
												<Col>
													<button type="submit" className="btn btn-primary btn-block">{formLoading ? <LoadingIndicator color={"white"}></LoadingIndicator> : "Apply Leave"}</button>
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
