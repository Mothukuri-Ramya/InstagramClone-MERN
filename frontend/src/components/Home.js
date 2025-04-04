import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Welcome to Instagram Clone {user?.username || "Guest"}!</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
