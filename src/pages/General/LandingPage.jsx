import { Button } from "antd";
import elearning from "../../assets/3delearning.png"
import Footer from "../../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
const LandingPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  useEffect(() => {
    if (user) {
      navigate("/me/home");
    }
  }, []);

  return !user ? (
    <div
      className="mx-auto mt-4 p-0"
      style={{ width: "90%", minHeight: "30rem", height: "auto" }}
    >
      {/* NAVIGATION */}
      <nav
        className="navbar navbar-expand-md navbar-light d-md-flex justify-content-md-between align-items-md-center mx-auto"
        style={{ width: "95%" }}
      >
      </nav>
      {/* HERO PAGE */}
      <div
        className="w-100 p-0"
        style={{ minHeight: "30rem", marginTop: "5rem" }}
      >
        <div className="w-100 row p-0" style={{ minHeight: "inherit" }}>
          <div
            className="col-md-6 col-sm-12 d-flex flex-column align-items-center justify-content-center"
            style={{ borderLeft: "5px solid purple" }}
          >
            <h4 className="motto text-center">
              Collaboration Platform for Resource Sharing
            </h4>
            <p
              className="mt-2 fw-bold fs-5"
              style={{ fontFamily: "'Electrolize', sans-serif" }}
            >
              
            </p>
            <div className="w-100 d-flex justify-content-center align-items-center first-actions mt-3">
              <Link to="/account/login" className="w-50">
                <Button className="btn1 bg-primary text-white fs-5">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
          <div className="col-md-6 d-none d-md-inline d-flex justify-content-center align-items-center">
            <img
              src={elearning}
              alt="learn"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>
      <Footer mt="5rem" />
    </div>
  ) : (
    ""
  );
};
export default LandingPage;
