import React, { useEffect, useState } from "react"
import {
   Button,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View
} from "react-native"

import { downloadInstrumentMaster } from "@/services/instrumentMaster"
import { addLog, getLogs } from "../../services/eventLogger"
import { kotakLogin } from "../../services/kotakLogin"
import { logout } from "../../services/logout"
import { getSession, isLoggedIn } from "../../services/sessionManager"
import { startTelegram } from "../../services/telegramReader"

export default function Dashboard(){

const [logged,setLogged] = useState(false)
const [totp,setTotp] = useState("")
const [botRunning,setBotRunning] = useState(false)
const [logs,setLogs] = useState<string[]>([])

let interval:any

useEffect(()=>{
},[])

useEffect(()=>{

init()

const logTimer = setInterval(()=>{
setLogs([...getLogs()])
},1000)

return ()=>{
clearInterval(logTimer)
if(interval) clearInterval(interval)
}

},[])

async function init(){
const state = await isLoggedIn()
setLogged(state)
}

async function handleLogin(){

try{

if(!totp){
alert("Enter TOTP")
return
}

addLog("Login started")

await kotakLogin(totp)

setLogged(true)

addLog("Login successful")

const session = await getSession()

addLog(`Base URL: ${session.baseUrl}`)

await downloadInstrumentMaster(session.baseUrl, session.token)

addLog("Instrument master download completed")

}catch(e){

addLog("Login failed")
alert("Login failed")

}

}

async function handleLogout(){

await logout()

setLogged(false)

stopBot()

addLog("Logged out")

}

function startBot(){
if(botRunning) return

addLog("Bot started")

interval = setInterval(()=>{
startTelegram();
},5000)

setBotRunning(true)
}

function stopBot(){

if(interval){
clearInterval(interval)
}

setBotRunning(false)

addLog("Bot stopped")

}

return(

<View style={styles.container}>

<Text style={styles.title}>
Trading Bot Dashboard
</Text>

<Text style={styles.status}>
Status: {logged ? "Logged In" : "Logged Out"}
</Text>

{!logged && (

<>
<Text style={styles.label}>
Enter Google Authenticator TOTP
</Text>

<TextInput
style={styles.input}
placeholder="Enter 6 digit TOTP"
placeholderTextColor="#00A000"
value={totp}
onChangeText={setTotp}
/>

<Button
title="Login"
onPress={handleLogin}
color="#00A000"
/>
</>

)}

{logged && (

<>
{/* ✅ Buttons in one row */}
<View style={styles.buttonRow}>

<TouchableOpacity style={styles.button} onPress={handleLogout}>
<Text style={styles.buttonText}>LOGOUT</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.button} onPress={startBot}>
<Text style={styles.buttonText}>
{botRunning ? "RUNNING" : "START"}
</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.button} onPress={stopBot}>
<Text style={styles.buttonText}>STOP</Text>
</TouchableOpacity>

</View>

</>

)}

<Text style={styles.logTitle}>
Event Logs
</Text>

{/* ✅ Full height + selectable */}
<View style={styles.logContainer}>
<ScrollView
contentContainerStyle={{ paddingBottom: 20 }}
showsVerticalScrollIndicator={true}
>

{logs.map((log,i)=>(
<Text key={i} style={styles.logText} selectable>
{log}
</Text>
))}

</ScrollView>
</View>

</View>

)

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000000",
padding:20
},

title:{
color:"#00A000",
fontSize:22,
marginBottom:10
},

status:{
color:"#00A000",
marginBottom:10
},

label:{
color:"#00A000",
marginBottom:5
},

input:{
borderWidth:1,
borderColor:"#00A000",
color:"#00A000",
padding:8,
marginBottom:10
},

/* ✅ Button Row */
buttonRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:10
},

button:{
flex:1,
backgroundColor:"#00A000",
paddingVertical:12,
marginHorizontal:5,
borderRadius:6,
alignItems:"center"
},

buttonText:{
color:"#000",
fontWeight:"bold",
fontSize:12
},

logTitle:{
color:"#00A000",
fontSize:18,
marginTop:10,
marginBottom:5
},

/* ✅ Full screen log */
logContainer:{
flex:1,
borderWidth:1,
borderColor:"#00A000",
padding:10
},

logText:{
color:"#00A000",
fontFamily:"monospace"
}

})