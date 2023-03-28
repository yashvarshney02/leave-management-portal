import React, { useState } from 'react'
import httpClient from '../../httpClient';
import "./ApplyForm.css"
import LoadingIndicator from '../LoadingIndicator';
import { useAuth } from '../../contexts/AuthContext';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import "./Form.css";

export default function ApplyLeave({ toast }) {
	const { currentUser } = useAuth();
	const [formData, setFormData] = useState({
		"form_name": currentUser.name,
		"form_email": currentUser.email,
		"form_nature": "Casual Leave",
		"form_isStation": "Yes"
	});
	const [formLoading, setFormLoading] = useState(false);

	const handleInputChange = (e) => {
		const propName = e.target.id;
		const propVal = e.target.value;
		setFormData({ ...formData, [propName]: propVal });
	};

	// const onFileChange = (event) => {
	// 	console.log("onfilechange")
	// 	setFileState(event.target.files[0]);
	// };

	const handleSubmit = async (e) => {
		e.preventDefault();
		// changedtoc		
		if (isNaN(formData.form_duration)) {
			toast.error("Error, Check the duration again", toast.POSITION.BOTTOM_RIGHT);
			return;
		}
		else if (parseInt(formData.form_duration * 10) % (5) != 0) {
			toast.error("Error, Check the duration again", toast.POSITION.BOTTOM_RIGHT);
			return;
		}
		setFormLoading(true);
		try {
			const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/apply_leave`, {
				data: formData
			})
			if (resp.data.status == 'success') {
				toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT)
			} else {
				toast.error(resp.data.data, toast.POSITION.BOTTOM_RIGHT)
			}
		} catch (error) {
			toast.error("Leave Application Unssucessful", toast.POSITION.BOTTOM_RIGHT)
		}
		setFormLoading(false);
	}

	return (
		// <div className="formWrapper">
		// 	<Card className="leaveform" style={{marginTop: "50px"}}>
		// 		<Card.Body>
		// 			<Card.Title>Apply Leave</Card.Title>
		// 			<Card.Text>
		// 				<form onSubmit={(e) => { handleSubmit(e) }}>
		// 					<Container>
		// 						<Row>
		// 							<Col>
		// 								<legend htmlFor="form_name" style={{fontSize: "18px"}}>Name *</legend>
		// 								<input type="text" className="form-control" style={{cursor: "not-allowed"}} id="form_name" value={currentUser.name} onChange={(e) => { handleInputChange(e) }} placeholder="Name" readonly disabled />
		// 							</Col>
		// 							<Col>
		// 								<legend htmlFor="form_email" style={{fontSize: "18px"}}>Email *</legend>
		// 								<input type="email" className="form-control" id="form_email" defaultValue={currentUser.email} onChange={(e) => { handleInputChange(e) }} placeholder="Email" readonly required />
		// 							</Col>
		// 						</Row>
		// 						<Row>
		// 							<Col>
		// 								<legend htmlFor="form_phone" style={{fontSize: "18px"}}>Phone Number *</legend>
		// 								<input type="tel" className="form-control" id="form_phone" defaultValue={currentUser.mobile} onChange={(e) => { handleInputChange(e) }} placeholder="Phone Number" required />
		// 							</Col>
		// 							<Col>
		// 								<legend htmlFor="form_nature" style={{fontSize: "18px"}}>Nature of leave *</legend>
		// 								<select className="form-control" defaultValue={"Casual Leave"} id="form_nature" onChange={(e) => { handleInputChange(e) }} required>
		// 									<option>Casual Leave</option>
		// 									<option>Restricted Leave</option>
		// 									<option>Earned Leave</option>
		// 									<option>Vacation Leave</option>
		// 									<option>Special Leave</option>
		// 									<option>Commuted Leave</option>
		// 									<option>Hospital Leave</option>
		// 									<option>Study Leave</option>
		// 									<option>Childcare Leave</option>
		// 									<option>Other Leave</option>
		// 								</select>
		// 							</Col>
		// 						</Row>
		// 						<Row>
		// 							<Col>
		// 								<legend htmlFor="form_isStation" style={{fontSize: "18px"}}>Is station leave? *</legend>
		// 								<select className="form-control" id="form_isStation" defaultValue={"Yes"} onChange={(e) => { handleInputChange(e) }}>
		// 									<option>Yes</option>
		// 									<option>No</option>
		// 								</select>
		// 							</Col>
		// 							<Col>
		// 								<legend htmlFor="form_duration" style={{fontSize: "18px"}}>Duration of leave *</legend>
		// 								<input type="number" className="form-control" id="form_duration" placeholder="Duration" onChange={(e) => { handleInputChange(e) }} required />
		// 							</Col>
		// 						</Row>
		// 						<Row>
		// 							<Col>
		// 								<legend htmlFor="form_sdate" style={{fontSize: "18px"}}>Start Date</legend>
		// 								<input type="date" id="form_sdate" placeholder="Pick start date" className="form-control" onChange={(e) => { handleInputChange(e) }} required></input>
		// 							</Col>
		// 							<Col>
		// 								<legend htmlFor="form_edate" style={{fontSize: "18px"}}>End Date</legend>
		// 								<input type="date" id="form_edate" placeholder="Pick end date" className="form-control" onChange={(e) => { handleInputChange(e) }} required></input>
		// 							</Col>
		// 						</Row>
		// 						<Row>
		// 							<Col>
		// 								<legend htmlFor="form_purpose" style={{fontSize: "18px"}}>Purpose of leave *</legend>
		// 								<textarea id="form_purpose" className="form-control" onChange={(e) => { handleInputChange(e) }}>

		// 								</textarea>
		// 							</Col>
		// 							<Col>
		// 								<legend htmlFor="form_altArrangements" style={{fontSize: "18px"}}>Alternative Arrangements</legend>
		// 								<textarea id="form_altArrangements" className="form-control" onChange={(e) => { handleInputChange(e) }}>

		// 								</textarea>
		// 							</Col>
		// 						</Row>
		// 						<br />
		// 						<Row>
		// 							<Col>
		// 								<button type="submit" className="btn btn-primary btn-block">{formLoading ? <LoadingIndicator color={"white"}></LoadingIndicator> : "Apply Leave"}</button>
		// 							</Col>
		// 						</Row>
		// 					</Container>
		// 				</form>
		// 			</Card.Text>
		// 		</Card.Body>
		// 	</Card>
		// 	{/* <div className="leaveform cardbody-color">
		// 		<h1>Leave Form</h1>
		// 		<form onSubmit={(e) => { handleSubmit(e) }}>
		// 			<div className="form-row">
		// 				<div className="form-group col-md-6">
		// 				</div>
		// 				<div className="form-group col-md-6">
		// 				</div>
		// 			</div>

		// 			<div className="form-row">
		// 				<div className="form-group col-md-6">

		// 				</div>
		// 				<div className="form-group col-md-6">
		// 				</div>
		// 			</div>

		// 			<div className="form-row">
		// 				<div className="form-group col-md-6">


		// 				</div>

		// 			</div>

		// 			<div className="form-row">
		// 				<div className="form-group col-md-6">
		// 				</div>
		// 				<div className="form-group col-md-6">
		// 				</div>
		// 			</div>

		// 			<div className="form-group">

		// 			</div>

		// 			<div className="form-group">

		// 			</div>

		// 			<div style={{ padding: 20 }}>
		// 				<legend>Attach pdf document</legend>
		// 				<input type="file" name="file" onChange={onFileChange} />
		// 			</div>
		// 			<br />
		// 		</form>
		// 	</div> */}
		// </div >

		<div class="container-al">
		<div class="title-al">Apply Leave</div>
		<div class="content-al">
		  <form onSubmit={(e) => { handleSubmit(e) }}>
			<div class="user-details-al">
			  <div class="input-box-al">
				<span class="details-al">Full Name</span>
				<input type="text" placeholder="Enter your name" value={currentUser.name} onChange={(e) => { handleInputChange(e) }} readonly disabled />
			  </div>
			  <div class="input-box-al">
				<span class="details-al">Email</span>
				<input type="text" placeholder="Enter your email" defaultValue={currentUser.email} onChange={(e) => { handleInputChange(e) }} readonly required />
			  </div>
			  <div class="input-box-al">
				<span class="details-al">Phone Number</span>
				<input type="text" placeholder="Enter your number" defaultValue={currentUser.mobile} onChange={(e) => { handleInputChange(e) }} required />
			  </div>
			  <div class="input-box-al">
				<span class="details-al">Duration of Leave</span>
	 			<input type="text" placeholder="Duration" onChange={(e) => { handleInputChange(e) }} required />
	 	   </div>
	
			  <div class="input-box-al">
				<span class="details-al">Start Date</span>
				<input type="date" id="start-date" name="start-date" />
			  </div>
			  <div class="input-box-al">
				<span class="details-al">End Date</span>
				<input type="date" id="end-date" name="end-date" />
			  </div>
	
			  <div class="input-box-al">
				<span class="details-al">Purpose of Leave:</span>
				<textarea rows="4" cols="68" onChange={(e) => { handleInputChange(e) }}></textarea>
			</div>

			<div class="input-box-al">
				<span class="details-al">Alternative Arrangements</span>
				<textarea rows="4" cols="68" onChange={(e) => { handleInputChange(e) }}></textarea>
			</div>

			<div class="input-box-al">
				<span class="details-al">Leave Type</span>
				<select class="dropdown-al" onChange={(e) => { handleInputChange(e) }} required>
				<option>Casual Leave</option>
	    		<option>Restricted Leave</option>
				<option>Earned Leave</option>
				<option>Vacation Leave</option>
				<option>Special Leave</option>
				<option>Commuted Leave</option>
				<option>Hospital Leave</option>
				<option>Study Leave</option>
				<option>Childcare Leave</option>
				<option>Other Leave</option>
				</select>
			</div>

			<div class="input-box-al">
				<span class="details-al">Is it a Station Leave ?</span>
				<select class="dropdown-al" defaultValue={"Yes"} onChange={(e) => { handleInputChange(e) }} required>
				<option>Yes</option>
	    		<option>No</option>
				</select>
			</div>

			</div>
			
	
			



				<div class="button-al">
				  <button type="submit" className="btn btn-primary btn-block-al">{formLoading ? <LoadingIndicator color={"white"}></LoadingIndicator> : "Apply Leave"}</button>
				</div>
			  </form>
			</div>
		  </div>
	)
}
