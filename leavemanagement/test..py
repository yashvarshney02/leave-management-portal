from flask import Flask,send_file, request, session, Response
import mysql.connector
import os
from flask_cors import CORS, cross_origin
import random
import pandas as pd
import pprint
import datetime as dt
import sys
from dateutil import parser
import json

import util

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.secret_key='secret123'
root_directory = 'mysite'
# app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=True)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'

no_auth_routes = ['/edit_user_info','/check_auth','/send_otp','/validate_otp','/login_oauth','/login_oauth','/logout','/logout','/sample_csvs', '/get_user_info', '/get_leave_info_by_id']

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
		"taken_non_casual_leave": 0,
		"total_restricted_leaves": 2,
		"taken_restricted_leaves": 0,
		"total_scl_leaves": 15,
		"taken_scl_leaves": 0,
		"total_pg_leaves": 30,
		"taken_pg_leaves": 0
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
		email = email.lower()
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
	print(query)
	cursor.execute(query, tuple(values))
	db.commit()
	db.close()
	return cursor.rowcount

def update_user(columns,values, user_id):
	db.reconnect()
	print("update", columns, values, user_id)
	cursor = db.cursor()
	query = "UPDATE users SET "
	for i in range(len(columns)):
		query += f"{columns[i]} = '{values[i]}'"
		if i < len(columns)-1:
			query += ", "
	query += f" WHERE user_id={user_id};"
	print(query)
	cursor.execute(query)
	db.commit()
	db.close()
	return cursor.rowcount

def update_leave_balance(columns,values, user_id, year):
	query = "UPDATE leaves_data SET "
	print(columns,values, user_id, year)

	# Add the column names and values to the query
	for i in range(len(columns)):
		query += f"{columns[i]} = {int(values[i])}"
		if i < len(columns)-1:
			query += ", "

	# Add the condition to the query
	query += f" WHERE user_id={user_id} and year={year}"
	print(query)
	db.reconnect()
	cursor = db.cursor()
	cursor.execute(query)
	db.commit()
	db.close()
	return cursor.rowcount


def get_columns_for_user_table(name, email_id, position, department, mobile,entry_number,ta_instructor,advisor):
	columns = ['email_id']
	values = [email_id]
	if not pd.isna(name):
		columns.append('name')
		values.append(name)
# 	else:
# 		columns.append('name')
# 		values.append(f'User - {position}')
	if not pd.isna(position):
		columns.append('position')
		values.append(position)
	if not pd.isna(department):
		columns.append('department')
		values.append(department)
	if not pd.isna(mobile):
		columns.append('mobile')
		values.append(str(mobile))
	if not pd.isna(entry_number):
		columns.append('entry_number')
		values.append(str(entry_number))
	if not pd.isna(ta_instructor):
		columns.append('ta_instructor')
		values.append(str(ta_instructor))
	if not pd.isna(advisor):
		columns.append('advisor')
		values.append(str(advisor))
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
	email = email.lower()
	dic = {}
	dic['user_id'] = data[0]
	dic['name'] = data[1]
	dic['email'] = data[2]
	dic['position'] = data[3]
	dic['department'] = data[4]
	dic['mobile'] = data[5]
	dic['entry_number'] = data[7]
	dic['ta_instructor'] = data[8]
	dic['advisor'] = data[9]
	return dic

def get_user_signature(email):
	data = get_user_data(email)[0]
	dic = {}
	dic['signature'] = base64.b64encode(data[6]).decode('utf-8') if data[6] else None
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
	dic['entry_number'] = data[7]
	dic['ta_instructor'] = data[8]
	dic['advisor'] = data[9]
	return dic

def get_new_leave_id(cursor):
	cursor.execute("SELECT leave_id FROM leaves ORDER BY leave_id DESC LIMIT 1")
	result = cursor.fetchone()
	if result is not None:
		last_leave_id = result[0]
	else:
		last_leave_id = None
	# Generate the new leave_id value
	if last_leave_id is not None:
		numeric_part = int(last_leave_id.split('_')[1])
		new_numeric_part = numeric_part + 1
		# Generate the new leave_id value
		new_leave_id = 'LMP_' + str(new_numeric_part)
	else:
	# If there are no rows in the table, set the new leave_id value to LMP_1
		new_leave_id = 'LMP_1'
	return new_leave_id

def get_new_pg_leave_id(cursor):
	cursor.execute("SELECT leave_id FROM pg_leaves ORDER BY leave_id DESC LIMIT 1")
	result = cursor.fetchone()
	if result is not None:
		last_leave_id = result[0]
	else:
		last_leave_id = None
	# Generate the new leave_id value
	if last_leave_id is not None:
		numeric_part = int(last_leave_id.split('_')[1])
		new_numeric_part = numeric_part + 1
		# Generate the new leave_id value
		new_leave_id = 'PG_' + str(new_numeric_part)
	else:
	# If there are no rows in the table, set the new leave_id value to LMP_1
		new_leave_id = 'PG_1'
	return new_leave_id

def insert_leave(leave, signature, document):
	try:
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		data = get_user_dic(leave['form_email'])
		user_id = data['user_id']
		department = data['department']
		position = data['position']
		if signature:
			signature_binary = bytes(signature.values())
		else:
			signature_binary = signature
		if leave.get('form_filename'):
			file_name = leave['form_filename']
			document.save(os.path.join(root_directory, file_name))
		else:
			file_name = ''
		if leave.get('form_filedata'):
			file_data = leave['form_filedata']
		else:
			file_data = ''
		cursor.execute("UPDATE users SET signature = %s WHERE user_id = %s", (signature_binary, user_id ))
		new_leave_id = get_new_leave_id(cursor)
		cursor.execute("INSERT INTO leaves\
			(leave_id, department, user_id, nature, purpose, is_station, request_date, start_date, end_date, duration, status, level,file_uploaded, type_of_leave, filename, file_data, signature, address, prefix_start_date, prefix_end_date,suffix_start_date,suffix_end_date, alt_arrangements,station_start_date, station_end_date) \
			VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
					(new_leave_id,department, user_id, leave['form_nature'], leave['form_purpose'], leave['form_isStation'], leave['form_rdate'], leave['form_sdate'], leave['form_edate'], leave['form_duration'], 'Pending', position, '', leave['form_type_of_leave'], file_name, file_data,signature_binary
					,leave.get('form_address'), leave.get('form_pres'), leave.get('form_pree'), leave.get('form_suffs'), leave.get('form_suffe'), leave.get('form_altArrangements'), leave.get('form_station_sdate'), leave.get('form_station_edate')))
		connect.commit()
		cols = ["Applicant Email ID", "Leave ID"]
		vals = [leave['form_email'],new_leave_id]
		for key in util.apply_leave_keys:
			if leave.get(key) and len(leave.get(key)):
				cols.append(util.apply_leave_keys[key])
				vals.append(leave.get(key))
		message = util.apply_leave_message(cols, vals)
		util.send_email(leave['form_email'], message, "Leave Applied Successfully")
		if leave['form_nature'].lower().startswith("casual"):
			url = f"casual/{new_leave_id}"
		else:
			url = f"non_casual/{new_leave_id}"
		message = util.process_leave_message( cols, vals, url)
		if (position == "hod"):
			cursor.execute("SELECT email_id FROM users where position='dean'")
			data = cursor.fetchall()
			if len(data):
				try:
					recepient_email = data[0][0]
					util.send_email(recepient_email, message, "New Leave Application Submitted")
				except:
					pass
		if (position == "faculty"):
			cursor.execute("SELECT email_id FROM users where position='hod' and department=%s",(department,))
			data = cursor.fetchall()
			if len(data):
				for info in data:
					try:
						recepient_email = info[0]
						util.send_email(recepient_email, message, "New Leave Application Submitted")
					except:
						pass

		return True, new_leave_id
	except Exception as E:
		exc_type, exc_obj, exc_tb = sys.exc_info()
		fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
		return "first" + str(E) + str(exc_tb.tb_lineno)

def insert_pg_leave(leave, signature, document):
	try:
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		data = get_user_dic(leave['form_email'])
		user_id = data['user_id']
		department = data['department']
		position = data['position']
		if signature:
			signature_binary = bytes(signature.values())
		else:
			signature_binary = signature
		if leave.get('form_filename'):
			file_name = leave['form_filename']
			document.save(os.path.join(root_directory, file_name))
		else:
			file_name = ''
		if leave.get('form_filedata'):
			file_data = leave['form_filedata']
		else:
			file_data = ''
		cursor.execute("UPDATE users SET signature = %s WHERE user_id = %s", (signature_binary, user_id ))
		new_leave_id = get_new_pg_leave_id(cursor)
		cursor.execute("INSERT INTO pg_leaves\
			(leave_id, department, user_id, nature, purpose, is_station, request_date, start_date, end_date, duration, status, level, filename, signature, address, venue, duty_start_date,duty_end_date,prefix_suffix,station_start_date, station_end_date, advisor, ta_instructor, remarks) \
			VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
					(new_leave_id,department, user_id, leave['form_nature'], leave['form_purpose'], leave['form_isStation'], leave['form_rdate'], leave['form_sdate'], leave['form_edate'], leave['form_duration'], 'Pending', position, file_name,signature_binary
					,leave.get('form_address'), leave.get('form_venue'), leave.get('form_duty_start'), leave.get('form_duty_end'), leave.get('form_prefix_suffix'), leave.get('form_station_sdate'), leave.get('form_station_edate'),leave['form_advisor'],leave['form_ta_instructor'],leave['form_remarks']))
		connect.commit()
		cols = ["Applicant Email ID", "Leave ID"]
		vals = [leave['form_email'],new_leave_id]
		# 		leave applied now send email
		for key in util.apply_pg_leave_keys:
			if leave.get(key) and len(leave.get(key)):
				cols.append(util.apply_pg_leave_keys[key])
				vals.append(leave.get(key))
		message = util.apply_leave_message(cols, vals)
		util.send_email(leave['form_email'], message, "Leave Applied Successfully")
		url = f"pg_applications/{new_leave_id}"
		message = util.process_leave_message( cols, vals, url)
		email_ids = set({leave['form_advisor'], leave['form_ta_instructor']})
		for email in email_ids:
			util.send_email(email, message, "New Leave Application Submitted")
		return True, new_leave_id
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
	columns = get_columns_of_table('leaves_data')
	default_columns = columns.copy()
	columns.remove("year")
	columns.append("year")
	if len(data) == 0:
		values = [user_id]
		for e in default_leaves:
			values.append(default_leaves[e])
		values.append(year)
		print(values)
		query = "INSERT INTO leaves_data ({}) VALUES ({})".format(
		', '.join(columns), ', '.join(['%s'] * len(values)))
		print(query)
		cursor.execute(query, tuple(values))
		connect.commit()
		return default_leaves
	else:
		payload = {key: val for key,val in zip(default_columns,data[0])}
		return payload

@app.before_request
def before_request():
	# if request.path not in no_auth_routes and not session.get('logged_in'):
	#     return jsonify({'error': 'Forbidden'}), 403
	return


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
		if mode == "users_sample":
			return send_file(file_name, as_attachment=True, attachment_filename=file_name)
		elif mode == "leaves_sample":
			return send_file(file_name, as_attachment=True, attachment_filename=file_name)
		elif mode == "leaves_balance":
			return send_file(file_name, as_attachment=True, attachment_filename=file_name)
		elif mode == "leave_document":
			return send_file(file_name, as_attachment=False, attachment_filename=file_name, mimetype='application/pdf')
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
		records_updated = 0
		if list(data.columns) != list(sample_data):
			return get_error_response("Wrong Data, Kindly Match the sample data provided in the link")
		if mode == "users_sample":
			inserted_users = {}
			for name, email_id, position, department, mobile, entry_number, ta_instructor, advisor in zip(data.name.values, data.email_id.values, data.position.values, data.department.values, data.mobile.values, data.entry_number.values, data.ta_instructor.values, data.advisor.values):
				if pd.isna(email_id) or pd.isna(position) or pd.isna(department):
					continue
				email_id = email_id.lower()
				columns, values = get_columns_for_user_table(name, email_id.lower(), position.lower(), department.lower(), mobile,entry_number,ta_instructor,advisor)
				if check_user(email_id):
					user = get_user_dic(email_id)
					user_id = user['user_id']
					records_updated+=update_user(columns,values,user_id)
				else:
					records_updated+=insert_user(columns,values)
				user_id = get_user_dic(email_id)['user_id']
				leaves_data_util(user_id)
				inserted_users[email_id] = [columns, values]
			for email in inserted_users:
				message = util.insert_user_message(inserted_users[email][0], inserted_users[email][1])
				util.send_email(email, message, "Account Updated")
		elif mode == "leaves_sample":
			for email_id,nature,duration,is_station,start_date,end_date,status,type_of_leave in zip(data.email_id.values, data.nature.values,data.duration.values, data.is_station.values, data.start_date.values, data.end_date.values, data.status.values,data.type_of_leave.values):
				if pd.isna(email_id)or pd.isna(duration) or pd.isna(nature) or pd.isna(is_station) or pd.isna(start_date) or pd.isna(end_date) or pd.isna(status) or pd.isna(type_of_leave):
					continue
				if not check_user(email_id):
					continue
				email_id = email_id.lower()
				columns,values = get_columns_for_leaves_table(email_id,nature,duration,is_station,start_date,end_date,status,type_of_leave)
				insert_leave_application(columns,values)
		elif mode == "leaves_balance":
			for email_id,total_casual_leaves,taken_casual_leaves,total_non_casual_leave,taken_non_casual_leave,total_restricted_leaves,taken_restricted_leaves,total_scl_leaves,taken_scl_leaves,total_pg_leaves,taken_pg_leaves,year in zip(data.email_id.values, data.total_casual_leaves.values,data.taken_casual_leaves.values, data.total_non_casual_leave.values, data.taken_non_casual_leave.values,data.total_restricted_leaves,data.taken_restricted_leaves,data.total_scl_leaves,data.taken_scl_leaves,data.total_pg_leaves.values,data.taken_pg_leaves.values,data.year.values):
				if pd.isna(email_id) or pd.isna(year):
					continue
				email_id = email_id.lower()
				user = get_user_dic(email_id)
				user_id = user['user_id']
				columns = []
				values = []
				if not pd.isna(total_casual_leaves):
					columns.append('total_casual_leaves')
					values.append(total_casual_leaves)
				if not pd.isna(taken_casual_leaves):
					columns.append('taken_casual_leaves')
					values.append(taken_casual_leaves)
				if not pd.isna(total_restricted_leaves):
					columns.append('total_restricted_leaves')
					values.append(total_restricted_leaves)
				if not pd.isna(taken_restricted_leaves):
					columns.append('taken_restricted_leaves')
					values.append(taken_restricted_leaves)
				if not pd.isna(total_scl_leaves):
					columns.append('total_scl_leaves')
					values.append(total_scl_leaves)
				if not pd.isna(taken_scl_leaves):
					columns.append('taken_scl_leaves')
					values.append(taken_scl_leaves)
				if not pd.isna(total_non_casual_leave):
					columns.append('total_non_casual_leave')
					values.append(total_non_casual_leave)
				if not pd.isna(taken_non_casual_leave):
					columns.append('taken_non_casual_leave')
					values.append(taken_non_casual_leave)
				if not pd.isna(total_pg_leaves):
					columns.append('total_pg_leaves')
					values.append(total_pg_leaves)
				if not pd.isna(taken_pg_leaves):
					columns.append('taken_pg_leaves')
					values.append(taken_pg_leaves)
				records_updated+=update_leave_balance(columns,values,user_id, year)

		return get_success_response(f"{records_updated} updated")
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
		email = request.json['email'].lower()
		if (not check_user(email)):
			return get_error_response("User not Allowed")
		OTP = random.randint(10**5,10**6-1)
		session['otp'] = OTP
		message = util.otp_message(OTP)
		util.send_email(email, message, "OTP Verification")
		return get_success_response(f"OTP has been sent to {email}")
	except Exception as E:
		return get_success_response(E)


@app.route('/validate_otp' , methods = ['POST'])
@cross_origin(supports_credentials=True)
def validate_otp():
	try:
		otp = request.json['otp']
		email = request.json['email'].lower()
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
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		email = session['user_info']['email'].lower()
		session['user_info'].update(get_user_dic(email=email))
		session['user_info'].update(get_user_signature(email=email))
		return get_success_response(session.get('user_info'))
	except Exception as E:
		return get_error_response(E)

@app.route('/edit_user_info' , methods = ['POST'])
@cross_origin(supports_credentials=True)
def edit_user_info():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		name = request.json['name']
		mobile = request.json['mobile']
		signature = request.json.get('signature')
		entry_number = request.json.get('entry_number')
		ta_instructor = request.json.get('ta_instructor')
		advisor = request.json.get('advisor')
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		email = session['user_info']['email'].lower()
		if not signature:
			query = 'UPDATE users set name = %s, mobile = %s,entry_number = %s,ta_instructor = %s,advisor = %s  WHERE email_id = %s'
			cursor.execute(query,(name, mobile, entry_number, ta_instructor, advisor, email))
		else:
			signature = bytes(signature.values())
			query = 'UPDATE users set name = %s, mobile = %s,signature=%s,entry_number = %s,ta_instructor = %s,advisor = %s WHERE email_id = %s'
			cursor.execute(query,(name, mobile, signature, entry_number, ta_instructor, advisor, email))
		connect.commit()
		return get_success_response("Profile Edit successful")
	except Exception as E:
		return get_error_response(E)


@app.route('/apply_leave', methods=['POST'])
@cross_origin(supports_credentials=True)
def apply_leave():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		data = json.loads(request.form.get('data'))
		signature = data['signature']
		try:
			document = request.files['file']
		except:
			document = None
		if 'pg' not in session['user_info']['position']:
			ret = insert_leave(data, signature,document)
		else:
			ret = insert_pg_leave(data, signature,document)
		if ret[0] == True:
			return get_success_response(f"Leave Applied Successfully ID: {ret[1]}")
		else:
			return get_error_response(f"Leave Application Unsuccessful {ret}")
	except Exception as E:
		return get_error_response(f"Leave Application Unsuccessful {E}")

import base64

@app.route('/past_applications', methods=['POST'])
@cross_origin(supports_credentials=True)
def past_applications():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		email = session['user_info']['email'].lower()
		user_id = session['user_info']['user_id']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		if 'pg' in session['user_info']['position']:
			cursor.execute("SELECT * FROM pg_leaves WHERE user_id = %s", (user_id, ))
			data = cursor.fetchall()
			columns = get_columns_of_table('pg_leaves')
		else:
			cursor.execute("SELECT * FROM leaves WHERE user_id = %s", (user_id, ))
			data = cursor.fetchall()
			columns = get_columns_of_table('leaves')
		payload = []
		applicant_data = get_user_dic_by_user_id(user_id)
		for i in data:
			content = {}
			for col, val in zip(columns, i):
				if col in ['file_data', 'signature'] or "_sig" in col:
					continue
				content[col] = val
			content['name'] = applicant_data.get('name')
			content['email'] = applicant_data.get('email')
			content['mobile'] = applicant_data.get('mobile')
			content['position'] = applicant_data.get('position')
			content['entry_number'] = applicant_data.get('entry_number')

			payload.append(content)
		connect.close()
		sorted_leaves = sorted(payload, key=lambda k: k['leave_id'], reverse=True)
		pending_leaves = []
		other_leaves = []
		for leave in sorted_leaves:
			if leave['status'] == 'Pending':
				pending_leaves.append(leave)
			else:
				other_leaves.append(leave)
# 		Combine the two lists, with pending leaves at the beginning
		payload = pending_leaves + other_leaves
		return get_success_response(payload)
	except Exception as E:
		exc_type, exc_obj, exc_tb = sys.exc_info()
		fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
		return get_error_response(f"{E} {exc_tb.tb_lineno}")


@app.route('/get_leave_info_by_id', methods=['POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def get_leave_info_by_id():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		leave_id = request.json['leave_id']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute('SELECT * FROM leaves WHERE leave_id = %s', (leave_id,))
		leaves = cursor.fetchall()
		columns = get_columns_of_table('leaves')
		if len(leaves) == 0:
			cursor.execute('SELECT * FROM pg_leaves WHERE leave_id = %s', (leave_id,))
			leaves = cursor.fetchall()
			columns = get_columns_of_table('pg_leaves')

		payload = []
		for i in leaves:
			content = {}
			for col, val in zip(columns, i):
				if col in ['file_data', 'signature'] or "_sig" in col:
					val = base64.b64encode(val).decode('utf-8') if val else None,
				content[col] = val
			applicant = get_user_dic_by_user_id(content['user_id'])
			content['name'] = applicant['name']
			content['email'] = applicant['email']
			content['mobile'] = applicant['mobile']
			content['position'] = applicant['position']
			content['entry_number'] = applicant.get('entry_number')
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
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
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
			leaves = cursor.fetchall()
		elif position == 'dean':
			cursor.execute('SELECT * FROM leaves WHERE\
				level = %s or nature = %s', ("hod", "Non Casual Leave"))
			leaves = cursor.fetchall()
		elif position == 'office':
			cursor.execute("SELECT * FROM leaves where department=%s", (department,))
			leaves = cursor.fetchall()
		else:
			leaves = []

		payload = []
		columns = get_columns_of_table('leaves')
		for i in leaves:
			content = {}
			for col, val in zip(columns, i):
				if col in ['file_data', 'signature'] or "_sig" in col:
					continue
				# 	val = base64.b64encode(val).decode('utf-8') if val else None,
				content[col] = val
			cursor.execute('SELECT email_id FROM users WHERE user_id = %s', (i[2], ))
			data = cursor.fetchall()
			email = data[0][0]
			cur_user = get_user_dic(email)
			content['email'] = cur_user['email']
			content['name'] = cur_user['name']
			content['position'] = cur_user['position']
			content['entry_number'] = cur_user['entry_number']
			payload.append(content)

		# now process pg leaves
		if not position == 'office':
			cursor.execute('SELECT * FROM pg_leaves WHERE advisor = %s or ta_instructor = %s', (session['user_info']['email'], session['user_info']['email']))
		else:
			cursor.execute('SELECT * FROM pg_leaves WHERE department =%s', (department, ))
		leaves = cursor.fetchall()
		columns = get_columns_of_table('pg_leaves')
		for i in leaves:
			content = {}
			for col, val in zip(columns, i):
				if col in ['file_data', 'signature'] or "_sig" in col:
					# print(col, "continue")
					continue
				content[col] = val
			cursor.execute('SELECT email_id FROM users WHERE user_id = %s', (i[2], ))
			data = cursor.fetchall()
			email = data[0][0]
			cur_user = get_user_dic(email)
			content['email'] = cur_user['email']
			content['name'] = cur_user['name']
			content['position'] = cur_user['position']
			content['entry_number'] = cur_user['entry_number']
			payload.append(content)

		sorted_leaves = sorted(payload, key=lambda k: k['leave_id'], reverse=True)
		pending_leaves = []
		other_leaves = []
		for leave in sorted_leaves:
			if leave['status'] == 'Pending':
				pending_leaves.append(leave)
			else:
				other_leaves.append(leave)
# 		Combine the two lists, with pending leaves at the beginning
		payload = pending_leaves + other_leaves
		return get_success_response(payload)
	except Exception as E:
		exc_type, exc_obj, exc_tb = sys.exc_info()
		fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
		return get_error_response(f"{E} {exc_tb.tb_lineno}")

@app.route('/fetch_remaining_leaves', methods=['GET'])
@cross_origin(supports_credentials=True)
def fetch_remaining_leaves():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
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
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
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

@app.route('/approve_withdraw_leave', methods=['POST'])
@cross_origin(supports_credentials=True)
def approve_withdraw_leave():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		leave_id = request.json['leave_id']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		if leave_id.startswith("LMP"):
			cursor.execute("SELECT nature, status, user_id, duration, type_of_leave from leaves WHERE leave_id = %s", (leave_id, ))
			results = cursor.fetchall()[0]
			curr_nature_of_leave = results[0]
			curr_type_of_leave = results[4]
			curr_user_id = results[2]
			curr_leave_duration = results[3]
			cursor.execute("UPDATE leaves SET status = 'Withdrawn', withdraw_reason=NULL WHERE leave_id = %s", (leave_id,))
			if curr_nature_of_leave.lower().startswith("casual"):
				u_st2 = util.leaves_data_map[curr_type_of_leave]
				query = "Update leaves_data set %s = %s-%s where user_id = %s" % (u_st2,u_st2,curr_leave_duration, curr_user_id)
				cursor.execute(query)
			else:
				u_st2 = util.leaves_data_map["non_casual_leave"]
				query = "Update leaves_data set %s = %s-%s where user_id = %s" % (u_st2,u_st2,curr_leave_duration, curr_user_id)
				cursor.execute(query)
			connect.commit()
			connect.close()
			return get_success_response(f"Withdraw Request for Leave with ID: {leave_id} is approved")
		else:
			cursor.execute("SELECT nature, status, user_id, duration from pg_leaves WHERE leave_id = %s", (leave_id, ))
			results = cursor.fetchall()[0]
			curr_nature_of_leave = results[0]
			curr_user_id = results[2]
			curr_leave_duration = results[3]
			cursor.execute("UPDATE pg_leaves SET status = 'Withdrawn', withdraw_reason=NULL WHERE leave_id = %s", (leave_id,))
			u_st2 = util.leaves_data_map["PG"]
			query = "Update leaves_data set %s = %s-%s where user_id = %s" % (u_st2,u_st2,curr_leave_duration, curr_user_id)
			cursor.execute(query)
			connect.commit()
			connect.close()
			return get_success_response(f"Withdraw Request for Leave with ID: {leave_id} is approved")
	except Exception as E:
		return get_error_response(E)

@app.route('/disapprove_withdraw_leave', methods=['POST'])
@cross_origin(supports_credentials=True)
def disapprove_withdraw_leave():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		leave_id = request.json['leave_id']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		if leave_id.startswith("LMP"):
			cursor.execute("UPDATE leaves SET withdraw_reason='' WHERE leave_id = %s", (leave_id,))
		else:
			cursor.execute("UPDATE pg_leaves SET withdraw_reason='' WHERE leave_id = %s", (leave_id,))
		connect.commit()
		return get_success_response(f"Withdraw Request for Leave with ID: {leave_id} is disapproved")
	except Exception as E:
		return get_error_response(E)

def approve_casual_leave(cursor, leave_id,user, applicant, signature_binary, nature, type_of_leave, duration):
	if user["position"] == "hod":
		by = f'Approved By Hod-{user["name"]}'
		cursor.execute(
			"UPDATE leaves SET status = %s, hod_sig= %s WHERE leave_id = %s", (by,signature_binary, leave_id ))
		cursor.execute("UPDATE users SET signature = %s WHERE user_id = %s", (signature_binary, user["user_id"] ))
	elif user["position"] == "dean":
		by = f'Approved By Dean-{user["name"]}'
		cursor.execute(
			"UPDATE leaves SET status = %s, dean_sig= %s WHERE leave_id = %s", (by,signature_binary, leave_id ))
		cursor.execute("UPDATE users SET signature = %s WHERE user_id = %s", (signature_binary, user["user_id"] ))
	u_st2 = util.leaves_data_map[type_of_leave]
	query = "Select %s from leaves_data where user_id = %s" % (u_st2, applicant['user_id'])
	cursor.execute(query)
	data = cursor.fetchall()[0]
	taken_cnt = float(data[0]) + duration
	query = "Update leaves_data set %s = %s where user_id = %s" % (
			u_st2, taken_cnt, applicant['user_id'])
	cursor.execute(query)
	return by

def approve_non_casual_leave(cursor, leave_id,user, applicant, signature_binary, nature, type_of_leave, duration, curr_status):
	if user["position"] == "hod":
		by = f'Approved By Hod-{user["name"]}'
		new_status = ""
		if curr_status == 'Pending':
			new_status = by
		else:
			new_status = f"{curr_status}|{by}"
		cursor.execute(
			"UPDATE leaves SET status = %s, hod_sig= %s WHERE leave_id = %s", (new_status,signature_binary, leave_id ))
		cursor.execute("UPDATE users SET signature = %s WHERE user_id = %s", (signature_binary, user["user_id"] ))
	elif user["position"] == "dean":
		by = f'Approved By Dean-{user["name"]}'
		new_status = ""
		if curr_status == 'Pending':
			new_status = by
		else:
			new_status = f"{curr_status}|{by}"
		cursor.execute(
			"UPDATE leaves SET status = %s, dean_sig= %s WHERE leave_id = %s", (new_status,signature_binary, leave_id ))
		cursor.execute("UPDATE users SET signature = %s WHERE user_id = %s", (signature_binary, user["user_id"] ))
	new_status = new_status.lower()
	reduce_leaves = False
	if 'approved by dean' in new_status and 'approved by hod' in new_status and applicant['position'] == 'faculty':
		reduce_leaves = True
	elif 'approved by dean' in new_status and applicant['position'] == 'hod':
		reduce_leaves = True
	if not reduce_leaves:
		return by
	u_st2 = util.leaves_data_map[nature]
	query = "Select %s from leaves_data where user_id = %s" % (u_st2, applicant['user_id'])
	cursor.execute(query)
	data = cursor.fetchall()[0]
	taken_cnt = float(data[0]) + duration
	query = "Update leaves_data set %s = %s where user_id = %s" % (
			u_st2, taken_cnt, applicant['user_id'])
	cursor.execute(query)
	return by

def approve_pg_leave(cursor,temp, leave_id,user, applicant, signature_binary, nature, duration,int_status,should_approve):
	by = f'Approved By {temp}'
	print(int_status)
	if int_status:
		int_status += f"|{by}"
	else:
		int_status = by
	print("test", int_status)
	if temp == 'TA Ins':
		cursor.execute(
		"UPDATE pg_leaves SET int_status = %s, ta_sig= %s WHERE leave_id = %s", (int_status,signature_binary, leave_id ))
		cursor.execute("UPDATE users SET signature = %s WHERE user_id = %s", (signature_binary, user["user_id"] ))
	elif temp == 'Advisor':
		cursor.execute(
		"UPDATE pg_leaves SET int_status = %s, advisor_sig= %s WHERE leave_id = %s", (int_status,signature_binary, leave_id ))
	if int_status.count("Approved") == 2:
		should_approve = True
	cursor.execute("UPDATE users SET signature = %s WHERE user_id = %s", (signature_binary, user["user_id"] ))
	u_st2 = util.leaves_data_map["PG"]
	query = "Select %s from leaves_data where user_id = %s" % (u_st2, applicant['user_id'])
	cursor.execute(query)
	data = cursor.fetchall()[0]
	taken_cnt = float(data[0]) + duration
	if should_approve:
		cursor.execute(
		"UPDATE pg_leaves SET status = %s WHERE leave_id = %s", ("Approved", leave_id ))
		query = "Update leaves_data set %s = %s where user_id = %s" % (
			u_st2, taken_cnt, applicant['user_id'])
		cursor.execute(query)
	return int_status

@app.route('/approve_leave', methods=['POST'])
@cross_origin(supports_credentials=True)
def approve_leave():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		leave_id = request.json['leave_id']
		applicant_id = request.json['applicant_id']
		signature = request.json['signature']
		try:
			signature_binary = bytes(signature.values())
		except:
			signature_binary = signature
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		applicant = get_user_dic_by_user_id(applicant_id)
		user_id = applicant_id
		if 'pg' in applicant['position']:
			cursor.execute("Select user_id, nature, duration,status, advisor, ta_instructor,int_status  from pg_leaves where leave_id = %s", (leave_id, ))
			data = cursor.fetchall()[0]
			nature = data[1]
			duration = float(data[2])
			curr_status = data[3]
			advisor = data[4]
			ta_instructor = data[5]
			int_status = data[6]
			nature = nature.lower().split()
			nature = '_'.join(nature)
			temp = ''
			should_approve = False
			if ta_instructor == session['user_info']['email']:
				temp = 'TA Ins'
			elif advisor == session['user_info']['email']:
				temp = 'Advisor'
			if ta_instructor == advisor:
				should_approve = True
			by = approve_pg_leave(cursor,temp, leave_id, session['user_info'],applicant, signature_binary, nature,duration, int_status, should_approve)
			connect.commit()
			cols = ["Leave ID", "Status"]
			vals = [leave_id, by]
			message = util.leave_status_message(cols, vals)
			util.send_email(applicant['email'], message, "Leave Status Updated")
			connect.commit()

		else:
			cursor.execute(
			"Select user_id, nature, duration,type_of_leave,status  from leaves where leave_id = %s", (leave_id, ))
			data = cursor.fetchall()[0]
			nature = data[1]
			duration = float(data[2])
			type_of_leave = data[3]
			curr_status = data[4]
			nature = nature.lower().split()
			nature = '_'.join(nature)
			if (nature == 'casual_leave'):
				by = approve_casual_leave(cursor, leave_id, session['user_info'],applicant, signature_binary, nature, type_of_leave,duration)
			elif (nature == 'non_casual_leave'):
				by = approve_non_casual_leave(cursor, leave_id, session['user_info'],applicant, signature_binary, nature, type_of_leave,duration,curr_status)
			else:
				return get_error_response("Leave Status Not Updated")
			connect.commit()
			cols = ["Leave ID", "Status"]
			vals = [leave_id, by]
			message = util.leave_status_message(cols, vals)
			util.send_email(applicant['email'], message, "Leave Status Updated")
			connect.commit()


		return get_success_response(f"Leave with ID: {leave_id} is approved")
	except Exception as E:
		return get_error_response(E)

@app.route('/submit_office_signature', methods=['POST'])
@cross_origin(supports_credentials=True)
def submit_office_signature():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		leave_id = request.json['leave_id']
		signature = request.json['signature']
		signature_binary = bytes(signature.values())
		user = get_user_dic(session['user_info']['email'])
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute(
				"UPDATE leaves SET office_sig= %s WHERE leave_id = %s", (signature_binary, leave_id ))
		cursor.execute("UPDATE users SET signature = %s WHERE user_id = %s", (signature_binary, user["user_id"]))
		connect.commit()
		return get_success_response(f"Signature added successfully for leave_id {leave_id}")
	except Exception as E:
		return get_error_response(E)

@app.route('/disapprove_leave', methods=['POST'])
@cross_origin(supports_credentials=True)
def disapprove_leave():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		leave_id = request.json['leave_id']
		applicant_id = request.json['applicant_id']
		user = get_user_dic(session['user_info']['email'])
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		if leave_id.startswith("LMP"):
			cursor.execute("SELECT nature, status, user_id, duration, type_of_leave from leaves WHERE leave_id = %s", (leave_id, ))
			results = cursor.fetchall()[0]
			curr_nature_of_leave = results[0]
			curr_status_of_leave = results[1]
			curr_type_of_leave = results[4]
			curr_user_id = results[2]
			curr_leave_duration = results[3]
			applicant = get_user_dic_by_user_id(applicant_id)
			if user["position"] == "hod":
				by = f'Disapproved By Hod-{user["name"]}'
				cursor.execute(
					"UPDATE leaves SET status = %s WHERE leave_id = %s", (by, leave_id ))
				connect.commit()
			elif user["position"] == "dean":
				by = f'Disapproved By Dean-{user["name"]}'
				cursor.execute(
					"UPDATE leaves SET status = %s WHERE leave_id = %s", (by, leave_id ))
				connect.commit()
			else:
				return get_error_response("Leave Status Not Updated")
			cols = ["Leave ID", "Status"]
			vals = [leave_id, by]
			message = util.leave_status_message(cols, vals)
			util.send_email(applicant['email'], message, "Leave Status Updated")

			if curr_nature_of_leave.lower().startswith("casual") and curr_status_of_leave.lower().startswith("approved"):
				u_st2 = util.leaves_data_map[curr_type_of_leave]
				query = "Update leaves_data set %s = %s-%s where user_id = %s" % (u_st2,u_st2,curr_leave_duration, curr_user_id)
				cursor.execute(query)
				connect.commit()
			if curr_nature_of_leave.lower().startswith("non casual") and curr_status_of_leave.lower().count("approved") == 2:
				u_st2 = util.leaves_data_map["non_casual_leave"]
				query = "Update leaves_data set %s = %s-%s where user_id = %s" % (u_st2,u_st2,curr_leave_duration, curr_user_id)
				cursor.execute(query)
				connect.commit()
			connect.close()
			return get_success_response(f"Leave with ID: {leave_id} is disapproved")
		else:
			cursor.execute("SELECT nature, status, user_id, duration, int_status from pg_leaves WHERE leave_id = %s", (leave_id, ))
			results = cursor.fetchall()[0]
			curr_nature_of_leave = results[0]
			curr_status_of_leave = results[1]
			curr_user_id = results[2]
			curr_leave_duration = results[3]
			curr_int_status = results[4]
			applicant = get_user_dic_by_user_id(applicant_id)
			by = f'Disapproved By {user["name"]}'
			if curr_int_status:
				curr_int_status += f"|{by}"
			else:
				curr_int_status = by
			cursor.execute(
					"UPDATE pg_leaves SET status = %s, int_status=%s WHERE leave_id = %s", (by,curr_int_status, leave_id ))
			cols = ["Leave ID", "Status"]
			vals = [leave_id, by]
			message = util.leave_status_message(cols, vals)
			util.send_email(applicant['email'], message, "Leave Status Updated")
			if curr_status_of_leave.lower().startswith("approved"):
				u_st2 = util.leaves_data_map["PG"]
				query = "Update leaves_data set %s = %s-%s where user_id = %s" % (u_st2,u_st2,curr_leave_duration, curr_user_id)
				cursor.execute(query)
			connect.commit()
			connect.close()
			return get_success_response(f"Leave with ID: {leave_id} is disapproved")

	except Exception as E:
		exc_type, exc_obj, exc_tb = sys.exc_info()
		fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
		return get_error_response(f"{E} {exc_tb.tb_lineno}")

@app.route('/add_comment', methods=['POST'])
def add_comment():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		leave_id = request.json['leave_id']
		applicant_id = request.json['applicant_id']
		comment = request.json['comment']
		applicant = get_user_dic_by_user_id(applicant_id)
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute(
			"UPDATE leaves SET authority_comment = %s WHERE leave_id = %s", (comment, leave_id))
		cols = ["Leave ID", "Comment", "By"]
		vals = [leave_id, comment, f"{session['user_info']['position'].upper()}-{session['user_info']['name']}"]
		message = util.leave_status_message(cols, vals)
		util.send_email(applicant['email'], message, "Leave Comment Added")
		connect.commit()
		connect.close()
		return get_success_response(f"Your comment is added to Leave with ID : {leave_id}")
	except Exception as E:
		return get_error_response(E)

@app.route('/delete_application', methods=['POST'])
def delete_application():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		leave_id = request.json['leave_id']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		if leave_id.startswith("LMP"):
			cursor.execute("SELECT status FROM leaves where leave_id = %s", (leave_id,))
		else:
			cursor.execute("SELECT status FROM pg_leaves where leave_id = %s", (leave_id,))
		results = cursor.fetchall()
		status = results[0][0]
		if ("Approved" in status):
			reason = request.json['reason']
			if leave_id.startswith("LMP"):
				cursor.execute("UPDATE leaves set withdraw_reason=%s where leave_id=%s", (reason, leave_id))
			else:
				cursor.execute("UPDATE pg_leaves set withdraw_reason=%s where leave_id=%s", (reason, leave_id))
				cols = ["Leave ID", "Reason"]
				vals = [leave_id, reason]
				message = util.withdraw_leave_message(cols, vals)
				util.send_email(session['user_info']['email'], message, "Leave Submitted for Withdrawl")
			connect.commit()
			return get_success_response(f"Leave with id : {leave_id} has been submitted for withdrawl")
		if ("Disapproved" in status):
			return get_error_response("This leave has already been disapproved, can't be deleted")
		if ("Pending" in status):
			if leave_id.startswith("LMP"):
				cursor.execute("DELETE from leaves where leave_id = %s", (leave_id,))
			else:
				cursor.execute("DELETE from pg_leaves where leave_id = %s", (leave_id,))
			connect.commit()
			return get_success_response(f"Leave with id : {leave_id} has been deleted")
	except Exception as E:
		return get_error_response(E)

@app.route('/get_holidays_info', methods=['GET'])
def get_holiday_info():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
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
		return get_error_response(str(E))

@app.route('/add_holiday', methods=['POST'])
def add_holiday():
	try:
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
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
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
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
		if (not session.get('user_info') or not check_user(session.get('user_info')['email'])):
			return get_error_response("Forbidden")
		email = session['user_info']['email']
		department = session['user_info']['department']
		db.reconnect()
		connect = db
		cursor = connect.cursor()
		cursor.execute('SELECT * FROM users WHERE department = %s', (department,))
		users = cursor.fetchall()
		users_data = []
		for data in users:
			dic = get_user_dic_by_user_id(data[0])
			uid = dic['user_id']
			# get total number of leaves from here
			leaves_dic = leaves_data_util(uid)
			dic.update(leaves_dic)
			# now get the ids of all leaves of that user_id
			if 'pg' in dic['position']:
				cursor.execute('SELECT leave_id, status, nature FROM pg_leaves WHERE user_id = %s', (uid,))
			else:
				cursor.execute('SELECT leave_id, status, nature FROM leaves WHERE user_id = %s', (uid,))
			leave_ids = cursor.fetchall()
			leave_ids = [[e[0],e[1],e[2]] for e in leave_ids]
			dic.update({"leave_ids": leave_ids})
			users_data.append(dic)
			print(users_data)
		return get_success_response(users_data)
	except Exception as E:
		exc_type, exc_obj, exc_tb = sys.exc_info()
		fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
		return get_error_response(f"{E} {exc_tb.tb_lineno}")



if __name__ == '__main__':
	app.secret_key='secret123'
	app.config['SESSION_COOKIE_SECURE'] = True
	app.config['SESSION_COOKIE_SAMESITE'] = 'None'
	app.run(host='0.0.0.0: 3001')