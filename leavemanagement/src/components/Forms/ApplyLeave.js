import React, { useState } from 'react'
import httpClient from '../../httpClient';
import "./ApplyForm.css"
import LoadingIndicator from '../LoadingIndicator';
import { useAuth } from '../../contexts/AuthContext';

export default function ApplyLeave({ toast }) {
	const {currentUser} = useAuth();
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
		<div className="formWrapper">
			<div className="leaveform cardbody-color">
				<h1>Leave Form</h1>
				<form onSubmit={(e) => {handleSubmit(e)}}>
					<div className="form-row">
						<div className="form-group col-md-6">
							<legend htmlFor="form_name">Name *</legend>
							<input type="text" className="form-control" id="form_name" value={currentUser.name} onChange={(e) => { handleInputChange(e) }} placeholder="Name" readonly disabled />
						</div>
						<div className="form-group col-md-6">
							<legend htmlFor="form_email">Email *</legend>
							<input type="email" className="form-control" id="form_email" defaultValue={currentUser.email} onChange={(e) => { handleInputChange(e) }} placeholder="Email" readonly required />
						</div>
					</div>

					<div className="form-row">
						<div className="form-group col-md-6">
							<legend htmlFor="form_phone">Phone Number *</legend>
							<input type="tel" className="form-control" id="form_phone" defaultValue={currentUser.mobile} onChange={(e) => { handleInputChange(e) }} placeholder="Phone Number" required/>
						</div>
						<div className="form-group col-md-6">
							<legend htmlFor="form_nature">Nature of leave *</legend>
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
						</div>
					</div>

					<div className="form-row">
						<div className="form-group col-md-6">

							<legend htmlFor="form_isStation">Is station leave? *</legend>
							<select className="form-control" id="form_isStation"  defaultValue={"Yes"}  onChange={(e) => { handleInputChange(e) }}>
								<option>Yes</option>
								<option>No</option>
							</select>
						</div>
						<div className="form-group col-md-6">
							<legend htmlFor="form_duration">Duration of leave *</legend>
							<input type="number" className="form-control" id="form_duration" placeholder="Duration" onChange={(e) => { handleInputChange(e) }} required />
						</div>
					</div>

					<div className="form-row">
						<div className="form-group col-md-6">
							<legend htmlFor="form_sdate">Start Date</legend>
							<input type="date" id="form_sdate" placeholder="Pick start date" className="form-control" onChange={(e) => { handleInputChange(e) }} required></input>
						</div>
						<div className="form-group col-md-6">
							<legend htmlFor="form_edate">End Date</legend>
							<input type="date" id="form_edate" placeholder="Pick end date" className="form-control" onChange={(e) => { handleInputChange(e) }} required></input>
						</div>
					</div>

					<div className="form-group">
						<legend htmlFor="form_purpose">Purpose of leave *</legend>
						<textarea id="form_purpose" className="form-control" onChange={(e) => { handleInputChange(e) }}>

						</textarea>
					</div>

					<div className="form-group">
						<legend htmlFor="form_altArrangements">Alternative Arrangements</legend>
						<textarea id="form_altArrangements" className="form-control" onChange={(e) => { handleInputChange(e) }}>

						</textarea>
					</div>

					{/* <div style={{ padding: 20 }}>
						<legend>Attach pdf document</legend>
						<input type="file" name="file" onChange={onFileChange} />
					</div> */}
					<br />
					<button type="submit" className="btn btn-primary btn-block">{formLoading ? <LoadingIndicator color={"white"}></LoadingIndicator> : "Apply Leave"}</button>
				</form>
			</div>
		</div >
	)
}
