CREATE DATABASE dep;

USE dep;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  `email_id` varchar(50) DEFAULT NULL,
  `position` varchar(30) DEFAULT NULL,
  `department` varchar(10) DEFAULT NULL,
  `mobile` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_id` (`email_id`)
);

CREATE TABLE `leaves_data` (
  `user_id` int(11) DEFAULT NULL,
  `total_casual_leaves` int(11) DEFAULT NULL,
  `taken_casual_leaves` int(11) DEFAULT NULL,
  `total_non_casual_leave` int(11) DEFAULT NULL,
  `taken_non_casual_leave` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  KEY `leaves_data_fk` (`user_id`),
  CONSTRAINT `leaves_data_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);

CREATE TABLE `leaves` (
  `leave_id` int(11) NOT NULL AUTO_INCREMENT,
  `department` varchar(10) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `nature` varchar(50) DEFAULT NULL,
  `purpose` varchar(200) DEFAULT NULL,
  `is_station` varchar(10) DEFAULT NULL,
  `request_date` timestamp NULL DEFAULT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `authority_comment` varchar(200) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `level` varchar(30) DEFAULT NULL,
  `file_uploaded` varchar(100) DEFAULT NULL,
  `type_of_leave` varchar(50) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `file_data` longblob,
  `signature` longblob,
  `address` varchar(255) DEFAULT NULL,
  `prefix_start_date` timestamp NULL DEFAULT NULL,
  `prefix_end_date` timestamp NULL DEFAULT NULL,
  `suffix_start_date` timestamp NULL DEFAULT NULL,
  `suffix_end_date` timestamp NULL DEFAULT NULL,
  `alt_arrangements` varchar(255) DEFAULT NULL,
  `station_start_date` timestamp NULL DEFAULT NULL,
  `station_end_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`leave_id`),
  KEY `leaves_ibfk_2` (`user_id`),
  CONSTRAINT `leaves_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);



