import axios from "axios"
import * as FileSystem from "expo-file-system/legacy"
import Papa from "papaparse"
import { addLog } from "./eventLogger"
import { read, save } from "./storage"

export let instruments:any = {
  nse_fo: [],
  mcx_fo: [],
  cde_fo: []
}

export async function downloadInstrumentMaster(baseUrl:string, token:string){

try{

// ----------------------------
// ✅ CHECK DAILY DOWNLOAD
// ----------------------------

const today = new Date().toISOString().split("T")[0]
const lastDownload = await read("MASTER_DATE")

if(lastDownload === today && instruments.length > 0){
  addLog("✅ Master already loaded for today")
  return
}

addLog("STEP 1: Fetching file path")

const accessToken = await read("accessToken")

const res = await axios.get(
`${baseUrl}/script-details/1.0/masterscrip/file-paths`,
{
headers:{
Authorization: accessToken,
"neo-fin-key":"neotradeapi",
accept:"application/json"
}
}
)

addLog(`STEP 2: API success ${res.status}`)

const files = res.data?.data?.filesPaths

if(!files){
addLog("ERROR: filesPaths missing")
return
}

// ----------------------------
// ✅ REQUIRED FILES
// ----------------------------

const requiredFiles = [
  {name:"nse_fo", key:"nse_fo"},
  {name:"mcx_fo", key:"mcx_fo"},
  {name:"cde_fo", key:"cde_fo"}
]


// ----------------------------
// ✅ DOWNLOAD LOOP
// ----------------------------

for(const file of requiredFiles){

  try{

    const fileUrl = files.find((f:string)=>f.includes(file.name))

    if(!fileUrl){
      addLog(`⚠️ ${file.name} not found`)
      continue
    }

    addLog(`⬇️ Downloading ${file.name}...`)

    const fileUri = FileSystem.documentDirectory + `${file.key}.csv`

    const downloadRes = await FileSystem.downloadAsync(fileUrl,fileUri)

    if(downloadRes.status !== 200){
      addLog(`❌ ${file.name} download failed`)
      continue
    }

    const csvData = await FileSystem.readAsStringAsync(fileUri)

    const parsed = Papa.parse(csvData,{
      header:true,
      skipEmptyLines:true
    })

    if(parsed.errors?.length){
      addLog(`⚠️ ${file.name} parse error`)
    }

    addLog(`✅ ${file.name} loaded: ${parsed.data.length}`)

    instruments[file.key] = parsed.data

  }catch(innerErr:any){

    addLog(`❌ Error processing ${file.name}`)
    console.log(innerErr)

  }

}

// ----------------------------
// ✅ FINAL ASSIGN
// ----------------------------


addLog(`🎯 TOTAL Instruments loaded: ${instruments.length}`)

// ----------------------------
// ✅ SAVE DATE (IMPORTANT)
// ----------------------------

await save("MASTER_DATE", today)

addLog("✅ Master saved for today")
addLog(`🎯 NSE FO: ${instruments.nse_fo.length}`)
addLog(`🎯 MCX: ${instruments.mcx_fo.length}`)
addLog(`🎯 NCDEX: ${instruments.cde_fo.length}`)
}catch(err:any){

addLog("❌ Instrument master FAILED")
addLog(`Error message: ${err.message}`)
addLog(`Error status: ${err.response?.status}`)
addLog(`Error data: ${JSON.stringify(err.response?.data)}`)

console.log("FULL ERROR:", err)

}
}