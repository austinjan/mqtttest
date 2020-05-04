import React from "react";
import { Link } from "react-router-dom";

export default () => {
  return (
    <div>
      <ul>
        <li className="navli">
          <Link to="/mqttClient">Client</Link>
        </li>
        <li className="navli">
          <Link to="/mqttServer">Server</Link>
        </li>
      </ul>
    </div>
  );
};
