import React from "react";
import { useState, useEffect } from "react";
import httpClient from "../../httpClient";
import "./PastApplications.css";
import Table from "../Table/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useAuth } from "../../contexts/AuthContext";
import LoadingIndicator from "../LoadingIndicator";

export default function PastApplications({ toast }) {
	const { currentUser } = useAuth();
	const [showLeaves, setShowLeaves] = useState([]);
	const [headers, setHeaders] = useState([
		"Leave Id",
		"Nature",
		"Start Date",
		"Duration",
		"Status",
	]);
	const [data, setData] = useState(null);

	const fetchLeaves = async (e) => {
		try {
			const resp = await httpClient.post(
				`${process.env.REACT_APP_API_HOST}/past_applications`
			);
			if (resp.data.status == "success") {
				// toast.success("Leaves fetched Successfully", toast.POSITION.BOTTOM_RIGHT);
			} else {
				// toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
				return;
			}
			const temp_data = resp.data.data;
			let temp = [];
			for (let i = 0; i < temp_data.length; i++) {
				temp.push([
					temp_data[i].id,
					temp_data[i].nature,
					temp_data[i].start_date.slice(0, -12),
					temp_data[i].duration,
					temp_data[i].status,
				]);
			}
			setData(temp);
			setShowLeaves(temp_data);
		} catch (error) {
			// toast.error("something went wrong", toast.POSITION.BOTTOM_RIGHT);
		}
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

				const input1 = document.getElementById("second-page-" + leave_id);
				html2canvas(input1).then((canvas) => {
					// document.getElementById("leave-container-" + leave_id).parentNode.style.overflow = 'hidden';

					var imgData = canvas.toDataURL("image/png");
					// window.open(imgData, "toDataURL() image", "width=800, height=800");
					pdf.addPage();
					pdf.addImage(imgData, "JPEG", 100, 50);
					pdf.save(`${"leave-" + leave_id}.pdf`);
				});
			});
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
