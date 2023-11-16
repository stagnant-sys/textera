import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { userContext } from "../App";
import { Layout } from "../components/Layout";
import { AvatarSmall } from "../components/AvatarSmall";
import { NewConvButton } from "../components/NewConvButton";

export const ContactsPage = () => {
  const [contacts, setContacts] = useState();
  const userData = useContext(userContext);

  const fetchContacts = async () => {
    if (!userData) {
      return
    }
    const req = await fetch('http://localhost:3000/user/' + userData.user_metadata.uid + '/contacts');
    //const req = await fetch('https://textera-production.up.railway.app/user/' + localStorage.user_id + '/contacts');
    const res = await req.json()
    setContacts(res);
  }

  useEffect(() => {
    fetchContacts();
  }, [userData])

  const contactsList = () => {
    if (!contacts) {
      return (
        <>
          Loading...
        </>
      )
    }

    return (
      <div className="contacts-list">
        <div className="contacts-length">
          {contacts.length} contacts
        </div>
        {
          contacts.map((el) => {
            return (
              <Link to={`/user/${el._id}`} key={el._id} className="contact-single">
                <AvatarSmall imageUrl={el.avatar} />
                <div>{el.username}</div>
              </Link>
            )
          })
        }
      </div>
    )
  }

  return (
    <Layout>
      <div className="content contacts-page">
        {contactsList()}
      </div>
      <NewConvButton link={'/contacts/add'} />
    </Layout>
  )
}