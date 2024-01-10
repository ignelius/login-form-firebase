// login form firebase dengan premium konten || updated : 10 Jan 2024
const firebaseConfig = {
    apiKey: "AIzaSyCVar0TA45QMGl22eR5Bk1vsqjfHZH9-Gk",
    authDomain: "ignelius-login.firebaseapp.com",
    databaseURL: "https://ignelius-login-default-rtdb.firebaseio.com",
    projectId: "ignelius-login",
    storageBucket: "ignelius-login.appspot.com",
    messagingSenderId: "459293232170",
    appId: "1:459293232170:web:45ed5382950919fa6f8753"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
console.log(app);

const loginForm = document.getElementById('login_form');
const exclusiveContent = document.getElementById('exclusive_content');
const logoutButton = document.getElementById('logout');
const alertBox = document.querySelector('.igneliusAlert');
const nonPremiumBox = document.querySelector('.nonPremium');

const exclusiveContentHTML = `
    <p class="box yellow">Mohon maaf, halaman saat ini sedang dalam tahap perbaikan. Konten di halaman ini untuk sementara waktu tidak ditampilkan. Kami akan memberitahu jika halaman sudah siap.</p>
`;

// Tambahkan listener untuk mendeteksi perubahan status otentikasi (sign-in atau sign-out)
onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        igneliusJS.console.log("User signed in and email verified");
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        showExclusiveContent(user.uid);
    } else {
        igneliusJS.console.log("User not signed in or email not verified");
        // Lakukan apa pun yang perlu dilakukan jika tidak dapat login
    }
});

function showNotification(message, className, targetBox) {
    targetBox.textContent = message;
    targetBox.className = `igneliusAlert ${className}`;
    targetBox.style.display = 'block';

    setTimeout(() => {
        targetBox.style.display = 'none';
    }, 5000);
}

function checkPremiumAccess(userId) {
    const database = getDatabase(app);
    const usersRef = ref(database, 'users/' + userId);

    return get(usersRef).then((snapshot) => {
        const userData = snapshot.val();
        return userData ? userData.premiumAcc || false : false;
    });
}

function showExclusiveContent(userId) {
    checkPremiumAccess(userId).then((isPremium) => {
        if (isPremium) {
            loginForm.style.display = 'none';
            exclusiveContent.style.display = 'block';
            logoutButton.style.display = 'block';
            exclusiveContent.innerHTML = exclusiveContentHTML;
        } else {
            showNonPremiumNotification();
        }
    });
}

function showNonPremiumNotification() {
    loginForm.style.display = 'none';
    nonPremiumBox.style.display = 'block';
}

function loginUser() {
    var email = document.getElementById("login_email").value;
    var password = document.getElementById("login_password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            if (user.emailVerified) {
                igneliusJS.console.log(user);
                showNotification(igneliusJS.alert.loginSukses, 'success', alertBox);
                // localStorage.setItem('loggedInUser', JSON.stringify(user)); // Tidak perlu disini
            } else {
                showNotification(igneliusJS.alert.emailNotVerified, 'error', alertBox);
            }
        })
        .catch((error) => {
            let errorMessage = error.message;

            if (error.code === 'auth/invalid-email') {
                errorMessage = igneliusJS.alert.invalidMail || "Email tidak valid.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Password salah. Mohon periksa kembali password Anda.";
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = "Pengguna tidak ditemukan. Silakan daftar terlebih dahulu.";
            } else if (error.code === 'auth/internal-error') {
                if (errorMessage && errorMessage.includes('password is required')) {
                    errorMessage = igneliusJS.alert.invalidPW || "Mohon masukkan password Anda.";
                } else {
                    errorMessage = igneliusJS.alert.errorPw || "Terjadi kesalahan internal.";
                }
            } else {
                errorMessage = igneliusJS.alert.generalLoginError || "Terjadi kesalahan saat login.";
            }

            igneliusJS.console.error(errorMessage);
            showNotification(errorMessage, 'error', alertBox);
        });
}

function logoutUser() {
    signOut(auth)
        .then(() => {
            igneliusJS.console.log('Sign-out successful.');
            showNotification(igneliusJS.alert.signOutSuccess, 'success', alertBox);
            localStorage.removeItem('loggedInUser');
            loginForm.style.display = 'block';
            exclusiveContent.style.display = 'none';
            nonPremiumBox.style.display = 'none'; // Tambahkan ini untuk elemen nonPremium
            logoutButton.style.display = 'none';
        })
        .catch(() => {
            igneliusJS.console.error('An error happened.');
            showNotification(igneliusJS.alert.signOutError, 'error', alertBox);
        });
}

document.getElementById("login").addEventListener("click", loginUser);
document.getElementById("logout").addEventListener("click", logoutUser);
