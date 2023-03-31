import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard";
import Login from "../Login/Login";
import ApplyLeave from "../Forms/ApplyLeave";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import PastApplications from "../Forms/PastApplications";
import CheckLeaves from "../Forms/CheckLeaves";
import Dates from "../Forms/Dates";
import LeavePDFModals from "../Forms/LeavePDFModals";

const Paths = (props) => {
	return (
		<>
			<Routes>
				<Route
					path="/"
					element={<PrivateRoute user={"all"} toast={props.toast} />}
				>
					<Route path="/" element={<Dashboard toast={props.toast} />} />
				</Route>
				<Route
					path="/forms/applyleave"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/forms/applyleave"
						element={<ApplyLeave toast={props.toast} />}
					/>
				</Route>
				<Route
					path="/forms/pastapplications"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/forms/pastapplications"
						element={<PastApplications toast={props.toast} />}
					/>
				</Route>
				<Route
					path="/check_applications/:id"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/check_applications/:id"
						element={
							<LeavePDFModals toast={props.toast} from="check-applications" />
						}
					></Route>
				</Route>

				<Route
					path="/past_applications/:id"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/past_applications/:id"
						element={
							<LeavePDFModals toast={props.toast} from="past-applications" />
						}
					></Route>
				</Route>

				<Route
					path="/forms/dates"
					element={<PrivateRoute user={["dean"]} toast={props.toast} />}
				>
					<Route path="/forms/dates" element={<Dates toast={props.toast} />} />
				</Route>
				<Route
					path="/forms/checkapplications"
					element={
						<PrivateRoute
							user={["dean", "hod", "faculty"]}
							toast={props.toast}
						/>
					}
				>
					<Route
						path="/forms/checkapplications"
						element={<CheckLeaves toast={props.toast} />}
					/>
				</Route>
				<Route path="/login" element={<Login toast={props.toast} />} />
			</Routes>
		</>
	);
};

export default Paths;
