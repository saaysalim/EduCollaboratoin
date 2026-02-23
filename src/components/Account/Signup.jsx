//new consent form for ireland and afganisthan users checkbox and model
import { Input, Button, Select, message, Checkbox, Modal } from "antd";
import { Link } from "react-router-dom";
import Footer from "../Footer";
import { useEffect, useState } from "react";
import { validateEmail, matchValues, fetcher } from "../../_services";
import { useNavigate } from "react-router-dom";
import API_URL from "../../apiUrl";
import Web3 from "web3";
import StudentData from "../../blockchain/build/contracts/StudentData.json";

const Signup = () => {
  const navigate = useNavigate();
  const apiUrl = API_URL;

  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
    grade: "",
    role: "student",
    department: "",
    academicDetails: "",
    permanentAddress: "",
    academicPercentage: "",
    school: "",
    age: "",
    gender: "",
  });

  const [status, setStatus] = useState({
    inputs: {
      name: "",
      email: "",
      password: "",
      cpassword: "",
      role: "",
      department: "",
      grade: "",
      academicDetails: "",
      permanentAddress: "",
      academicPercentage: "",
      school: "",
      age: "",
      gender: "",
    },
  });

  const [departments, setDepartments] = useState([]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentModalVisible, setConsentModalVisible] = useState(false);
  const [consentText, setConsentText] = useState("");

  const roles = [
    { name: "Student", value: "student" },
    { name: "Teacher", value: "teacher" },
    { name: "Admin", value: "admin" },
  ];

  const grades = [
    { name: "9", value: "nine" },
    { name: "10", value: "ten" },
  ];

  const schools = [
    { name: "Afghanistan", value: "afghanistan" },
    { name: "Ireland", value: "ireland" },
  ];

  const getDepartments = () => {
    fetcher("get-departments")
      .then((res) => {
        const depts = res.result;
        if (depts && depts.length > 0) {
          const departments = depts.map((dept) => ({
            name: dept.title,
            value: dept._id,
          }));
          setDepartments(departments);
          setInput({ ...input, department: depts[0]._id });
        }
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  };

  const handleChange = (e) => {
    setStatus({ ...status, inputs: {} });
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
    if (name === "age") {
      if (parseInt(value) < 18) {
        setStatus({ ...status, inputs: { ...status.inputs, age: "error" } });
      } else {
        setStatus({ ...status, inputs: { ...status.inputs, age: "" } });
      }
    } else {
      setStatus({ ...status, inputs: { ...status.inputs, [name]: "" } });
    }
  };

  const handleRoleChange = (role) => {
    setInput({ ...input, role: role });
    if (role === "admin") {
      navigate("/account/login");
    }
  };

  const handleDeptChange = (dept) => {
    setInput({ ...input, department: dept });
  };

  const handleGradeChange = (grade) => {
    setInput({ ...input, grade: grade });
  };

  const handleSchoolChange = (school) => {
    setInput({ ...input, school: school });
    setConsentChecked(false);
  };

  const handleConsentCheckboxChange = (e) => {
    setConsentChecked(e.target.checked);
  };

  const showConsentModal = () => {
    if (input.school === "afghanistan") {
      setConsentText(`Dear Student,

Welcome to our international collaboration program between Coláiste Nano Nagle School in Limerick, Ireland, and Irshad High School in Kabul, Afghanistan. To participate in this program, we need your consent to collect, process, and store your personal data. Please review the following information carefully.

Purpose of Data Collection:
We collect and process your personal data to:
Manage your enrollment and participation in the international collaboration program.
Facilitate communication and collaboration between students and teachers from both schools.
Provide access to educational resources and support services.
Monitor and evaluate the program’s effectiveness.

Types of Data Collected:
The personal data we collect includes:
Name, age, and address.
Academic records and performance data.
Attendance and participation records.
Communication logs and feedback.

Legal Basis for Processing:
Your data is processed based on your explicit consent, in compliance with GDPR (for data processed within the EU).

Data Sharing and Transfer:
Your data may be shared with:
Teachers and administrative staff at Coláiste Nano Nagle School and Irshad High School.
Third-party service providers supporting the program (e.g., learning management systems).

Data Protection Measures:
We implement the following measures to protect your data:

Data encryption during storage and transmission.
Access controls to restrict data access to authorized personnel.
Regular security audits to identify and address vulnerabilities.
Your Rights:
You have the right to:

Access your personal data.
Correct inaccurate data.
Request data deletion.
Withdraw your consent at any time.
Data Retention:
We will retain your data for the duration of your participation in the program and for specify duration thereafter.

Contact Information:
For any questions or concerns about your data, please contact our Data Protection Officer at +3530772022871.

Consent Declaration:

I,consent to the collection, processing, and storage of my personal data as described above.
`);
    } else if (input.school === "ireland") {
      setConsentText(`Dear Student,

We are excited to welcome you to our international collaboration program between Coláiste Nano Nagle School in Limerick, Ireland, and Irshad High School in Kabul, Afghanistan. To ensure compliance with data protection laws and to protect your privacy, we require your explicit consent to collect, process, and store your personal data. Please read the information below carefully before providing your consent.

Purpose of Data Collection:
We collect and process your personal data for the following purposes:

To manage your enrollment and participation in the international collaboration program.
To facilitate communication and collaboration between students and teachers from both schools.
To provide access to educational resources and support services.
To monitor and evaluate the program's effectiveness.

Types of Data Collected:
The personal data we collect includes, but is not limited to:
Name, age, and address.
Academic records and performance data.
Attendance and participation records.
Communication logs and feedback.

Legal Basis for Processing:
We process your personal data based on your explicit consent, in accordance with Article 6(1)(a) of the GDPR.

Data Sharing and Transfer:
Your personal data may be shared with:
Teachers and administrative staff at Coláiste Nano Nagle School and Irshad High School.
Third-party service providers who assist in the operation of the program (e.g., learning management systems, communication platforms).

Data Protection Measures:
We implement appropriate technical and organizational measures to protect your personal data, including encryption, access controls, and regular security audits, in compliance with Article 32 of the GDPR.

Your Rights:
As a data subject, you have the following rights under the GDPR:

The right to access your personal data (Article 15).
The right to rectify inaccurate or incomplete data (Article 16).
The right to erase your data (Article 17)(Right to be Forgotten).
The right to withdraw your consent at any time (Article 7(3)).
Data Retention:
We will retain your personal data for the duration of your participation in the program and for a specify duration thereafter, unless otherwise required by law.

Contact Information:
If you have any questions or concerns about your personal data, please contact our Data Protection Officer at +3530772022871.

Consent Declaration:

I, hereby give my explicit consent for Coláiste Nano Nagle School to collect, process, and store my personal data as described above.
`);
    }
    setConsentModalVisible(true);
  };

  const handleConsentModalOk = () => {
    setConsentModalVisible(false);
  };

  const handleConsentModalCancel = () => {
    setConsentModalVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInput()) return;
    const userExists = await checkUser();
    if (userExists) {
      setStatus({ ...status, inputs: { ...status.inputs, email: "error" } });
      return;
    }
    await createNewUser();
  };

  const checkUser = () => {
    return fetch(`${apiUrl}/filterUserByEmail`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: input.email }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((res) => {
        if (res && res.result && res.result.length > 0) return true;
        else return false;
      })
      .catch((err) => {
        console.error("Error fetching user by email:", err);
        return false;
      });
  };

  const createNewUser = async () => {
    const formData = new FormData();
    Object.keys(input).forEach((key) => {
      formData.append(key, input[key]);
    });

    if (
      input.school === "afghanistan" &&
      input.role === "student" &&
      !consentChecked
    ) {
      message.error(
        "Please Agree to the consent Form by clicking the check box"
      );
      return;
    }
    if (
      input.school === "ireland" &&
      input.role === "student" &&
      !consentChecked
    ) {
      message.error(
        "Please Agree to the consent Form by clicking the check box"
      );
      return;
    }

    const result = await fetch(`${apiUrl}/create-account`, {
      method: "post",
      body: formData,
    }).then((res) => res.json());

    if (result.error) {
      console.error("Error creating user:", result.error);
      return;
    }

    if (result.transactionHash) {
      message.success(
        `Personal details stored on blockchain. Transaction Hash: ${result.transactionHash}`
      );
    }

    navigate("/account/wait-for-approval");
  };

  const validateInput = () => {
    let valid = true;
    if (!validateEmail(input.email)) {
      setStatus({ ...status, inputs: { ...status.inputs, email: "error" } });
      valid = false;
    }
    if (!matchValues(input.password, input.cpassword)) {
      setStatus({
        ...status,
        inputs: { ...status.inputs, cpassword: "error" },
      });
      valid = false;
    }
    if (
      (input.school === "afghanistan" || input.school === "ireland") &&
      input.role === "student" &&
      !consentChecked
    ) {
      message.error(
        "consent is required for students from Afghanistan or Ireland"
      );
      valid = false;
    }

    return valid;
  };

  useEffect(() => {
    getDepartments();
  }, []);

  return (
    <>
      <div
        className="d-flex flex-column justify-content-center align-items-center inherit-br-right mx-auto border rounded p-3"
        style={{ width: "60%" }}
      >
        <h3 className="fw-bold">Create Account</h3>
        <div className="mt-2" style={{ width: "80%" }}>
          <form
            className="d-flex justify-content-center align-items-center flex-column"
            onSubmit={handleSubmit}
          >
            <label htmlFor="name" className="w-100">
              Name
            </label>
            <Input
              style={{ height: "2.5rem" }}
              className="half-black"
              placeholder="Name"
              name="name"
              id="name"
              value={input.name}
              onChange={handleChange}
              status={status.inputs.name}
              required
            />
            <label htmlFor="email" className="w-100 mt-2 d-block">
              Email
            </label>
            <Input
              style={{ height: "2.5rem" }}
              className="half-black"
              placeholder="Email"
              name="email"
              id="email"
              value={input.email}
              onChange={handleChange}
              status={status.inputs.email}
              required
            />
            <label htmlFor="role" className="w-100 mt-2 d-block">
              Role
            </label>
            <Select
              id="role"
              name="role"
              onChange={handleRoleChange}
              value={input.role}
              className="w-100"
            >
              {roles.map((opt, index) => (
                <Select.Option key={index} value={opt.value}>
                  {opt.name}
                </Select.Option>
              ))}
            </Select>
            <label htmlFor="school" className="w-100 mt-2 d-block">
              School
            </label>
            <Select
              id="school"
              name="school"
              onChange={handleSchoolChange}
              value={input.school}
              className="w-100"
            >
              {schools.map((opt, index) => (
                <Select.Option key={index} value={opt.value}>
                  {opt.name}
                </Select.Option>
              ))}
            </Select>
            <label htmlFor="department" className="w-100 mt-2 d-block">
              Department
            </label>
            <Select
              id="department"
              name="department"
              onChange={handleDeptChange}
              value={input.department}
              className="w-100"
            >
              {departments.map((opt, index) => (
                <Select.Option key={index} value={opt.value}>
                  {opt.name}
                </Select.Option>
              ))}
            </Select>
            {input.role === "student" && (
              <>
                <label htmlFor="grade" className="w-100 mt-2 d-block">
                  Grade
                </label>
                <Select
                  id="grade"
                  name="grade"
                  onChange={handleGradeChange}
                  value={input.grade}
                  className="w-100"
                >
                  {grades.map((opt, index) => (
                    <Select.Option key={index} value={opt.value}>
                      {opt.name}
                    </Select.Option>
                  ))}
                </Select>
                <label htmlFor="academicDetails" className="w-100 mt-2">
                  Academic Details
                </label>
                <Input
                  style={{ height: "2.5rem" }}
                  className="half-black"
                  placeholder="Academic Details"
                  name="academicDetails"
                  id="academicDetails"
                  value={input.academicDetails}
                  onChange={handleChange}
                  status={status.inputs.academicDetails}
                  required
                />
                <label htmlFor="permanentAddress" className="w-100 mt-2">
                  Permanent Address
                </label>
                <Input
                  style={{ height: "2.5rem" }}
                  className="half-black"
                  placeholder="Permanent Address"
                  name="permanentAddress"
                  id="permanentAddress"
                  value={input.permanentAddress}
                  onChange={handleChange}
                  status={status.inputs.permanentAddress}
                  required
                />
                <label htmlFor="academicPercentage" className="w-100 mt-2">
                  Academic Percentage
                </label>
                <Input
                  style={{ height: "2.5rem" }}
                  className="half-black"
                  placeholder="Academic Percentage"
                  name="academicPercentage"
                  id="academicPercentage"
                  value={input.academicPercentage}
                  onChange={handleChange}
                  status={status.inputs.academicPercentage}
                  required
                />
                {input.role === "student" && (
                  <>
                    <label htmlFor="age" className="w-100 mt-2">
                      Age
                    </label>
                    <Input
                      style={{ height: "2.5rem" }}
                      className="half-black"
                      placeholder="Age"
                      name="age"
                      id="age"
                      value={input.age}
                      onChange={handleChange}
                      status={status.inputs.age}
                      required
                    />
                    <label htmlFor="gender" className="w-100 mt-2">
                      Gender
                    </label>
                    <Select
                      id="gender"
                      name="gender"
                      onChange={(value) =>
                        setInput({ ...input, gender: value })
                      }
                      value={input.gender}
                      className="w-100"
                    >
                      <Select.Option value="male">Male</Select.Option>
                      <Select.Option value="female">Female</Select.Option>
                      <Select.Option value="other">Other</Select.Option>
                    </Select>
                  </>
                )}
                {(input.school === "afghanistan" ||
                  input.school === "ireland") && (
                  <>
                    <Checkbox
                      checked={consentChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          showConsentModal();
                        } else {
                          setConsentChecked(false);
                        }
                      }}
                    >
                      I agree to the consent form
                    </Checkbox>
                  </>
                )}
              </>
            )}
            <label htmlFor="password" className="w-100 mt-2">
              Password
            </label>
            <Input.Password
              style={{ height: "2.5rem" }}
              className="half-black"
              placeholder="Password"
              name="password"
              id="password"
              value={input.password}
              onChange={handleChange}
              status={status.inputs.password}
              required
              minLength="8"
            />
            <label htmlFor="cpassword" className="w-100 mt-2">
              Confirm Password
            </label>
            <Input.Password
              style={{ height: "2.5rem" }}
              className="half-black"
              placeholder="Confirm Password"
              name="cpassword"
              id="cpassword"
              value={input.cpassword}
              onChange={handleChange}
              status={status.inputs.cpassword}
              required
              minLength="8"
            />
            <Button
              className="rounded-button mt-3 text-white"
              style={{
                width: "45%",
                height: "2.5rem",
                background: "darkslategray",
              }}
              htmlType="submit"
              disabled={input.role === "student" && parseInt(input.age) < 18}
            >
              Sign Up
            </Button>
          </form>
        </div>

        <small className="mt-2">
          Already have an{" "}
          <a className="text-blue text-decoration-none" href="/#">
            Edu Connect Hub
          </a>{" "}
          account?
        </small>
        <Link to="/account/login" style={{ width: "35%" }}>
          <Button
            className="rounded-button mt-3"
            style={{ width: "100%", height: "2.5rem" }}
          >
            Sign In
          </Button>
        </Link>
      </div>
      <Footer mt="6rem" />

      <Modal
        title={
          input.school === "afghanistan"
            ? "AfgREN Consent Form for International Educational Collaboration"
            : "Data Protection Consent Form"
        }
        visible={consentModalVisible}
        onCancel={() => setConsentModalVisible(false)}
        footer={[
          <Button
            key="agree"
            type="primary"
            onClick={() => {
              setConsentChecked(true);
              setConsentModalVisible(false);
            }}
          >
            Agree
          </Button>,
        ]}
        width={800} // Increase the width of the modal
        bodyStyle={{ maxHeight: "60vh", overflowY: "auto" }} // Make the modal scrollable
      >
        <pre style={{ whiteSpace: "pre-wrap" }}>{consentText}</pre>
      </Modal>
    </>
  );
};

export default Signup;
