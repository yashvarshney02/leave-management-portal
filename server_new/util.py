import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

admin_mail = "head.dep2023@gmail.com"
admin_pass = "gthqszvacmcjmunk"
base_url = "http://172.30.8.214/"

def insert_user_message(columns, values):
    message = "<h3>Your account has been updated for the Leave Management Portal (IIT Ropar) with the following details:</h3>"
    message += "<table>"
    for col, val in zip(columns, values):
        message += f"<tr><td><b>{col}<b/></td><td>{val}</td></tr>"
    message += "</table>"
    message += f"<h4>You can login your account at {base_url+'login'}</h4>"
    message += f"<p>Kindly contact {admin_mail} for any queries.</p>"
    return message

def apply_leave_message(columns, values):
    message = "<h3>Your leave has been applied successfully with the following details:</h3>"
    message += "<table>"
    for col, val in zip(columns, values):
        message += f"<tr><td><b>{col}<b/></td><td>{val}</td></tr>"
    message += "</table>"
    message += f"<h4>You can check your past applications at {base_url+'navigate/pastapplications'}</h4>"
    message += f"<p>Kindly contact {admin_mail} for any queries.</p>"
    return message

def process_leave_message(columns, values, url):
    message = "<h3>New leave application has been submitted with the following details:</h3>"
    message += "<table>"
    for col, val in zip(columns, values):
        message += f"<tr><td><b>{col}<b/></td><td>{val}</td></tr>"
    message += "</table>"
    message += f"<h4>You can process this application at {base_url+'check_applications/'+url}</h4>"
    message += f"<p>Kindly contact {admin_mail} for any queries.</p>"
    return message

def leave_status_message(columns, values):
    message = "<h3>Your leave application has been updated:</h3>"
    message += "<table>"
    for col, val in zip(columns, values):
        message += f"<tr><td><b>{col}<b/></td><td>{val}</td></tr>"
    message += "</table>"
    message += f"<h4>You can check your past applications at {base_url+'navigate/pastapplications'}</h4>"
    message += f"<p>Kindly contact {admin_mail} for any queries.</p>"
    return message

def add_comment_message(columns, values):
    message = "<h3>Your leave application has one comment:</h3>"
    message += "<table>"
    for col, val in zip(columns, values):
        message += f"<tr><td><b>{col}<b/></td><td>{val}</td></tr>"
    message += "</table>"
    message += f"<h4>You can check your past applications at {base_url+'navigate/pastapplications'}</h4>"
    message += f"<p>Kindly contact {admin_mail} for any queries.</p>"
    return message

def withdraw_leave_message(columns, values):
    message = "<h3>Your leave application has been submitted for withdrawl:</h3>"
    message += "<table>"
    for col, val in zip(columns, values):
        message += f"<tr><td><b>{col}<b/></td><td>{val}</td></tr>"
    message += "</table>"
    message += f"<h4>You can check your past applications at {base_url+'navigate/pastapplications'}</h4>"
    message += f"<p>Kindly contact {admin_mail} for any queries.</p>"
    return message

def otp_message(otp):
    message = "<h3>Your one time password for Leave Management Portal is:</h3>"
    message += f"<span  style='color: blue; font-weight: bold;text-align: center;'>{otp}</span>"
    return message

def send_email(email, message, subject=""):
    msg = MIMEMultipart()
    msg['From'] = 'Leave Management Portal'
    msg['To'] = email
    msg['Subject'] = subject
    part = MIMEText(message, 'html')
    msg.attach(part)
    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login(admin_mail, admin_pass)
    s.sendmail('no-reply', email, msg.as_string())
    s.quit()

apply_leave_keys = {
    "form_nature":"Nature of Leave",
    "form_type_of_leave":"Type of Leave",
    "form_isStation":"Is Leave Station Required",
    "form_rdate":"Request Date",
    "form_sdate":"Start Date",
    "form_edate":"End Date",
    "form_duration":"Leave Duration",
    "form_station_sdate":"Station Leave Start Date",
    "form_station_edate":"Station Leave End Date",
    "form_pres": "Prefix Start Date",
    "form_pree": "Prefix End Date",
    "form_suffs": "Suffix Start Date",
    "form_suffe": "Suffix End Date",
    "form_purpose":"Purpose of Leave",
    "form_altArrangements":"Alternate Arrangements",
    "form_address":"Address",
}

apply_pg_leave_keys = {
    "form_nature":"Nature of Leave",
    "form_type_of_leave":"Type of Leave",
    "form_isStation":"Is Leave Station Required",
    "form_rdate":"Request Date",
    "form_sdate":"Start Date",
    "form_edate":"End Date",
    "form_duration":"Leave Duration",
    "form_station_sdate":"Station Leave Start Date",
    "form_station_edate":"Station Leave End Date",
    "form_duty_start": "Duty Start Date",
    "form_duty_end": "Duty End Date",
    "form_prefix_suffix": "Prefix/Suffix",
    "form_venue":"Venue",
    "form_address":"Address",
    "form_advisor": "Advisor",
    "form_ta_instructor": "TA Instructor"
}

leaves_data_map = {
    "CASUAL LEAVE": "taken_casual_leaves",
    "RESTRICTED HOLIDAY": "taken_restricted_leaves",
    "SPECIAL CASUAL LEAVE": "taken_scl_leaves",
    "CASUAL LEAVE": "taken_casual_leaves",
    "non_casual_leave": "taken_non_casual_leave",
    "PG": "taken_pg_leaves"
}



