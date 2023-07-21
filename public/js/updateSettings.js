/*eslint-disable*/
const userFormData = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.formPassword');
console.log('Hello');
console.log(userPasswordForm);

const updateData = async (name, email) => {
  try {
    alert('enter updateData axios');
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:8000/api/v1/users/updateMe',
      data: {
        name,
        email
      }
    });
    console.log(name, email);
    if (res.data.status === 'success') {
      alert('Success', 'Data Updated Successfully!');
    }
  } catch (error) {
    alert('Error', err.response.data.message);
  }
};

const updatePassword = async (currentPassword, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:8000/api/v1/users/updatePassword',
      data: {
        currentPassword,
        password,
        passwordConfirm
      }
    });

    if (res.data.status === 'success') {
      alert('Success', 'Password Updated Successfully!');
    }
  } catch (error) {
    alert('Error', err.response.data.message);
  }
};

if (userFormData) {
  userFormData.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateData(name, email);
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    console.log('hey from userpasswordform');
    document.querySelector('.btn-on-save').textContent = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updatePassword(currentPassword, password, passwordConfirm); //we used await here because we need to erase our password below in meantime
    document.querySelector('.btn-on-save').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
