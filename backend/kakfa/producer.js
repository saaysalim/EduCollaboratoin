const initializeKafka = require("./config");

const kafka = initializeKafka();
const producer = kafka.producer();
const produceEvent = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
};

module.exports = produceEvent;
