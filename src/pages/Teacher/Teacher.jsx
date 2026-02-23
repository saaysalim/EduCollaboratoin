import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TeacherDashboard from "./Dashboard";
import {
  BookOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Button,
  Popover,
  List,
  Badge,
  Popconfirm,
  theme,
} from "antd";
import { MdLogout } from "react-icons/md";
import { FaPencilAlt } from "react-icons/fa";
import MyCourses from "./MyCourses";
import MyLessons from "./MyLessons";
import Me from "../common/Me";
import io from "socket.io-client";
import moment from "moment";
import { fetcher } from "../../_services";
import { setCourses } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
const { Header, Sider, Content } = Layout;
const socket = io("http://localhost:3002");

const Teacher = () => {
  const [notifications, setNotifications] = useState([]);
  const dispatch = useDispatch();
  const currentTeacherId = localStorage.getItem("currentTeacherId");

  const fetchCourses = useCallback(async () => {
    await fetcher("get-courses").then((res) => {
      const courses = res.result;
      console.log("courses in techers pge", courses);
      dispatch(setCourses(courses));
    });
  }, [dispatch]);

  const fetchNotifications = useCallback(async () => {
    try {
      console.log("Inside fetch notifications in teachers page");
      const data = await fetcher(`teacher-notifications/${currentTeacherId}`);
      console.log("Data in teacher notifications", data);

      if (!data || data.length === 0) {
        setNotifications([]);
        console.log("No notifications found for the current teacher.");
      } else {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  }, [currentTeacherId]);

  useEffect(() => {
    socket.on("notification", (event) => {
      console.log("Received notification:", event);
      if ("courseId" in event && event.teachers.includes(currentTeacherId)) {
        console.log("Teacher ID matched");
        setNotifications((prev) => [event, ...prev]);
        fetchCourses();
      }
    });
    return () => {
      socket.off("notification");
    };
  }, [currentTeacherId, fetchCourses]);

  useEffect(() => {
    fetchCourses();
    fetchNotifications();
  }, [fetchCourses, fetchNotifications]);

  const courses = useSelector((state) => {
    return state.myReducer.courses;
  });
  console.log("courses", courses);

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [selectedKey, setSelectedKey] = useState("1");
  let content;
  switch (selectedKey) {
    case "1":
      content = <TeacherDashboard />;
      break;
    case "2":
      content = <MyCourses />;
      break;
    case "3":
      content = <MyLessons />;
      break;
    case "4":
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
            {
              key: "1",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "2",
              icon: <BookOutlined />,
              label: "My Courses",
            },
            {
              key: "3",
              icon: <FaPencilAlt />,
              label: "My Lessons",
            },
            {
              key: "4",
              icon: <UserOutlined />,
              label: "Me",
            },
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
                      Assigned to course:{" "}
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
              title="Are you sure you want to log out ?"
              onConfirm={() => {
                localStorage.removeItem("currentUser");
                localStorage.removeItem("currentTeacherId");
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

export default Teacher;
