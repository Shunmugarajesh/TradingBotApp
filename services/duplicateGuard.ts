let lastTrade=""

export function isDuplicate(signal:any){

const id = signal.symbol + signal.action

if(lastTrade===id){

console.log("Duplicate trade ignored")
return true

}

lastTrade=id

return false

}