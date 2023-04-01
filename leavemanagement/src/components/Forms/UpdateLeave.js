import React, { useState, useEffect } from 'react'
import httpClient from '../../httpClient';
import "./ApplyForm.css"
import LoadingIndicator from '../LoadingIndicator';
import { useAuth } from '../../contexts/AuthContext';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import "./Form.css";
import { Button } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';

export default function UpdateLeave({ toast }) {
	const { currentUser } = useAuth();
	const [currentQuery, setCurrentQuery] = useState("users_sample");
	const [collectiveData, setCollectiveData] = useState();
	const listOfQueries = {
		"Add Users": "users_sample",
		"Add Leaves Info": "leaves_sample"
	}
	const [formLoading, setFormLoading] = useState(false);
	const [fileName, setFileName] = useState('')
	const [downloadLink, setDownloadLink] = useState('');

	const handleDownloadClick = async (query) => {

		const response = await httpClient.post(`${process.env.REACT_APP_API_HOST}/sample_csvs`, {
			name: query
		})
		const blob = new Blob([response.data], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		setFileName(`${query}.csv`)
		setCurrentQuery(query)
		setDownloadLink(url);
	};

	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		const formData = new FormData();
		formData.append('file', file);
		formData.append('name', currentQuery);

		try {
			const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/process_query`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			if (resp.data.status == "success") {
				toast.success("Query Executed Successfully", toast.POSITION.BOTTOM_RIGHT);
			} else {
				toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
				return;
			}
		} catch (error) {
			console.log(error); // Check if there are any error messages
		}
	};


	const getEmails = async (e) => {
		try {
			const resp = await httpClient.get(`${process.env.REACT_APP_API_HOST}/collective_data`);
			if (resp.data.status == "success") {
				console.log(resp.data.data)
				setCollectiveData(resp.data.data);
				// toast.success("Leaves fetched Successfully", toast.POSITION.BOTTOM_RIGHT);
			} else {
				toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
				return;
			}
		} catch (error) {
			// toast.error("something went wrong", toast.POSITION.BOTTOM_RIGHT);
		}
	}

	useEffect(() => {
		async function test() {
			await getEmails();
			await handleDownloadClick(currentQuery);
		}
		test();
	}, [])

	return (
		<>
			<div className="container-al">
				<Card style={{ width: "100%" }}>
					<Card.Body style={{ width: "100%" }}>
						<Card.Title className="title-al" >Establishment Portal</Card.Title>
						<Card.Text>
							<form>
								<Container className="content-al">
									<div className="user-details-al">
										<div className="input-box-al">
											<div className="details-al">
												<Row className="row-al">
													<Col className="col-al">
														<legend htmlFor="form_query" style={{ fontSize: "18px" }}>Choose Query</legend>
														<select className="form-control" id="form_query" onChange={async (e) => { await handleDownloadClick(listOfQueries[e.target.value]) }} required>
															{
																Object.keys(listOfQueries).map((item, key) => {
																	return <option key={key}>{item}</option>
																})
															}
														</select>
													</Col >

												</Row >
												<div style={{ textAlign: "left" }}>
													<Button >
														{downloadLink && <a href={downloadLink} style={{ color: "white" }} download={fileName}>Download Sample Data</a>}
													</Button>
												</div>
												<br />
												<div style={{ textAlign: "left" }}>
													<input type="file" accept=".csv" onChange={handleFileChange} />
												</div>
												{/* <Row className="row-al">
												<Col>
													<button type="submit" className="btn btn-primary btn-block">{formLoading ? <LoadingIndicator color={"white"}></LoadingIndicator> : "Apply Leave"}</button>
												</Col>
											</Row> */}
											</div>
										</div>
									</div>
								</Container>
							</form>
						</Card.Text>
					</Card.Body>
				</Card>
			</div >
			<div className="container-al">
				<Card style={{ width: "100%" }}>
					<Card.Body style={{ width: "100%" }}>
						<Card.Title className="title-al" >Collective Leave Data</Card.Title>
						<Card.Text>
							{
								collectiveData?.map((item, key) => {
									return (
										<Accordion defaultActiveKey="0">
											<Accordion.Item eventKey="0">
												<Accordion.Header>{item.name} ({item.email_id})</Accordion.Header>
												<Accordion.Body>
													<ul>
													<li style={{textAlign: "left"}}>
														<span style={{fontWeight: "bold"}}>Total Casual Leaves:</span> {item.total_casual_leaves?item.total_casual_leaves:"NA"}
													</li>
													<li style={{textAlign: "left"}}>
														<span style={{fontWeight: "bold"}}>Taken Casual Leaves:</span> {item.total_casual_leaves?item.taken_casual_leaves:"NA"}
													</li>
													<li style={{textAlign: "left"}}>
														<span style={{fontWeight: "bold"}}>Total Non Casual Leaves:</span> {item.total_casual_leaves?item.total_non_casual_leave:"NA"}
													</li>
													<li style={{textAlign: "left"}}>
														<span style={{fontWeight: "bold"}}>Taken Non Casual Leaves:</span> {item.total_casual_leaves?item.taken_non_casual_leave:"NA"}
													</li>
													</ul>
												</Accordion.Body>
											</Accordion.Item>
										</Accordion>
									)

								})
							}

						</Card.Text>
					</Card.Body>
				</Card>
			</div >
		</>
	)
}
