import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { read, save } from "../../services/storage";

export default function Settings(){

const[mobile,setMobile]=useState("")
const[ucc,setUcc]=useState("")
const[mpin,setMpin]=useState("")
const[token,setToken]=useState("")
const[totp,setTotp]=useState("")
const[telegram,setTelegram]=useState("")
const[serverUrl,setserverUrl]=useState("")

useEffect(()=>{
loadSettings()
},[])

async function loadSettings(){

setMobile(await read("mobile") || "")
setUcc(await read("ucc") || "")
setMpin(await read("mpin") || "")
setToken(await read("accessToken") || "")
setTotp(await read("totp") || "")
setTelegram(await read("telegramToken") || "")
setserverUrl(await read("serverUrl") || "")


}

async function store(){

await save("mobile",mobile)
await save("ucc",ucc)
await save("mpin",mpin)
await save("accessToken",token)
await save("totp",totp)
await save("telegramToken",telegram)
await save("serverUrl",serverUrl)

alert("Settings Saved")

}

return(

<View style={{padding:20}}>

<Text style={styles.label}>Mobile</Text>
<TextInput
style={styles.input}
placeholder="Mobile"
placeholderTextColor="#00A000"
value={mobile}
onChangeText={setMobile}
/>

<Text style={styles.label}>UCC Client Code</Text>
<TextInput
style={styles.input}
placeholder="UCC"
placeholderTextColor="#00A000"
value={ucc}
onChangeText={setUcc}
/>

<Text style={styles.label}>MPIN</Text>
<TextInput
style={styles.input}
placeholder="MPIN"
placeholderTextColor="#00A000"
value={mpin}
onChangeText={setMpin}
/>

<Text style={styles.label}>Access Token</Text>
<TextInput
style={styles.input}
placeholder="Access Token"
placeholderTextColor="#00A000"
value={token}
onChangeText={setToken}
/>

<Text style={styles.label}>TOTP Secret</Text>
<TextInput
style={styles.input}
placeholder="TOTP Secret"
placeholderTextColor="#00A000"
value={totp}
onChangeText={setTotp}
/>

<Text style={styles.label}>Telegram Token</Text>
<TextInput
style={styles.input}
placeholder="Telegram Token"
placeholderTextColor="#00A000"
value={telegram}
onChangeText={setTelegram}
/>

<Text style={styles.label}>Server URL</Text>
<TextInput
style={styles.input}
placeholder="https://your-server.com"
placeholderTextColor="#00A000"
value={serverUrl}
onChangeText={setserverUrl}
/>

<Button title="Save Settings" onPress={store} color="#00A000"/>

</View>

)

}

const styles=StyleSheet.create({

label:{
color:"#00A000",
fontSize:16,
marginBottom:5
},

input:{
borderWidth:1,
borderColor:"#00A000",
color:"#00A000",
padding:8,
marginBottom:10
}

})