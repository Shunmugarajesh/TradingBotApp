import { read } from "./storage"

let tradeCount=0

export async function canTrade(){

const maxTrades=parseInt(await read("maxTrades") || "10")

if(tradeCount>=maxTrades){

console.log("Max trades reached")
return false

}

return true

}

export function recordTrade(){
tradeCount++
}