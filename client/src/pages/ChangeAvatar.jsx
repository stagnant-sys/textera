import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { userContext } from "../App"
import { Layout } from "../components/Layout"
import { AvatarBig } from "../components/AvatarBig"
import imageIcon from '../assets/icons/image_upload.png'


export const ChangeAvatarPage = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const userData = useContext(userContext);
  const navigateTo = useNavigate();

  const submitImage = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const formData = new FormData(e.target);
    formData.append('userID', userData.user_metadata.uid);
    const req = await fetch('http://localhost:3000/user/edit/avatar', {
    //const req = await fetch('https://textera-production.up.railway.app/user/edit/avatar', {
      method: 'PATCH',
      headers: {
        "Authorization": userData.user_metadata.uid,
      },
      body: formData
    })
    const res = await req.json();
    if (res.errors.length !== 0) {
      setErrorMessage(res.errors)
    } else {
      localStorage.avatar = res.newAvatar;
      navigateTo('/settings');
    }
  }

  const deleteAvatar = async () => {
    if (window.confirm('Do you really want to delete your avatar?')) {
      const data = { userID: userData.user_metadata.uid };
      await fetch('http://localhost:3000/user/edit/avatar/delete', {
      //await fetch('https://textera-production.up.railway.app/user/edit/avatar/delete', {
        method: 'PATCH',
        headers: {
          "Content-Type": 'application/json',
          "Authorization": userData.user_metadata.uid,
        },
        body: JSON.stringify(data)
      });
      localStorage.avatar = "https://firebasestorage.googleapis.com/v0/b/textera-e04fe.appspot.com/o/system%2Fuser_default.png?alt=media&token=4261b87a-533c-4886-840a-45a4b9b51ff4";
      navigateTo('/settings');  
    }
  }

  const ErrorContainer = () => {
    if (!errorMessage) {
      return null
    } else {
      return (
        <div className="error-container">
          {
            errorMessage.map((el, i) => {
              return (
                <div key={`error-${i}`}>{el}</div>
              )
            })
          }
        </div>
      )
    }
  }

  return (
    <Layout>
      <div className="content change-avatar-page">
        <AvatarBig imageUrl={localStorage.avatar} />
        <form onSubmit={submitImage}>
          <button type="button"><label htmlFor="avatar">
            <img src={imageIcon} alt="" />Change avatar</label></button>
          <input type="file" id="avatar" name="avatar" accept="image/*" style={{display: 'none'}} />
          <button type="submit"><b>Save</b></button> 
        </form>
        <ErrorContainer />
        <button className="delete-avatar_button" onClick={() => deleteAvatar()}>Delete avatar</button>
      </div>
    </Layout>
  )
}