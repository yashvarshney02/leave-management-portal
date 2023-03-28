import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const SidebarLink = styled(Link)`
  display: flex;
  color: #e1e9fc;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  list-style: none;
  height: 60px;
  text-decoration: none;
  font-size: 18px;

  &:hover {
    background: #bfcff5;
    border-left: 4px solid #632ce4;
    cursor: pointer;
  }
`;

const SidebarLabel = styled.span`
  margin-left: 16px;
`;

const DropdownLink = styled(Link)`
  background: #08328B;
  height: 60px;
  padding-left: 3rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #f5f5f5;
  font-size: 18px;

  &:hover {
    background: #89a6f0;
    cursor: pointer;
  }
`;

const SubMenu = ({ item, showSidebar }) => {
  const [subnav, setSubnav] = useState(false);
  const { logout, refresh_user } = useAuth();
  const navigate = useNavigate();

  const showSubnav = () => setSubnav(!subnav);

  return (
    <>
      <SidebarLink to={item.path} onClick={async () => {        
        showSubnav();
        if (!item.subNav) {
          showSidebar();
        }        
        if (item.title == 'Logout') {
          let res = await logout();
          if (res['status'] == 'success') {
            toast.success(res['data'], toast.POSITION.BOTTOM_RIGHT);
            await refresh_user();
            navigate("/login");
          } else {
            toast.success(res['emsg'], toast.POSITION.BOTTOM_RIGHT);
          }

        }
      }}>
        <div>
          {item.icon}
          <SidebarLabel>{item.title}</SidebarLabel>
        </div>
        <div>
          {item.subNav && subnav
            ? item.iconOpened
            : item.subNav
              ? item.iconClosed
              : null}
        </div>
      </SidebarLink>
      {item.subNav && subnav &&
        item.subNav.map((item, index) => {
          return (
            <DropdownLink to={item.path} onClick={showSidebar} key={index}>
              {item.icon}
              <SidebarLabel>{item.title}</SidebarLabel>
            </DropdownLink>
          );
        })}
    </>
  );
};

export default SubMenu;