import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactElement;
}

const ProtectedRoute = ({ children }: Props) => {
  const farmerId = localStorage.getItem("farmer_id");
  if (!farmerId) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
