import React, { useEffect, useState } from "react";
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
          casual_value.textContent = `Taken = ${props.taken}; Total = ${props.total}`;
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
        <div class={`value-container value-${props.leaveType}`}>
          0%
        </div>
      </div>
      <div>{props.leaveType}</div>
    </OuterContainer>
  );
};

const OuterContainer = styled.div`
  .circular-progress {
    position: relative;
    height: 170px;
    width: 170px;
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
    font-family: "Poppins", sans-serif;
    font-size: 30px;
    color: #231c3d;
  }
`;

export default PieChart;
