import React from "react";
import { Typography, Card } from "antd";
export default props => {
  const { title, state } = props;
  const color = state === "0" ? "#800b22" : "#2e800b";
  return (
    <Card title={title} bodyStyle={{ backgroundColor: color, color: "white" }}>
      {state === "0" ? "OFF" : "ON"}
    </Card>
  );
};
