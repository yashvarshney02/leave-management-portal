import React from "react";
import { useState, useEffect } from "react";
import httpClient from "../../httpClient";
import "./CheckLeaves.css";
import Table from "../Table/Table";
import { useAuth } from "../../contexts/AuthContext";
import LoadingIndicator from "../LoadingIndicator";

export default function CheckLeaves({ toast }) {
  const [leaves, setLeaves] = useState([]);
  const headers = ["Leave Id", "Nature", "Name", "Position", "Request Date", "Start Date", "Status"];
  const [data, setData] = useState(null);

  const fetchLeaves = async (e) => {
    try {
      const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/check_applications`);
      if (resp.data.status == "success") {
        // toast.success("Leaves fetched Successfully", toast.POSITION.BOTTOM_RIGHT);
      } else {
        // toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
        return;
      }
      let temp = [], data = resp.data.data;
      for (let i = 0; i < data.length; i++) {
        try {          
          let status;
          if (data[i].status.includes("Hod") && data[i].status.includes("Hod")) {
            status = `${data} dean, hod`
          } else if (data[i].status.includes("Hod")) {
            status = `${data[i].status.split(" ")[0]} by hod`
          } else if (data[i].status.includes("Dean")) {
            status = `${data[i].status.split(" ")[0]} by dean`
          } else {
            status = data[i].status;
          }          
          temp.push([data[i].id, data[i].nature, data[i].name, data[i].position, new Date(data[i].request_date).toDateString(), data[i].start_date.slice(0, -12), status]);
        } catch (error) {          
          continue;
        }
      }
      setData(temp);
      setLeaves(data)
    } catch (error) {
      toast.error("something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  }

  useEffect(() => {
    async function test() {
      await fetchLeaves();
    }
    test();
  }, []);


  const styles = {
    border: '1px solid black',
    color: 'white',
    backgroundColor: 'black'
  };

  return (
    <div>
      {(data) ? (
        <Table title={"Check Leave Applications"} headers={headers} initialData={data} from="check_applications" />
      ) : (
        <LoadingIndicator color={"blue"} />
      )}
    </div >
  )
}
