import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Layout } from "../components/Layout";
import imageIcon from '../assets/icons/image_upload.png'


export const SignupPage = () => {
  const [error, setError] = useState();
  const navigateTo = useNavigate();
  
  // Supabase signup
  const signup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const req = await fetch(`http://localhost:3000/user/signup`, {
    //const req = await fetch(`https://textera-production.up.railway.app/user/signup`, {
      method: 'POST',
      body: formData,
    });
    const errors = await req.json();
    if (errors.length > 0) {
      setError(errors);
    } else {
      navigateTo('/login');
    }
  }

  const ErrorContainer = () => {
    if (!error) {
      return null
    } else {
      return (
        <div className="error-container">
          <ul>
            {
              error.map((el, i) => {
                return (
                  <li key={'error' + i}>{el.msg}</li>
                )
              })
            }
          </ul>
        </div>
      )
    }
  }

  return (
      <Layout>
        <div className="content signup-page">
          <h2 className="page-title">Sign up</h2>
          <form id='signup_form' className='form' onSubmit={signup}>
            <div className="input-group">
              <label htmlFor="username">Username: </label>
              <input type='text' id='username' name='username' minLength={5} maxLength={20} />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password: </label>
              <input type='password' id='password' name='password' minLength={5} />
            </div>
            <div className="input-group">
              <label htmlFor='password_confirm'>Confirm password: </label>
              <input type="password" id="password_confirm" name="password_confirm" />
            </div>
            <div>
              <button className="upload-avatar" type="button">
                <label htmlFor="avatar">
                  <img src={imageIcon} alt="" /> Upload an avatar 
                </label>
              </button>
              <input type='file' id='avatar' name='avatar' accept="image/*" style={{display: 'none'}} />
            </div>
            <button type='submit' className="button_primary"><b>Sign up</b></button>
          </form>
          <ErrorContainer />
        </div>
      </Layout>
  )
}