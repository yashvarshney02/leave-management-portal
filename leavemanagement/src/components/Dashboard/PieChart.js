import React, { useEffect, useState } from "react";
import './Dashboard.css'
import styled from "styled-components";

const PieChart = (props) => {


  const [progress, setProgress] = useState();
  useEffect(() => {
    let casual = document.querySelector(`.${props.leaveType}`);
    let casual_value = document.querySelector(`.value-${props.leaveType}`);
    let progressValue = 0;
    setProgress(
      setInterval(() => {
        progressValue++;
        if (progressValue <= props.endValue) {
          casual_value.textContent = `Taken = ${props.taken} Total = ${props.total}`;
          casual.style.background = `conic-gradient(
        #4d5bf9 ${progressValue * 3.6}deg,
        #cadcff ${progressValue * 3.6}deg)`;
        }
        if (progressValue == 100) {
          clearInterval(progress);
        }
      }, props.speed)
    );
  }, []);

  return (
    <OuterContainer class="container">
      <div class={`circular-progress ${props.leaveType}`}>
        <span class={`value-container value-${props.leaveType}`}>
          0%
        </span>
      </div>
      <div>{props.leaveType}</div>
    </OuterContainer>
  );
};

const OuterContainer = styled.div`
  .circular-progress {
    position: relative;
    height: 200px;
    width: 200px;
    border-radius: 50%;
    display: grid;
    place-items: center;
  }

  .circular-progress:before {
    content: "";
    position: absolute;
    height: 84%;
    width: 84%;
    background-color: #ffffff;
    border-radius: 50%;
  }

  .value-container {
    position: relative;
    width: 5em;
    font-size: 1.5em;
    font-family: "Times New Roman", Times, serif;
    color: #231c3d;
  }
`;

export default PieChart;
