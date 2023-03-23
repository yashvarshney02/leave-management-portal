import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { toast } from "react-toastify";
import * as FaIcons from 'react-icons/fa';
import { Badge } from 'react-bootstrap';
import httpClient from '../httpClient';

export default function Table({ title, headers, initialData }) {
  const [data, setData] = useState(initialData);
  const [deleteLeaveID, setDeleteLeaveID] = useState("");
  const [showConfirmDeleteAction, setShowConfirmDeleteAction] = useState(false);

  const handleClose = () => setShowConfirmDeleteAction(false);
  const handleShow = () => setShowConfirmDeleteAction(true);

  function handleSearch(val) {
    let finalData = [];
    for (let idx in initialData) {
      for (let i in initialData[idx]) {
        if (String(initialData[idx][i]).toLowerCase().includes(val.toLowerCase())) {
          finalData.push(initialData[idx]);
          break;
        }
      }
    }
    setData(finalData);
  }

  async function handleDeleteLeaveApplication(leaveID) {
    const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/delete_application`, {
      leave_id: leaveID,
    });
    if (resp.data.status == 'error') {
      toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
    } else {
      toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
    }
  }

  function getActions(title, row) {
    if (title == 'Applied Leaves') {
      return (
        <td>
          <FaIcons.FaEye style={{ cursor: "pointer" }} color='green' onClick={(e) => {
            e.currentTarget.dataset.toggle = 'modal';
            e.currentTarget.dataset.target = "#modal-" + row[0];
          }} />&nbsp;
          <FaIcons.FaTrash style={{ cursor: "pointer" }} color='red' onClick={(e) => {
            setDeleteLeaveID(row[0])
            handleShow()
          }} />&nbsp;
        </td>
      )
    } else if (title == 'Check Leave Applications') {
      return (
        <td>
          <FaIcons.FaEye style={{ cursor: "pointer" }} color='green' onClick={(e) => {
            e.currentTarget.dataset.toggle = 'modal';
            e.currentTarget.dataset.target = "#modal-" + row[0];
          }} />&nbsp;
        </td>
      )
    } else {
      return ''
    }
  }

  return (

    <div class="container ">
      <Modal show={showConfirmDeleteAction} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>{`Are you sure you want to delete the leave with ID: ${deleteLeaveID}`} </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setDeleteLeaveID("");
            handleClose()
          }}>
            Discard
          </Button>
          <Button variant="danger" onClick={async () => {
            await handleDeleteLeaveApplication(deleteLeaveID);
            setDeleteLeaveID("");
            handleClose();
          }}>
            <FaIcons.FaTrash></FaIcons.FaTrash>
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="crud shadow-lg p-3 mb-5 mt-5 bg-body rounded">
        <div class="row ">

          <div class="col-sm-3 mt-5 mb-4 text-gred">
            <div className="search">
              <form class="form-inline">
                <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" onChange={(e) => { handleSearch(e.target.value) }} />
              </form>
            </div>
          </div>
          <div class="col-sm-3 offset-sm-2 mt-5 mb-4 text-gred" style={{ color: "green" }}><h2><b>{title}</b></h2></div>
        </div>
        <div class="row">
          <div class="table-responsive " >
            <table class="table table-striped table-hover table-bordered">
              <thead>
                <tr>
                  {
                    headers.map((item, idx) => {
                      return (
                        <th key={idx}>
                          {item}
                        </th>
                      )
                    })
                  }
                  {
                    (title == 'Applied Leaves' || title == 'Check Leave Applications') ? (
                      <th>
                        Action
                      </th>) : ''
                  }
                </tr>
              </thead>
              <tbody>
                {
                  data.map((row, idx) => {
                    return (
                      <tr key={idx} className="cell-1">
                        {
                          row.map((item, i) => {
                            if (String(item).toLowerCase().startsWith("approved")) {
                              return (
                                <td key={i}>
                                  <Badge pill bg='success' text='light'>{item}</Badge>
                                </td>
                              )
                            }
                            else if (String(item).toLowerCase().startsWith("disapproved")) {
                              return (
                                <td key={i}>
                                  <Badge pill bg='danger' text='light'>{item}</Badge>
                                </td>
                              )
                            }
                            else if (String(item).toLowerCase().startsWith("pending")) {
                              return (
                                <td key={i}>
                                  <Badge pill bg='info' text='light'>{item}</Badge>
                                </td>
                              )
                            }
                            return (
                              <td key={i}>
                                {item}
                              </td>
                            )
                          })
                        }
                        {
                          getActions(title, row)
                        }
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
