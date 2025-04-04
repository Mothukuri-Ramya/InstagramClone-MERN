// import { useState } from "react";
// import { signup } from "../api/auth";
// import { useNavigate } from "react-router-dom";
// import "../styles/signup.css";



// const Signup = () => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await signup({ username, email, password });
//       alert("Signup successful! Please login.");
//       navigate("/");
//     } catch (err) {
//       console.log(err.response.data.error);
//     }
//   };

//   return (
//     <div style={{ textAlign: "center", marginTop: "50px" }}>
//       <h2>Instagram Clone - Sign Up</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required />
//         <br /><br />
//         <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
//         <br /><br />
//         <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
//         <br /><br />
//         <button type="submit">Sign Up</button>
//       </form>
//       <br />
//       <a href="/">Already have an account? Login</a>
//     </div>
//   );
// };

// export default Signup;



import { useState } from "react";
import { signup } from "../api/auth"; // ✅ Ensure this import is correct
import { useNavigate } from "react-router-dom";
import "../styles/signup.css"; // ✅ Ensure correct import

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({ username, email, password });
      alert("Signup successful! Please login.");
      navigate("/");
    } catch (err) {
      console.log(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="signup-container"> {/* ✅ Apply CSS properly */}
      <div className="signup-card">
      <img src="/logo.png" alt="Instagram Logo" className="logo" />
        <h2 className="instagram-text">Instagram</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Sign Up</button>
        </form>
        <p><a href="/">Already have an account? Login</a></p>
      </div>
    </div>
  );
};

export default Signup;
