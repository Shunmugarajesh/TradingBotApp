import { addLog } from "./eventLogger"
import { remove } from "./storage"

export async function logout(){

await remove("sessionToken")
await remove("sessionSid")
await remove("baseUrl")

console.log("User logged out")
addLog("User logged out")

}