const initializeKafka = require('./config');
require('dotenv').config();
const connectDB = require('../db');
const TeacherNotification = require('../models/notification').TeacherNotification;
const StudentNotification = require('../models/notification').StudentNotification;
const User = require('../models/user');
const kafka = initializeKafka();
const consumer = kafka.consumer({ groupId: 'notification-service' });
const admin = kafka.admin();

const io = require('socket.io')(3002, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

/**
 * Consume events from Kafka and emit them to connected clients
 */
const consumeEvents = async () => {
  try {
    await consumer.connect();
    console.log('Consumer connected');

    await admin.connect();
    console.log('Admin connected');

    // List and log available topics
    const topics = await admin.listTopics();
    console.log('Available topics:', topics);

    // Specify topics to subscribe to
    const subscriptionTopics = ['course-added', 'teacher-assigned'];
    const validTopics = subscriptionTopics.filter(topic => topics.includes(topic));

    if (validTopics.length === 0) {
      console.error('No valid topics found:', subscriptionTopics);
      return;
    }

    console.log('Valid topics:', validTopics);

    // Subscribe to valid topics
    for (const topic of validTopics) {
      await consumer.subscribe({ topic, fromBeginning: true });
      console.log(`Subscribed to topic: ${topic}`);
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log(`Received event on topic ${topic}:`, event);

        if (topic === 'teacher-assigned') {
          const notification = new TeacherNotification({
            teacherId: event.teachers[0],
            courseId: event.courseId,
            timestamp: new Date(),
            message: 'You have been assigned to a new course.'
          });
          await notification.save();
          io.emit('notification', event);
        }

        if (topic === 'course-added') {
          console.log('Processing course-added event:', event);

          const students = await User.find({ department: event.department, role: 'student' });
          console.log(`Found ${students.length} students in department ${event.department}`);

          const notifications = students.map(student => ({
            studentId: student._id,
            courseId: event.courseId,
            timestamp: new Date(),
            message: `New course added in your department: ${event.courseId}`
          }));

          try {
            const insertedNotifications = await StudentNotification.insertMany(notifications);
            console.log('Notifications inserted in DB:', insertedNotifications.length);
          } catch (error) {
            console.error('Error inserting notifications in DB:', error);
          }

          // Emit notifications to all connected clients
          students.forEach(student => {
            io.emit('notification', {
              studentId: student._id,
              courseId: event.courseId,
              timestamp: new Date(),
              message: `New course added in your department: ${event.courseId}`
            });
            console.log(`Notification emitted for student ${student._id}`);
          });
        }
      }
    });

    await admin.disconnect();
    console.log('Admin disconnected');
  } catch (error) {
    console.error('Error in consumer:', error);
  }
};

consumeEvents();
