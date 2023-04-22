import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import * as RiIcons from 'react-icons/ri';

export const SidebarData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <FaIcons.FaHome />
  },
  {
    title: 'Navigate',    
    icon: <IoIcons.IoIosPaper />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,

    subNav: [
      {
        title: 'Apply Leave',
        path: '/navigate/applyleave',
        icon: <IoIcons.IoIosPaper />,
        cName: 'sub-nav',
        allowed: ['admin', 'hod', 'faculty', 'pg']
      },
      {
        title: 'Office Portal',
        path: '/navigate/updateleave',
        icon: <IoIcons.IoIosPaper />,
        cName: 'sub-nav',
        allowed: ['admin', 'office']
      },
      {
        title: 'Past Appilcations',
        path: '/navigate/pastapplications',
        icon: <IoIcons.IoIosPaper />,
        cName: 'sub-nav',
        allowed: ['admin', 'hod', 'faculty', 'pg']
      },
      {
        title: 'Process Applications',
        path: '/navigate/checkapplications',
        icon: <IoIcons.IoIosPaper />,
        cName: 'sub-nav',
        allowed: ['admin', 'faculty', 'hod', 'dean', 'office', 'registrar']
      },
      {
        title: 'Dates',
        path: '/navigate/dates',
        icon: <IoIcons.IoIosPaper />,
        allowed: ['admin']
      }
    ]
  },
  {
    title: 'Login',
    path: '/login',
    icon: <FaIcons.FaKey />
  },  
  {
    title: 'Logout',
    path: '/login',
    icon: <FaIcons.FaArrowCircleRight />
  },  
  // {
  //   title: 'Team',
  //   path: '/team',
  //   icon: <IoIcons.IoMdPeople />
  // },
  // {
  //   title: 'Messages',
  //   path: '/messages',
  //   icon: <FaIcons.FaEnvelopeOpenText />,

  //   iconClosed: <RiIcons.RiArrowDownSFill />,
  //   iconOpened: <RiIcons.RiArrowUpSFill />,

  //   subNav: [
  //     {
  //       title: 'Message 1',
  //       path: '/messages/message1',
  //       icon: <IoIcons.IoIosPaper />
  //     },
  //     {
  //       title: 'Message 2',
  //       path: '/messages/message2',
  //       icon: <IoIcons.IoIosPaper />
  //     }
  //   ]
  // },
  // {
  //   title: 'Support',
  //   path: '/support',
  //   icon: <IoIcons.IoMdHelpCircle />
  // }
];