import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import * as FaIcons from 'react-icons/fa';
import { Badge } from 'react-bootstrap';

export default function Table({ title, headers, initialData }) {
  const [data, setData] = useState(initialData);

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

  return (

    <div class="container ">
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
                    (title != 'Remaining Number of Leaves') ? (
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
                                <Badge pill bg='success' text='light'>{item}</Badge>
                              )
                            }
                            else if (String(item).toLowerCase().startsWith("disapproved")) {
                              return (
                                <Badge pill bg='danger' text='light'>{item}</Badge>
                              )
                            }
                            else if (String(item).toLowerCase().startsWith("pending")) {
                              return (
                                <Badge pill bg='info' text='light'>{item}</Badge>
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
                          (title != 'Remaining Number of Leaves') ? (
                            <td>
                              <FaIcons.FaEye style={{ cursor: "pointer" }} color='green' onClick={(e) => {
                                e.currentTarget.dataset.toggle = 'modal';
                                e.currentTarget.dataset.target = "#modal-" + row[0];
                              }} />&nbsp;
                              {/* <FaIcons.FaPencilAlt style={{cursor: "pointer"}} color='blue'/>&nbsp;
                        <FaIcons.FaPrescriptionBottle style={{cursor: "pointer"}} color='red'/>&nbsp; */}

                            </td>) : ''
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
