import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

export async function save(key:string,value:string){

try{

if(Platform.OS==="web"){
localStorage.setItem(key,value)
}else{
await SecureStore.setItemAsync(key,value)
}

}catch(e){
console.log("Storage save error",e)
}

}

export async function read(key:string){

try{

if(Platform.OS==="web"){
return localStorage.getItem(key)
}else{
return await SecureStore.getItemAsync(key)
}

}catch(e){
console.log("Storage read error",e)
return null
}

}

export async function remove(key:string){

if(Platform.OS==="web"){
localStorage.removeItem(key)
}else{
await SecureStore.deleteItemAsync(key)
}

}