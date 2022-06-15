import { useState } from 'react';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../firebase.config';
import Oauth from '../components/Oauth';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const { name, email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((previousState) => ({
      ...previousState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      updateProfile(auth.currentUser, {
        displayName: name,
      });

      const formDataCopy = { ...formData };

      delete formDataCopy.password;

      formDataCopy.timestamp = serverTimestamp();

      await setDoc(doc(db, 'users', user.uid), formDataCopy);

      navigate('/');
    } catch (error) {
      if (password.length < 5) {
        toast.error('Weak Password');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'>Welcome</p>
        </header>
        <main>
          <form onSubmit={onSubmit}>
            <input
              type='text'
              className='nameInput'
              placeholder='Name'
              id='name'
              value={name}
              onChange={onChange}
            />
            <input
              type='email'
              className='emailInput'
              placeholder='email'
              value={email}
              id='email'
              onChange={onChange}
            />
            <div className='passwordInputDiv'>
              <input
                type={showPassword ? 'text' : 'password'}
                className='passwordInput'
                placeholder='Password'
                id='password'
                value={password}
                onChange={onChange}
              />
              <img
                src={visibilityIcon}
                alt='showPassword'
                className='showPassword'
                onClick={() =>
                  setShowPassword((previousState) => !previousState)
                }
              />
            </div>
            <Link to='/forgot-password' className='forgotPasswordLink'>
              Forgot Password
            </Link>
            <div className='signUpBar'>
              <p className='signUpText'>Sign Up</p>
              <button className='signUpButton'>
                <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
              </button>
            </div>
          </form>
          <Oauth />
          <Link to='/sign-in' className='registerLink'>
            Sign In Instead
          </Link>
        </main>
      </div>
    </>
  );
}
export default SignUp;
