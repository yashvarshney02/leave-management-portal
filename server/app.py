from tkinter import E
from flask import Flask,send_file, jsonify, render_template, url_for, request, session, redirect, Response, send_from_directory
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
import numpy as np
from dateutil import parser
import json

import util

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.secret_key='secret123'
root_directory = 'mysite'
app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=True)

# db = mysql.connector.connect(
#     host="sql12.freemysqlhosting.net",
#     user="sql12599367",
#     passwd="41XYHlH5lg",
#     database="sql12599367"
# )
# db = mysql.connector.connect(
# 	host="yashiitrpr.mysql.pythonanywhere-services.com",
# 	user="yashiitrpr",
# 	passwd="password@dep123",
# 	database="yashiitrpr$dep"
# )
db = mysql.connector.connect(
	host="localhost",
	user="root",
	passwd="abcd@12345",
	database="dep"
)

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
	
def get_columns_of_table(table):
	db.reconnect()
	connect = db
	cursor = connect.cursor()
	cursor.execute(f'SHOW columns FROM {table}')
	columns = cursor.fetchall()
	return [e[0] for e in columns]

def check_user(email):
	try:
		db.reconnect()
		cursor = db.cursor()
		cursor.execute("SELECT * FROM users")
		data = cursor.fetchall()
		for info in data:
			if (info[2] == email):
				return True
		return False
	except Exception as E:
		return False

def insert_user(columns,values):
	db.reconnect()
	cursor = db.cursor()
	query = "INSERT INTO users ({}) VALUES ({})".format(
			', '.join(columns), ', '.join(['%s'] * len(values)))
	cursor.execute(query, tuple(values))
	db.commit()
	db.close()

def insert_leave_application(columns,values):
	db.reconnect()
	cursor = db.cursor()
	query = "INSERT INTO leaves ({}) VALUES ({})".format(
			', '.join(columns), ', '.join(['%s'] * len(values)))
	cursor.execute(query, tuple(values))
	db.commit()
	db.close()

def get_columns_for_user_table(name, email_id, position, department, mobile):
	columns = ['email_id']
	values = [email_id]
	if not pd.isna(name):
		columns.append('name')
		values.append(name)
	else:
		columns.append('name')
		values.append(f'User - {position}')
	if not pd.isna(position):
		columns.append('position')
		values.append(position)
	if not pd.isna(department):
		columns.append('department')
		values.append(department)
	if not pd.isna(mobile):
		columns.append('mobile')
		values.append(str(mobile))
	return columns, values

def get_columns_for_leaves_table(email_id,nature,duration,is_station,start_date,end_date,status,type_of_leave):
	user_data = get_user_dic(email_id)
	department = user_data['department']
	user_id = user_data['user_id']
	request_date = str(dt.datetime.now())
	level = user_data['position']
	columns = ['user_id','nature','duration','is_station','start_date','end_date','status','type_of_leave', 'department', 'request_date','level']
	values = [user_id, nature,int(duration), is_station, parser.parse(start_date), parser.parse(end_date), status, type_of_leave, department, request_date,level]
	return columns, values


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

def get_user_dic_by_user_id(user_id):
	db.reconnect()
	cursor = db.cursor()
	cursor.execute("SELECT * FROM users where user_id=%s", (user_id, ))
	data = cursor.fetchall()[0]
	dic = {}
	dic['user_id'] = data[0]
	dic['name'] = data[1]
	dic['email'] = data[2]
	dic['position'] = data[3]
	dic['department'] = data[4]
	dic['mobile'] = data[5]
	return dic

def insert_leave(leave, signature, document):
	try:
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		data = get_user_dic(leave['form_email'])
		user_id = data['user_id']
		print("USER_ID: ", user_id)
		department = data['department']
		position = data['position']
		signature_binary = bytes(signature.values())
		if leave.get('form_filename'):
			file_name = leave['form_filename']
			document.save(os.path.join(root_directory, file_name))
		else:
			file_name = ''
		if leave.get('form_filedata'):
			file_data = leave['form_filedata']
		else:
			file_data = ''
		cursor.execute("INSERT INTO leaves\
			(department, user_id, nature, purpose, is_station, request_date, start_date, end_date, duration, status, level,file_uploaded, type_of_leave, filename, file_data, signature, address, prefix_start_date, prefix_end_date,suffix_start_date,suffix_end_date, alt_arrangements,station_start_date, station_end_date) \
			VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
					(department, user_id, leave['form_nature'], leave['form_purpose'], leave['form_isStation'], str(dt.datetime.now()), leave['form_sdate'], leave['form_edate'], leave['form_duration'], 'Pending', position, '', leave['form_type_of_leave'], file_name, file_data,signature_binary
					,leave.get('form_address'), leave.get('form_pres'), leave.get('form_pree'), leave.get('form_suffs'), leave.get('form_suffe'), leave.get('form_altArrangements'), leave.get('form_station_sdate'), leave.get('form_station_edate')))
		connect.commit()
		return True
	except Exception as E:
		exc_type, exc_obj, exc_tb = sys.exc_info()
		fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
		return str(E) + str(exc_tb.tb_lineno)

def leaves_data_util(user_id):
	connect = db
	cursor = connect.cursor()
	year = dt.date.today().year
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
		return default_leaves
	else:
		payload = {key: val for key,val in zip(columns,data[0])}
		return payload


@app.route('/home', methods = ['GET'])
@cross_origin(supports_credentials=True)
def home():
	return get_success_response("Hello World")

@app.route('/sample_csvs', methods = ['POST'])
@cross_origin(supports_credentials=True)
def sample_csvs():
	try:
		mode = request.json['name']
		file_name = f'{mode}.csv' if not request.json.get('file_name') else request.json.get('file_name')
		print(os.path.join(root_directory,file_name))
		if mode == "users_sample":
			return send_file(file_name, as_attachment=True, attachment_filename=file_name)
		elif mode == "leaves_sample":
			return send_file(file_name, as_attachment=True, attachment_filename=file_name)
		elif mode == "leave_document":
			with open(os.path.join(root_directory,file_name), 'rb') as f:
				pdf_data = f.read()
				encoded_data = base64.b64encode(pdf_data).decode('utf-8')
			return get_success_response(encoded_data)
	except Exception as E:
		return get_error_response(E)

@app.route('/process_query', methods = ['POST'])
@cross_origin(supports_credentials=True)
def process_query():
	try:
		file = request.files['file']
		mode = request.form.get('name')
		sample_data = pd.read_csv(f"{root_directory}//{mode}.csv")
		data = pd.read_csv(file)
		if list(data.columns) != list(sample_data):
			return get_error_response("Wrong Data, Kindly Match the sample data provided in the link")
		if mode == "users_sample":
			inserted_users = {}
			for name, email_id, position, department, mobile in zip(data.name.values, data.email_id.values, data.position.values, data.department.values, data.mobile.values):
				print("email:",pd.isna(email_id),pd.isna(position),pd.isna(department), department, position)
				if pd.isna(email_id) or pd.isna(position) or pd.isna(department):
					continue
				if check_user(email_id):
					continue
				columns, values = get_columns_for_user_table(name, email_id, position, department, mobile)
				insert_user(columns,values)
				user_id = get_user_dic(email_id)['user_id']
				leaves_data_util(user_id)
				inserted_users[email_id] = [columns, values]
			for email in inserted_users:
				message = util.insert_user_message(inserted_users[email][0], inserted_users[email][1])
				util.send_email(email, message)
		elif mode == "leaves_sample":
			for email_id,nature,duration,is_station,start_date,end_date,status,type_of_leave in zip(data.email_id.values, data.nature.values,data.duration.values, data.is_station.values, data.start_date.values, data.end_date.values, data.status.values,data.type_of_leave.values):
				if pd.isna(email_id)or pd.isna(duration) or pd.isna(nature) or pd.isna(is_station) or pd.isna(start_date) or pd.isna(end_date) or pd.isna(status) or pd.isna(type_of_leave):
					continue
				print('all_good')
				if not check_user(email_id):
					continue
				columns,values = get_columns_for_leaves_table(email_id,nature,duration,is_station,start_date,end_date,status,type_of_leave)
				insert_leave_application(columns,values)

		return get_success_response(True)
	except Exception as E:
		return get_error_response(E)

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
		message = util.otp_message(OTP)
		util.send_email(email, message)
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
		query = 'UPDATE users set name = %s, mobile = %s WHERE email_id = %s'
		cursor.execute(query,(name, mobile, email,))
		connect.commit()
		return get_success_response("Profile Edit successful")
	except Exception as E:
		return get_error_response(E)


@app.route('/apply_leave', methods=['POST'])
@cross_origin(supports_credentials=True)
def apply_leave():
	try:
		data = json.loads(request.form.get('data'))
		signature = data['signature']
		try:
			document = request.files['file']
		except:
			document = None
		ret = insert_leave(data, signature,document)
		if ret == True:
			return get_success_response("Leave Applied Successfully")
		else:
			return get_error_response(f"Leave Application Unsuccessful {ret}")
	except Exception as E:
		return get_error_response(f"Leave Application Unsuccessful {E}")

import base64

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
		cur_user = get_user_dic(email)
		columns = get_columns_of_table('leaves')
		for i in data:
			content = {}
			for col, val in zip(columns, i):
				if col in ['file_data', 'signature']:
					val = base64.b64encode(val).decode('utf-8') if val else None,
				content[col] = val
			content['name'] = cur_user['name']
			content['email'] = cur_user['email']
			content['mobile'] = cur_user['mobile']
			content['position'] = cur_user['position']

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
		columns = get_columns_of_table('leaves')
		payload = []
		for i in leaves:
			content = {}
			for col, val in zip(columns, i):
				if col in ['file_data', 'signature']:
					val = base64.b64encode(val).decode('utf-8') if val else None,
				content[col] = val
			applicant = get_user_dic_by_user_id(content['user_id'])
			content['name'] = applicant['name']
			content['email'] = applicant['email']
			content['mobile'] = applicant['mobile']
			content['position'] = applicant['position']
			leaves_data = leaves_data_util(i[2])
			content.update(leaves_data)
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
			cursor.execute('SELECT * FROM leaves WHERE\
				department = %s and level = %s', (department, "hod"))
		elif position == 'establishment':
			cursor.execute("SELECT * FROM leaves")
		leaves = cursor.fetchall()
		payload = []
		for i in leaves:
			content = {'id': i[0], 'department': i[1], 'user_id': i[2], 'nature': i[3], 'purpose': i[4], 'is_station': i[5], 'request_date': i[6],
					'start_date': i[7], 'end_date': i[8], 'authority_comment': i[9], 'duration': i[10], 'status': i[11], 'level': i[12], 'attached_documents': i[13], 'signature': base64.b64encode(i[17]).decode('utf-8') if i[17] else None,}
			if content['department'] != department:
				continue
			cursor.execute('SELECT email_id FROM users WHERE user_id = %s', (i[2], ))
			data = cursor.fetchall()
			email = data[0][0]
			cur_user = get_user_dic(email)
			content['email'] = cur_user['email']
			content['name'] = cur_user['name']
			applicant_position = cur_user['position']
			content['position'] = applicant_position
			if position == 'dean' and applicant_position == 'hod':
				payload.append(content)
			elif position == 'hod' and applicant_position == 'faculty':
				payload.append(content)
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
		leaves_data = leaves_data_util(user_id)
		return get_success_response(leaves_data)
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
		if nature == "casual_leave":
			u_st2 = 'taken_' + nature + 's'
		else:
			u_st2 = 'taken_' + nature
		query = "Select %s from leaves_data where user_id = %s" % (u_st2, user_id)
		cursor.execute(query)
		data = cursor.fetchall()[0]
		print("duration:",duration)
		taken_cnt = float(data[0]) + duration
		print("taken: ",taken_cnt)
		query = "Update leaves_data set %s = %s where user_id = %s" % (
				u_st2, taken_cnt, user_id)
		cursor.execute(query)
		connect.commit()
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
				"UPDATE leaves SET status = 'Disapproved By Dean' WHERE leave_id = %s", (leave_id,))
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

		cursor.execute("UPDATE leaves set status='Pending Withdrawn' where leave_id = %s", (leave_id,))
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

@app.route('/get_emails' , methods = ['GET'])
@cross_origin(supports_credentials=True)
def get_emails():
	try:
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute("SELECT * FROM users")
		data = cursor.fetchall()
		payload = []
		if len(data) == 0:
			return get_success_response(payload)
		for i in data:
			if i[3] in ['hod','dean','faculty']:
				payload.append(i[2])
		return get_success_response(payload)
	except Exception as E:
		return get_error_response(E)

@app.route('/collective_data', methods=['GET', 'POST'])
@cross_origin(supports_credentials=True)
def collective_data():
	try:
		email = session['user_info']['email']
		data = get_user_dic(email)
		department = data['department']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute('SHOW columns from users')
		users_cols = cursor.fetchall()   # list of tuples whose first value of tuple is the column name
		users_cols = [e[0] for e in users_cols]
		cursor.execute('SELECT * FROM users WHERE department = %s', (department,))
		users = cursor.fetchall()
		users_data = []
		for data in users:
			if data[4] != department:
				continue
			dic = {key: value for key, value in zip(users_cols,data)}
			uid = dic['user_id']
			# get total number of leaves from here
			leaves_dic = leaves_data_util(uid)
			dic.update(leaves_dic)
			# now get the ids of all leaves of that user_id
			cursor.execute('SELECT leave_id, status FROM leaves WHERE user_id = %s', (uid,))
			leave_ids = cursor.fetchall()
			leave_ids = [[e[0],e[1]] for e in leave_ids]
			dic.update({"leave_ids": leave_ids})
			users_data.append(dic)
		return get_success_response(users_data)
	except Exception as E:
		exc_type, exc_obj, exc_tb = sys.exc_info()
		fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
		return get_error_response(f"{E} {exc_tb.tb_lineno}")



if __name__ == '__main__':
	app.secret_key='secret123'
	app.run(host='0.0.0.0: 3001')