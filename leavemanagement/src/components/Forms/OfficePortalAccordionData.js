export default function OfficePortalAccordionData({ item }) {
	if (item?.position.includes('pg')) {
		return  (
			<>
			<li style={{ textAlign: "left" }}>
				<span style={{ fontWeight: "bold" }}>
					Total Leaves:
				</span>{" "}
				{item.total_pg_leaves
					? item.total_pg_leaves
					: "NA"}
			</li>
			<li style={{ textAlign: "left" }}>
				<span style={{ fontWeight: "bold" }}>
					Taken Leaves:
				</span>{" "}
				{item?.taken_pg_leaves}
			</li>
		</>
		)
	}
	return (
		<>
			<li style={{ textAlign: "left" }}>
				<span style={{ fontWeight: "bold" }}>
					Total Casual Leaves:
				</span>{" "}
				{item.total_casual_leaves
					? item.total_casual_leaves
					: "NA"}
			</li>
			<li style={{ textAlign: "left" }}>
				<span style={{ fontWeight: "bold" }}>
					Taken Casual Leaves:
				</span>{" "}
				{item?.taken_casual_leaves}
			</li>
			<li style={{ textAlign: "left" }}>
				<span style={{ fontWeight: "bold" }}>
					Total Restricted Leaves:
				</span>{" "}
				{item?.total_restricted_leaves}
			</li>
			<li style={{ textAlign: "left" }}>
				<span style={{ fontWeight: "bold" }}>
					Taken Restricted Leaves:
				</span>{" "}
				{item?.taken_restricted_leaves}
			</li>
			<li style={{ textAlign: "left" }}>
				<span style={{ fontWeight: "bold" }}>
					Total Non Casual Leaves:
				</span>{" "}
				{item.total_non_casual_leave
					? item.total_non_casual_leave
					: "NA"}
			</li>
			<li style={{ textAlign: "left" }}>
				<span style={{ fontWeight: "bold" }}>
					Taken Non Casual Leaves:
				</span>{" "}
				{item?.taken_non_casual_leave}
			</li>
			<li style={{ textAlign: "left" }}>
				<span style={{ fontWeight: "bold" }}>
					Total SCL Leaves:
				</span>{" "}
				{item?.total_scl_leaves}
			</li>
			<li style={{ textAlign: "left" }}>
				<span style={{ fontWeight: "bold" }}>
					Taken SCL Leaves:
				</span>{" "}
				{item?.taken_scl_leaves}
			</li>
		</>
	)

}