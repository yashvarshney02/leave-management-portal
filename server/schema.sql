-- CREATE DATABASE sql12599367;

USE yash_db;

CREATE TABLE user(
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30),
    email_id VARCHAR(50) UNIQUE,
    position VARCHAR(30),
    department VARCHAR(10),
    total_casual_leaves INTEGER,
    taken_casual_leaves INTEGER,
    total_restricted_leaves INTEGER,
    taken_restricted_leaves INTEGER,
    total_earned_leaves INTEGER,
    taken_earned_leaves INTEGER,
    total_vacation_leaves INTEGER,
    taken_vacation_leaves INTEGER,
    total_special_leaves INTEGER,
    taken_special_leaves INTEGER,
    total_commuted_leaves INTEGER,
    taken_commuted_leaves INTEGER,
    total_hospital_leaves INTEGER,
    taken_hospital_leaves INTEGER,
    total_study_leaves INTEGER,
    taken_study_leaves INTEGER,
    total_childcare_leaves INTEGER,
    taken_childcare_leaves INTEGER
);

insert into user(name, email_id, position, department, total_casual_leaves, taken_casual_leaves, total_restricted_leaves, taken_restricted_leaves, total_earned_leaves, taken_earned_leaves, total_vacation_leaves, taken_vacation_leaves, total_special_leaves, taken_special_leaves, total_commuted_leaves, taken_commuted_leaves, total_hospital_leaves, taken_hospital_leaves, total_study_leaves, taken_study_leaves, total_childcare_leaves, taken_childcare_leaves) values ("User - Staff", "jaglike.makkar@gmail.com", "staff", "cse", 8, 0, 2, 0, 30, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0);
insert into user(name, email_id, position, department, total_casual_leaves, taken_casual_leaves, total_restricted_leaves, taken_restricted_leaves, total_earned_leaves, taken_earned_leaves, total_vacation_leaves, taken_vacation_leaves, total_special_leaves, taken_special_leaves, total_commuted_leaves, taken_commuted_leaves, total_hospital_leaves, taken_hospital_leaves, total_study_leaves, taken_study_leaves, total_childcare_leaves, taken_childcare_leaves) values ("User - Hod", "2020eeb1222@iitrpr.ac.in", "hod", "cse", 8, 0, 2, 0, 30, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0);
insert into user(name, email_id, position, department, total_casual_leaves, taken_casual_leaves, total_restricted_leaves, taken_restricted_leaves, total_earned_leaves, taken_earned_leaves, total_vacation_leaves, taken_vacation_leaves, total_special_leaves, taken_special_leaves, total_commuted_leaves, taken_commuted_leaves, total_hospital_leaves, taken_hospital_leaves, total_study_leaves, taken_study_leaves, total_childcare_leaves, taken_childcare_leaves) values ("User - Dean", "yashvarshney872@gmail.com", "staff", "cse", 8, 0, 2, 0, 30, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0);
-- insert into user(name, email_id, position, department, total_casual_leaves, taken_casual_leaves, total_restricted_leaves, taken_restricted_leaves, total_earned_leaves, taken_earned_leaves, total_vacation_leaves, taken_vacation_leaves, total_special_leaves, taken_special_leaves, total_commuted_leaves, taken_commuted_leaves, total_hospital_leaves, taken_hospital_leaves, total_study_leaves, taken_study_leaves, total_childcare_leaves, taken_childcare_leaves) values ("User - Staff", "jaglike.makkar@gmail.com", "staff", "cse", 8, 0, 2, 0, 30, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0);
insert into user(name, email_id, position, department, total_casual_leaves, taken_casual_leaves, total_restricted_leaves, taken_restricted_leaves, total_earned_leaves, taken_earned_leaves, total_vacation_leaves, taken_vacation_leaves, total_special_leaves, taken_special_leaves, total_commuted_leaves, taken_commuted_leaves, total_hospital_leaves, taken_hospital_leaves, total_study_leaves, taken_study_leaves, total_childcare_leaves, taken_childcare_leaves) values ("User - Admin", "jaglike.makkar@codingninjas.com", "admin", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
insert into user(name, email_id, position, department, total_casual_leaves, taken_casual_leaves, total_restricted_leaves, taken_restricted_leaves, total_earned_leaves, taken_earned_leaves, total_vacation_leaves, taken_vacation_leaves, total_special_leaves, taken_special_leaves, total_commuted_leaves, taken_commuted_leaves, total_hospital_leaves, taken_hospital_leaves, total_study_leaves, taken_study_leaves, total_childcare_leaves, taken_childcare_leaves) values ("User - Admin", "varshneyyash60@gmail.com", "admin", "", 8, 0, 2, 0, 30, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0);
insert into user(name, email_id, position, department, total_casual_leaves, taken_casual_leaves, total_restricted_leaves, taken_restricted_leaves, total_earned_leaves, taken_earned_leaves, total_vacation_leaves, taken_vacation_leaves, total_special_leaves, taken_special_leaves, total_commuted_leaves, taken_commuted_leaves, total_hospital_leaves, taken_hospital_leaves, total_study_leaves, taken_study_leaves, total_childcare_leaves, taken_childcare_leaves) values ("Establishment Office", "jaglike07@gmail.com", "establishment", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

CREATE TABLE leaves(
    leave_id INT PRIMARY KEY AUTO_INCREMENT,
    department VARCHAR(10),
    user_id INT,
    nature VARCHAR(50),
    purpose VARCHAR(200),
    is_station VARCHAR(10),
    request_date TIMESTAMP,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    authority_comment VARCHAR(200),
    duration INT,
    status VARCHAR(30),
    level VARCHAR(30),
    file_uploaded VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- CREATE TABLE log(

-- );

CREATE TABLE user_auth(
    email_id VARCHAR(50) PRIMARY KEY
);
