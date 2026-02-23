const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express(); //initalizing the express
const cors = require("cors");

const AfghanistanUser = require("./models/afghanistanUser");
const IrelandUser = require("./models/irelandUser");
const Admin = require("./models/admin");
const Department = require("./models/department");
const Course = require("./models/course");
const Token = require("./models/token");
const CourseRegistration = require("./models/course-registration");
const StudentActivity = require("./models/student-activity");
const StudentNote = require("./models/student-notes");
const Lesson = require("./models/lesson");
const Exam = require("./models/exam");
const {
  TeacherNotification,
  StudentNotification,
} = require("./models/notification");
const produceEvent = require("./kakfa/producer");
const { Web3 } = require("web3");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

require("dotenv").config();
const bcrypt = require("bcrypt");
const multer = require("multer");
const mongodburl = process.env.MONGODB_URL;
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const OAuth2 = google.auth.OAuth2;
const port = process.env.PORT || 3001;

mongoose
  .connect(mongodburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongodburl", mongodburl);
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Web3 setup
// Ensure this matches Ganache GUI settings

const web3 = new Web3("http://127.0.0.1:7545");
const StudentData = require("../src/blockchain/build/contracts/StudentData.json");
const getContractInstance = async () => {
  const networkId = await web3.eth.net.getId();
  console.log("Connected to network with ID backend:", networkId);
  const deployedNetwork = StudentData.networks[networkId];
  if (!deployedNetwork) {
    throw new Error(
      `No contract deployed on network with ID backend: ${networkId}`
    );
  }
  return new web3.eth.Contract(StudentData.abi, deployedNetwork.address);
};

/*UTILITIES */

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).array("files", 10);

/*   API ROUTES    */

const consentUpload = multer({
  storage: storage,
});

app.post(
  "/create-account",
  consentUpload.single("consentFile"),
  async (req, res) => {
    const {
      name,
      email,
      password,
      grade,
      department,
      role,
      school,
      academicDetails,
      permanentAddress,
      academicPercentage,
      age,
      gender,
    } = req.body;
    const consentFile = req.file;

    console.log("Received request to create account with data:", req.body);

    try {
      const hashedPw = await bcrypt.hash(password, 10);
      console.log("Password hashed successfully");

      let newUser;
      if (school === "afghanistan") {
        newUser = new AfghanistanUser({
          name,
          email,
          password: hashedPw,
          department:
            role !== "admin" ? convertFieldsToObjectId(department) : null,
          // department: null,
          grade: role === "student" ? grade : null,
          role,
          school,
          // consentFilePath: role === "student" && school === "afghanistan" ? (consentFile ? consentFile.path : null) : null,
          age: role === "student" ? age : null,
          gender: role === "student" ? gender : null,
        });
      } else if (school === "ireland") {
        newUser = new IrelandUser({
          name,
          email,
          password: hashedPw,
          department:
            role !== "admin" ? convertFieldsToObjectId(department) : null,
          // department: null,
          grade: role === "student" ? grade : null,
          role,
          school,
          age: role === "student" ? age : null,
          gender: role === "student" ? gender : null,
        });
      }

      const savedUser = await newUser.save();
      console.log("New user saved to MongoDB:", newUser);

      // Store additional data on blockchain
      if (role === "student") {
        const contract = await getContractInstance();
        const accounts = await web3.eth.getAccounts();
        const receipt = await contract.methods
          .storeStudentData(
            academicDetails,
            permanentAddress,
            academicPercentage
          )
          .send({ from: accounts[0], gas: 2000000 });

        console.log("Transaction receipt:", receipt);
        // Update user document with transaction hash
        savedUser.transactionHash = receipt.transactionHash;
        await savedUser.save();
      }
      res.json({
        result: savedUser,
        transactionHash: savedUser.transactionHash,
      });
    } catch (err) {
      console.error("Error creating user:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// Fetch student data from blockchain
app.post("/fetch-student-data", async (req, res) => {
  const { studentAddress } = req.body;
  try {
    console.log(
      "Received request to fetch student data with address:",
      studentAddress
    );
    // Initialize contract
    const contract = await getContractInstance();
    // Fetch student data from contract
    const studentData = await contract.methods
      .getStudentData(studentAddress)
      .call();
    console.log("Fetched student data from blockchain:", studentData);
    res.json({
      result: {
        academicDetails: studentData[0],
        permanentAddress: studentData[1],
        academicPercentage: studentData[2],
      },
    });
  } catch (err) {
    console.error("Error fetching student data:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/send-email", (req, response) => {
  const { isHtml, to, subject, html, text } = req.body;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Account Status Update</title>
<style>
*{
  box-sizing:border-box;
}
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
  }
  .container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #fff;
    border:1px solid black;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
  h1 {
    color: #333;
    text-align: center;
  }
  p {
    color: #666;
    line-height: 1.6;
  }
  .button {
    display: block;
    width:10rem;
    padding: 10px 20px;
    background-color: darkslategray;
    color: white;
    border-radius: 5px;
    margin: 20px auto;
  }
  .link{
    text-decoration: none;
    color:white !important;
  }
</style>
</head>
<body>
  <div class="container">
    ${html ? html : ""}
    <button class="button">
    <a class="link" noreferrer target='_blank' noopener href=${
      process.env.NODE_ENV === "production"
        ? "http://localhost:3000"
        : "http://localhost:3000"
    }>Visit Our Website</a>
    </button>
  </div>
</body>
</html>
`;

  const oauth2Client = new OAuth2(
    process.env.NODE_MAILER_CLIENT_ID,
    process.env.NODE_MAILER_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.NODE_MAILER_REFRESH_TOKEN,
  });

  oauth2Client.getAccessToken((err, token) => {
    if (err) {
      console.error("Error getting access token:", err);
      return response.status(500).json({ error: "Failed to get access token" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.NODE_MAILER_EMAIL,
        accessToken: token,
        clientId: process.env.NODE_MAILER_CLIENT_ID,
        clientSecret: process.env.NODE_MAILER_CLIENT_SECRET,
        refreshToken: process.env.NODE_MAILER_REFRESH_TOKEN,
      },
    });

    const mailOptions = {
      from: "Edu Collab Hub",
      to: to,
      subject: subject,
      text: isHtml ? "" : text,
      html: isHtml ? htmlContent : "",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return response.status(500).json({ error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        return response.json({ result: info.response });
      }
    });
  });
});

app.post("/change-password/:id", (req, response) => {
  const uid = req.params.id;
  const { newPassword } = req.body;
  bcrypt
    .hash(newPassword, 10)
    .then((res) => {
      const hashedPw = res;
      const user = getUserById(uid);
      user.password = hashedPw;
      return user.save();
    })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/change-profile/:id", (req, response) => {
  const uid = req.params.id;
  const { name, email } = req.body;
  getUserById(uid)
    .then((user) => {
      user.name = name;
      user.email = email;
      return user.save();
    })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/update-user/:id", async (req, response) => {
  const { account_status } = req.body;
  const id = req.params.id;
  try {
    const user = await getUserById(id);
    user.account_status = account_status;
    const updatedUser = await user.save();
    response.json({ result: updatedUser });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.get("/get-users", async (req, response) => {
  try {
    const users = await getAllUsers();
    response.json({ result: users });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/filterUserByEmail", async (req, response) => {
  const { email } = req.body;
  try {
    const user = await getUserByEmail(email);
    response.json({ result: user });
  } catch (err) {
    response.status(500).json({ error: err.message });
  }
});

app.post("/checkCredentials", async (req, response) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      response.json({ error: "User Not Found!" });
      return;
    }
    const pwmatch = await bcrypt.compare(password, user.password);
    if (!pwmatch) {
      response.json({ error: "Wrong Password" });
      return;
    }
    response.json({ result: user });
  } catch (err) {
    response.status(500).json({ error: err.message });
  }
});

app.post("/create-department", async (req, response) => {
  const { name } = req.body;
  const newDept = new Department({
    title: name,
  });

  try {
    const savedDept = await newDept.save();
    response.json({ result: savedDept });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/update-department/:id", async (req, response) => {
  const { name } = req.body;
  const id = req.params.id;
  try {
    const updatedDept = await Department.findByIdAndUpdate(
      id,
      { title: name },
      { new: true }
    );
    response.json({ result: updatedDept });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.get("/get-departments", async (req, response) => {
  try {
    const departments = await Department.find();
    response.json({ result: departments });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.get("/delete-department/:id", async (req, response) => {
  const id = req.params.id;
  try {
    const deletedDept = await Department.findByIdAndDelete(id);
    response.json({ result: deletedDept });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/filterDeptByName", async (req, response) => {
  const { name } = req.body;
  try {
    const departments = await Department.find({ title: name });
    response.json({ result: departments });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.get("/get-courses", async (req, response) => {
  try {
    const courses = await Course.find();
    response.json({ result: courses });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/create-course", async (req, response) => {
  const { name, courseid, department } = req.body;
  const newDept = new Course({
    title: name,
    id: courseid,
    department: convertFieldsToObjectId(department),
  });

  try {
    const savedCourse = await newDept.save();

    // Produce Kafka event for course-added
    await produceEvent("course-added", {
      courseId: savedCourse._id,
      department: department,
      timestamp: Date.now(),
    });

    response.json({ result: savedCourse });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/update-course/:id", async (req, response) => {
  const { name, courseid, department } = req.body;
  const id = req.params.id;
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        title: name,
        id: courseid,
        department: department,
      },
      { new: true }
    );
    response.json({ result: updatedCourse });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/assign-teacher-to-course/:id", async (req, response) => {
  const { teachers } = req.body;
  const id = req.params.id;

  try {
    const course = await Course.findByIdAndUpdate(id, {
      teachers: JSON.parse(teachers),
    });
    if (!course) {
      console.error("Course not found:", id);
      response.status(404).json({ error: "Course not found" });
      return;
    }

    console.log("Teacher assigned to course:", course);

    // Produce Kafka event
    await produceEvent("teacher-assigned", {
      courseId: id,
      teachers: JSON.parse(teachers),
      timestamp: Date.now(),
    });

    console.log("Kafka event produced: teacher-assigned");

    response.json({ result: course });
  } catch (err) {
    console.error("Error assigning teacher:", err);
    response.json({ error: err.message });
  }
});

app.get("/release-course/:id", async (req, response) => {
  const id = req.params.id;
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { status: "active" },
      { new: true }
    );
    response.json({ result: updatedCourse });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.get("/delete-course/:id", async (req, response) => {
  const id = req.params.id;
  try {
    const deletedCourse = await Course.findByIdAndDelete(id);
    response.json({ result: deletedCourse });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/filterCourseByName", async (req, response) => {
  const { name } = req.body;
  try {
    const courses = await Course.find({ title: name });
    response.json({ result: courses });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/filterCourseById", async (req, response) => {
  const { courseid } = req.body;
  try {
    const courses = await Course.find({ id: courseid });
    response.json({ result: courses });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/upload-lesson", (req, response) => {
  upload(req, response, (err) => {
    if (err) {
      response.json({ error: err });
      return;
    }
    const { course, title, filePaths, uploadedBy } = req.body;
    const newLesson = new Lesson({
      course: course,
      title: title,
      filePaths: filePaths,
      uploadedBy: uploadedBy,
    });
    newLesson
      .save()
      .then((res) => {
        response.json({ result: res });
      })
      .catch((err) => {
        response.json({ error: err });
      });
  });
});

app.get("/get-lessons", async (req, response) => {
  try {
    const lessons = await Lesson.find();
    response.json({ result: lessons });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.get("/get-course-regs", async (req, response) => {
  try {
    const courseRegs = await CourseRegistration.find();
    response.json({ result: courseRegs });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/register-for-course", async (req, response) => {
  const { uid, courseid } = req.body;
  const newCourseReg = new CourseRegistration({
    course: convertFieldsToObjectId(courseid),
    user: convertFieldsToObjectId(uid),
  });
  try {
    const savedCourseReg = await newCourseReg.save();
    response.json({ result: savedCourseReg });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/update-course-reg/:id", async (req, response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedCourseReg = await CourseRegistration.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );
    response.json({ result: updatedCourseReg });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.get("/get-exams", async (req, response) => {
  try {
    const exams = await Exam.find();
    response.json({ result: exams });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/upload-exam", (req, response) => {
  upload(req, response, (err) => {
    if (err) {
      response.json({ error: err });
      return;
    }
    const { lesson, title, filePaths } = req.body;
    const newExam = new Exam({
      lesson: convertFieldsToObjectId(lesson),
      title: title,
      filePaths: filePaths,
    });
    newExam
      .save()
      .then((res) => {
        response.json({ result: res });
      })
      .catch((err) => {
        response.json({ error: err });
      });
  });
});

app.get("/generate-token", async (req, response) => {
  try {
    const uuid = uuidv4();
    const token = new Token({ token: uuid });
    const savedToken = await token.save();
    response.json({ result: savedToken });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.get("/verify-token/:token", async (req, response) => {
  const { token } = req.params;
  try {
    const foundToken = await Token.findOne({ token: token, status: "active" });
    response.json({ result: foundToken });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.get("/deactivate-token/:token", async (req, response) => {
  const token = req.params.token;
  try {
    const deletedToken = await Token.findOneAndDelete({ token: token });
    response.json({ result: deletedToken });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.get("/get-all-student-activities", async (req, response) => {
  try {
    const activities = await StudentActivity.find();
    response.json({ result: activities });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/create-student-activity", async (req, response) => {
  const { student, course, lesson } = req.body;
  const newActivity = new StudentActivity({
    student: student,
    course: course,
    lesson: lesson,
  });
  try {
    const savedActivity = await newActivity.save();
    response.json({ result: savedActivity });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/update-student-activity/:id", async (req, response) => {
  const { id } = req.params;
  const updateData = req.body;
  if (updateData.note) {
    try {
      const activity = await StudentActivity.findById(id);
      activity.notes.push(updateData.note);
      const updatedActivity = await activity.save();
      response.json({ result: updatedActivity });
    } catch (err) {
      response.json({ error: err.message });
    }
  }
});

app.get("/get-all-student-notes", async (req, response) => {
  try {
    const notes = await StudentNote.find();
    response.json({ result: notes });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/create-student-note", async (req, response) => {
  const { subject, content } = req.body;
  const newNote = new StudentNote({
    subject: subject,
    content: content,
  });
  try {
    const savedNote = await newNote.save();
    response.json({ result: savedNote });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/update-student-note", async (req, response) => {
  const { id, subject, content } = req.body;
  try {
    const updatedNote = await StudentNote.findByIdAndUpdate(
      id,
      { subject: subject, content: content },
      { new: true }
    );
    response.json({ result: updatedNote });
  } catch (err) {
    response.json({ error: err.message });
  }
});

app.post("/upload-student-activity-file/:id", async (req, response) => {
  const { id } = req.params;
  const { filePaths } = req.body;
  upload(req, response, async (err) => {
    if (err) {
      response.json({ error: err });
      return;
    }

    try {
      const activity = await StudentActivity.findById(id);
      filePaths &&
        JSON.parse(filePaths).map((path) => activity.filePaths.push(path));
      const updatedActivity = await activity.save();
      response.json({ result: updatedActivity });
    } catch (err) {
      response.json({ error: err.message });
    }
  });
});

app.get("/student-notifications/:studentId", async (req, res) => {
  const { studentId } = req.params;
  console.log("studentid", studentId);
  try {
    const notifications = await StudentNotification.find({ studentId })
      .sort({ timestamp: -1 })
      .limit(3);
    console.log("api result student", notifications);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching student notifications:", error);
    res.status(500).json({ error: "Failed to fetch student notifications" });
  }
});

app.get("/teacher-notifications/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  console.log("teacherID", teacherId);
  try {
    const notifications = await TeacherNotification.find({ teacherId })
      .sort({ timestamp: -1 })
      .limit(3);
    console.log("teacher notificartion in bck", notifications);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching teacher notifications:", error);
    res.status(500).json({ error: "Failed to fetch teacher notifications" });
  }
});

//Methods
const convertFieldsToObjectId = (input) => {
  const objId = new mongoose.Types.ObjectId(input);
  return objId;
};

const getUserById = async (id) => {
  let user = await AfghanistanUser.findById(id);
  if (!user) {
    user = await IrelandUser.findById(id);
  }
  if (!user) {
    user = await Admin.findById(id);
  }
  return user;
};

const getUserByEmail = async (email) => {
  let user = await AfghanistanUser.findOne({ email });
  if (!user) {
    user = await IrelandUser.findOne({ email });
  }
  if (!user) {
    user = await Admin.findOne({ email });
  }
  return user;
};

const getAllUsers = async () => {
  const afghanistanUsers = await AfghanistanUser.find();
  const irelandUsers = await IrelandUser.find();
  const admins = await Admin.find();
  return [...afghanistanUsers, ...irelandUsers, ...admins];
};

app.listen(port, () => {
  console.log(`Server Listening on Port ${port}`);
});
