import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import httpClient from "../../httpClient";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

function Calendar({ data }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  //   const lastDayOfMonth = new Date(year, month, daysInMonth).getDay();
  console.log(data);
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    // console.log("month "+month);
    if (month === 0) {
      setMonth(0);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    // console.log("month " + month);
    if (month === 11) {
      setMonth(11);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div>
      <div class="calendar-panel">
        <button class="arrow">
          <FontAwesomeIcon icon={faArrowLeft} onClick={prevMonth} />
        </button>
        <div class="calendar">
          <span>{`${new Date(year, month).toLocaleString("default", {
            month: "long",
          })} ${year}`}</span>
          <div class="week">
            <span class="day header">Sun</span>
            <span class="day header">Mon</span>
            <span class="day header">Tue</span>
            <span class="day header">Wed</span>
            <span class="day header">Thu</span>
            <span class="day header">Fri</span>
            <span class="day header">Sat</span>
          </div>
          {[...Array(6)].map((_, weekIndex) => (
            <div class="week" key={weekIndex}>
              {[...Array(7)].map((_, dayIndex) => {
                const day = weekIndex * 7 + dayIndex + 1 - firstDayOfMonth;
                let isLeaveTaken = false;
                if (data && data[month] && data[month].includes(day) && day > 0 && day <= daysInMonth)
                  isLeaveTaken = true;
                else isLeaveTaken = false;
                return (
                  <span
                    class={`day ${isLeaveTaken ? "taken" : "not-taken"}`}
                    key={dayIndex}
                  >
                    {day > 0 && day <= daysInMonth ? day : ""}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <button class="arrow" onClick={nextMonth}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
      {/* <button onClick={prevMonth}>Prev</button>
      <button onClick={nextMonth}>Next</button> */}
    </div>
  );
}

export default Calendar;
