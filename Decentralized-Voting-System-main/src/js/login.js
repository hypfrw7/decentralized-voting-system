const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('voter-id').value;
  const password = document.getElementById('password').value;
  const token = voter_id;

  const headers = {
    'method': "GET",
    'Authorization': `Bearer ${token}`,
  };

  fetch(`http://127.0.0.1:8000/login?voter_id=${voter_id}&password=${password}`, { headers })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Login failed');
    }
  })
  .then(data => {
    if (data.role === 'admin') {
      console.log(data.role)
      localStorage.setItem('jwtTokenAdmin', data.token);
      // Use relative path for admin
      window.location.replace(`admin.html?Authorization=Bearer ${localStorage.getItem('jwtTokenAdmin')}`);
    } else if (data.role === 'user'){
      localStorage.setItem('jwtTokenVoter', data.token);
      // Use relative path for user voting page
      window.location.replace(`index.html?Authorization=Bearer ${localStorage.getItem('jwtTokenVoter')}`);
    }
  })
  .catch(error => {
    console.error('Login failed:', error.message);
  });
});
