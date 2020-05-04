import React, { useState, useEffect, useMemo, useReducer } from "react";
import ReactDom from "react-dom";
import Paho from "paho-mqtt";
import Trend from "react-trend";
import { Switch, Typography, Form, Input, Button, Row, Col, Card } from "antd";
import R from "ramda";
import classnames from "classnames";
import DICard from "./Card";
import "./app.css";
const { Text, Title } = Typography;

//io52/di/0-5
//io52/rly/0-1
//io52/ai/0-3

function mqttReducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case "SET":
      return R.assoc(payload.topic, payload.value)(state);
    case "PUSH":
      const t = R.prop("trend", state) || [];
      return R.assoc("trend", R.append(parseInt(payload.value), t))(state);
    default:
      return state;
  }
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 }
};
export default props => {
  const [connectState, setConnectState] = useState("disconnect");
  const [hostSettings, setHostSettings] = useState({});
  const [alert, setAlert] = useState("");
  const [state, dispatch] = useReducer(mqttReducer, {});
  const onConnectionLost = response => {
    console.log("mqtt lost connect.", response);
  };

  const onMessage = msg => {
    dispatch({
      type: "SET",
      payload: { topic: msg.destinationName, value: msg.payloadString }
    });
    if (msg.destinationName === "io52/ai/0") {
      dispatch({
        type: "PUSH",
        payload: { value: msg.payloadString }
      });
    }
  };

  const onSuccess = e => {
    console.log("connect success ", e);
    mqttClient.subscribe("io52/di/#");
    mqttClient.subscribe("io52/rly/#");
    mqttClient.subscribe("io52/ai/#");
  };

  const onFailure = e => {
    console.log("connect failure ", e);
    setAlert(e);
    setConnectState("disconnect");
  };

  const toggleConnect = () => {
    if (connectState === "disconnect") {
      mqttClient.connect({ onSuccess: onSuccess, onFailure: onFailure });
      setConnectState("connect");
    } else {
      mqttClient.disconnect();
      setConnectState("disconnect");
    }
  };
  // "AMQJS0005E Internal error. Error Message: message is not defined, Stack trace: No Error Stack Available";
  const mqttClient = useMemo(() => {
    console.log("usememo");
    let _client = new Paho.Client(
      "broker.mqttdashboard.com",
      8000,
      "austin" + Math.random() * 100
    );
    _client.onConnectionLost = onConnectionLost;
    _client.onMessageArrived = onMessage;
    return _client;
  }, [hostSettings]);

  const handleSubmit = v => {
    setHostSettings(v);
  };

  const relayChange = (topic, checked) => {
    const message = new Paho.Message(checked ? "1" : "0");
    message.destinationName = topic;
    mqttClient.send(message);
  };

  let divClass = classnames({
    disabled: connectState === "disconnect"
  });

  return (
    <div style={{ margin: "auto", width: "70vw" }}>
      <Title level={2}>RemoteI/O demo</Title>

      {alert === "" ? null : (
        <Row>
          <Col span={24}>
            <Alert message={alert} type="warning" closable />
          </Col>
        </Row>
      )}

      <Row style={{ padding: "1em 0" }}>
        <Col span={8}>
          <Text
            style={{ paddingBottom: "2em" }}
            type={connectState === "disconnect" ? "danger" : "secondary"}
          >
            Current state: {connectState}
          </Text>
        </Col>
        <Col>
          <Button
            onClick={toggleConnect}
            type={connectState === "connect" ? "danger" : "primary"}
          >
            {connectState === "disconnect" ? "Connect" : "Disconnect"}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Form
            onFinish={handleSubmit}
            initialValues={{
              host: "broker.mqttdashboard.com",
              port: 8000
            }}
          >
            <Form.Item
              label="Host"
              name="host"
              rules={[{ required: true, message: "Please input host name !" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Port"
              name="port"
              rules={[{ required: true, message: "Please input port number!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Setting
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <div className={divClass}>
        <Title level={3}> DI </Title>
        <Row>
          <Col span={6}>
            <DICard title="DI1" state={R.prop("io52/di/1", state)} />
          </Col>
          <Col span={6}>
            <DICard title="DI2" state={R.prop("io52/di/2", state)} />
          </Col>
          <Col span={6}>
            <DICard title="DI3" state={R.prop("io52/di/3", state)} />
          </Col>
          <Col span={6}>
            <DICard title="DI4" state={R.prop("io52/di/4", state)} />
          </Col>
        </Row>

        <Title level={3}> Relay </Title>

        <Row>
          <Col span={4}>
            <Text>Realy0:</Text>
          </Col>
          <Col span={4}>
            <Switch onChange={checked => relayChange("io52/rly/0", checked)} />
          </Col>
          <Col span={4}>
            <Text>Realy1:</Text>
          </Col>
          <Col span={4}>
            <Switch onChange={checked => relayChange("io52/rly/1", checked)} />
          </Col>
        </Row>

        <Title level={3}> AI </Title>
        <Row>
          <Col span={6}>
            <Card title="AI0">{R.prop("io52/ai/0", state)}</Card>
          </Col>
          <Col span={6}>
            <Card title="AI1">{R.prop("io52/ai/1", state)}</Card>
          </Col>
          <Col span={6}>
            <Card title="AI2">{R.prop("io52/ai/2", state)}</Card>
          </Col>
          <Col span={6}>
            <Card title="AI3">{R.prop("io52/ai/3", state)}</Card>
          </Col>
        </Row>
        <pre>{JSON.stringify(R.prop("trend", state))}</pre>

        <Title level={3}> Trend of AI0 </Title>
        <Row>
          <Trend
            data={R.prop("trend", state) || []}
            smooth
            gradient={["red", "orange", "yellow"]}
            strokeWidth={2}
            strokeLinecap={"butt"}
          />
        </Row>
      </div>
    </div>
  );
};
