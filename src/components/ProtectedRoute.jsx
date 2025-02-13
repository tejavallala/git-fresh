import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const adminAddress = sessionStorage.getItem('adminAddress');
  
  if (!adminAddress) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;