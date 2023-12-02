import { useState, useEffect, useContext } from "react"
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../App";
import { userContext } from "../App";

import { Layout } from "../components/Layout"
import { AvatarBig } from "../components/AvatarBig";
import { ErrorPage } from "./ErrorPage";
import { LoadingPage } from "../components/LoadingPage";

import imageIcon from '../assets/icons/image_upload.png'
import statusIcon from '../assets/icons/status.png'
import logoutIcon from '../assets/icons/logout.png'


export const SettingsPage = () => {
  const [user, setUser] = useState();
  const [networkError, setNetworkError] = useState(false);

  const userData = useContext(userContext);
  const navigateTo = useNavigate();

  const logout = async () => {
    if (window.confirm('Do you really want to log out ?')) {
      localStorage.clear();
      await supabase.auth.signOut();
      navigateTo('/');
      location.reload();
    } else {
      return;
    }
  }

  const fetchUserData = async () => {
    if (!userData) {
      return
    }
    try {
      const req = await fetch('http://localhost:3000/user/' + userData.user_metadata.uid);
      //const req = await fetch('https://textera-production.up.railway.app/user/' + userData.user_metadata.uid);
      const res = await req.json()
      setUser(res);  
    } catch {
      setNetworkError(true);
    }
  }

  useEffect (() => {
    fetchUserData();
  }, [userData])

  if (networkError) {
    return (
      <ErrorPage error={"Network error"} />
    )
  }

  if (!user || !userData) {
    return <LoadingPage />
  }

  return (  
      <Layout>
        <div className="content settings-page">
          <div className="user-info">
            <AvatarBig imageUrl={user.avatar} />
            <div className="user_name">{user.username}</div>
            <div className="user_status">{user.status}</div>
          </div>
          <div className="actions">
            <Link to='/settings/edit/avatar' state={{user: user}}>
              <button>
                <img src={imageIcon} alt="" />Change avatar
              </button>
            </Link>
            <Link to='/settings/edit/status' state={{user: user}}>
              <button>
                <img src={statusIcon} alt="" />Change status
              </button>
            </Link>
            <button className="logout-button" onClick={logout}>
              <img src={logoutIcon} alt="" />
              Log out
            </button>
          </div>
        </div>
      </Layout>
    
  )
}