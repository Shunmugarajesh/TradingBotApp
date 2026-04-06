import { read } from "./storage"

export async function getSession(){

  let token = await read("sessionToken")

  const sessionToken = await read("sessionToken")
  const sessionSid = await read("sessionSid")
  const baseUrl = await read("baseUrl")

  if(!sessionToken || !sessionSid || !baseUrl){
    throw new Error("Session not available. Login failed.")
  }

  return {
    token: sessionToken,
    sid: sessionSid,
    baseUrl: baseUrl
  }

}

export async function isLoggedIn(){

const token = await read("sessionToken")

return token ? true : false

}