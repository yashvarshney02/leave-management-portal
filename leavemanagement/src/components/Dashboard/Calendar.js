import React, { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "./Calendar.css";

export default function CustomCalendar({ data }) {
  function getTileClassName({ date, view }) {
    let curr_date = date.toISOString().slice(0, 10)
    if (Object.keys(data).includes(curr_date)) {
      return data[curr_date].split(" ")[0].toLowerCase()
    }
  }

  function tileContent({ date, view }) { 
    if (Object.keys(data).includes(date.toISOString().slice(0, 10))) {
      return <div className="tile-content">{data[date.toISOString().slice(0, 10)].split("-")[0]}</div>;
    }
  }

  return (
    <div className="calendar-container">
      <Calendar
        tileClassName={getTileClassName}
        tileContent={tileContent}
      />
    </div>
  );
};
