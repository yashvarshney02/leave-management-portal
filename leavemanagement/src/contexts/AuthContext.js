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

	async function editProfile(name, mobile, binarySig, entryNumber, TAInstructor, advisor) {
		if (currentUser) {
			let res = await httpClient.post(`${process.env.REACT_APP_API_HOST}/edit_user_info`, {
				name: name,
				mobile: String(mobile),
				signature: binarySig,
				entry_number: entryNumber,
				ta_instructor: TAInstructor,
				advisor: advisor
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
		console.log(`Firing ${process.env.REACT_APP_API_HOST}/get_user_info`)
		let res = await httpClient.get(`${process.env.REACT_APP_API_HOST}/get_user_info`);
		console.log(res)
		if (res.data.data && res.data.data.signature) {
			const imageUrl = "data:image/png;base64," + String(res.data.data.signature);
			res.data.data.signature = imageUrl
		}
		setCurrentUser(res.data.data);
		return res;
	}

	useEffect(() => {
		async function test() {
			console.log(`Firing ${process.env.REACT_APP_API_HOST}/get_user_info`)
			let user_data = await httpClient.get(`${process.env.REACT_APP_API_HOST}/get_user_info`);		
			if (user_data.data.data && user_data.data.data.signature) {
				const imageUrl = "data:image/png;base64," + String(user_data.data.data.signature);
				user_data.data.data.signature = imageUrl
			}
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