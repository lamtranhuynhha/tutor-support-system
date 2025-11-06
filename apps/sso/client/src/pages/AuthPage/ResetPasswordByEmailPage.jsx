import React from "react";
import { useNavigate } from "react-router-dom";

const ResetPasswordByEmailPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-yellow-100">
      <h1 className="text-3xl font-bold mb-6">Reset Password By Email Page</h1>
      <button
        className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        onClick={() => navigate("/login")}
      >
        Go to Login
      </button>
    </div>
  );
};

export default ResetPasswordByEmailPage;
