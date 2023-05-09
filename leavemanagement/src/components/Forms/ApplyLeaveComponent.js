import React from "react";
import { useAuth } from '../../contexts/AuthContext';
import FacultyApplyLeave from "./FacultyApplyLeave";
import PGApplyLeave from "./PGApplyLeave";

export default function ApplyLeaveComponent({toast}) {
	const { currentUser } = useAuth();
	if (currentUser.position.includes('pg')) {
		return <PGApplyLeave toast={toast} />
	} else {
		return <FacultyApplyLeave toast={toast}/>
	}
}