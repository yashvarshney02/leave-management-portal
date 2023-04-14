import React from "react";
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";


export default function PrivateRoute({ component: Component, ...rest }) {    
    const { currentUser, loading } = useAuth();      
    if (loading == true || (rest.user.includes('all')==false && rest.user.includes(currentUser?.position) == false)) {
        // toast.error('User Not Allowed', toast.POSITION.BOTTOM_RIGHT)
        return <Navigate to="/login" />;
    }
    function isAuthenticated() {        
        if (currentUser == null) {
            return false;
        }        
        return true;
    }
    return isAuthenticated() == true ? <Outlet /> : <Navigate to="/login" />
}