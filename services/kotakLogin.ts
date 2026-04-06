import axios from "axios"
import { addLog } from "./eventLogger"
import { read, save } from "./storage"

export async function kotakLogin(totp: string){

try{

const mobile = await read("mobile")
const ucc = await read("ucc")
const accessToken = await read("accessToken")
const mpin = await read("mpin")

addLog("Login started")

const step1 = await axios.post(
"https://mis.kotaksecurities.com/login/1.0/tradeApiLogin",
{
mobileNumber: mobile,
ucc: ucc,
totp: totp
},
{
headers:{
Authorization: accessToken,
"neo-fin-key":"neotradeapi",
"Content-Type":"application/json"
}
}
)

const viewToken = step1.data.data.token
const viewSid = step1.data.data.sid

addLog("Step1 success")

const step2 = await axios.post(
"https://mis.kotaksecurities.com/login/1.0/tradeApiValidate",
{
mpin: mpin
},
{
headers:{
Authorization: accessToken,
"neo-fin-key":"neotradeapi",
sid: viewSid,
Auth: viewToken,
"Content-Type":"application/json"
}
}
)

await save("sessionToken",step2.data.data.token)
await save("sessionSid",step2.data.data.sid)
await save("baseUrl",step2.data.data.baseUrl)


addLog("Login successful")
addLog(`sessionToken: ${step2.data.data.token}`);
addLog(`sessionSid: ${step2.data.data.sid}`);
addLog(`baseUrl: ${step2.data.data.baseUrl}`);

}catch(err:any){

console.log("LOGIN ERROR:",err.response?.data)
addLog(`LOGIN ERROR: ${err.response?.data}`);
addLog("Login failed")

throw err

}

}