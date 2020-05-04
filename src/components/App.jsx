import React, { useState, useEffect, useMemo, useReducer } from "react";
import MqttClient from "./MqttClient";
import MqttServer from "./MqttServer";
import Navibar from "./Navibar";
import ReactDom from "react-dom";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";

const App = props => {
  return (
    <Router>
      <Navibar />

      <Route path="/mqttClient">
        <MqttClient />
      </Route>
      <Route path="/mqttServer">
        <MqttServer />
      </Route>

      <Redirect exact from="/" to="/mqttClient" />
    </Router>
  );
};

export default App;
