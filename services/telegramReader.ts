import { AppState } from "react-native"
import { addLog } from "./eventLogger"
import { placeOrder } from "./placeOrder"
import { getSocket } from "./Socket"

let connected = false
let lastSignal = ""
let appState = AppState.currentState

let listenersAdded = false
let appStateListenerAdded = false

export async function startTelegram(){

  const socket = await getSocket()

  // ✅ Always try reconnect (don't block)
  if (!socket.connected) {
    addLog("Connecting to server...")
    socket.connect()
  }

  // ✅ Add socket listeners ONLY ONCE
  if (!listenersAdded) {

    socket.on("connect", ()=>{
      connected = true
      addLog("Connected to server")
    })

    socket.on("signal", async (data:any)=>{
      try{

        if(!data?.symbol || !data?.action){
          addLog("Invalid signal")
          return
        }

        // duplicate protection
        const id = data.symbol + data.action
        if(lastSignal === id){
          addLog("Duplicate signal ignored")
          return
        }
        lastSignal = id

        addLog(`Signal received: ${JSON.stringify(data)}`)

        await placeOrder(data)

      }catch(err){
        addLog("Error processing signal")
        console.log(err)
      }
    })

    socket.on("log",(msg:string)=>{
      addLog(msg)
    })

    socket.on("disconnect", ()=>{
      connected = false
      addLog("Disconnected from server")
    })

    listenersAdded = true
  }

  // ✅ Add AppState listener ONLY ONCE
  if (!appStateListenerAdded) {

    AppState.addEventListener("change", async (nextState) => {

      if (appState.match(/inactive|background/) && nextState === "active") {
        addLog("App resumed - reconnecting socket...")

        const socket = await getSocket()

        if (!socket.connected) {
          socket.connect()
        }
      }

      appState = nextState
    })

    appStateListenerAdded = true
  }
}


// import { AppState } from "react-native"
// import { addLog } from "./eventLogger"
// import { placeOrder } from "./placeOrder"
// import { getSocket } from "./Socket"

// let connected = false
// let lastSignal = ""
// let appState = AppState.currentState
// let listenersAdded = false

// export async function startTelegram(){

// if(connected){
//   //addLog("Already connected")
//   return
// }

// AppState.addEventListener("change", async (nextState) => {

//   if (appState.match(/inactive|background/) && nextState === "active") {
//     addLog("App resumed - reconnecting socket...")

//     const socket = await getSocket()

//     if (!socket.connected) {
//       socket.connect()
//     }
//   }

//   appState = nextState
// })

// addLog("Connecting to server...")

// const socket = await getSocket();
// socket.connect()

// socket.on("connect", ()=>{
//   connected = true
//   addLog("Connected to server")
// })

// // 🔥 RECEIVE SIGNAL
// socket.on("signal", async (data:any)=>{

// try{

// if(!data?.symbol || !data?.action){
//   addLog("Invalid signal")
//   return
// }

// // duplicate protection
// const id = data.symbol + data.action
// if(lastSignal === id){
//   addLog("Duplicate signal ignored")
//   return
// }
// lastSignal = id

// addLog(`Signal received: ${JSON.stringify(data)}`);
// // 👉 YOUR EXISTING LOGIC
// await placeOrder(data)

// }catch(err){
// addLog("Error processing signal")
// console.log(err)
// }

// })

// // optional logs
// socket.on("log",(msg:string)=>{
//   addLog(msg)
// })

// socket.on("disconnect", ()=>{
//   connected = false
//   addLog("Disconnected from server")
// })

// }




// import axios from "axios"
// import { addLog } from "./eventLogger"
// import { placeOrder } from "./placeOrder"
// import { read, save } from "./storage"

// // prevent multiple polling calls
// let isChecking = false

// // store last update id
// let lastUpdateId = 0

// // 🔥 INIT (call this once on app start)
// export async function initTelegram(){

// try{

// addLog("Initializing Telegram...")

// const storedId = await read("lastUpdateId")

// if(storedId){
// lastUpdateId = parseInt(storedId)
// addLog(`Loaded lastUpdateId: ${lastUpdateId}`)
// }else{
// addLog("No previous offset found")
// }

// }catch(err:any){

// addLog(`Init error: ${err.message}`)
// console.log(err)

// }

// }

// // 🔥 MAIN FUNCTION
// export async function checkTelegram(){

// // prevent overlapping calls
// if(isChecking){
// addLog("Skipping: previous check still running")
// return
// }

// isChecking = true

// try{

// addLog("Checking Telegram updates...")

// const token = await read("telegramToken")

// if(!token){
// addLog("Telegram token missing")
// return
// }

// // call telegram API
// //const url = `https://api.telegram.org/bot${token}/getUpdates`
// const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId}`

// addLog(`Calling Telegram API with offset: ${lastUpdateId}`)

// const res = await axios.get(url,{
// params:{
// offset:lastUpdateId,
// timeout:10
// }
// })

// // validate response
// if(!res.data.ok){
// addLog(`Telegram API error: ${res.data.description}`)
// return
// }
// const result = res.data.result

// const updates = Array.isArray(result) ? result : []

// addLog(`Updates received: ${updates.length}`)

// // no updates
// if(updates.length === 0){
// return
// }

// // process each update
// for(const update of updates){

// try{

// lastUpdateId = update.update_id + 1

// // persist offset
// await save("lastUpdateId", String(lastUpdateId))

// addLog(`Processing updateId: ${update.update_id}`)

// const text = update.message?.text

// if(!text){
// addLog("Message has no text, skipping")
// continue
// }

// addLog(`Telegram raw: ${text}`)

// // ------------------------
// // JSON PARSE FIX
// // ------------------------

// let cleanText = text.trim()

// // remove wrapping quotes
// if(cleanText.startsWith('"') && cleanText.endsWith('"')){
// cleanText = cleanText.slice(1, -1)
// }

// // remove escape characters
// cleanText = cleanText
// .replace(/\\n/g,"")
// .replace(/\\"/g,'"')
// .trim()

// addLog(`Cleaned text: ${cleanText}`)

// // parse JSON
// let signal:any = null

// // Ignore non JSON messages
// if(!cleanText.startsWith("{")){
//   addLog(`Skipping non-signal message: ${cleanText}`)
//   continue
// }

// try{
// signal = JSON.parse(cleanText)

// if(!signal.action || !signal.symbol){
//   addLog("Invalid signal format")
//   continue
// }

// addLog(`Signal: ${signal.action} ${signal.symbol}`)

// }catch(parseErr){
// addLog("JSON parse failed (inner)")
// console.log("Bad JSON:", cleanText)
// continue
// }

// // validate signal
// if(!signal?.action || !signal?.symbol){
// addLog("Invalid signal format (missing fields)")
// continue
// }

// addLog(`Signal received → ${signal.action} ${signal.symbol}`)

// // place order
// try{

// addLog("Calling placeOrder...")

// await placeOrder(signal)

// addLog("Order execution completed")

// }catch(orderErr:any){

// addLog(`Order error: ${orderErr.message}`)
// console.log(orderErr)

// }

// }catch(loopErr:any){

// addLog(`Update processing error: ${loopErr.message}`)
// console.log(loopErr)

// }

// }

// }catch(err:any){

// // handle rate limit
// if(err.response?.status === 429){
// addLog("Telegram rate limit reached")
// return
// }

// // invalid token
// if(err.response?.status === 401){
// addLog("Telegram unauthorized (invalid token)")
// return
// }

// // conflict (multiple polling)
// if(err.response?.data?.description?.includes("Conflict")){
// addLog("Telegram conflict: multiple bot instances running")
// return
// }

// addLog(`Telegram error: ${err.response?.data?.description || err.message}`)

// console.log(err.response?.data || err.message)

// }finally{

// isChecking = false

// }

// }