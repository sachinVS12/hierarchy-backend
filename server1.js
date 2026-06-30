// recive code

const mqtt = require("mqtt");

// Local MQTT broker
const broker = "mqtt://localhost:1883";

const client = mqtt.connect(broker);

client.on("connect", () => {
  console.log("Connected to Local MQTT Broker");

  // Subscribe to all topics like p1/data, p2/data, ..., p1000/data
  client.subscribe("+/data", (err) => {
    if (err) {
      console.error("Subscription failed:", err);
    } else {
      console.log("Subscribed to +/data");
    }
  });
});

// Receive messages
client.on("message", (topic, message) => {
  console.log(`Topic: ${topic} | Value: ${message.toString()}`);
});

client.on("error", (err) => {
  console.error("Connection Error:", err);
});

client.on("close", () => {
  console.log("Disconnected from MQTT Broker");
});
