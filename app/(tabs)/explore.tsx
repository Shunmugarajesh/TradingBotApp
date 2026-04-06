import React, { useEffect, useState } from "react"
import { DeviceEventEmitter, FlatList, StyleSheet, Text, View } from "react-native"
import { read } from "./../../services/storage"

export default function Trades(){

  const [orders,setOrders] = useState<any[]>([])

  useEffect(()=>{
    loadOrders()
    const sub = DeviceEventEmitter.addListener("ORDER_UPDATED",()=>{
    loadOrders()
  })

  },[])
  

  const loadOrders = async ()=>{
    const data = await read("orders")

    if(data){
      setOrders(JSON.parse(data))
    }
  }

  return(
    <View style={{flex:1,padding:10}}>

      <FlatList
        data={orders}
        keyExtractor={(item,index)=>index.toString()}
        renderItem={({item})=>(
          <View style={{padding:10,borderBottomWidth:1}}>
            
            <Text style={styles.label}>{item.symbol}</Text>
            <Text style={styles.label}>{item.action} | Qty: {item.qty}</Text>
            <Text style={styles.label}>Status: {item.status}</Text>
            <Text style={styles.label}>{item.time}</Text>

          </View>
        )}
      />

    </View>
  )
}

const styles = StyleSheet.create({

label:{
color:"#00A000",
marginBottom:5
}
})