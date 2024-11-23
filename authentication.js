import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
        
import { getAuth, GoogleAuthProvider, EmailAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const provider = new GoogleAuthProvider()
const providerEmail = new EmailAuthProvider()

const google = document.getElementById('google');
const signin = document.getElementById('signin');
const register = document.getElementById('register');

$( document ).ready(function() {
    google.addEventListener('click', signinWithGoogle);
    if (signin)
        signin.addEventListener('click', signIn);
    if (register)
        register.addEventListener('click', processRegister);

    checkLoggedIn();
});

const signinWithGoogle = async() => {
    signInWithPopup(auth, provider)
    .then((result) => {
        const user = result.user
        
        saveDataUser(user)
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message
    })
}

onAuthStateChanged(auth, (user) => {
    if(user) {
        saveDataUser(user)
    } else {
        console.log(auth);
    }
})

const checkLoggedIn = () => {
    if ("uid" in localStorage && localStorage.getItem('uid')) {
        document.location.href = '/index.html';
    }
}

const signIn = () => {
    const email = $('#email').val();
    const password = $('#password').val();
  
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;

        saveDataUser(user)
      })
      .catch((error) => {
        let errorMessage = error.message;

        if (error.code == 'auth/internal-error' || error.code == 'auth/invalid-login-credentials') {
            errorMessage = 'Email atau password salah!';
        } else if (error.code == 'auth/invalid-email') {
            errorMessage = 'Email yang dimasukan tidak valid!'
        }

        $('.alert').removeClass('d-none');
        $('#message').html(errorMessage);

        setTimeout(() => {
            $('.alert').addClass('d-none');
            $('#message').html('');
        }, 2000);
      });
}

const processRegister = () => {
    const email = $('#email').val();
    const password = $('#password').val();
  
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Registered and signed in
        const user = userCredential.user;
        saveDataUser(user)
      })
      .catch((error) => {
        let errorMessage = error.message;

        if (error.code == 'auth/internal-error') {
            errorMessage = 'Email atau password salah!';
        } else if (error.code == 'auth/invalid-email') {
            errorMessage = 'Email yang dimasukan tidak valid!'
        }

        $('.alert').removeClass('d-none');
        $('#message').html(errorMessage);

        setTimeout(() => {
            $('.alert').addClass('d-none');
            $('#message').html('');
        }, 2000);
      });
}

const saveDataUser = (user) => {
    localStorage.setItem('refreshToken', user.refreshToken)
    localStorage.setItem('uid', user.uid)
    localStorage.setItem('displayName', user.displayName)
    localStorage.setItem('photoURL', user.photoURL)
    localStorage.setItem('email', user.email)
    localStorage.setItem('phoneNumber', user.phoneNumber)

    setTimeout(() => {
        document.location.reload();
    }, 500);
}