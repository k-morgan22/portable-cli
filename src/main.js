import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import extract from 'extract-zip';
import axios from 'axios';

async function unzipFiles(zip, dir){
  try {
    await extract(zip, { dir: dir })
    // console.log('Extraction complete:', zip)
  } catch (err) {
    console.log(err)
  }

  fs.unlink(zip,function(err){
    if(err){
      console.log(err);
    }
  })
  // console.log('file deleted:', zip)
}

async function downloadZip(downloadUrl, zipFileName){

  const filestream = fs.createWriteStream(zipFileName);
  const response = await axios.get(downloadUrl, {responseType: "stream"})
    .catch((err) =>{
      console.log("Error downloading the file for the following url:", downloadUrl)
      console.log(err);
    })

  response.data.pipe(filestream)

  return new Promise(async (resolve, reject) => {
    filestream.on('finish', async () => {
      filestream.close();
      // console.log("Download Complete for the following file", zipFileName);
      // await unzipFiles(zipFileName, dir)
      resolve(true)
    })
    filestream.on('error', (err) =>{
      console.log("Error downloading the file for the following url:", downloadUrl)
      console.log(err);
      reject
    })
  })
}

async function openProject(name, withTemplate){
  
  const portableDir = path.join(os.homedir(), '/Desktop/vscPortable')
  const appPath = path.join(portableDir, name, '/Visual\ Studio\ Code.app')
  const starterFiles = path.join(portableDir, name, '/starter')

  let open;

  if(withTemplate){
    open = spawn('open', ["-a", appPath, starterFiles])
  }else{
    open = spawn('open', ["-a", appPath])
  }

  open.stdout.on("data", (data)=>{
    console.log(`data:\n${data}`)
  })

  open.stderr.on("data", (err)=>{
    console.log(`error: ${err}`);
  })

}

async function createProject(name){

  const projectDir = path.join(os.homedir(), '/Desktop/vscPortable', name)
  // console.log(projectDir)

  const vscDownloadUrl = "https://go.microsoft.com/fwlink/?LinkID=620882"
  const vscZipName = path.join(projectDir, 'vscode-portable.zip')

  const portableDataDownloadUrl = "https://github.com/k-morgan22/vscPortableStarter/raw/main/code-portable-data.zip"
  const portableDataZipName = path.join(projectDir, 'code-portable-data.zip')

  const mernStarterDownloadUrl = "https://github.com/k-morgan22/vscPortableStarter/raw/cli/mern-starter.zip"
  const mernStarterZipName = path.join(projectDir, 'mern-starter.zip')

  if(!fs.existsSync(projectDir)){
    fs.mkdirSync(projectDir, {recursive: true});
  }
  
  console.log("Downloading Necessary Files ....")

  await Promise.all([downloadZip(mernStarterDownloadUrl, mernStarterZipName), downloadZip(vscDownloadUrl, vscZipName), downloadZip(portableDataDownloadUrl, portableDataZipName)]);
  console.log("Installing .....")
  

  await Promise.all([unzipFiles(mernStarterZipName, projectDir), unzipFiles(vscZipName, projectDir), unzipFiles(portableDataZipName, projectDir)]);
  console.log("Opening VS Code ....")

  openProject(name, true)


}

export async function createOrOpen(options){
  options = {
    ...options
  }
  // console.log(options)

  if(options.openProject){
    const projectName = options.openProject
    openProject(projectName, false)
  } 

  if(options.createProject){
    const projectName = options.createProject
    createProject(projectName)
  }

}