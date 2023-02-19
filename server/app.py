from tkinter import E
from flask import Flask, jsonify, render_template, url_for, request, session, redirect, Response
from flask_pymongo import PyMongo
# from matplotlib.pyplot import connect
from py import code
from pymongo import MongoClient
from flask_mysqldb import MySQL
import mysql.connector
from authlib.integrations.flask_client import OAuth
from flask_cors import CORS, cross_origin
import bcrypt
import random
import smtplib, os
import pandas as pd
from pymysql import NULL
import pprint

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# oAuth Setup
oauth = OAuth(app)

# credentials = open("C:\\Academics\\6th Sem\\CP301_DP\\oAuthCredentials.txt").readlines()
# my_client_id = credentials[0].strip()
# my_secret = credentials[1].strip()

# google = oauth.register(
#     name='google',
#     client_id=my_client_id,
#     client_secret=my_secret,
#     access_token_url='https://accounts.google.com/o/oauth2/token',
#     access_token_params=None,
#     authorize_url='https://accounts.google.com/o/oauth2/auth',
#     authorize_params=None,
#     api_base_url='https://www.googleapis.com/oauth2/v1/',
#     userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',  # This is only needed if using openId to fetch user info
#     client_kwargs={'scope': 'openid email profile'},
# )

# app.config['MYSQL_HOST'] = 'localhost'
# app.config['MYSQL_USER'] = 'root'
# app.config['MYSQL_PASSWORD'] = 'password123'
# app.config['MYSQL_DB'] = 'yash_db'
# db = MySQL(app)
db = mysql.connector.connect(
    host="sql12.freemysqlhosting.net",
    user="sql12599367",
    passwd="41XYHlH5lg",
    database="sql12599367"
)

# db = mysql.connector.connect(
#     host="yashiitrpr.mysql.pythonanywhere-services.com",
#     user="yashiitrpr",
#     passwd="password@dep123",
#     database="password@dep123"
# )

print(db)

success_code = Response(status=200)
failiure_code = Response(status=400)


def is_valid_email(email_id):
    print(email_id)
    connect = db    
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM user")
    data = cursor.fetchall()
    print("data: ", data)
    return 1    
    if not data:
        session.clear()
        return 0
    else:
        return 1

def get_user_data(email_id):
    connect = db
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM user WHERE email_id = %s",(email_id, ))
    data = cursor.fetchall()
    print(data)
    return data

def insert_leave(l):
    connect = db
    cursor = connect.cursor()
    cursor.execute("SELECT user_id, department, position FROM user WHERE email_id = %s",(l['email'], ))
    data = cursor.fetchall()
    user_id = data[0][0]
    department = data[0][1]
    position = data[0][2]
    
    
    cursor.execute("INSERT INTO leaves\
        (department, user_id, nature, purpose, is_station, request_date, start_date, end_date, duration, status, level,file_uploaded) \
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s)",
        (department, user_id, l['nature'], l['purpose'], l['isStation'], l['rdate'], l['sdate'], l['edate'], l['duration'], 'Pending', position,l['attached_documents']))
    connect.commit()
    return 1

def initialize():
    connect = db
    cursor = connect.cursor()
    cursor.execute("drop table if exists leaves")
    cursor.execute("drop table if exists user")
    connect.commit()
    cursor.execute("CREATE TABLE user(      \
        user_id INT PRIMARY KEY AUTO_INCREMENT, \
        name VARCHAR(30),                       \
        email_id VARCHAR(50) UNIQUE,            \
        position VARCHAR(30),                   \
        department VARCHAR(10),                 \
        total_casual_leaves INTEGER,            \
        taken_casual_leaves INTEGER,            \
        total_restricted_leaves INTEGER,        \
        taken_restricted_leaves INTEGER,        \
        total_earned_leaves INTEGER,            \
        taken_earned_leaves INTEGER,            \
        total_vacation_leaves INTEGER,          \
        taken_vacation_leaves INTEGER,          \
        total_special_leaves INTEGER,           \
        taken_special_leaves INTEGER,           \
        total_commuted_leaves INTEGER,          \
        taken_commuted_leaves INTEGER,          \
        total_hospital_leaves INTEGER,          \
        taken_hospital_leaves INTEGER,          \
        total_study_leaves INTEGER,             \
        taken_study_leaves INTEGER,             \
        total_childcare_leaves INTEGER,         \
        taken_childcare_leaves INTEGER          \
    );")

    cursor.execute("CREATE TABLE leaves(        \
        leave_id INT PRIMARY KEY AUTO_INCREMENT,    \
        department VARCHAR(10),                     \
        user_id INT,                                \
        nature VARCHAR(100),                        \
        purpose VARCHAR(200),                       \
        is_station VARCHAR(10),                     \
        request_date TIMESTAMP,                     \
        start_date TIMESTAMP,                       \
        end_date TIMESTAMP,                         \
        authority_comment VARCHAR(200),             \
        duration INT,                               \
        status VARCHAR(30),                         \
        level VARCHAR(30),                          \
        file_uploaded VARCHAR(100),                 \
        FOREIGN KEY (user_id) REFERENCES user(user_id)\
    );")
    connect.commit()


def get_user_dic(email):
    data = get_user_data(email)[0]
    dic = {}
    dic['user_id'] = data[0]
    dic['name'] = data[1]
    dic['email'] = data[2]
    dic['position'] = data[3]
    dic['department'] = data[4]
    dic['total_casual_leaves'] = data[5]
    dic['taken_casual_leaves'] = data[6]
    dic['total_restricted_leaves'] = data[7]
    dic['taken_restricted_leaves'] = data[8]
    dic['total_earned_leaves'] = data[9]
    dic['taken_earned_leaves'] = data[10]
    dic['total_vacation_leaves'] = data[11]
    dic['taken_vacation_leaves'] = data[12]
    dic['total_special_leaves'] = data[13]
    dic['taken_special_leaves'] = data[14]
    dic['total_commuted_leaves'] = data[15]
    dic['taken_commuted_leaves'] = data[16]
    dic['total_hospital_leaves'] = data[17]
    dic['taken_hospital_leaves'] = data[18]
    dic['total_study_leaves'] = data[19]
    dic['taken_study_leaves'] = data[20]
    dic['total_childcare_leaves'] = data[21]
    dic['taken_childcare_leaves'] = data[22]

    return dic

def send_update_mail(leave_id):

    connect = db
    cursor = connect.cursor()
    cursor.execute('SELECT duration,request_date,start_date,end_date,status,authority_comment,user_id,nature FROM leaves WHERE leave_id = %s',(leave_id))
    tmp = cursor.fetchall()[0]
    duration = tmp[0]
    request_date = tmp[1]
    start_date = tmp[2]
    end_date = tmp[3]
    status = tmp[4]
    authority_comment = tmp[5]    
    user_id = tmp[6]
    nature = tmp[7]

    cursor.execute('SELECT total_casual_leaves,taken_casual_leaves,email_id,name FROM user WHERE user_id = %s',(user_id))
    tmp = cursor.fetchall()[0]
    total_leaves = tmp[0]
    taken_leaves = tmp[1]
    email_id = tmp[2]
    name = tmp[3]
    remaining_leaves = str(float(total_leaves) - float(taken_leaves))
    msg = """Hi {}, your leave application for {} has been {}.\n\n\
    Leave Information: \n\
        Leave Id - {} \n\
        Duration - {} days \n\
        Request Date - {} \n\
        Start Date - {} \n\
        End Date - {} \n\
        Status - {} \n\
        Authority Comment - {} \n\n\
    Updated Leaves Count: \n\
        Total Casual Leaves - {} days \n\
        Taken Casual Leaves - {} days \n\
        Remaining Casual Leaves - {} days \n\
    """.format(name,nature,status,leave_id,duration,request_date,start_date,end_date,status,authority_comment,total_leaves,taken_leaves,remaining_leaves)

    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login("sangramjagadale2017@gmail.com", "ifitfwphppuwtgfl")
    s.sendmail('IIT Rpr Leave OTP',email_id,msg)

def findNextLeaveID():
    connect = db
    cursor = connect.cursor()
    cursor.execute("select max(leave_id) from leaves;")
    data = cursor.fetchall()
    if not data:
        return 1    
    if not data[0]:
        return 1
    try:
        return data[0][0]+1
    except:
        return 1

from pydrive.drive import GoogleDrive
from pydrive.auth import GoogleAuth
import os,shutil

access_token = "ya29.A0ARrdaM-5wVuIL8TgP48E5-g7zB7MGPzRQPNzW2U2soXr-Q9L0UEudP680MClxvrT2_0aS4GdZVuGBmI6QO7etyaIe9nvM9sANlT4mAGNWq4xloXC77DWAR59LquOY_k5wCaa2LnM2PsSqCwM3Z13wSMdnotE"

import json
import requests
class GoogleDrive:
    def __init__(self,access_token):
        self.headers = {"Authorization": "Bearer {}".format(access_token)}
    def uploadFile(self,file_path, filename):
        para = {"name": filename, "parents": ["1ylWUFqR6s5QadjELxCodWAo6qIwXr4MD"]} # name of the file after upoading
        files = {
            'data': ('metadata', json.dumps(para), 'application/json; charset=UTF-8'),
            'file': open(file_path, "rb")
        }
        r = requests.post("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",headers=self.headers,files=files)
        print(r.text)
        
        file_link = "https://drive.google.com/file/d/"+r.json()['id']+"/view?usp=sharing"
        print("File Link", file_link)
        return file_link

GD = GoogleDrive(access_token)
# GD.uploadFile("C:\\Users\\ACER\\3D Objects\\Leave-Portal-main\\server\\Invoice- April Cycle.pdf")

# def upload(path,file_name):
#     gauth = GoogleAuth()
#     gauth.LocalWebserverAuth()	
#     drive = GoogleDrive(gauth)
#     f = drive.CreateFile({'title': file_name})
#     f.SetContentFile(path)
#     f.Upload()
#     f = None

def empty_the_folder(folder_path):
    folder = folder_path
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
            
        except Exception as e:
            print('Failed to delete %s. Reason: %s' % (file_path, e))
            return 0
    return 1

print("hi")
@app.route('/')
@cross_origin(supports_credentials=True)
def home():
    return 'Hello'


@app.route('/login_oauth', methods = ['POST'])
@cross_origin(supports_credentials=True)
def login_oauth():
    user_info = request.json["user_info"]
    email = user_info['email']
    if is_valid_email(email):
        session['logged_in'] = True
        session['user_info'] = user_info
        session.permanent = True
        data = get_user_data(email)
        return jsonify(data)
    else:
        return failiure_code


OriginalOTP = -1
@cross_origin(supports_credentials=True)
def send_otp(email):
    global OriginalOTP
    print("SEND OTP:", email)
    OTP = random.randint(10**5,10**6-1)
    print(OTP)
    session['otp'] = OTP
    print(session)
    OriginalOTP = OTP
    msg = "Your OTP for IIT Rpr Leave Management Portal is " + str(OTP)
    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login("head.dep2023@gmail.com", "osgkkqldbkkinnqj")
    s.sendmail('IIT Rpr Leave OTP',email,msg)
    print("HHHHHHHHHHHHHHHHHHHHHHHHHHHHH", session['otp'])
    return success_code

@app.route('/login_otp', methods = ['POST'])
@cross_origin(supports_credentials=True)
def login_otp():
    email = request.json['email']
    print("email: ", email)
    print(is_valid_email(email))
    if is_valid_email(email):
        send_otp(email)
        print("email sent: ")
        session['user_info'] = dict()
        session['user_info']['email'] = email
        print("session: ", session)
        return success_code
    else:
        return failiure_code

@app.route('/validate_otp' , methods = ['POST'])
@cross_origin(supports_credentials=True)
def validate_otp():
    otp = request.json['otp']
    print(otp , session['otp'],'==================')
    if str(otp) == str(session['otp']):
        
        session['logged_in'] = True
        session['user_info']['imageUrl'] = ""

        return success_code
    else:
        session.clear()
        return failiure_code

@app.route('/@me')
# @cross_origin(supports_credentials=True)
def get_current_user():
    if 'user_info' in session:
        email = session['user_info']['email']
        user_data = get_user_data(email)
        print("user_data", user_data)
        user_data = user_data[0]

        data = dict()
        data['name'] = user_data[1]
        data['email'] = user_data[2]
        data['level'] = user_data[3]
        data['department'] = user_data[4]
        data['total_leaves'] = user_data[5]
        data['av_leaves'] = user_data[6]
        if 'imageUrl' in 'user_info':
            data['imageURL'] = session['user_info']['imageUrl']
        else:
            data['imageURL'] = ""

        return jsonify(data)
    else:
        return jsonify("")

@app.route('/leave_application', methods=['POST'])
@cross_origin(supports_credentials=True)
def leave_application():
    print("tem1p",request.files.keys())
    print("tem2p",request.form.keys())
    dataa = request.form.copy()
    if 'docc' in request.files:
        dataa['docc'] = request.files['docc']
        ff = dataa['docc']
        file_name = 'doc{}.pdf'.format(findNextLeaveID())
        ff.save(os.getcwd()+'\\files\\' + file_name)
        dataa['docc'] = os.getcwd()+'.\\files\\' + file_name
        # upload(dataa['docc'],file_name)
        attached_documents = GD.uploadFile(dataa['docc'], file_name)
        dataa['attached_documents'] = attached_documents
        empty_the_folder(os.getcwd()+'\\files')

    else:
        dataa['docc'] = ""
        dataa['attached_documents'] = ""
    print("HHHHHHHHHHHHHHHH", dataa['docc'])
    status = insert_leave(dataa)
    if status:
        return success_code
    else:
        return failiure_code
        
@app.route('/dashboard',methods = ["POST","GET"])
@cross_origin(supports_credentials=True)
def dashboard():
    print('Dashboard' , session)
    data = get_user_dic(session['user_info']['email'])
    return jsonify(data)

@app.route('/fetchLeaves', methods = ['POST'])
@cross_origin(supports_credentials=True)
def fetchLeaves():
    email = session['user_info']['email']
    data = get_user_data(email)[0]
    user_id = data[0]
    connect = db
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM leaves WHERE user_id = %s",(user_id, ))
    data = cursor.fetchall()
    payload = []
    for i in data:
        # department, user_id, nature, purpose, is_station, request_date, start_date, end_date, duration, status, level
        content = {'id': i[0], 'department': i[1], 'user_id': i[2],'nature': i[3],'purpose': i[4],'is_station': i[5],'request_date': i[6],'start_date': i[7],'end_date': i[8], 'authority_comment': i[9], 'duration': i[10],'status': i[11],'level': i[12], 'attached_documents': i[13]}
        user_id = i[2]
        connect = db
        cursor = connect.cursor()
        cursor.execute('SELECT email_id FROM user WHERE user_id = %s',(user_id, ))
        data = cursor.fetchall()
        email = data[0][0]
        cur_user = get_user_dic(email)
        content['email'] = cur_user['email']
        content['name'] = cur_user['name']
        nature = i[3]
        c_st1 = "Total " + nature + 's'
        c_st2 = "Taken " + nature + 's'
        nature = nature.lower().split()
        nature = '_'.join(nature)
        u_st1 = 'total_' + nature + 's'
        u_st2 = 'taken_' + nature + 's'
        
        content[c_st1] = cur_user[u_st1]
        content[c_st2] = cur_user[u_st2]
        content["key1"] = c_st1
        content["key2"] = c_st2
        
        payload.append(content)

    return jsonify(result=payload)

@app.route('/check_leaves',methods = ['GET','POST'])
@cross_origin(supports_credentials=True)
def check_leaves():
    email = session['user_info']['email']
    data = get_user_dic(email)
    user_id = data['user_id']
    department = data['department']
    position = data['position']
    connect = db
    cursor = connect.cursor()
    print("HERE : ", position)
    if position == "hod":
        cursor.execute('SELECT * FROM leaves WHERE\
            department = %s and level = %s',(department, "Faculty"))
    elif position == 'dean':
        cursor.execute('SELECT * FROM leaves')
    elif position == 'establishment':
        cursor.execute("SELECT * FROM leaves")
    leaves = cursor.fetchall()    
    payload = []

    for i in leaves:
        content = {'id': i[0], 'department': i[1], 'user_id': i[2],'nature': i[3],'purpose': i[4],'is_station': i[5],'request_date': i[6],'start_date': i[7],'end_date': i[8], 'authority_comment': i[9], 'duration': i[10],'status': i[11],'level': i[12], 'attached_documents': i[13]}
        pprint.pprint(content)
        user_id = i[2]
        connect = db
        cursor = connect.cursor()
        cursor.execute('SELECT email_id FROM user WHERE user_id = %s',(user_id, ))
        data = cursor.fetchall()
        email = data[0][0]
        cur_user = get_user_dic(email)
        content['email'] = cur_user['email']
        content['name'] = cur_user['name']
        nature = i[3]
        c_st1 = "Total " + nature + 's'
        c_st2 = "Taken " + nature + 's'
        nature = nature.lower().split()
        nature = '_'.join(nature)
        u_st1 = 'total_' + nature + 's'
        u_st2 = 'taken_' + nature + 's'
        
        content[c_st1] = cur_user[u_st1]
        content[c_st2] = cur_user[u_st2]
        content["key1"] = c_st1
        content["key2"] = c_st2
        print("position: ", position)
        if position == 'dean':
            print("here: ", nature, content['level'])
            if (nature=="casual_leave" or nature=="restricted_leave") and (content['level'] == 'hod'):                
                payload.append(content)
            elif nature == "casual_leave" or nature == "restricted_leave":
                continue
            elif content['status'] == 'Approved By Hod' or content['status'] == 'Approved By Dean' or content['status'] == 'Disapproved By Dean':
                payload.append(content)
        elif position == 'hod':
            payload.append(content)
        elif position == 'establishment':
            if content['status'] == 'Approved By Hod':
                payload.append(content)

    return jsonify(result = payload)

@app.route('/approve_leave', methods = ['POST'])
@cross_origin(supports_credentials=True)
def approve_leave():
    leave_id = request.json['leave_id']
    if "approved" not in session:
        session['approved'] = {}
    if leave_id in session['approved']:
        return success_code
    session['approved'][leave_id] = 1
    user = get_user_dic(session['user_info']['email'])

    connect = db
    cursor = connect.cursor()
    if user["position"] == "hod":
        cursor.execute("UPDATE leaves SET status = 'Approved By Hod' WHERE leave_id = %s",(leave_id, ))
    elif user["position"] == "dean":
        cursor.execute("UPDATE leaves SET status = 'Approved By Dean' WHERE leave_id = %s",(leave_id, ))
    connect.commit()

    cursor.execute("Select user_id, nature, duration from leaves where leave_id = %s", (leave_id, ))
    data = cursor.fetchall()[0]
    user_id = data[0]
    nature = data[1]
    duration = float(data[2])

    nature = nature.lower().split()
    nature = '_'.join(nature)
    u_st1 = 'total_' + nature + 's'
    u_st2 = 'taken_' + nature + 's'
    query = "Select %s from user where user_id = %s" % (u_st2, user_id)
    cursor.execute(query)
    data = cursor.fetchall()[0]
    taken_cnt = float(data[0]) + duration
    if (nature == "casual_leave" or nature == "restricted_leave") and (user['position']=='hod' or user['position']=='dean'):
        query = "Update user set %s = %s where user_id = %s" % (u_st2, taken_cnt, user_id)
        cursor.execute(query)
    elif nature != "casual_leave" and nature != "restricted_leave" and user['position']=='dean':
        query = "Update user set %s = %s where user_id = %s" % (u_st2, taken_cnt, user_id)
        cursor.execute(query)
    connect.commit()
    # send_update_mail(leave_id)
    return success_code

@app.route('/disapprove_leave', methods = ['POST'])
@cross_origin(supports_credentials=True)
def disapprove_leave():
    leave_id = request.json['leave_id']
    connect = db
    cursor = connect.cursor()
    cursor.execute("UPDATE leaves SET status = 'Disapproved By Hod' WHERE leave_id = %s",(leave_id))
    connect.commit()
    return success_code

@app.route('/add_comment', methods = ['POST'])
def add_comment():
    leave_id = request.json['leave_id']
    comment = request.json['comment']
    connect = db
    cursor = connect.cursor()
    cursor.execute("UPDATE leaves SET authority_comment = %s WHERE leave_id = %s",(comment, leave_id))
    connect.commit()
    return success_code

@app.route('/add_users', methods=['GET', 'POST'])
@cross_origin(supports_credentials=True)
def add_users():
    file = request.files['file']
    file.save("data.xlsx")
    dfs = pd.read_excel("data.xlsx", sheet_name=None)
    d = dfs["Sheet1"]
    initialize()
    for i in range (len(d)):
        query = "insert into user(name, email_id, position, department, total_casual_leaves, taken_casual_leaves, total_restricted_leaves, taken_restricted_leaves, total_earned_leaves, taken_earned_leaves, total_vacation_leaves, taken_vacation_leaves, total_special_leaves, taken_special_leaves, total_commuted_leaves, taken_commuted_leaves, total_hospital_leaves, taken_hospital_leaves, total_study_leaves, taken_study_leaves, total_childcare_leaves, taken_childcare_leaves) values ('%s', '%s', '%s', '%s', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);" % (d.iloc[i,0], d.iloc[i,1], d.iloc[i,2], d.iloc[i,3], d.iloc[i,4], d.iloc[i,5], d.iloc[i,6], d.iloc[i,7], d.iloc[i,8], d.iloc[i,9], d.iloc[i,10], d.iloc[i,11], d.iloc[i,12], d.iloc[i,13], d.iloc[i,14], d.iloc[i,15], d.iloc[i,16], d.iloc[i,17], d.iloc[i,18], d.iloc[i,19], d.iloc[i,20], d.iloc[i,21])
        connect = db
        cursor = connect.cursor()
        cursor.execute(query)
        connect.commit()

    return success_code
    
# @app.route('/register', methods=['POST', 'GET'])
# def register():
#     if request.method == 'POST':
#         username = request.form['username']
#         password = request.form['password']
#         connect = db
#         cursor = connect.cursor()
#         cursor.execute("SELECT * FROM user_auth WHERE username = %s",(username))
#         data = cursor.fetchall()
#         if not data:
#             cursor.execute("INSERT INTO user_auth(username, password) VALUES (%s, %s)",(username, password))
#             connect.commit()
#             cursor.close()
#             session["logged_in"]=1
#             session["username"]=username
#             return render_template('home.html')
#         else:
#             return "Username already exists."
#     return render_template('register.html')

@app.route('/logout')
@cross_origin(supports_credentials=True)
def logout():
    session.clear()
    return success_code

if __name__ == '__main__':
    app.secret_key='secret123'
    print("hi")
    app.run(debug=True)