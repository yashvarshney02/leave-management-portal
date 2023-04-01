import { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import * as FaIcons from "react-icons/fa";
import { Badge } from "react-bootstrap";
import httpClient from "../../httpClient";
import { filterColoumns, globalFiltering, makeAbb } from "./helperFunctions";
import "./Table.css";
import { useNavigate } from "react-router-dom";

export default function Table({ title, headers, initialData, from }) {
	const navigate = useNavigate();
	//to set initial search values = ""
	let initColSearchKey = {};
	for (let head in headers) {
		initColSearchKey[headers[head]] = "";
	}
	let pendingTopData = [
		...filterColoumns(headers, initialData, "Status", "pending"),
		...filterColoumns(headers, initialData, "Status", "approved"),
		...filterColoumns(headers, initialData, "Status", "withdrawn"),
	];

	initialData = pendingTopData;

	const [colSearchKey, setColSearchKey] = useState({ initColSearchKey });
	const [data, setData] = useState(initialData);
	const [deleteLeaveID, setDeleteLeaveID] = useState("");
	const [showConfirmDeleteAction, setShowConfirmDeleteAction] = useState(false);
	const [displayTab, setDisplayTab] = useState(0);
	const [pendingCount, setPendingCount] = useState(0);

	const handleTabChange = (displayTab, colHeading) => {
		let toShow = "";
		if (displayTab === 0) toShow = "";
		if (displayTab === 1) toShow = "pending";
		if (displayTab === 2) toShow = "approved";
		if (displayTab === 3) toShow = "withdrawn";
		let finalData = filterColoumns(headers, initialData, colHeading, toShow);
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
		const resp = await httpClient.post(
			`${process.env.REACT_APP_API_HOST}/delete_application`,
			{
				leave_id: leaveID,
			}
		);
		if (resp.data.status == "error") {
			toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
		} else {
			toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
		}
	}

	function getActions(title, row) {
		if (title == "Applied Leaves") {
			return (
				<td>
					<FaIcons.FaEye
						style={{ cursor: "pointer" }}
						color="green"
						onClick={(e) => {
							navigate(`/${from}/${row[0]}`);
						}}
					/>
					&nbsp;
					<FaIcons.FaTrash
						style={{ cursor: "pointer" }}
						color="red"
						onClick={(e) => {
							setDeleteLeaveID(row[0]);
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
							navigate(`/${from}/${row[0]}`);
						}}
					/>
					&nbsp;
				</td>
			);
		} else {
			return "";
		}
	}

	return (
		<div className="container ">
			<Modal show={showConfirmDeleteAction} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Confirmation</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{`Are you sure you want to delete the leave with ID: ${deleteLeaveID}`}{" "}
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => {
							setDeleteLeaveID("");
							handleClose();
						}}
					>
						Discard
					</Button>
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
												if (String(item).toLowerCase().startsWith("approved")) {
													return (
														<td key={i}>
															<Badge pill bg="success" text="light">
																{item}
															</Badge>
														</td>
													);
												} else if (
													String(item).toLowerCase().startsWith("disapproved")
												) {
													return (
														<td key={i}>
															<Badge pill bg="danger" text="light">
																{item}
															</Badge>
														</td>
													);
												} else if (
													String(item).toLowerCase().startsWith("pending")
												) {
													return (
														<td key={i}>
															<Badge pill bg="info" text="light">
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
