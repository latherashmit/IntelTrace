// //COPILOT MODIFICATION
// import React, { useState } from 'react';
// import axios from 'axios';

// const Login = ({ onLogin }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const res = await axios.post('http://localhost:5000/login', { username, password });
//       if (res.data.token) {
//         localStorage.setItem('jwt', res.data.token);
//         onLogin();
//       } else {
//         setError('Login failed.');
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || 'Login failed.');
//     }
//   };

//   return (
//     <div style={{ maxWidth: 300, margin: 'auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', marginBottom: 10 }} />
//         <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: 10 }} />
//         <button type="submit" style={{ width: '100%' }}>Login</button>
//       </form>
//       {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
//     </div>
//   );
// };

// export default Login;
