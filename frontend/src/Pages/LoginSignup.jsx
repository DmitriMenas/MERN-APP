import React, { useState } from 'react';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = () => {
    setAgreeToTerms(!agreeToTerms);
  };

  const login = async () => {
    if (!agreeToTerms) {
      alert("You must agree to the terms and conditions.");
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to sign up.');
      }

      const responseData = await response.json();
      if (responseData.success) {
        console.log('User Created');
        localStorage.setItem('auth-token', responseData.token);
        window.location.replace('/'); // Redirect to home or dashboard
      } else {
        alert(responseData.message || 'Signup failed.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Error connecting to the server.');
    }
  };

  const signup = async () => {
    if (!agreeToTerms) {
      alert("You must agree to the terms and conditions.");
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to sign up.');
      }

      const responseData = await response.json();
      if (responseData.success) {
        console.log('User Created');
        localStorage.setItem('auth-token', responseData.token);
        window.location.replace('/'); // Redirect to home or dashboard
      } else {
        alert(responseData.message || 'Signup failed.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Error connecting to the server.');
    }
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" && <input name='username' value={formData.username} onChange={handleChange} type="text" placeholder="Your Name" />}
          <input name='email' value={formData.email} onChange={handleChange} type="email" placeholder="Email Address" />
          <input name='password' value={formData.password} onChange={handleChange} type="password" placeholder="Password" />
        </div>
        <button onClick={state === "Login" ? login : signup} >Continue</button>
        {state === "Sign Up"
          ? <p className='loginsignup-login'>Already have an account? <span onClick={() => setState("Login")}>Login Here</span></p>
          : <p className='loginsignup-login'>Need an account? <span onClick={() => setState("Sign Up")}>Click Here</span></p>}
        <div className="loginsignup-agree">
          <input type="checkbox" checked={agreeToTerms} onChange={handleCheckboxChange} id='agreeToTerms' />
          <label htmlFor='agreeToTerms'>I agree to the terms and conditions</label>
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;
