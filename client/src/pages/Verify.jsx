import { useEffect, useState } from "react";
import { Layout } from "../components/Layout"
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gliraufnczlivoqbxhzc.supabase.co";
import { supabaseKey } from "../_private";
export const supabase = createClient(supabaseUrl, supabaseKey);


export const VerifyUser = () => {
  const [token, setToken] = useState();

  const getToken = async () => {
    const {data, error} = await supabase.auth.getSession();
    if (!data.session) {
      setToken(undefined);
    } else {
      setToken(data.session.access_token)
    }
  }

  useEffect(() => {
    getToken();
  }, [])

  const verifyUser = async (e) => {
    e.preventDefault();
    const req = await fetch('http://localhost:3000/user/verify', {
      method: 'POST',
      headers: {
        'authorization' : token
      }
    })
    const res = await req.json();
    console.log(res)
  }

  return (
    <Layout>
        <div className="content">
          <form onSubmit={verifyUser}>
            <button>Verify</button>
          </form>
        </div>
      </Layout>
  )
}