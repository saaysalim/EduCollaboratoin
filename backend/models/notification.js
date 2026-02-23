// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema(
//   {
//     teacherId: { type: mongoose.Types.ObjectId, ref: "User",required: true},
//     // studentId: { type: mongoose.Types.ObjectId, ref: 'User', required: false },
//     courseId: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
//     timestamp: { type: Date, default: Date.now },
//   },
//   { collection: "Notification", timestamps: true }
// );

// const Notification = mongoose.model("Notification", notificationSchema);
// module.exports = Notification;

// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema(
//   {
//     teacherId: { type: mongoose.Types.ObjectId, ref: "User", required: false },
//     studentId: { type: mongoose.Types.ObjectId, ref: "User", required: false },
//     courseId: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
//     timestamp: { type: Date, default: Date.now },
//   },
//   { collection: "Notification", timestamps: true }
// );

// // Add a validation to ensure at least one of teacherId or studentId is present
// notificationSchema.pre('save', function (next) {
//   if (!this.teacherId && !this.studentId) {
//     return next(new Error('Either teacherId or studentId must be present'));
//   }
//   next();
// });

// const Notification = mongoose.model("Notification", notificationSchema);
// module.exports = Notification;


// const mongoose = require("mongoose");

// const teacherNotificationSchema = new mongoose.Schema(
//   {
//     teacherId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
//     courseId: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
//     timestamp: { type: Date, default: Date.now },
//   },
//   { collection: "TeacherNotification", timestamps: true }
// );

// const TeacherNotification = mongoose.model("TeacherNotification", teacherNotificationSchema);
// module.exports = TeacherNotification;


// const studentNotificationSchema = new mongoose.Schema(
//   {
//     studentId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
//     courseId: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
//     timestamp: { type: Date, default: Date.now },
//   },
//   { collection: "StudentNotification", timestamps: true }
// );

// const StudentNotification = mongoose.model("StudentNotification", studentNotificationSchema);
// module.exports = StudentNotification;

const mongoose = require("mongoose");

const teacherNotificationSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "TeacherNotification", timestamps: true }
);

const TeacherNotification = mongoose.model("TeacherNotification", teacherNotificationSchema);

const studentNotificationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "StudentNotification", timestamps: true }
);

const StudentNotification = mongoose.model("StudentNotification", studentNotificationSchema);

module.exports = {
  TeacherNotification,
  StudentNotification
};
