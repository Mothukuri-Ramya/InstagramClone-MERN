import { useState, useContext } from "react";
import { login } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"; // Import CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      setUser(res.data.user);
      navigate("/home");
    } catch (err) {
      console.log(err.response.data.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card"> 
      <img src="/logo.png" alt="Instagram Logo" className="logo" />
        <h1 className="instagram-text">Instagram</h1>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <br /><br />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          <br /><br />
          <button type="submit">Login</button>
        </form>
        <br />
        <a href="/signup">Don't have an account? Sign Up</a>
      </div>
    </div>
  );
};

export default Login;
