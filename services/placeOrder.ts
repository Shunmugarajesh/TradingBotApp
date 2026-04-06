import axios from "axios"
import { isDuplicate } from "./duplicateGuard"
import { addLog } from "./eventLogger"
import { instruments } from "./instrumentMaster"
import { addOrder } from "./orderHistory"
import { canTrade, recordTrade } from "./riskManager"
import { getSession } from "./sessionManager"
import { read } from "./storage"
import { findInstrument } from "./symbolFinder"

// ----------------------------
// 🔥 Convert TradingView Symbol → Kotak Format
// ----------------------------
function convertTVSymbol(symbol:string, instruments:any[]){

  const match = symbol.match(/(NIFTY|BANKNIFTY)(\d{2})(\d{2})(\d{2})([CP])(\d+)/)

  if(!match) return symbol

  const index = match[1]
  const month = match[3]
  const type = match[5] === "C" ? "CE" : "PE"
  const strike = match[6]

  const months:any = {
    "01":"JAN","02":"FEB","03":"MAR","04":"APR",
    "05":"MAY","06":"JUN","07":"JUL","08":"AUG",
    "09":"SEP","10":"OCT","11":"NOV","12":"DEC"
  }

  const mon = months[month]

  // 🔥 FIND VALID EXPIRY FROM MASTER
  const filtered = instruments.filter((inst:any)=>{

    return (
      inst.pTrdSymbol.includes(index) &&
      inst.pTrdSymbol.includes(strike) &&
      inst.pTrdSymbol.includes(type) &&
      inst.pTrdSymbol.includes(mon)
    )

  })

  if(filtered.length === 0){
    return symbol // fallback
  }

  // ✅ pick nearest expiry (first match)
  return filtered[0].pTrdSymbol
}

// ----------------------------
// MAIN ORDER FUNCTION
// ----------------------------
export async function placeOrder(signal:any){

try{

// ----------------------------
// BASIC VALIDATION
// ----------------------------
if(isDuplicate(signal)) return

if(!await canTrade()) return

if(!signal || !signal.symbol){
  addLog("Invalid signal")
  return
}

addLog(`Signal received ${signal.symbol}`)

// ----------------------------
// SESSION
// ----------------------------
const {token,sid,baseUrl}=await getSession()

let tradingSymbol=""
let exchange=""
let qty=1

// ----------------------------
// 🔥 FIX EXCHANGE
// ----------------------------
let exch=(signal.exchange || "").toUpperCase()

if(exch === "NSE_DLY"){
  exch = "NSEFO"
}

addLog(`Incoming exchange: ${exch}`)

// ----------------------------
// 🔥 DETECT DERIVATIVES (LIKE SERVER)
// ----------------------------
const isOption =
  signal.symbol.includes("NIFTY") ||
  signal.symbol.includes("BANKNIFTY")

// ----------------------------
// DERIVATIVE ORDER (MATCH SERVER)
// ----------------------------
if(isOption){

  addLog("Derivative instrument detected")

  // 🔥 Convert symbol
  const convertedSymbol = convertTVSymbol(signal.symbol, instruments)

  addLog(`Converted symbol: ${convertedSymbol}`)

  // 🔥 Find instrument
  const inst = findInstrument(convertedSymbol, "nse_fo")

  if(!inst){
    addLog(`Instrument not found for ${convertedSymbol}`)
    return
  }

  // 🔥 EXACT SERVER LOGIC
  tradingSymbol = inst.pTrdSymbol
  exchange = "nse_fo"
  qty = parseInt(inst.lLotSize || "1")

  if(!qty || qty<=0) qty=1

  addLog(`Trading symbol: ${tradingSymbol}`)
  addLog(`Lot size: ${qty}`)
}

// ----------------------------
// EQUITY ORDER
// ----------------------------
else{

  addLog("Equity instrument detected")

  tradingSymbol = signal.symbol
  exchange = "nse_cm"

  const eqQty = await read("equityQty")

  qty = parseInt(eqQty || "1")

  if(!qty || qty<=0) qty=1
}

// ----------------------------
// FINAL ORDER LOG
// ----------------------------
addLog(`Placing order ${tradingSymbol} | Exchange ${exchange} | Qty ${qty}`)

// ----------------------------
// ORDER PAYLOAD (MATCH SERVER)
// ----------------------------
const order={

am:"NO",
dq:"0",
es:exchange,
mp:"0",
pc:"NRML",
pf:"N",
pr:"0",
pt:"MKT",
qt:String(qty),
rt:"DAY",
tp:"0",
ts:tradingSymbol,
tt: signal.action === "BUY" ? "B" : "S"

}

// ----------------------------
// ORDER EXECUTION (RETRY)
// ----------------------------
let res:any
let retry=0

while(retry<2){

try{

res=await axios.post(
`${baseUrl}/quick/order/rule/ms/place`,
`jData=${JSON.stringify(order)}`,
{
headers:{
accept:"application/json",
Auth:token,
Sid:sid,
"neo-fin-key":"neotradeapi",
"Content-Type":"application/x-www-form-urlencoded"
}
}
)

break

}catch(err){

retry++
addLog(`Order retry ${retry}`)

if(retry>=2) throw err

}

}

// ----------------------------
// RESPONSE LOGGING
// ----------------------------
console.log("Order response:",res?.data)

addLog("Order response received")
addLog(`Order response: ${JSON.stringify(res?.data)}`)

// ----------------------------
// SAVE HISTORY
// ----------------------------
await addOrder({
symbol: tradingSymbol,
originalSymbol: signal.symbol,
action: signal.action,
qty: qty,
price: signal.price,
exchange: exchange,
orderId: res?.data?.nOrdNo || "",
status: res?.data?.stat || "SENT",
time: new Date().toLocaleString()
})

recordTrade()

}catch(err:any){

addLog("Order failed")
addLog(`Error data: ${JSON.stringify(err)}`)
addLog(`Error data: ${JSON.stringify(err.response?.data)}`)
addLog(err?.message || "Unknown error");

console.log(err?.response?.data || err.message)

}

}