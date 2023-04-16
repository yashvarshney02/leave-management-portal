import React from "react";
import PropTypes from "prop-types";

const ProgressBar = ({ value, max, type }) => {
  const percentage = ((value / max) * 100).toFixed(2);
  const progressStyle = {
    width: `${percentage}%`,
    backgroundColor: "#4caf50",
    height: "10px",
    borderRadius: "10px",
  };
  const barStyle = {
    backgroundColor: "#e0e0e0",
    height: "10px",
    borderRadius: "10px",
    display: "inline-block",
    width: "150px", // adjust this value to fit your layout
  };
  const textStyle = {
    display: "inline-block",
    marginLeft: "10px",
    fontWeight: "bold",
    fontSize: "14px",
  };

  return (
    <div>
      <div style={barStyle}>
        <div style={progressStyle}></div>
      </div>
      <div style={textStyle}>
        &nbsp;&nbsp;&nbsp;Remaining {type}: {value}/{max}
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
};

export default ProgressBar;