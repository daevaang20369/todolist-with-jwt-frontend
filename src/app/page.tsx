"use client";
import { useState } from "react";
import axios from "axios";
import { api } from "./api";
import { Navigate } from "react-router-dom";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    dateofbirth: "",
    email: "",
    otp: "",
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleregisteration = async () => {
    try {
      setError("");
      setSuccess("");
      const response = await axios.post(`${api}/register`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccess(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "all fields required");
    }
  };
  const handlesendotp = async () => {
    setError("");
    setSuccess("");
    const response = await axios.post(`${api}/sendotp`, formData, {
      headers: { "Content-Type": "application/json" },
    });
    setSuccess(response.data.message);
    console.log(response);
  };

  const handleotpverify = async () => {
    try {
      setError("");
      setSuccess("");
      if(formData.otp == ""){
        return setError("Enter otp before continue")
      }
      const response = await axios.post(`${api}/verify`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,

      });
      setSuccess(response.data.message);
      if (response.status === 200) {
        alert("Login successful!");
        const { accesstoken } = response.data;
        if (accesstoken) {
          localStorage.setItem("accessToken", accesstoken);
          router.push("/notes")
        } else {
          console.log("Token Not Received");
        }
        console.log(response);
        return;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response.data.message || "Login failed");
      setError(error.response.data.message)
      
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      handleregisteration();
    } else if (step === 2) {
      handlesendotp();
      setStep(3);
    } else {
      handleotpverify();
    }
  };

  return (
    <div className="signup">
      <div className="signup-left">
        <img className="logo" src={"logo.svg"} alt="logo" />
        <div className="signup-form">
          <form onSubmit={handleSubmit}>
            <div className="heading">Sign up</div>
            <div className="sub-heading">
              {step === 1
                ? "Sign up to enjoy the features of HD"
                : "Enter OTP sent to your email"}
              {error && (
                <p style={{ color: "red" }} className="error-text">
                  {error}
                </p>
              )}
              {success && (
                <p style={{ color: "lightgreen" }} className="success-text">
                  {success}
                </p>
              )}
            </div>

            {step === 1 && (
              <>
                <div className="input-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="doblabel" htmlFor="dateofbirth">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    id="dateofbirth"
                    name="dateofbirth"
                    value={formData.dateofbirth}
                    // placeholder="DD/MM/YYYY"
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {step != 1 && (
              <div className="input-group">
                <label htmlFor="otp">OTP</label>
                <input
                  type="number"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            {step != 1 && (
              <div className="Signinlink">
                Didnt received Otp?{" "}
                <button onClick={handlesendotp}> send again</button>
              </div>
            )}

            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-submit"
            >
              {step === 1 ? "Register" : step === 2 ? "Send OTP" : "Verify OTP"}
            </button>
          </form>

          {step == 1 ? (
            <div className="Signinlink">
              Already have an account?{" "}
              <button onClick={() => setStep(2)}>Sign in</button>
            </div>
          ) : (
            <div className="Signinlink">
              Dont have an account?{" "}
              <button onClick={() => setStep(1)}>Sign up</button>
            </div>
          )}
        </div>
      </div>

      <div className="signup-right">
        <img src={"sigupphoto.png"} alt="signup" />
      </div>
    </div>
  );
}
