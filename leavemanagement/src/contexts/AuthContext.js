import React, { useContext, useState, useEffect } from "react"
import { auth, firestore, FIREBASE } from "../firebase"
import {
	GoogleAuthProvider,
	signInWithPopup,
	EmailAuthProvider,
	reauthenticateWithCredential,
} from "firebase/auth";
import jwt_decode from "jwt-decode";
import httpClient from "../httpClient";

const AuthContext = React.createContext()

export function useAuth() {
	return useContext(AuthContext)
}

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState();
	const [loading, setLoading] = useState(true);

	async function accessGoogleAccountInfo(access_token) {
		return jwt_decode(access_token);
	}

	async function loginWithOTP(email, otp) {
		if (auth.currentUser != null) {
			await logout();
		} else {
			try {
				await createUser(email, otp);
			} catch {

			}
		}
		const credential = EmailAuthProvider.credential(email, otp);
		return reauthenticateWithCredential(auth.currentUser, credential);
	}

	async function logout() {
		if (currentUser) {
			let res = await httpClient.post(`${process.env.REACT_APP_API_HOST}/logout`);
			return res;
		}
	}

	async function createUser(email, password) {
		return auth.createUserWithEmailAndPassword(email, password);
	}

	async function editProfile(name, mobile) {
		if (currentUser) {
			let res = await httpClient.post(`${process.env.REACT_APP_API_HOST}/edit_user_info`, {
				name: name,
				mobile: String(mobile)
			})
			return res;
		}
	}

	async function send_otp(email) {
		let res = await httpClient.post(`${process.env.REACT_APP_API_HOST}/send_otp`, {
			email: email
		});
		return res;
	}

	async function validate_otp(email, otp) {
		let res = await httpClient.post(`${process.env.REACT_APP_API_HOST}/validate_otp`, {
			otp: otp,
			email: email
		});
		return res;
	}

	async function loginWithGoogle() {
		const googleProvider = new GoogleAuthProvider();
		const res = await auth.signInWithPopup(googleProvider);		
	}
	async function refresh_user() {
		let res = await httpClient.get(`${process.env.REACT_APP_API_HOST}/get_user_info`);		
		setCurrentUser(res.data.data);
	}

	useEffect(() => {
		async function test() {
			let user_data = await httpClient.get(`${process.env.REACT_APP_API_HOST}/get_user_info`);
			setCurrentUser(user_data.data.data);
			setLoading(false);
		}
		test();
	}, [])

	const value = {
		currentUser,
		loginWithOTP,
		logout,
		loginWithGoogle,
		createUser,
		accessGoogleAccountInfo,
		loading,
		send_otp,
		validate_otp,
		refresh_user,
		editProfile
	}

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	)
}