import { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import * as FaIcons from "react-icons/fa";
import { Badge } from "react-bootstrap";
import httpClient from "../../httpClient";
import {
	filterColoumns,
	globalFiltering,
	makeAbb,
	prepData,
} from "./helperFunctions";
import "./Table.css";
import { useNavigate } from "react-router-dom";
import NoData from "../NoData";

export default function Table({ title, headers, initialData, from }) {
	const navigate = useNavigate();
	//to set initial search values = ""
	let initColSearchKey = {};
	for (let head in headers) {
		initColSearchKey[headers[head]] = "";
	}


	const [colSearchKey, setColSearchKey] = useState({ initColSearchKey });
	const [data, setData] = useState(initialData);
	const [deleteLeaveID, setDeleteLeaveID] = useState("");
	const [currentLeaveStatus, setCurrentLeaveStatus] = useState("");
	const [currentLeaveWithdrawReason, setCurrentLeaveWithdrawReason] = useState("");
	const [showConfirmDeleteAction, setShowConfirmDeleteAction] = useState(false);
	const [displayTab, setDisplayTab] = useState(0);
	const [pendingCount, setPendingCount] = useState(0);

	const handleTabChange = (displayTab, colHeading) => {
		let toShow = "";
		if (displayTab === 0) toShow = "";
		if (displayTab === 1) toShow = "pending";
		if (displayTab === 2) toShow = "approved";
		if (displayTab === 3) toShow = "withdrawn";
		let finalData = [];
		let arrpos = headers.findIndex((x) => x === colHeading), temp_data = [];
		if (toShow === "") {
			finalData = initialData;
		} else if (toShow === "pending") {
			finalData = [...prepData(headers, initialData, "Status", "pending")];
		} else if (toShow === "approved") {
			
			for (let idx in initialData) {
				if (initialData[idx][arrpos]?.toLowerCase().includes("approved") || initialData[idx][arrpos]?.toLowerCase().includes("disapproved")) {
					temp_data.push(initialData[idx]);
				}
			}
			finalData = temp_data;
		} else if (toShow === "withdrawn") {
			finalData = [
				...prepData(headers, initialData, "Status", "Withdrawn"),
				...prepData(headers, initialData, "Status", "pending withdrawn"),
				...prepData(headers, initialData, "Status", "approved withdrawn")
			];
		}

		setColSearchKey(initColSearchKey);
		setData(finalData);
	};

	const handleSearch = (val) => {
		setDisplayTab(0);
		setColSearchKey(initColSearchKey);
		let finalData = globalFiltering(initialData, val);
		setData(finalData);
	};

	const handleColumnSearch = (val, colHeading) => {
		let finalData = filterColoumns(headers, initialData, colHeading, val);
		let toShow = "";
		if (displayTab === 0) toShow = "";
		if (displayTab === 1) toShow = "pending";
		if (displayTab === 2) toShow = "approved";
		if (displayTab === 3) toShow = "withdrawn";
		let tabData = filterColoumns(headers, finalData, "Status", toShow);
		setData(tabData);
		let newColState = colSearchKey;
		newColState[colHeading] = val;
		setColSearchKey(newColState);
	};

	useEffect(() => {
		//count number of pending requests
		let colHeading = "Status";
		let toCount = "Pending";
		let arrpos = headers.findIndex((x) => x === colHeading);
		let cnt = 0;
		for (let idx in initialData) {
			if (initialData[idx][arrpos] === toCount) {
				cnt++;
			}
		}
		setPendingCount(cnt);
	}, [data]);

	useEffect(() => {
		handleTabChange(displayTab, "Status");
	}, [displayTab]);

	const handleClose = () => setShowConfirmDeleteAction(false);
	const handleShow = () => setShowConfirmDeleteAction(true);

	async function handleDeleteLeaveApplication(leaveID) {
		if (currentLeaveStatus.startsWith("Approved") && currentLeaveWithdrawReason.length == 0) {
			toast.error("Withdraw reason must be mentioned", toast.POSITION.BOTTOM_RIGHT);
			return;
		}
		const resp = await httpClient.post(
			`${process.env.REACT_APP_API_HOST}/delete_application`,
			{
				leave_id: leaveID, reason: currentLeaveWithdrawReason
			}
		);
		if (resp.data.status == "error") {
			toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
		} else {
			toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
			setTimeout(() => {
				window.location.reload()
			}, 2000);
		}
	}

	async function approveWithdraw(leaveID) {
		const resp = await httpClient.post(
			`${process.env.REACT_APP_API_HOST}/approve_withdraw_leave`,
			{
				leave_id: leaveID
			}
		);
		if (resp.data.status == "error") {
			toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
		} else {
			toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
			setTimeout(() => {
				window.location.reload()
			}, 2000);
		}
	}

	async function disapproveWithdraw(leaveID) {
		const resp = await httpClient.post(
			`${process.env.REACT_APP_API_HOST}/disapprove_withdraw_leave`,
			{
				leave_id: leaveID
			}
		);
		if (resp.data.status == "error") {
			toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
		} else {
			toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
			setTimeout(() => {
				window.location.reload()
			}, 2000);
		}
	}

	function getActions(title, row) {
		let position = row[row.length - 1], status;
		let arrpos = headers.findIndex((x) => x === "Status");
		status = row[arrpos].toLowerCase()
		if (title == "Applied Leaves") {
			return (
				<td>
					<FaIcons.FaEye
						style={{ cursor: "pointer" }}
						color="green"
						onClick={(e) => {
							if (position.includes('pg') == false)
								navigate(`/${from}/${row[1].toLowerCase().startsWith("casual") ? "casual" : "non_casual"}/${row[0]}`);
							else
								navigate(`/${from}/${"pg_applications"}/${row[0]}`);
						}}
					/>
					&nbsp;
					<FaIcons.FaTrash
						style={{ cursor: "pointer" }}
						color="red"
						onClick={(e) => {
							console.log(status)
							setDeleteLeaveID(row[0]);
							setCurrentLeaveStatus(status)
							handleShow();
						}}
					/>
					&nbsp;
				</td>
			);
		} else if (title == "Check Leave Applications") {
			return (
				<td>
					<FaIcons.FaEye
						style={{ cursor: "pointer" }}
						color="green"
						onClick={(e) => {
							if (position.includes('pg') == false)
								navigate(`/${from}/${row[1].toLowerCase().startsWith("casual") ? "casual" : "non_casual"}/${row[0]}`);
							else
								navigate(`/${from}/${"pg_applications"}/${row[0]}`);
						}}
					/>
					&nbsp;
				</td>
			);
		} else {
			return "";
		}
	}

	if (initialData.length == 0) {
		return (
			<NoData />
		)
	}
	return (
		<div className="container ">
			<Modal show={showConfirmDeleteAction} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Confirmation</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{`Are you sure you want to delete the leave with ID: ${deleteLeaveID}`}{" "}					
					{(currentLeaveStatus?.toLowerCase().includes("approved") && currentLeaveStatus?.toLowerCase().includes("disapproved") == false) ? (
						<div>
							<br />
							<p>Enter the reason for withdraw:</p>
							<textarea onChange={(e) => { setCurrentLeaveWithdrawReason(e.target.value) }}>
							</textarea>
						</div>
					) : ""}
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="danger"
						onClick={async () => {
							await handleDeleteLeaveApplication(deleteLeaveID);
							setDeleteLeaveID("");
							handleClose();
						}}
					>
						<FaIcons.FaTrash></FaIcons.FaTrash>
					</Button>
				</Modal.Footer>
			</Modal>
			<div className="crud shadow-lg p-3 mb-5 bg-body rounded">
				<div className="row ">
					<div className="row text-align-center mb-5 mt-2">
						<h2>
							<b>{title}</b>
						</h2>
					</div>
				</div>
				<div className="row">
					<div className="search">
						<input
							className="form-control"
							type="search"
							placeholder="Search in the Complete Table"
							aria-label="Search"
							onChange={(e) => {
								handleSearch(e.target.value);
							}}
						/>
					</div>
				</div>
				<div className="d-flex flex-wrap justify-content-center m-3">
					<button
						className={displayTab === 0 ? "isActive tab-button" : "tab-button"}
						onClick={() => setDisplayTab(0)}
					>
						All
					</button>
					<button
						className={displayTab === 1 ? "isActive tab-button" : "tab-button"}
						onClick={() => setDisplayTab(1)}
					>
						Pending ({pendingCount})
					</button>
					<button
						className={displayTab === 2 ? "isActive tab-button" : "tab-button"}
						onClick={() => setDisplayTab(2)}
					>
						Approved/Disapproved
					</button>
					<button
						className={displayTab === 3 ? "isActive tab-button" : "tab-button"}
						onClick={() => setDisplayTab(3)}
					>
						Withdrawn
					</button>
				</div>
				<div className="row">
					<div className="table-responsive ">
						<table className="table table-striped table-hover table-bordered">
							<thead>
								<tr>
									{headers.map((item, idx) => {
										return (
											<th key={idx}>
												{item}
												<div>
													<input
														placeholder="search"
														onChange={(e) => {
															handleColumnSearch(e.target.value, item);
														}}
														value={colSearchKey[item]}
														className="form-control mr-sm-2"
													/>
												</div>
											</th>
										);
									})}
									{title == "Applied Leaves" ||
										title == "Check Leave Applications" ? (
										<th>Action</th>
									) : (
										""
									)}
								</tr>
							</thead>
							<tbody>
								{data.map((row, idx) => {
									return (
										<tr key={idx} className="cell-1">
											{row.map((item, i) => {
												if (
													String(item).toLowerCase().includes("disapproved")
												) {
													return (
														<td key={i}>
															<Badge pill bg="danger" text="light">
																{item}
															</Badge>
														</td>
													);
												} else if (String(item).toLowerCase().startsWith("approved")) {
													return (
														<td key={i}>
															<Badge pill bg="success" text="light">
																{item}
															</Badge>
														</td>
													);
												}  else if (
													String(item).toLowerCase().startsWith("pending")
												) {
													return (
														<td key={i}>
															<Badge pill bg="info" text="light">
																{item}
															</Badge>
														</td>
													);
												}else if (
													String(item).toLowerCase().startsWith("withdrawn")
												) {
													return (
														<td key={i}>
															<Badge pill bg="warning" text="light">
																{item}
															</Badge>
														</td>
													);
												} else if (
													i == 1 //it is in leave nature column
												) {
													return (
														<td key={i}>
															{makeAbb(item)}
															&nbsp;
															<button
																type="button"
																className="leave-nature-hover"
																data-toggle="tooltip"
																data-placement="right"
																title={item}
															>
																<FaIcons.FaQuestionCircle></FaIcons.FaQuestionCircle>
															</button>
														</td>
													);
												} else if (
													i == 7 && item?.length
												) {
													return (
														<td>
															<button
																type="button"
																className="leave-nature-hover"
																data-toggle="tooltip"
																data-placement="right"
																title={`Reason - ${item}`}
																onClick={async () => { await approveWithdraw(row[0]) }}
															>
																<FaIcons.FaCheck color="green"></FaIcons.FaCheck>
															</button>&nbsp;&nbsp;:&nbsp;&nbsp;
															<button
																type="button"
																className="leave-nature-hover"
																data-toggle="tooltip"
																data-placement="right"
																title={`Reason - ${item}`}
																onClick={async () => { await disapproveWithdraw(row[0]) }}
															>
																<FaIcons.FaTimes color="red"></FaIcons.FaTimes>
															</button>
														</td>
													)
												} else if (i == row.length - 1) {
													return <></>
												}
												return <td key={i}>{item}</td>;
											})}
											{getActions(title, row)}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
