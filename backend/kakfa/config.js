const { Kafka } = require("kafkajs");

/**
 * Initialize Kafka instance
 * @returns {Kafka} Kafka instance
 */
const initializeKafka = () => {
  return new Kafka({
    clientId: "university-management-app",
    brokers: ["localhost:9092"],
  });
};

module.exports = initializeKafka;
