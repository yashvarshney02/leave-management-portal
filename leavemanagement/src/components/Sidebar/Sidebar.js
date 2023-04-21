import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';
import { IconContext } from 'react-icons/lib';
import { useAuth } from '../../contexts/AuthContext';
import {toast} from "react-toastify";
import { useNavigate } from 'react-router-dom';

const Nav = styled.div`
  background: linear-gradient(135deg, #08328B, #265ACB);
  height: 60px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const NavIcon = styled(Link)`
  margin-left: 2rem;
  font-size: 2rem;
  height: 80px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const SidebarNav = styled.nav`
  background: linear-gradient(135deg, #08328B, #08328B);
  width: 270px;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
  transition: 350ms;
  z-index: 10;
`;

const SidebarWrap = styled.div`
  width: 100%;
`;

const Sidebar = () => {  
  const [sidebar, setSidebar] = useState(false);
  const { currentUser, logout, refresh_user } = useAuth();
  const showSidebar = () => setSidebar(!sidebar);
  const navigate = useNavigate();
  const path = window.location.href.split("/")[window.location.href.split("/").length -1]  
  if (path == 'login') {
    return <></>
  }

  return (
    <>
      <IconContext.Provider value={{ color: '#fff' }}>
        <Nav>
          <NavIcon to='#'>
            <FaIcons.FaBars onClick={showSidebar} />
          </NavIcon>
          <div style={{ marginRight: "auto", width: "500px", fontSize:"20px", color: "white" }}>
            Leave Management Portal
          </div>
          <div style={{ marginLeft: "auto", width: "200px", color: "white" }}>
            Hi, {currentUser ? currentUser.name : 'User'} {currentUser ? <FaIcons.FaArrowCircleRight style={{ cursor: "pointer" }} onClick={async () => {
              let res = await logout();              
              if (res.data['status'] == 'success') {
                toast.success(res.data['data'], toast.POSITION.BOTTOM_RIGHT);
                let res1 = await refresh_user();
                if (res1.data['status'] == 'success') {
                  navigate("/login");
                }                
              } else {
                toast.success(res['emsg'], toast.POSITION.BOTTOM_RIGHT);
              }
            }
            } /> : ''}
          </div>
        </Nav>
        <SidebarNav sidebar={sidebar}>
          <SidebarWrap>
            <NavIcon to='#'>
              <AiIcons.AiOutlineClose onClick={showSidebar} />
            </NavIcon>
            {SidebarData.map((item, index) => {
              
              if (!currentUser && item.title == 'Logout') {
                return <></>
              } if (currentUser && item.title == 'Login') {
                return <></>
              } else if (item.title == 'Logout') {
                return <SubMenu item={item} key={index} showSidebar={showSidebar} currentUser={currentUser} />;
              } else {
                return <SubMenu item={item} key={index} showSidebar={showSidebar} currentUser={currentUser}/>;
              }
            })}
          </SidebarWrap>
        </SidebarNav>
      </IconContext.Provider>
    </>
  );
};

export default Sidebar;