import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';
import { IconContext } from 'react-icons/lib';
import { useAuth } from '../../contexts/AuthContext';

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
  width: 250px;
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
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser.name)
  const showSidebar = () => setSidebar(!sidebar);
  

  return (
    <>
      <IconContext.Provider value={{ color: '#fff' }}>
        <Nav>
          <NavIcon to='#'>
            <FaIcons.FaBars onClick={showSidebar} />
          </NavIcon>  
          <div style={{marginLeft:"auto",width:"200px",color:"white"}}>
            Hi, {name}!
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
              } else if (item.title == 'Logout') {
                return <SubMenu className = "yash" item={item} key={index} showSidebar={showSidebar}/>;
              } else {
                return <SubMenu item={item} key={index} showSidebar={showSidebar}/>;
              }
            })}
          </SidebarWrap>
        </SidebarNav>
      </IconContext.Provider>
    </>
  );
};

export default Sidebar;