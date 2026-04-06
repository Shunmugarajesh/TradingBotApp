function convertTVSymbol(symbol:string){

  const match = symbol.match(/(NIFTY|BANKNIFTY|FINNIFTY)(\d{2})(\d{2})(\d{2})([CP])(\d+)/)

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

  // 🔥 FORCE MONTHLY EXPIRY (last Thursday)
  const expiryMap:any = {
    "03":"26", // March 2026
    "04":"30",
    "05":"28"
  }

  const day = expiryMap[month] || "26"

  return `${index}${day}${months[month]}${strike}${type}`
}