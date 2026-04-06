import { DeviceEventEmitter } from "react-native"
import { read, save } from "./storage"

export async function addOrder(order:any){

  try{

    const existing = await read("orders")

    let orders:any[] = []

    if(existing){
      orders = JSON.parse(existing)
    }

    orders.unshift(order) // latest first

    await save("orders", JSON.stringify(orders))
    DeviceEventEmitter.emit("ORDER_UPDATED")

  }catch(err){
    console.log("Save order error", err)
  }

}