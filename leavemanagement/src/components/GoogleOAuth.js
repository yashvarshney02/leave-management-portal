import React, { useState, useEffect } from 'react';
import { GoogleAuth } from 'google-auth-library';

const GoogleOAuth = ({}) => {
	function initGoogleSignIn() {
		window.gapi.load('auth2', () => {
			window.gapi.auth2.init({
				client_id: '145347950197-k36hp883k0ic0afktgi06h1v0kokjb7g.apps.googleusercontent.com',
			});
		});
	}

	async function handleGoogleSignIn() {
		const GoogleAuth = window.gapi.auth2.getAuthInstance();
		const GoogleUser = await GoogleAuth.signIn();
		const profile = GoogleUser.getBasicProfile();
		const email = profile.getEmail();
		const imageUrl = profile.getImageUrl();
		// Do something with email and imageUrl
	}

	useEffect(() => {
		initGoogleSignIn();
	}, []);

	const [auth, setAuth] = useState(null);
	return (
		<button onClick={handleGoogleSignIn}>Sign in with Google</button>
	);
};

export default GoogleOAuth;
