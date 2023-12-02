import { useState, useEffect, useContext } from "react";
import { userContext } from "../App";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import { AvatarBig } from "../components/AvatarBig";
import { AvatarSmall } from "../components/AvatarSmall";
import { AvatarVerySmall } from "../components/AvatarVerySmall";
import { MediaThumbnail } from "../components/MediaThumbnail";
import { Layout } from "../components/Layout";
import { LoadingPage } from "../components/LoadingPage";
import { ErrorPage } from "./ErrorPage";


export const GroupInfo = () => {
  const [group, setGroup] = useState();
  const [media, setMedia] = useState();
  const [error, setError] = useState(false);
  const userData = useContext(userContext);
  const { id } = useParams();

  const fetchGroup = async () => {
    try {
      const req = await fetch('http://localhost:3000/group/' + id, {
      //const req = await fetch('https://textera-production.up.railway.app/group/' + id, {
        headers: {
          "Authorization": userData.user_metadata.uid,
        }
      });
      const res = await req.json()
      setGroup(res);
      // Fetch media
      const mediaReq = await fetch('http://localhost:3000/messages/group/' + id + '/media', {
      //const mediaReq = await fetch('https://textera-production.up.railway.app/messages/group/' + id + '/media', {
        headers: {
          "Authorization": userData.user_metadata.uid,
        }
      });
      const mediaRes = await mediaReq.json();
      setMedia(mediaRes);
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    fetchGroup();
  }, [])

  if (error) {
    return (
      <ErrorPage error={"Group not found"} />
    )
  }

  if (!group || !media) {
    return <LoadingPage />
  }

  const EditGroupButton = () => {
    if (!group.admin.username || !userData) {
      return null
    } else if (group.admin.username === userData.user_metadata.username) {
      return (
        <Link to={`/group/${group.id}/edit`}>
          <button className="edit-group_button">
            Edit group 
          </button>
        </Link>
      )
    }
  }

  const MediaList = () => {
    if (media.length === 0) {
      return (
        <div>
          No media
        </div>
      )
    }

    return (
      <div className="group_media-list">
        {
          media.map((el) => {
            return (
              <MediaThumbnail imageUrl={el.file} key={el._id} />
            )
          })
        }
      </div>
    )
  }

  return (
      <Layout>
        <div className="content group-info">
          <AvatarBig imageUrl={group.image} />
          <div className="group-name">{group.title}</div>
          <div>
            <Link to={'/user/' + group.admin._id} className="admin">
              <strong>Admin:</strong> <AvatarVerySmall imageUrl={group.admin.avatar} /> {group.admin.username}
            </Link>
          </div>
          <EditGroupButton />
          <div className="group_users-list">
            <div className="group-info_section">{group.users.length} members</div>
            <div>
              {
                group.users.map((el) => {
                  return (
                    <Link to={`/user/${el._id}`} key={el._id} className="group_user">
                      <AvatarSmall imageUrl={el.avatar} />
                      <div>
                        {el.username}
                      </div>
                    </Link>
                  )
                })
              }
            </div>
          </div>
          <div className="group_media-section">
            <div className="group-info_section">Media</div>
            <MediaList />
          </div>
        </div>
      </Layout>
  )
}