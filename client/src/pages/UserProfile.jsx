import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userContext } from "../App";
import { AvatarBig } from "../components/AvatarBig";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ErrorPage } from "./ErrorPage";
import { MediaThumbnail } from "../components/MediaThumbnail";
import { LoadingPage } from "../components/LoadingPage";

import conversationIcon from '../assets/icons/conversation_white.png'
import conversation_newIcon from '../assets/icons/conversation_new_white.png'
import addIcon from '../assets/icons/add.png'

export const UserProfile = () => {
  const userData = useContext(userContext);
  const [user, setUser] = useState();
  const [conversation, setConversation] = useState([]);
  const [media, setMedia] = useState();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const navigateTo = useNavigate();

  const fetchUsers = async () => {
    if (!userData) {
      return;
    }
    try {
      const userReq = await fetch('http://localhost:3000/user/' + id);
      //const userReq = await fetch('https://textera-production.up.railway.app/user/' + id);
      const userRes = await userReq.json()
      setUser(userRes);
      const convReq = await fetch('http://localhost:3000/conversation/users/' + userData.user_metadata.uid + '/' + id, {
      //const convReq = await fetch('https://textera-production.up.railway.app/conversation/users/' + userData.user_metadata.uid + '/' + id, {
        headers: {
          "Authorization": userData.user_metadata.uid,
        }
      })
      const convRes = await convReq.json();
      setConversation(convRes);
      setLoading(false);
    } catch {
      setError(true)
    }
  }

  const fetchMedia = async () => {
    if (!conversation.length) {
      return
    } else {
      const mediaReq = await fetch('http://localhost:3000/messages/conv/' + conversation[0]._id + '/media', {
      //const mediaReq = await fetch('https://textera-production.up.railway.app/messages/conv/' + conversation[0]._id + '/media', {
        headers: {
          "Authorization": userData.user_metadata.uid,
        }
      });
      const mediaRes = await mediaReq.json();
      setMedia(mediaRes);
    }
  }

  const addToContacts = async () => {
    await fetch('http://localhost:3000/user/' + userData.user_metadata.uid + '/add/' + id, {
    //await fetch('https://textera-production.up.railway.app/user/' + userData.user_metadata.uid + '/add/' + id, {
      method: 'POST',
    });
    navigateTo('/contacts');
  }

  const createConversation = async () => {
    const users = {
      user1: userData.user_metadata.uid,
      user2: user._id,
    };
    const req = await fetch('http://localhost:3000/conversation/create', {
    //const req = await fetch('https://textera-production.up.railway.app/conversation/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(users),
    })
    const res = await req.json();
    navigateTo('/conv/' + res._id);
  }

  useEffect(() => {
    fetchUsers();
  }, [userData])

  useEffect(() => {
    fetchMedia();
  }, [conversation])

  const MediaList = () => {
    if (!media || media.length === 0) {
      return null
    }

    return (
      <div className="group_media-section">
        <div className="group-info_section">Media</div>
          <div className="group_media-list">
            {
              media.map((el) => {
                return (
                  <MediaThumbnail imageUrl={el.file} key={el._id} />
                )
              })
            }
        </div>
      </div>
    )
  }

  const AddContactButton = () => {
    if (user.contacts.includes(userData.user_metadata.uid) || user._id === userData.user_metadata.uid) {
      return null
    } 
    
    return (
      <div className="add-contact_button">
        <button onClick={addToContacts} className="">
         <img src={addIcon} alt ="" />Add to contacts
        </button>
      </div>
    )
  }

  const ConversationPrompt = () => {
    if (loading) {
      return (
        <div className="conversation-button">
          <button>
            Loading...
          </button>
        </div>
      )
    }

    if (user.contacts.includes(userData.user_metadata.uid) && conversation.length === 0) {
      return (
        <div className="conversation-button">
          <button onClick={createConversation}>
            <img src={conversation_newIcon} alt="" /> Start a new conversation
          </button>
        </div>
        
      )
    } else if (user.contacts.includes(userData.user_metadata.uid)) {
      return (
        <>
          <Link to={`/conv/${conversation[0]._id}`} className="conversation-button">
            <button >
              <img src={conversationIcon} alt="" /> Go to conversation
            </button>
          </Link>
          <MediaList/>
        </>
      )
    } 
  }

  if (error) {
    return (
      <Layout>
        <ErrorPage error={"User not found"} />
      </Layout>
    )
  }

  if (!user) {
    return <LoadingPage />
  }

  return (
      <Layout>
        <div className="content user-profile">
          <AvatarBig imageUrl={user.avatar}/>
          <div className="user_name">{user.username}</div>
          <div className="user_status">{user.status}</div>
          <AddContactButton />
          <ConversationPrompt />
        </div>
      </Layout>
  )
}