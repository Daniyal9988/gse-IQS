import React, { useState } from 'react';
import styles from './Styles/Login.module.css';
import logoImg from './assets/logo.png'; 

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

const handleAccess = (e) => {
  if (e) e.preventDefault();
  setError("");

  // 1. Define your valid users from the Environment Variables
  const users = [
    {
      username: import.meta.env.VITE_GSE_ADMIN_USERNAME,
      password: import.meta.env.VITE_GSE_ADMIN_PASSWORD,
      role: "admin"
    },
    {
      username: import.meta.env.VITE_GSE_ZOHAIB_USERNAME ,
      password: import.meta.env.VITE_GSE_ZOHAIB_PASSWORD ,
      role: "staff"
    }
  ];

  // 2. Check if the typed username and password match ANY user in the list
  const foundUser = users.find(
    (u) => u.username === username && u.password === password
  );

  if (foundUser) {
    console.log(`Logged in as: ${foundUser.username} with role: ${foundUser.role}`);
    onLogin(foundUser); // Success!
  } else {
    setError("Invalid Username or Passcode");
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }
};

  return (
    <div className={styles.container}>
      <div className={`${styles.loginCard} ${isShaking ? styles.shake : ""}`}>
        <div className={styles.header}>
          <img src={logoImg} alt="GSE Logo" className={styles.logo} />
          <h1>GLOBAL SAFETY EQUIPMENT</h1>
          <p>INTERNAL QUOTATION SYSTEM</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleAccess} className={styles.form}>
          <div className={styles.field}>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={error ? styles.inputError : ""}
              required 
            />
          </div>

          <div className={styles.field}>
            <input 
              type="password" 
              placeholder="Passcode" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error ? styles.inputError : ""}
              required 
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            ENTER SYSTEM
          </button>
        </form>

        <div className={styles.footer}>
          <span>• RIYADH, KSA</span>
        </div>
      </div>
    </div>
  );
};

export default Login;