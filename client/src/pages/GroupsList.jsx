import { useState, useEffect, useContext } from "react";
import { userContext } from "../App";
import { Layout } from "../components/Layout";
import { GroupOverview } from "../components/GroupOverview";
import { NewConvButton } from "../components/NewConvButton";
import { LoadingPage } from "../components/LoadingPage";
import { ErrorPage } from "./ErrorPage";

export const GroupsList = () => {
  const [groups, setGroups] = useState();
  const [networkError, setNetworkError] = useState(false);
  const userData = useContext(userContext);

  const groupsList = () => {
    return(
      <>
        {
          groups.map((el) => {
            return (
              <GroupOverview key={el._id} group={el} />
            )
          })
        }
      </>
    )
  }

  const fetchGroups = async () => {
    if (!userData) {
      return
    }
    try {
      const req = await fetch('http://localhost:3000/group/user/' + userData.user_metadata.uid, {
      //const req = await fetch('https://textera-production.up.railway.app/group/user/' + userData.user_metadata.uid, {
        headers: {
          "Authorization": userData.user_metadata.uid,
        }
      });
      const res = await req.json()
      setGroups(res);  
    } catch {
      setNetworkError(true)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [userData])

  if (networkError) {
    return (
      <ErrorPage error={'Network error'} />
    )
  }
  
  if (!groups) {
    return <LoadingPage />
  }

  if (!groups.length) {
    return (
      <Layout>
        <div className="content empty">
          <div>No group</div>
          <NewConvButton link={'/group/create'} />
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Layout>
        <div className="content groups-list">
          {groupsList()}
        </div>
        <NewConvButton link={'/group/create'} />
      </Layout>
    </>
  )
}