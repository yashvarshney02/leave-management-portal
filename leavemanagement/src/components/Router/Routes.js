import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard";
import Login from "../Login/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import PastApplications from "../Forms/PastApplications";
import CheckLeaves from "../Forms/CheckLeaves";
import Dates from "../Forms/Dates";
import ApplyLeaveComponent from "../Forms/ApplyLeaveComponent";
import UpdateLeave from "../Forms/OfficePortal";
import LeavePDFModals from "../Forms/LeavePDFModals";
import LeavePDFModalsNonCasual from "../Forms/LeavePDFModals2";
import PGLeavePdfModal from "../Forms/PGpdf";

const Paths = (props) => {
	return (
		<>
			<Routes>
				<Route
					path="/"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route path="/" element={<Dashboard toast={props.toast} />} />
				</Route>
				<Route
					path="/navigate/applyleave"
					element={<PrivateRoute user={['admin', 'hod', 'faculty', 'pg']} toast={props.toast} />}
				>
					<Route
						path="/navigate/applyleave"
						element={<ApplyLeaveComponent toast={props.toast} />}
					/>
				</Route>
				<Route path='/navigate/updateleave' element={<PrivateRoute user={['admin', 'office']} toast={props.toast} />}>
					<Route path="/navigate/updateleave" element={<UpdateLeave toast={props.toast} />} />
				</Route>
				<Route
					path="/navigate/pastapplications"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/navigate/pastapplications"
						element={<PastApplications toast={props.toast} />}
					/>
				</Route>
				<Route
					path="/check_applications/casual/:id"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/check_applications/casual/:id"
						element={
							<LeavePDFModals toast={props.toast} from="check_applications" />
						}
					></Route>
				</Route>

				<Route
					path="/past_applications/casual/:id"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/past_applications/casual/:id"
						element={
							<LeavePDFModals toast={props.toast} from="past_applications" />
						}
					></Route>
				</Route>
				<Route
					path="/past_applications/pg_applications/:id"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/past_applications/pg_applications/:id"
						element={
							<PGLeavePdfModal toast={props.toast} from="past_applications" />
						}
					></Route>
				</Route>
				<Route
					path="/check_applications/pg_applications/:id"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/check_applications/pg_applications/:id"
						element={
							<PGLeavePdfModal toast={props.toast} from="check_applications" />
						}
					></Route>
				</Route>
				<Route
					path="/check_applications/non_casual/:id"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/check_applications/non_casual/:id"
						element={
							<LeavePDFModalsNonCasual toast={props.toast} from="check_applications" />
						}
					></Route>
				</Route>

				<Route
					path="/past_applications/non_casual/:id"
					element={<PrivateRoute user={["all"]} toast={props.toast} />}
				>
					<Route
						path="/past_applications/non_casual/:id"
						element={
							<LeavePDFModalsNonCasual toast={props.toast} from="past_applications" />
						}
					></Route>
				</Route>

				<Route
					path="/navigate/dates"
					element={<PrivateRoute user={["admin"]} toast={props.toast} />}
				>
					<Route path="/navigate/dates" element={<Dates toast={props.toast} />} />
				</Route>
				<Route
					path="/navigate/checkapplications"
					element={
						<PrivateRoute
							user={['admin', 'faculty', 'hod', 'dean', 'office', 'registrar']}
							toast={props.toast}
						/>
					}
				>
					<Route
						path="/navigate/checkapplications"
						element={<CheckLeaves toast={props.toast} />}
					/>
				</Route>
				<Route path="/login" element={<Login toast={props.toast} />} />
			</Routes>
		</>
	);
};

export default Paths;
