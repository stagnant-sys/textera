import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom"
import { userContext } from "../App";
import { Layout } from "../components/Layout";
import { ConversationHeader } from "../components/ConversationHeader";
import { MessageInputField } from "../components/MessageInputField";
import { MessageSingle } from "../components/MessageSingle";
import { LoadingPage } from "../components/LoadingPage";
import { ErrorPage } from "./ErrorPage";

export const Conversation = () => {
  const [messages, setMessages] = useState();
  const [correspondant, setCorrespondant] = useState();
  const [update, setUpdate] = useState(0);
  const [error, setError] = useState(false);

  const userData = useContext(userContext);
  const { id } = useParams();
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView(/*{ behavior: "smooth", block:"end" }*/)
  }

  const fetchConv = async () => {
    if (!userData) {
      return null
    }
    try {
      const req = await fetch('http://localhost:3000/messages/conv/' + id, {
      //const req = await fetch('https://textera-production.up.railway.app/messages/conv/' + id, {
        headers: {
          "Authorization": userData.user_metadata.uid,
        }
      });
      const res = await req.json();
      res.conv.users.forEach((el) => {
        return el._id === userData.user_metadata.uid ? null : setCorrespondant(el);
      })
      setMessages(res.messages);
    } catch {
      setError(true)
    }
    
  }


  const updateComponent = () => {
    setUpdate(update + 1);
  }

  useEffect(() => {
    fetchConv();
  }, [userData, update])

  useEffect(() => {
    scrollToBottom();
  }, [messages])

  if (error) {
    return (
      <ErrorPage error={'Conversation not found'} />
    )
  }

  if (!messages || !correspondant) {
    return <LoadingPage />;
  }

  return (
    <Layout>
      <ConversationHeader name={correspondant.username} image={correspondant.avatar} id={correspondant._id} />
      <div className="content conversation-page">
        <div className='messages-list'>
        {
          messages.map((el) => {
            if (el.author._id === userData.user_metadata.uid) {
              return (
                <MessageSingle key={el.id} content={el.content} file={el.file} timestamp={el.timestampFormatted} author={'own'} />
              )
            } else {
              return (
                <MessageSingle key={el._id} content={el.content} file={el.file} timestamp={el.timestampFormatted} author={'other'} conv_id={id} />
            )
            }
          })
        }
        </div>
        <div className="content-end" ref={messagesEndRef}></div>
      </div>
      <MessageInputField conversationID={id} groupID={undefined} onSend={updateComponent} />
    </Layout>
  )
}