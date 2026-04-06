import { instruments } from "./instrumentMaster"

export function findInstrument(symbol:string, exchange?:string){

  if(!symbol) return null

  const clean = symbol.toUpperCase().trim()

  // ----------------------------
  // 🔥 DETECT INDEX
  // ----------------------------
  let index = ""
  if(clean.startsWith("NIFTY")) index = "NIFTY"
  else if(clean.startsWith("BANKNIFTY")) index = "BANKNIFTY"
  else if(clean.startsWith("FINNIFTY")) index = "FINNIFTY"

  // ----------------------------
  // 🔥 SAFE EXCHANGE DEFAULT
  // ----------------------------
  const ex = exchange || "nse_fo"

  const list = instruments?.[ex]

  // ----------------------------
  // 🚨 SAFETY CHECK
  // ----------------------------
  if(!Array.isArray(list)){
    console.log("❌ Invalid instrument list for exchange:", ex)
    return null
  }

  // ----------------------------
  // ✅ FILTER SAME INDEX ONLY
  // ----------------------------
  const filtered = list.filter((inst:any)=>{
    const ts = (inst.pTrdSymbol || "").toUpperCase()
    return ts.startsWith(index)
  })

  if(filtered.length === 0){
    console.log("No instruments for index:", index)
    return null
  }

  // ----------------------------
  // ✅ EXACT MATCH
  // ----------------------------
  let match = filtered.find((inst:any)=>{
    const ts = (inst.pTrdSymbol || "").toUpperCase()
    return ts === clean
  })

  if(match) return match

  // ----------------------------
  // ✅ STRIKE + TYPE MATCH
  // ----------------------------
  const strike = clean.match(/\d+$/)?.[0]
  const type = clean.endsWith("CE") ? "CE" : "PE"

  match = filtered.find((inst:any)=>{
    const ts = (inst.pTrdSymbol || "").toUpperCase()

    return (
      ts.includes(strike || "") &&
      ts.endsWith(type)
    )
  })

  return match || null
}