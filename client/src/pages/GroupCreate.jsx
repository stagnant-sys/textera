import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom";
import { userContext } from "../App";
import { Layout } from "../components/Layout"
import { LoadingPage } from "../components/LoadingPage";
import { AvatarSmall } from "../components/AvatarSmall";
import imageIcon from '../assets/icons/image_upload.png'

export const GroupCreatePage = () => {
  const userData = useContext(userContext);
  const [contacts, setContacts] = useState();
  const [usersID, setUsersID] = useState();
  const [usersInfo, setUsersInfo] = useState();

  const navigateTo = useNavigate();

  const fetchContacts = async () => {
    if (!userData) {
      return
    }
    setUsersID([userData.user_metadata.uid]);
    setUsersInfo([{id: userData.user_metadata.uid, username : userData.user_metadata.username, avatar: localStorage.avatar}])
    const req = await fetch('http://localhost:3000/user/' + userData.user_metadata.uid + '/contacts');
    //const req = await fetch('https://textera-production.up.railway.app/user/' + userData.user_metadata.uid + '/contacts');
    const res = await req.json()
    setContacts(res);
  }

  useEffect(() => {
    fetchContacts();
  }, [userData])

  const createGroup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('admin', userData.user_metadata.uid);
    usersID.forEach((el, i) => {
      formData.append('users[]', usersID[i])
      }
    )
    const req = await fetch(`http://localhost:3000/group/create`, {
    //const req = await fetch(`https://textera-production.up.railway.app/group/create`, {
        method: 'POST',
        body: formData,
      });
    const res = await req.json();
    navigateTo('/group/' + res);
  }

  const addUser = () => {
    const option = document.getElementById('usersSelect');
    if (option.value === 'placeholder') {
      return null;
    }
    const userData = {
      id: option.value,
      username: option.options[option.selectedIndex].getAttribute('data-username'),
      avatar: option.options[option.selectedIndex].getAttribute('data-avatar'),
    }
    const tempUsers = usersID.slice();
    setUsersID([...tempUsers, option.value]);
    const tempUsersInfo = usersInfo.slice();
    setUsersInfo([...tempUsersInfo, userData]);
  }

  const removeUser = (n) => {
    const temp = usersID.slice();
    temp.splice(n, 1);
    setUsersID([...temp]);
    const tempUsersInfo = usersInfo.slice();
    tempUsersInfo.splice(n, 1);
    setUsersInfo([...tempUsersInfo]);
  }

  const usersList = (el, i) => {
    if (el.id === userData.user_metadata.uid) {
      return (
        <div key={el.id + '_info'} className="user-info">
          <AvatarSmall imageUrl={usersInfo[i].avatar} />
          {usersInfo[i].username} (You)
        </div>
      )
    } else {
      return (
      <div key={el.id + '_info'} className="user-info">
        <button className="remove-button" onClick={() => removeUser(i)}>✖</button>
        <AvatarSmall imageUrl={usersInfo[i].avatar} />
        {usersInfo[i].username}
      </div>
    )
      }
  }

  if (!contacts) {
    return <LoadingPage />
  }

  return (
    <Layout>
      <div className="content group-create-page">
        <form id="group-create_form" onSubmit={createGroup}>
          <div className="group-info_form">
            <label htmlFor="image" className="image-upload_button">
              <img src={imageIcon} alt='group image' />
            </label>
            <input type='file' id='image' name='image' accept="image/*" style={{display: "none"}} />
            <input type="text" id="title" name="title" minLength={1} maxLength={100} placeholder="Group name" />
          </div>
          
          
          <div className="users-options">
            <label htmlFor="usersSelect">Add users:</label>
            <select name="usersSelect" id="usersSelect">
              <option value='placeholder' style={{color: 'ffffff'}}>select user</option>
              {
                contacts.map((el) => {
                  if (usersID.includes(el._id)) {
                    return null
                  } else {
                    return (
                      <option key={el._id} data-username={el.username} data-avatar={el.avatar} value={el._id}>{el.username}</option>
                    )
                  }
                })
              }
            </select>
            <input type='button' onClick={() => addUser()} value='+' />
          </div>
        </form>

        <div className="users-list">
          <h3>Users:</h3>
          {
            usersInfo.map((el, i) => {
              return (
                usersList(el, i)
              )
            })
          }
        </div>
        <div className="submit-button_container">
          <button type="submit" form='group-create_form'>Create group</button>
        </div>
      </div>
    </Layout>
  )
}