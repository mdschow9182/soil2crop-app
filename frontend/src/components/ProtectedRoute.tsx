import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactElement;
}

const ProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem("soil2crop_token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
