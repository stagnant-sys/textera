import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../App";
import { Layout } from "../components/Layout"


export const AddContactPage = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [success, setSuccess] = useState(false)
  const userData = useContext(userContext);
  const navigateTo = useNavigate();

  const addContact = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    if (data.username === '') {
      return;
    }
    const contactReq = await fetch('http://localhost:3000/user/username/' + data.username);
    //const contactReq = await fetch('https://textera-production.up.railway.app/user/username/' + data.username);
    const contactRes = await contactReq.json();
    if (contactRes.length === 0) {
      const err = 'User not found';
      setErrorMessage(err);
    } else {
      const req = await fetch('http://localhost:3000/user/' + userData.user_metadata.uid + '/add/' + contactRes[0]._id, {
      //const req = await fetch('https://textera-production.up.railway.app/user/' + userData.user_metadata.uid + '/add/' + contactRes[0]._id, {
        method: 'POST',
      })
      if(req.status !== 200) {
        const err = await req.json();
        setErrorMessage(err);
        e.target.reset();
      } else {
        setErrorMessage(null);
        setSuccess(true);
        setTimeout(() => {
          navigateTo('/contacts');
        }, "1500")
      }
    }
  }

  const SuccessNotification = () => {
    if (!success) {
      return null
    }

    return (
      <div className="positive-notification">
        User added to your contacts!
      </div>
    )
  }

  const ErrorContainer = () => {
    if (!errorMessage) {
      return null
    }

    return (
      <div className="error-container">
        {errorMessage}
      </div>
    )
  }

  return (
    <Layout>
      <div className="content add-contact_page">
        Enter user info to add to your contacts
        <form id="add-contact_form" onSubmit={addContact}>
          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input type='text' id='username' name="username" minLength={1} />
          </div>
          <button type='submit'>Add contact</button>
        </form>
        <ErrorContainer />
        <SuccessNotification />

      </div>
    </Layout>
  )
}