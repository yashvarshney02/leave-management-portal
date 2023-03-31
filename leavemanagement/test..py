from tkinter import E
from flask import Flask, jsonify, render_template, url_for, request, session, redirect, Response
from flask_pymongo import PyMongo
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
import sys

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
	host="yashiitrpr.mysql.pythonanywhere-services.com",
	user="yashiitrpr",
	passwd="password@dep123",
	database="yashiitrpr$dep"
)
# db = mysql.connector.connect(
# 	host="localhost",
# 	user="root",
# 	passwd="root_user@dep2023",
# 	database="yash_db"
# )

success_code = Response(status=200)
failure_code = Response(status=400)

def get_default_number_of_leaves():
	return {
		"total_casual_leaves": 8,
		"taken_casual_leaves": 0,
		"total_non_casual_leave": 8,
		"taken_non_casual_leave": 0
	}

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
		cursor.execute("SELECT * FROM users where email_id=%s", (email, ))
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
	dic['mobile'] = data[5]
	return dic

def insert_leave(leave):
	try:
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		data = get_user_data(leave['form_email'])[0]
		user_id = data[0]
		department = data[1]
		position = data[3]
		print(leave)
		cursor.execute("INSERT INTO leaves\
			(department, user_id, nature, purpose, is_station, request_date, start_date, end_date, duration, status, level,file_uploaded, type_of_leave) \
			VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s,%s)",
					(department, user_id, leave['form_nature'], leave['form_purpose'], leave['form_isStation'], str(dt.datetime.now()), leave['form_sdate'], leave['form_edate'], leave['form_duration'], 'Pending', position, '', leave['form_type_of_leave']))
		connect.commit()
		return True
	except Exception as E:
		print(E)
		return False

@app.route('/home', methods = ['GET'])
@cross_origin(supports_credentials=True)
def home():
	return get_success_response("Hello World")

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
		if (not check_user(data.get('email'))):
			return get_error_response("User not Allowed")
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
		email = session['user_info']['email']
		session['user_info'].update(get_user_dic(email=email))
		return get_success_response(session.get('user_info'))
	except Exception as E:
		return get_error_response(E)

@app.route('/edit_user_info' , methods = ['POST'])
@cross_origin(supports_credentials=True)
def edit_user_info():
	try:
		name = request.json['name']
		mobile = request.json['mobile']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		email = session['user_info']['email']
		query = 'UPDATE user set name = %s, mobile = %s WHERE email_id = %s'
		cursor.execute(query,(name, mobile, email,))
		connect.commit()
		return get_success_response("Profile Edit successful")
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
			content = {'id': i[0], 'department': i[1], 'user_id': i[2], 'nature': i[3],'type_of_leave':i[14], 'purpose': i[4], 'is_station': i[5], 'request_date': i[6],
					'start_date': i[7], 'end_date': i[8], 'authority_comment': i[9], 'duration': i[10], 'status': i[11], 'level': i[12], 'attached_documents': i[13]}
			user_id = i[2]
			cur_user = get_user_dic(email)
			content['email'] = cur_user['email']
			content['name'] = cur_user['name']

			payload.append(content)
		connect.close()

		return get_success_response(payload)
	except Exception as E:
		return get_error_response(E)

@app.route('/get_leave_info_by_id', methods=['POST'])
@cross_origin(supports_credentials=True)
def get_leave_info_by_id():
	try:
		leave_id = request.json['leave_id']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute('SELECT * FROM leaves WHERE leave_id = %s', (leave_id,))
		leaves = cursor.fetchall()
		payload = []
		for i in leaves:
			content = {'id': i[0], 'department': i[1], 'user_id': i[2], 'nature': i[3], 'purpose': i[4], 'is_station': i[5], 'request_date': i[6],
			'start_date': i[7], 'end_date': i[8], 'authority_comment': i[9], 'duration': i[10], 'status': i[11], 'level': i[12], 'attached_documents': i[13]}
			payload.append(content)
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
				'SELECT * FROM users WHERE user_id = %s', (user_id, ))
			data = cursor.fetchall()
			email = data[0][2]
			applicant_position = data[0][3]
			cur_user = get_user_dic(email)
			content['email'] = cur_user['email']
			content['name'] = cur_user['name']
			payload.append(content)
			if position == 'dean' and applicant_position == 'hod':
				payload.append(content)
			elif position == 'hod' and applicant_position == 'faculty':
				payload.append(content)
# 			elif position == 'hod':
# 				payload.append(content)
		return get_success_response(payload)
	except Exception as E:
		exc_type, exc_obj, exc_tb = sys.exc_info()
		fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
		return get_error_response(f"{E} {exc_tb.tb_lineno}")

@app.route('/fetch_remaining_leaves', methods=['GET'])
@cross_origin(supports_credentials=True)
def fetch_remaining_leaves():
	try:
		email = session['user_info']['email']
		data = get_user_data(email)[0]
		user_id = data[0]
		year = dt.date.today().year
		connect = db
		cursor = connect.cursor()
		cursor.execute("SELECT * FROM leaves_data WHERE user_id=%s and year=%s", (user_id, year))
		data = cursor.fetchall()
		default_leaves = get_default_number_of_leaves()
		columns = ["user_id"]
		for e in default_leaves:
			columns.append(e)
		columns.append("year")
		if len(data) == 0:
			values = [user_id]
			for e in default_leaves:
				values.append(default_leaves[e])
			values.append(year)
			query = "INSERT INTO leaves_data ({}) VALUES ({})".format(
			', '.join(columns), ', '.join(['%s'] * len(values)))
			cursor.execute(query, tuple(values))
			connect.commit()
			return get_success_response(default_leaves)
		else:
			payload = {key: val for key,val in zip(columns,data[0])}
			return get_success_response(payload)
	except Exception as E:
		return get_error_response(E)

@app.route('/fetch_number_of_leaves', methods=['POST'])
@cross_origin(supports_credentials=True)
def fetch_number_of_leaves():
	try:
		email = session['user_info']['email']
		data = get_user_data(email)[0]
		if data[3] !='dean':
			return get_success_response([])
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute("SELECT * FROM user")
		data = cursor.fetchall()
		payload = []
		for i in data:
			if (i[3] == 'hod'):
				content = [i[2], i[1], i[3], i[4], i[5] - i[6]]
				payload.append(content)
		return get_success_response(payload)
	except Exception as E:
		return get_error_response(E)

@app.route('/approve_leave', methods=['POST'])
@cross_origin(supports_credentials=True)
def approve_leave():
	try:
		leave_id = request.json['leave_id']
		if "approved" not in session:
			session['approved'] = {}
		if leave_id in session['approved']:
			return get_success_response(f"Leave with ID: {leave_id} is approved")
		session['approved'][leave_id] = 1
		user = get_user_dic(session['user_info']['email'])

		db.reconnect()
		connect = db
		cursor = connect.cursor()
		if user["position"] == "hod":
			cursor.execute(
				"UPDATE leaves SET status = 'Approved By Hod' WHERE leave_id = %s", (leave_id, ))
		elif user["position"] == "dean":
			cursor.execute(
				"UPDATE leaves SET status = 'Approved By Dean' WHERE leave_id = %s", (leave_id, ))
		connect.commit()

		cursor.execute(
			"Select user_id, nature, duration from leaves where leave_id = %s", (leave_id, ))
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
		if (nature == "casual_leave" or nature == "restricted_leave") and (user['position'] == 'hod' or user['position'] == 'dean'):
			query = "Update user set %s = %s where user_id = %s" % (
				u_st2, taken_cnt, user_id)
			cursor.execute(query)
		elif nature != "casual_leave" and nature != "restricted_leave" and user['position'] == 'dean':
			query = "Update user set %s = %s where user_id = %s" % (
				u_st2, taken_cnt, user_id)
			cursor.execute(query)
		connect.commit()
		connect.close()
		# send_update_mail(leave_id)
		return get_success_response(f"Leave with ID: {leave_id} is approved")
	except Exception as E:
		return get_error_response(E)

@app.route('/disapprove_leave', methods=['POST'])
@cross_origin(supports_credentials=True)
def disapprove_leave():
	try:
		leave_id = request.json['leave_id']
		user = get_user_dic(session['user_info']['email'])
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		if user["position"] == "hod":
			cursor.execute(
				"UPDATE leaves SET status = 'Disapproved By Hod' WHERE leave_id = %s", (leave_id,))
		elif user["position"] == "dean":
			cursor.execute(
				"UPDATE leaves SET status = 'Disapproved By Hod' WHERE leave_id = %s", (leave_id,))
		connect.commit()
		connect.close()
		return get_success_response(f"Leave with ID: {leave_id} is disapproved")
	except Exception as E:
		return get_error_response(E)

@app.route('/add_comment', methods=['POST'])
def add_comment():
	try:
		leave_id = request.json['leave_id']
		comment = request.json['comment']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute(
			"UPDATE leaves SET authority_comment = %s WHERE leave_id = %s", (comment, leave_id))
		connect.commit()
		connect.close()
		return get_success_response(f"Your comment is added to Leave with ID : {leave_id}")
	except Exception as E:
		return get_error_response(E)

@app.route('/delete_application', methods=['POST'])
def delete_application():
	try:
		leave_id = request.json['leave_id']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute("SELECT status FROM leaves where leave_id = %s", (leave_id,))
		results = cursor.fetchall()
		status = results[0][0]
		if ("Approved" in status):
			return get_error_response("This leave has already been approved, can't be deleted")
		if ("Disapproved" in status):
			return get_error_response("This leave has already been disapproved, can't be deleted")
		cursor.execute("DELETE FROM leaves where leave_id = %s", (leave_id,))
		connect.commit()
		connect.close()
		return get_success_response(f"Leave with id : {leave_id} has been deleted, refresh the page to see changes")
	except Exception as E:
		return get_error_response(E)

@app.route('/get_holidays_info', methods=['GET'])
def get_holiday_info():
	try:
		curr_year = dt.datetime.now().year
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute(f"CREATE TABLE IF NOT EXISTS holidays_{curr_year} (date VARCHAR(50) UNIQUE)")
		connect.commit()
		query = "SHOW TABLES LIKE 'holidays%'"
		cursor.execute(query)
		results = cursor.fetchall()
		tables = [table[0] for table in results]
		payload = {}
		for table in tables:
			year = table.split("_")[1]
			holidays = []
			payload[year] = []
			cursor.execute(f"SELECT * FROM {table}")
			results = cursor.fetchall()
			holidays = [res[0] for res in results]
			payload[year] = holidays
		connect.close()
		return get_success_response(payload)
	except Exception as E:
		return get_error_response(E)

@app.route('/add_holiday', methods=['POST'])
def add_holiday():
	try:
		curr_year = request.json['year']
		new_holidays = request.json['holidays']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute(f"TRUNCATE TABLE holidays_{curr_year}")
		connect.commit()
		for date in new_holidays:
			query = f"INSERT INTO holidays_{curr_year}(date) values('{date[0]}')"
			cursor.execute(query)
		connect.commit()
		connect.close()
		return get_success_response("Holidays Added successfully")
	except Exception as E:
		return get_error_response(E)


if __name__ == '__main__':
	app.secret_key='secret123'
	app.run(host='0.0.0.0: 3001')