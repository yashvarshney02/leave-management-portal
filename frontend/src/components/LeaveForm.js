import React, { useState } from 'react'
import httpClient from "../httpClient";
import '../css/LeaveForm.css';
import { isDate, isEmail, isName, isPhone } from "./helpers/validators";

export default function LeaveForm({ user }) {
  const [state, setState] = useState({
    name: user.firstName,
    email: user.email,
    phone: "",
    duration: 0,
    rdate: (new Date()).toISOString().substr(0, 10),
    sdate: (new Date()).toISOString().substr(0, 10),
    edate: (new Date()).toISOString().substr(0, 10),
    nature: "Casual leave",
    isStation: "",
    purpose: "",
    altArrangements: "",
  });

  const [fileState, setFileState] = useState(null)
  const onFileChange = (event) => {
    console.log("onfilechange")
    setFileState(event.target.files[0]);
  };

  const validate = () => {
    let errorMsg = "";
  if (state.name === "") {
    errorMsg = "Please enter valid name";
  } else if (!isEmail(state.email)) {
      errorMsg = "Please enter valid email address";
  } else if(!isPhone(state.phone)) {
      errorMsg = "Please enter valid mobile number";
  } else if (!isName(state.nature)) {
      errorMsg = "Please enter valid nature";
  } else if(state.duration <= 0) {
      errorMsg = "Please enter valid Duration";
  } else if (!isDate(state.sdate)) {
      errorMsg = "Please check the start Date";
  } else if (!isDate(state.edate)) {
      errorMsg = "Please check the end Date";
  } else if(new Date(state.edate) < new Date(state.sdate)) {
      errorMsg = "End Date should be greater than start date";
  } else if (!isName(state.purpose)) {
      errorMsg = "Please enter valid reason";
  }
  if(errorMsg !== "")
  {
      alert(errorMsg);
      return 0;
  }
  return 1;
};
  const sendApplication = () => {
    // console.log("H", state);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let status = validate();
    if (status==0){
      return;
    }
    const name = document.getElementById('form_name').value;
    const email = document.getElementById('form_email').value;
    const phone = document.getElementById('form_phone').value;
    const nature = document.getElementById('form_nature').value;
    const duration = document.getElementById('form_duration').value;
    const isStation = document.getElementById('form_isStation').value;
    const sdate = document.getElementById('form_sdate').value;
    const edate = document.getElementById('form_edate').value;
    const purpose = document.getElementById('form_purpose').value;
    const altArrangements = document.getElementById('form_altArrangements').value;

    // changedtoc
    if (isNaN(duration)) {
      setState({ ...state, errorMsg: "Please enter valid Duration" });
      alert("Error, Check the duration again")
      return;
    }
    else if (parseInt(duration * 10) % (5) != 0) {
      setState({ ...state, errorMsg: "Please enter valid Duration" });
      alert("Error, Check the duration again")
      return;
    }

    setState(prevState => ({ ...prevState, name: name }));
    setState(prevState => ({ ...prevState, email: email }));
    setState(prevState => ({ ...prevState, phone: phone }));
    setState(prevState => ({ ...prevState, nature: nature }));
    setState(prevState => ({ ...prevState, duration: duration }));
    setState(prevState => ({ ...prevState, isStation: isStation }));
    setState(prevState => ({ ...prevState, sdate: sdate }));
    setState(prevState => ({ ...prevState, edate: edate }));
    setState(prevState => ({ ...prevState, purpose: purpose }));
    setState(prevState => ({ ...prevState, altArrangements: altArrangements }));

    const myObj = {
      name: name,
      email: email,
      phone: phone,
      duration: duration,
      rdate: (new Date()).toISOString().substr(0, 10),
      sdate: sdate,
      edate: edate,
      nature: nature,
      isStation: isStation,
      purpose: purpose,
      altArrangements: altArrangements,
      doc: fileState,
    }

    const data = new FormData()
    data.append('name', name)
    data.append('email', email)
    data.append('phone', phone)
    data.append('duration', duration)
    data.append('rdate', (new Date()).toISOString().substr(0, 10),)
    data.append('sdate', sdate)
    data.append('edate', edate)
    data.append('nature', nature)
    data.append('isStation', isStation)
    data.append('purpose', purpose)
    data.append('docc', fileState)
    data.append('altArrangements', altArrangements)

    console.log("State: ", state);
    console.log("My Obj: ", myObj);

    document.querySelector('.leaveform button').classList.add('disabled');
    try {
      const resp = await httpClient.post("https://yashiitrpr.pythonanywhere.com/leave_application", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Response:", resp);
      alert("Leave Successfully Applied");
    } catch (error) {
      alert("Leave Application Unsuccessful");
    }
  }

  return (
    <div className="formWrapper">
      <div className="leaveform cardbody-color">
        <h1>Leave Form</h1>
        <form>
          <div className="form-row">
            <div className="form-group col-md-6">
              <legend htmlFor="form_name">Name *</legend>
              <input type="text" className="form-control" id="form_name" placeholder="Name" value={state.name} readonly   required/>
            </div>
            <div className="form-group col-md-6">
              <legend htmlFor="form_email">Email *</legend>
              <input type="email" className="form-control" id="form_email" placeholder="Email" value={state.email} readonly required/>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <legend htmlFor="form_phone">Phone Number</legend>
              <input type="tel" className="form-control" id="form_phone" placeholder="Phone Number" value={state.phone} onChange={(e)=>setState({...state,phone:e.target.value})} />
            </div>
            <div className="form-group col-md-6">
              <legend htmlFor="form_nature">Nature of leave *</legend>
              <select className="form-control" id="form_nature" value={state.nature} onChange={(e)=>setState({...state, nature:e.target.value})} required>
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
              <select className="form-control" id="form_isStation">
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className="form-group col-md-6">
              <legend htmlFor="form_duration">Duration of leave *</legend>
              <input type="number" className="form-control" id="form_duration" placeholder="Duration" value={state.duration} onChange={(e)=>setState({...state,duration:e.target.value})} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <legend htmlFor="form_sdate">Start Date</legend>
              <input type="date" id="form_sdate" placeholder="Pick start date" className="form-control" defaultValue={state.sdate} value={state.sdate} onChange={(e)=>setState({...state,sdate:e.target.value})} required></input>
            </div>
            <div className="form-group col-md-6">
              <legend htmlFor="form_edate">End Date</legend>
              <input type="date" id="form_edate" placeholder="Pick end date" className="form-control" defaultValue={state.edate} value={state.edate} onChange={(e)=>setState({...state,edate:e.target.value})} required></input>
            </div>
          </div>

          <div className="form-group">
            <legend htmlFor="form_purpose">Purpose of leave *</legend>
            <textarea id="form_purpose" className="form-control" defaultValue={state.purpose} onChange={(e)=>setState({...state, purpose:e.target.value})}>
                
            </textarea>
          </div>

          <div className="form-group">
            <legend htmlFor="form_altArrangements">Alternative Arrangements</legend>
            <textarea id="form_altArrangements" className="form-control" defaultValue={state.altArrangements} onChange={(e)=>setState({...state, altArrangements:e.target.value})}>

            </textarea>
          </div>

          <div style={{ padding: 20 }}>
            <legend>Attach pdf document</legend>
            <input type="file" name="file" onChange={onFileChange} />
          </div>
          
          <button type="submit" onClick={handleSubmit} className="btn btn-primary btn-block">Apply for leave</button>
        </form>
      </div>
    </div >
  )
}
