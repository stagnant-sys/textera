import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom"
import { userContext } from "../App";
import { Layout } from "../components/Layout";
import { GroupHeader } from "../components/GroupHeader";
import { MessageInputField } from "../components/MessageInputField";
import { MessageSingle } from "../components/MessageSingle";
import { LoadingPage } from "../components/LoadingPage";
import { ErrorPage } from "./ErrorPage";

export const Group = () => {
  const [messages, setMessages] = useState();
  const [groupInfo, setGroupInfo] = useState();
  const [error, setError] = useState(false);
  const [user, setUser] = useState();
  const [update, setUpdate] = useState(0);
  const userData = useContext(userContext);

  const { id } = useParams();
  const messagesEndRef = useRef(null)

  const fetchGroup = async () => {
    if (!userData) {
      return
    }
    // Get all messages in group and group info
    try {
      const req = await fetch('http://localhost:3000/messages/group/' + id, {
      //const req = await fetch('https://textera-production.up.railway.app/messages/group/' + id, {
        headers: {
          "Authorization": userData.user_metadata.uid,
        }
      });
      const res = await req.json();
      setMessages(res.messages);
      setGroupInfo(res.group);
      res.group.users.forEach((el) => {
        return el._id !== userData.user_metadata.uid ? null : setUser(el);
      })
    } catch {
      setError(true);
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView(/*{ behavior: "smooth", block:"end" }*/)
  }

  const updateComponent = () => {
    setUpdate(update + 1);
  }

  useEffect(() => {
    scrollToBottom();
  })

  useEffect(() => {
    fetchGroup();
  }, [update, userData])

  if (error) {
    return (
      <ErrorPage error={'Group not found'} />
    )
  }

  if (!messages || !groupInfo) {
    return <LoadingPage />
  }

  return (
    <Layout>
      <GroupHeader name={groupInfo.title} image={groupInfo.image} id={groupInfo._id} />
      <div className="content conversation-page">
        <div className='messages-list'>
        {
          messages.map((el) => {
            if (el.author._id === userData.user_metadata.uid) {
              return (
                <MessageSingle key={el.id} group={true} content={el.content} file={el.file} timestamp={el.timestampFormatted} author={'own'} />
              )
            } else {
              return (
                <MessageSingle key={el._id} group={true} content={el.content} file={el.file} timestamp={el.timestampFormatted} author={'other'} username={el.author.username} avatar={el.author.avatar} />
            )
            }
          })
        }
        </div>
        <div className="content-end" ref={messagesEndRef}></div>
      </div>
      <MessageInputField groupID={id} conversationID={undefined} onSend={updateComponent} />
    </Layout>
  )
}