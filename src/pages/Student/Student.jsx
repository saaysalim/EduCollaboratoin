import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StudentDashboard from "./Dashboard";
import {
  BookOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined
} from "@ant-design/icons";
import { Layout, Menu, Button, Popover, List, Badge, Popconfirm, theme } from "antd";
import { MdLogout, MdOutlineAnalytics } from "react-icons/md";
import { FaBookOpen, FaPencilAlt } from "react-icons/fa";
import Me from "../common/Me";
import Courses from "./Courses";
import MyCourses from "./MyCourses";
import Lessons from "./Lessons";
import MyActivity from "./MyActivity";
import io from "socket.io-client";
import moment from "moment";
import { fetcher } from "../../_services";
import { setCourses } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";

const { Header, Sider, Content } = Layout;
const socket = io("http://localhost:3002", {
  query: {
    studentId: localStorage.getItem("currentStudentId")
  }
});

const Student = () => {
  const [notifications, setNotifications] = useState([]);
  const dispatch = useDispatch();
  const currentStudentId = localStorage.getItem("currentStudentId");
  console.log("currentStudentId:", currentStudentId);

  const fetchCourses = useCallback(async () => {
    await fetcher("get-courses").then((res) => {
      const courses = res.result;
      console.log("courses in students page", courses);
      dispatch(setCourses(courses));
    });
  }, [dispatch]);

  const fetchNotifications = useCallback(async () => {
    try {
      console.log("Inside fetch notifications in students page");
      const data = await fetcher(`student-notifications/${currentStudentId}`);
      console.log("Data in student notifications", data);

      if (!data || data.length === 0) {
        setNotifications([]);
        console.log("No notifications found for the current student.");
      } else {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  }, [currentStudentId]);

  useEffect(() => {
    console.log("Connecting to socket...");
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("notification", (event) => {
      console.log("Received notification:", event);
      if ("courseId" in event && event.studentId === currentStudentId) {
        console.log("Notification is for the current student");
        setNotifications((prev) => [event, ...prev]);
        fetchCourses();
      }
    });

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("notification");
    };
  }, [currentStudentId, fetchCourses]);

  useEffect(() => {
    fetchCourses();
    fetchNotifications();
  }, [fetchCourses, fetchNotifications]);

  const courses = useSelector((state) => state.myReducer.courses);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const [selectedKey, setSelectedKey] = useState("1");
  let content;
  switch (selectedKey) {
    case "1":
      content = <StudentDashboard />;
      break;
    case "2":
      content = <Courses />;
      break;
    case "3":
      content = <MyCourses />;
      break;
    case "4":
      content = <Lessons />;
      break;
    case "5":
      content = <MyActivity />;
      break;
    case "6":
      content = <Me />;
      break;
    default:
      content = <div>default content</div>;
      break;
  }

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const handleResize = () => {
    if (window.innerWidth <= 800) setCollapsed(true);
    else setCollapsed(false);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
  }, []);

  return (
    <Layout className="w-100 bg-white" style={{ height: "100vh" }}>
      <Sider theme="light" trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            { key: "1", icon: <DashboardOutlined />, label: "Dashboard" },
            { key: "2", icon: <BookOutlined />, label: "All Courses" },
            { key: "3", icon: <FaBookOpen />, label: "My Courses" },
            { key: "4", icon: <FaPencilAlt />, label: "Lessons" },
            { key: "5", icon: <MdOutlineAnalytics />, label: "My Activity" },
            { key: "6", icon: <UserOutlined />, label: "Me" }
          ]}
          onClick={handleMenuClick}
          className="h-100"
        ></Menu>
      </Sider>

      <Layout className="px-0 px-md-2 px-lg-5 bg-white">
        <Header
          className="row m-0 justify-content-center align-items-center"
          style={{ padding: 0, background: colorBgContainer }}
        >
          <div className="col-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </div>
          <div className="col-4 text-center">
            <h4 className="m-0">Dashboard</h4>
          </div>
          <div className="col-4 text-center d-flex justify-content-end gap-3">
            <Popover
              content={
                <List
                  dataSource={notifications}
                  renderItem={(item) => (
                    <List.Item>
                      New course added:{" "}
                      {courses.map((course) =>
                        course._id === item.courseId ? course.title : ""
                      )}{" "}
                      <br />
                      Date:{" "}
                      {moment(item.timestamp).format("MMMM Do YYYY, h:mm:ss a")}
                    </List.Item>
                  )}
                />
              }
              title="Notifications"
              trigger="click"
            >
              <Badge count={notifications.length}>
                <BellOutlined style={{ fontSize: "24px", cursor: "pointer" }} />
              </Badge>
            </Popover>
            <Popconfirm
              title="Are you sure you want to log out?"
              onConfirm={() => {
                localStorage.removeItem("currentUser");
                navigate("/");
                window.location.reload();
              }}
            >
              <Button className="float-right text-danger" icon={<MdLogout />}>
                Log out
              </Button>
            </Popconfirm>
          </div>
        </Header>
        <Content
          style={{
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {content}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Student;
