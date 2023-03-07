import DatePicker from "react-multi-date-picker"
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import { useState } from "react";

export default function Dates() {
  const [dates, setDates] = useState([
    new Date(),
    new Date({ year: 2020, month: 9, day: 8 }),
    "December 09 2020",
    1597994736000 //unix time in milliseconds (August 21 2020)
  ])

  return (
    <DatePicker
      value={dates}
      onChange={setDates}
      format="MMMM DD YYYY"
      sort
      plugins={[
        <DatePanel />
      ]}
    />
  )
}