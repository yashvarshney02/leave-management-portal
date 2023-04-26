import React from "react";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";


export default function PrivateRoute({ component: Component, ...rest }) {  
    const { currentUser, loading } = useAuth();     
    if (loading == true || rest.user.includes('all')==false) {
        let found = false;
        for (let idx in rest.user) {
            
            if (!currentUser?.position.includes(rest.user[idx])) {
                found = true;
                break;
            }
        }        
        if (!found) {
            <Navigate to="/login" />;
        }
    }
    function isAuthenticated() {        
        if (currentUser == null) {
            return false;
        }        
        return true;
    }
    return isAuthenticated() == true ? <Outlet /> : <Navigate to="/login" />
}