import React, { useState, useEffect } from "react";
import httpClient from "../../httpClient";
import "./ApplyForm.css";
import LoadingIndicator from "../LoadingIndicator";
import { useAuth } from "../../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import "./Form.css";
import { Button, Modal, Accordion, Badge } from "react-bootstrap";
import OfficePortalAccordionData from "./OfficePortalAccordionData";

export default function UpdateLeave({ toast }) {
  const [specificData, setSpecificData] = useState();
  const [currentQuery, setCurrentQuery] = useState("users_sample");
  const [initialcollectiveData, setinitialCollectiveData] = useState();
  const [collectiveData, setCollectiveData] = useState();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const listOfQueries = {
    "Add Users": "users_sample",
    "Update Leaves Balance": "leaves_balance",
  };
  const [formLoading, setFormLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [isLoadingSample,setIsLoadingSample] = useState(false);

  const handleDownloadClick = async (query) => {
	setIsLoadingSample(true);
    const response = await httpClient.post(
      `${process.env.REACT_APP_API_HOST}/sample_csvs`,
      {
        name: query,
      }
    );	
	setIsLoadingSample(false);
    const blob = new Blob([response.data], { type: "text/csv" });	
    const url = window.URL.createObjectURL(blob);	
    setFileName(`${query}.csv`);
    setCurrentQuery(query);
    setDownloadLink(url);	
  };

  const handleFileSubmit = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", currentQuery);
    try {
      const resp = await httpClient.post(
        `${process.env.REACT_APP_API_HOST}/process_query`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (resp.data.status == "success") {
        toast.success(
          `Query Executed Successfully. ${resp.data.data}`,
          toast.POSITION.BOTTOM_RIGHT
        );
        let res = await getCollectiveData();
      } else {
        toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
        return;
      }
    } catch (error) {
      console.log(error); // Check if there are any error messages
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
	  setIsFilePicked(true);
	  if (!file) setIsFilePicked(false);
  };

  const getCollectiveData = async (e) => {
    try {
      const resp = await httpClient.get(
        `${process.env.REACT_APP_API_HOST}/collective_data`
      );
      if (resp.data.status == "success") {     
        setinitialCollectiveData(resp.data.data);
        setCollectiveData(resp.data.data);
        // toast.success("Leaves fetched Successfully", toast.POSITION.BOTTOM_RIGHT);
      } else {
        toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
        return;
      }
    } catch (error) {
      // toast.error("something went wrong", toast.POSITION.BOTTOM_RIGHT);
    }
  };

  function handleFilter(text) {
    if (text.length == 0) {
      setCollectiveData(initialcollectiveData);
      return;
    }
    let temp = [];
    for (let idx in initialcollectiveData) {
      if (
        initialcollectiveData[idx].email
          .toLowerCase()
          .includes(text.toLowerCase()) ||
        initialcollectiveData[idx].name
          .toLowerCase()
          .includes(text.toLowerCase()) ||
        initialcollectiveData[idx].position
          .toLowerCase()
          .includes(text.toLowerCase())
      ) {
        temp.push(initialcollectiveData[idx]);
      }
    }
    setCollectiveData(temp);
  }

  useEffect(() => {
    async function test() {
      await getCollectiveData();
      await handleDownloadClick(currentQuery);
    }
    test();
  }, []);
  useEffect(() => {
    async function test() {
      await getCollectiveData();
      await handleDownloadClick(currentQuery);
    }
    test();
  }, []);

  return (
    <>
      <div className="container-al">
        <Card style={{ width: "100%" }}>
          <Card.Body style={{ width: "100%" }}>
            <Card.Title className="title-al">Update Portal</Card.Title>
            <Card.Text>
              <form>
                <Container className="content-al">
                  <div className="user-details-al">
                    <div className="input-box-al">
                      <div className="details-al">
                        <Row className="row-al">
                          <Col className="col-al">
                            <legend
                              htmlFor="form_query"
                              style={{ fontSize: "18px" }}
                            >
                              Choose Query
                            </legend>
                            <select
                              className="form-control"
                              id="form_query"
                              onChange={async (e) => {
                                handleDownloadClick(
                                  // listOfQueries[e.target.value]
                                  e.target.value
                                );
                              }}
                              required
                            >
                              {Object.keys(listOfQueries).map((item, key) => {
                                // return <option key={key}>{item}</option>;
                                return <option key={key} value={listOfQueries[item]}>{item}</option>;
                              })}
                            </select>
                          </Col>
                        </Row>
                        <div style={{ textAlign: "left" }}>
                          <Button>
                            {!isLoadingSample && (
                              <a
                                href={downloadLink}
                                style={{
                                  color: "white",
                                  textDecoration: "none",
                                }}
                                download={fileName}
								// onClick={console.log(fileName)}
                              >
                                Download Sample Data
                              </a>
                            )}
                          </Button>
                        </div>
                        <br />
                        <div
                          style={{
                            textAlign: "left",
                          }}
                        >
                          <input
                            type="file"
                            accept=".csv"
                            style={{ border: "none" }}
                            onChange={handleFileChange}
                          />
                        </div>
                        <div className="d-flex">
                          <a
                            onClick={handleFileSubmit}
                            className={`btn btn-primary btn-lg ${
                              isFilePicked ? "" : "disabled"
                            }`}
                            role="button"
                            aria-disabled="true"
                          >
                            Upload
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container>
              </form>
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
      <div className="container-al">
        <Card style={{ width: "100%" }}>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>
                {specificData?.name} ({specificData?.email_id})
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ul>
                {specificData?.leave_ids.map((item, idx) => {                         
                  return (
                    <li style={{ textAlign: "left" }}>
                      <a
                        href={ item[0].startsWith("LMP") ? (`/past_applications/${item[2].toLowerCase().startsWith("casual")?"casual": "non_casual"}/${item[0]}`): (`/past_applications/${"pg_applications"}/${item[0]}`)}
                        target="blank"
                        style={{ fontWeight: "bold" }}
                      >
                        Leave ID {item[0]}
                      </a>
                      : {item[1]}
                    </li>
                  );
                })}
              </ul>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
          <Card.Body style={{ width: "100%" }}>
            <Card.Title className="title-al">Collective Leave Data</Card.Title>
            <Card.Text>
              <input
                type="text"
                className="form-control"
                id="form_name"
                onChange={(e) => {
                  handleFilter(e.target.value);
                }}
                placeholder="Search by email or name or position"
              />
              <br />
              {collectiveData?.map((item, key) => {             
                return (
                  <Accordion defaultActiveKey={"0"}>
                    <Accordion.Item eventKey={key}>
                      <Accordion.Header>
                        {item.name} ({item.email}) &nbsp;&nbsp; &nbsp;&nbsp;<Badge pill bg="secondary" text="light">
																{item.position}
															</Badge>
                      </Accordion.Header>
                      <Accordion.Body>
                        <ul>
                          <OfficePortalAccordionData item={item} position={item.position}/>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSpecificData(item);
                              handleShow();
                            }}
                          >
                            View All applications
                          </Button>
                        </ul>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                );
              })}
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
