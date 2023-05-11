import React from "react";
import { useState, useEffect } from "react";
import httpClient from "../../httpClient";
import "./PastApplications.css";
import Table from "../Table/Table";
import { useAuth } from "../../contexts/AuthContext";
import LoadingIndicator from "../LoadingIndicator";

export default function PastApplications({ toast }) {
	const { currentUser } = useAuth();
	
	let headers_temp = [];
	if (currentUser.position.includes('pg')) {
		headers_temp = ["Leave Id", "Nature","Request Date", "Start Date", "Duration", "Status"]
	} else {
		headers_temp = ["Leave Id", "Nature","Request Date", "Start Date", "Duration", "Status"]
	}
	const [headers, setHeaders] = useState(headers_temp);

	const [data, setData] = useState(null);

	const fetchLeaves = async (e) => {
		try {
			const resp = await httpClient.post(
				`${process.env.REACT_APP_API_HOST}/past_applications`
			);					
			if (resp.data.status == "success") {				
			} else {	
				setData([])			
				return;
			}
			const temp_data = resp.data.data;
			let temp = [];
			for (let i = 0; i < temp_data.length; i++) {
				let status;
				if (temp_data[i].status.toLowerCase().includes("hod") && temp_data[i].status.toLowerCase().includes("dean")) {
					status = `${temp_data[i].status.split("|")[0].split("-")[0]}|${temp_data[i].status.split("|")[1].split("-")[0]}`
				} else if (temp_data[i].status.toLowerCase().includes("hod")) {
					status = `${temp_data[i].status.split(" ")[0]} by hod`
				} else if (temp_data[i].status.toLowerCase().includes("dean")) {
					status = `${temp_data[i].status.split(" ")[0]} by dean`
				} else {
					status = temp_data[i].status
				}
				// remember last item is for url don't change it
				if (currentUser.position.includes('pg')) {
					temp.push([temp_data[i].leave_id, temp_data[i].nature,new Date(temp_data[i].request_date).toDateString(), temp_data[i].start_date?.slice(0, -12), temp_data[i].duration, status, temp_data[i].level]);
				} else {
					temp.push([temp_data[i].leave_id, temp_data[i].nature,new Date(temp_data[i].request_date).toDateString(), temp_data[i].start_date?.slice(0, -12), temp_data[i].duration, status, temp_data[i].level]);
				}				
			}
			setData(temp);
		} catch (error) {
			setData([]);
			// toast.error("something went wrong", toast.POSITION.BOTTOM_RIGHT);
		}
	};

	useEffect(() => {
		async function test() {
			await fetchLeaves();			
		}
		test();
	}, []);

	return (
		<div>
			<br />
			{data ? (
				<Table
					title={"Applied Leaves"}
					headers={headers}
					initialData={data}
					from="past_applications"
				/>
			) : (
				<LoadingIndicator color={"blue"} />
			)}
		</div>
	);
}
