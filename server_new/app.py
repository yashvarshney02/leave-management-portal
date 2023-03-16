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
import datetime as dt

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.secret_key='secret123'

app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=True)

# db = mysql.connector.connect(
#     host="sql12.freemysqlhosting.net",
#     user="sql12599367",
#     passwd="41XYHlH5lg",
#     database="sql12599367"
# )
db = mysql.connector.connect(
	host="localhost",
	user="root",
	passwd="root_user@dep2023",
	database="yash_db"
)
print(db)

success_code = Response(status=200)
failure_code = Response(status=400)

def get_error_response(error):
	return {
		"status": "error",
		"emsg": str(error)
	}

def get_success_response(data):
	return {
		"status": "success",
		"data": data
	}

def check_user(email):
	try:
		db.reconnect()
		cursor = db.cursor()
		cursor.execute("SELECT * FROM user")
		data = cursor.fetchall()
		for info in data:
			if (info[2] == email):
				return True
		return False
	except Exception as E:
		return False   

def get_user_data(email):
	try:
		db.reconnect()
		cursor = db.cursor()
		cursor.execute("SELECT * FROM user where email_id=%s", (email, ))
		data = cursor.fetchall()
		return data
	except Exception as E:
		return {}

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

def insert_leave(leave):
	try:		
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		data = get_user_data(leave['form_email'])[0]
		user_id = data[0]
		department = data[1]
		position = data[2]

		cursor.execute("INSERT INTO leaves\
			(department, user_id, nature, purpose, is_station, request_date, start_date, end_date, duration, status, level,file_uploaded) \
			VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s)",
					(department, user_id, leave['form_nature'], leave['form_purpose'], leave['form_isStation'], str(dt.date.today()), leave['form_sdate'], leave['form_edate'], leave['form_duration'], 'Pending', position, ''))
		connect.commit()    
		return True
	except Exception as E:
		print(E)
		return False

@app.route('/check_auth', methods = ['POST'])
@cross_origin(supports_credentials=True)
def check_auth():
	try:
		if session.get('logged_in'):
			return get_success_response(True)
		else:
			return get_success_response(False)
	except Exception as E:
		return get_success_response(E)	

@app.route('/send_otp', methods = ['POST'])
@cross_origin(supports_credentials=True)
def send_otp():
	try:		
		session.clear()
		email = request.json['email']
		if (not check_user(email)):
			return get_error_response("User not Allowed")
		OTP = random.randint(10**5,10**6-1)		
		session['otp'] = OTP		
		msg = "Your OTP for IIT Rpr Leave Management Portal is " + str(OTP)
		s = smtplib.SMTP('smtp.gmail.com', 587)
		s.starttls()
		s.login("head.dep2023@gmail.com", "osgkkqldbkkinnqj")
		s.sendmail('IIT Rpr Leave OTP',email,msg)		
		return get_success_response(f"OTP has been sent to {email}")
	except Exception as E:
		return get_success_response(E)


@app.route('/validate_otp' , methods = ['POST'])
@cross_origin(supports_credentials=True)
def validate_otp():
	try:
		otp = request.json['otp']  
		email = request.json['email']  		
		if str(otp) == str(session['otp']):        
			session['logged_in'] = True
			session['user_info'] = {
				"email": email,
				"picture" : ""
			}
			session['user_info'].update(get_user_dic(email=email))
			return get_success_response("OTP verified")
		else:
			session.clear()
			return get_error_response("Wrong OTP")        
	except Exception as E:
		return get_error_response(E)

@app.route('/login_oauth' , methods = ['POST'])
@cross_origin(supports_credentials=True)
def login_oauth():
	try:
		data = request.json['data'] 
		session.clear()      
		session['logged_in'] = True
		session['user_info'] = data
		session['user_info'].update(get_user_dic(email=data.get('email')))
		return get_success_response("Details Saved")                       
	except Exception as E:
		return get_error_response(E)

@app.route('/logout' , methods = ['POST'])
@cross_origin(supports_credentials=True)
def logout():
	try:
		session.clear()                   
		return get_success_response("Logout Successfull")
	except Exception as E:
		return get_error_response("Logout Failed")

@app.route('/get_user_info' , methods = ['GET'])
@cross_origin(supports_credentials=True)
def get_user_info():
	try:
		return get_success_response(session.get('user_info'))
	except Exception as E:		
		return get_error_response(E)
	
@app.route('/apply_leave', methods=['POST'])
@cross_origin(supports_credentials=True)
def apply_leave():
	try:
		data = request.json['data']
		insert_leave(data)
		return get_success_response("Leave Applied Successfully")
	except Exception as E:
		return get_error_response("Leave Application Unsuccessful")
	
@app.route('/past_applications', methods=['POST'])
@cross_origin(supports_credentials=True)
def past_applications():
	try:
		email = session['user_info']['email']	
		data = get_user_data(email)[0]	
		user_id = data[0]	
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute("SELECT * FROM leaves WHERE user_id = %s", (user_id, ))
		data = cursor.fetchall()	
		payload = []
		for i in data:			
			content = {'id': i[0], 'department': i[1], 'user_id': i[2], 'nature': i[3], 'purpose': i[4], 'is_station': i[5], 'request_date': i[6],
					'start_date': i[7], 'end_date': i[8], 'authority_comment': i[9], 'duration': i[10], 'status': i[11], 'level': i[12], 'attached_documents': i[13]}
			user_id = i[2]        
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
		connect.close()	

		return get_success_response(payload)
	except Exception as E:
		return get_error_response(E)
	
@app.route('/check_applications', methods=['GET', 'POST'])
@cross_origin(supports_credentials=True)
def check_applications():
	try:
		email = session['user_info']['email']	
		data = get_user_dic(email)	
		user_id = data['user_id']
		department = data['department']
		position = data['position']
		db.reconnect()
		connect = db
		cursor = connect.cursor()    
		if position == "hod":
			cursor.execute('SELECT * FROM leaves WHERE\
				department = %s and level = %s', (department, "faculty"))
		elif position == 'dean':
			cursor.execute('SELECT * FROM leaves')
		elif position == 'establishment':
			cursor.execute("SELECT * FROM leaves")
		leaves = cursor.fetchall()
		payload = []	
		for i in leaves:		
			content = {'id': i[0], 'department': i[1], 'user_id': i[2], 'nature': i[3], 'purpose': i[4], 'is_station': i[5], 'request_date': i[6],
					'start_date': i[7], 'end_date': i[8], 'authority_comment': i[9], 'duration': i[10], 'status': i[11], 'level': i[12], 'attached_documents': i[13]}        
			user_id = i[2]
			db.reconnect()
			connect = db
			cursor = connect.cursor()
			cursor.execute(
				'SELECT email_id FROM user WHERE user_id = %s', (user_id, ))
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
			if position == 'dean':            
				if (nature == "casual_leave" or nature == "restricted_leave") and (content['status'] == 'Pending'):
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
		return get_success_response(payload)
	except Exception as E:
		return get_error_response(E)	
	
@app.route('/fetch_number_of_leaves', methods=['POST'])
@cross_origin(supports_credentials=True)
def fetchNumberOfLeaves():
	try:
		email = session['user_info']['email']
		data = get_user_data(email)[0]
		if data[3] !='dean':
			return jsonify(result=[])		
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute("SELECT * FROM user")
		data = cursor.fetchall()
		pprint.pprint(data)
		payload = []
		for i in data:
			if (i[3] == 'hod'):            
				content = [i[2], i[1], i[3], i[4], i[5] - i[6]]        
				payload.append(content)
		return get_success_response(payload)
	except Exception as E:
		return get_error_response(E)    

		

if __name__ == '__main__':
	app.secret_key='secret123'    
	app.run(debug=True)