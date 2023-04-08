import smtplib
from email.mime.text import MIMEText

admin_mail = "head.dep2023@gmail.com"
admin_pass = "osgkkqldbkkinnqj"

def insert_user_message(columns, values):
    message = "Your account has been registered for the Leave Management Portal(IIT Ropar) with the following details:\n"
    for col, val in zip(columns,values):
        message+=f"{col}: {val}\n"
    message += f"Kindly contact to {admin_mail} for any query"
    return message

def otp_message(otp):
    message = f"Your one time password for Leave Management Portal is {otp}"
    return message

def send_email(email, message):
    msg = MIMEText(message)
    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login(admin_mail, admin_pass)
    s.sendmail('Leave Management Portal',email,msg.as_string())
