import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import * as FaIcons from 'react-icons/fa';
import { Badge } from 'react-bootstrap';
import DatePicker from "react-multi-date-picker"
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import httpClient from '../httpClient';

export default function DatesTable({ toast, title, headers, initialData }) {
  const [initData, setInitData] = useState(initialData);
  const [data, setData] = useState(initialData);
  const [dates, setDates] = useState([]);
  const [showSaveButton, setShowSaveButton] = useState("");

  async function handleSave() {
    const resp = await httpClient.post(`${process.env.REACT_APP_API_HOST}/add_holiday`, {
      year: title,
      holidays: data
    });    
    if (resp.data.status == 'error') {
      toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
    } else {
      toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);            
    }
  }

  useEffect(() => {
    let temp = [];
    for (let idx in data) {
      let date = data[idx][0];
      temp.push(
        new Date(date)
      )
    }
    setDates(temp);
  }, [])

  return (

    <div className="container ">
      <div className="crud shadow-lg p-3 mb-5 mt-5 bg-body rounded">
        <div className="row ">

          <div className="col-sm-3 mt-5 mb-4 text-gred">
            <div className="search">
              <form className="form-inline">
                <DatePicker
                  style={{ width: "300px", height: "50px" }}
                  value={dates}
                  minDate={title + "-" + "01" + "-" + "01"}
                  maxDate={title + "-" + "12" + "-" + "31"}
                  onChange={(listOfDates) => {
                    let temp = [], data_temp = []
                    for (let i in listOfDates) {
                      let time_string = listOfDates[i].year + "-" + ((parseInt(listOfDates[i].month.number / 10) == 0) ? "0" + listOfDates[i].month.number : listOfDates[i].month.number) + "-" + ((parseInt(listOfDates[i].day / 10) == 0) ? "0" + listOfDates[i].day : listOfDates[i].day)
                      data_temp.push([time_string])
                      temp.push(
                        new Date(time_string)
                      )
                    }
                    setData(data_temp)
                    setDates(temp);
                  }}
                  format="MMMM DD YYYY"
                  sort
                  plugins={[
                    <DatePanel />
                  ]}
                />
                <div style={{ "textAlign": "left", display: showSaveButton }}><br></br><Button onClick={async () => { await handleSave() }}>Save Changes</Button></div>
              </form>
            </div>
          </div>
          <div className="col-sm-3 offset-sm-2 mt-5 mb-4 text-gred" style={{ color: "green" }}><h2><b>{title}</b></h2></div>
        </div>
        <div className="row">
          <div className="table-responsive " >
            <table className="table table-striped table-hover table-bordered">
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
                </tr>
              </thead>
              <tbody>
                {
                  data.map((row, idx) => {
                    return (
                      <tr key={idx} className="cell-1">
                        {
                          row.map((item, i) => {
                            return (
                              <td key={i}>
                                {item}
                              </td>
                            )
                          })
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
