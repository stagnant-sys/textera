import { useState, useEffect, useContext } from "react"
import { userContext } from "../App";
import { Layout } from "../components/Layout"
import { ConversationOverview } from "../components/ConversationOverview";
import { NewConvButton } from "../components/NewConvButton";
import { LoadingPage } from "../components/LoadingPage";
import { ErrorPage } from "./ErrorPage";

export const ConversationsList = () => {
  const [conversations, setConversations] = useState();
  const [networkError, setNetworkError] = useState(false);
  const userData = useContext(userContext);

  const fetchConversations = async () => {
    if (!userData) {
      return;
    } 
    try {
      const req = await fetch('http://localhost:3000/conversation/user/' + userData.user_metadata.uid, {
      //const req = await fetch('https://textera-production.up.railway.app/conversation/user/' + userData.user_metadata.uid, {
        headers: {
          "Authorization": userData.user_metadata.uid,
        }
      });
      const res = await req.json()
      setConversations(res);
    } catch {
      setNetworkError(true)
    }
  }

  const conversationsList = () => {
    return(
      <>
        {
          conversations.map((el) => {
            return (
              <ConversationOverview key={el._id} message={el} />
            )
          })
        }
      </>
    )
  }

  useEffect(() => {
    fetchConversations();
  }, [userData])

  if (networkError) {
    return (
      <ErrorPage error={'Network error'} />
    )
  }

  if (!conversations) {
    return <LoadingPage />
  }

  if (!conversations.length) {
    return (
      <Layout>
        <div className="content empty">
          <div>No conversations</div>
          <NewConvButton link={'/contacts'} />
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Layout>
        <div className="content conversation-list">
          {conversationsList()}
        </div>
        <NewConvButton link={'/contacts'} />
      </Layout>
    </>
  )
}