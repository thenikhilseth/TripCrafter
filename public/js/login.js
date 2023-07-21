/*eslint-disable*/
const loginForm = document.querySelector('.form');
const logoutButton = document.querySelector('.logOut');

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    // console.log(res);
    // console.log(email, password);
    if (res.data.status === 'success') {
      alert('Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    alert(error.response.data.message);
    console.log(error.response.data);
  }
};

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    // console.log(res);
    if (res.data.status === 'success') {
      alert('Logged out successfully');
      location.assign('/');
    }
  } catch (error) {
    alert('Error, Please try again');
  }
};

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}
