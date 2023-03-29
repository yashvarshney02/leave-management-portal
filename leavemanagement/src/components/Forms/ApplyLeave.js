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




		<div className="container-al">
			<Card style={{ width:"100%"  }}>
				<Card.Body style={{width: "100%"}}>
					<Card.Title className="title-al" >Apply Leave</Card.Title>
					<Card.Text>
						<form onSubmit={(e) => { handleSubmit(e) }}>
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
										<select className="form-control" defaultValue={"Casual Leave"} id="form_nature" onChange={(e) => { handleInputChange(e) }} required>
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
									</Col >
								</Row >
								<Row className="row-al">
									<Col className="col-al">
										<legend htmlFor="form_isStation" style={{ fontSize: "18px" }}>Is it a station leave?</legend>
										<select className="form-control" id="form_isStation" defaultValue={"Yes"} onChange={(e) => { handleInputChange(e) }}>
											<option>Yes</option>
											<option>No</option>
										</select>
									</Col >
									<Col className="col-al">
										<legend htmlFor="form_duration" style={{ fontSize: "18px" }}>Duration of leave</legend>
										<input type="number" className="form-control" id="form_duration" placeholder="Duration" onChange={(e) => { handleInputChange(e) }} required />
									</Col >
								</Row >
								<Row className="row-al">
									<Col className="col-al">
										<legend htmlFor="form_sdate" style={{ fontSize: "18px" }}>Start Date</legend>
										<input type="date" id="form_sdate" placeholder="Pick start date" className="form-control" onChange={(e) => { handleInputChange(e) }} required></input>
									</Col >
									<Col className="col-al">
										<legend htmlFor="form_edate" style={{ fontSize: "18px" }}>End Date</legend>
										<input type="date" id="form_edate" placeholder="Pick end date" className="form-control" onChange={(e) => { handleInputChange(e) }} required></input>
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
			{/* <div className="leaveform cardbody-color">
	<h1>Leave Form</h1>
	<form onSubmit={(e) => { handleSubmit(e) }}>
		<div className="form-row">
			<div className="form-group col-md-6">
			</div>
			<div className="form-group col-md-6">
			</div>
		</div>

		<div className="form-row">
			<div className="form-group col-md-6">

			</div>
			<div className="form-group col-md-6">
			</div>
		</div>

		<div className="form-row">
			<div className="form-group col-md-6">


			</div>

		</div>

		<div className="form-row">
			<div className="form-group col-md-6">
			</div>
			<div className="form-group col-md-6">
			</div>
		</div>

		<div className="form-group">

		</div>

		<div className="form-group">

		</div>

		<div style={{ padding: 20 }}>
			<legend>Attach pdf document</legend>
			<input type="file" name="file" onChange={onFileChange} />
		</div>
		<br />
	</form>
</div> */}
		</div >


	)
}
