import React from "react";
import { useState, useEffect } from "react";
import httpClient from "../../httpClient";
import "./CheckLeaves.css";
import Table from "../Table/Table";
import { useAuth } from "../../contexts/AuthContext";
import LoadingIndicator from "../LoadingIndicator";

export default function CheckLeaves({ toast }) {

  const [leaves, setLeaves] = useState([]);
  const headers = ["Leave Id", "Nature", "Name", "Start Date", "Status"];
  const headers2 = ["Email ID", "Name", "Position", "Department", "Casual Leaves"];
  const [data, setData] = useState(null);
  const [numberOfLeaves, setNumberOfLeaves] = useState(null);
  const { currentUser } = useAuth()

  const fetchLeaves = async (e) => {
    try {      
      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/check_applications`);
      console.log(resp);
      if (resp.data.status == "success") {
        // toast.success("Leaves fetched Successfully", toast.POSITION.BOTTOM_RIGHT);
      } else {
        // toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
        return;
      }
      let temp = [], data = resp.data.data;
      for (let i = 0; i < data.length; i++) {
        temp.push([data[i].id, data[i].nature, data[i].name, data[i].start_date.slice(0, -12), data[i].status]);
      }      
      setData(temp);
      setLeaves(data)
    } catch (error) {
      // toast.error("something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  }
  const fetchNumberOfLeaves = async (e) => {
    try {
      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/fetch_number_of_leaves`);
      if (resp.data.status == "success") {
        // toast.success("Leaves fetched Successfully", toast.POSITION.BOTTOM_RIGHT);
      } else {
        // toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
        return;
      }
      setNumberOfLeaves(resp.data.data);

    } catch (error) {
      // toast.error("something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  }

  useEffect(() => {
    async function test() {
      await fetchLeaves();
      await fetchNumberOfLeaves();
    }
    test();
  }, []);

  const approveLeave = async (leave_id) => {
    try {
      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/approve_leave`, { leave_id, level: currentUser.level });
      if (resp.data.status == 'error') {
        toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
      } else {
        toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
      }      
      window.location.reload();
    } catch (error) {
      toast.success("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  }

  const disapproveLeave = async (leave_id) => {
    try {
      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/disapprove_leave`, { leave_id });
      if (resp.data.status == 'error') {
        toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
      } else {
        toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
      }      
      window.location.reload();
    } catch (error) {
      toast.success("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  }

  const addComment = async (leave_id) => {
    try {
      const uid = "comment-" + leave_id;
      const comment = document.getElementById(uid).value;      
      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/add_comment`, { comment, leave_id });
      if (resp.data.status == 'error') {
        toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
      } else {
        toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
      }
      window.location.reload();
    } catch (error) {
      toast.success("Something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  }

  const styles = {
    border: '1px solid black',
    color: 'white',
    backgroundColor: 'black'
  };

  return (
    <div>
      {(data) ? (
        <Table title={"Check Leave Applications"} headers={headers} initialData={data} from="check_applications"/>
      ) : (
        <LoadingIndicator color={"blue"} />
      )}
      {(numberOfLeaves) ? (
        <Table title={"Remaining Number of Leaves"} headers={headers2} initialData={numberOfLeaves} />
      ) : (
        <LoadingIndicator color={"blue"} />
      )}
    </div >
  )
}
