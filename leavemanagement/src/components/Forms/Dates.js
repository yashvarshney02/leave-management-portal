import { useState, useEffect } from "react";
import httpClient from "../../httpClient";
import DatesTable from "../DatesTable";

export default function Dates({ toast }) {
  const [dates, setDates] = useState({})
  const headers = ['Date']

  useEffect(() => {
    async function test() {
      const resp = await httpClient.get(`${process.env.REACT_APP_API_HOST}/get_holidays_info`);
      if (resp.data.status == 'error') {
        toast.error(resp.data.emsg, toast.POSITION.BOTTOM_RIGHT);
      } else {
        // toast.success(resp.data.data, toast.POSITION.BOTTOM_RIGHT);
        let dic = resp.data.data, sortedDic = {};
        const sortedKeys = Object.keys(dic).sort();     
        sortedKeys.forEach(key => {
          sortedDic[key] = dic[key];
        });
        setDates(sortedDic);
      }
    }
    test()
  }, [])

  return (
    <div style={{ paddingTop: "100px" }}>
      {
        Object.keys(dates).map((year, key) => {
          let rows = [];
          for (let idx in dates[year]) {
            rows.push([dates[year][idx]]);
          }
          return <DatesTable toast={toast} key={key} headers={headers} initialData={rows} title={year}></DatesTable>
        })
      }
    </div>
  )
}