import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { https } from 'follow-redirects';
import extract from 'extract-zip';

async function checkStatus(dir){
  const appExists = fs.existsSync(path.join(dir, '/Visual\ Studio\ Code.app'))
  const dataExists = fs.existsSync(path.join(dir, '/code-portable-data'))
  const starterExists = fs.existsSync(path.join(dir, '/starter'))

  if(appExists && dataExists && starterExists){
    console.log("All files downloaded, opening mern stack in vs code")
    openProject("react")
  }

}

async function unzipFiles(zip, dir){
  // console.log("you have activated my trap card haha")

  try {
    await extract(zip, { dir: dir })
    console.log('Extraction complete:', zip)
  } catch (err) {
    console.log(err)
  }

  fs.unlink(zip,function(err){
    if(err){
      console.log(err);
    }
  })

  checkStatus(dir)

}

async function downloadZip(downloadUrl, zipFileName, dir){
  https.get(downloadUrl,function(res){
    const filestream = fs.createWriteStream(zipFileName);
    res.pipe(filestream);

    filestream.on("error",function(err){
      console.log("Error writing to the stream for the following url:", downloadUrl);
      console.log(err);
    })

    filestream.on("finish",function(){
      filestream.close();
      console.log("Download Complete for the following file", zipFileName);
    });

    filestream.on("close",function(){
      unzipFiles(zipFileName, dir)
    })

  }).on("error",function(err){
    console.log("Error downloading the file for the following url:", downloadUrl);
    console.log(err);
  })

}

async function openProject(name){
  
  const portableDir = path.join(os.homedir(), '/Desktop/vscPortable')
  const appPath = path.join(portableDir, name, '/Visual\ Studio\ Code.app')
  // do I need projectPath that points to starter folder?

  const open = spawn('open', ["-a", appPath])

  open.stdout.on("data", (data)=>{
    console.log(`data:\n${data}`)
  })

  open.stderr.on("data", (err)=>{
    console.log(`error: ${err}`);
  })

  //withTemplate = false
  // if(withTemplate){
  //   const open = spawn('open', ["-a", appPath, starterDir])
  // } else{
  //   const open = spawn('open', ["-a", appPath])
  // }

}

async function createProject(name){

  const projectDir = path.join(os.homedir(), '/Desktop/vscPortable', name)
  console.log(projectDir)

  const vscDownloadUrl = "https://go.microsoft.com/fwlink/?LinkID=620882"
  const vscZipName = path.join(projectDir, 'vscode-portable.zip')

  const portableDataDownloadUrl = "https://github.com/k-morgan22/vscPortableStarter/raw/main/code-portable-data.zip"
  const portableDataZipName = path.join(projectDir, 'code-portable-data.zip')

  const mernStarterDownloadUrl = "https://github.com/k-morgan22/vscPortableStarter/raw/cli/mern-starter.zip"
  const mernStarterZipName = path.join(projectDir, 'mern-starter.zip')

  if(!fs.existsSync(projectDir)){
    fs.mkdirSync(projectDir, {recursive: true});
  }
  
  downloadZip(vscDownloadUrl, vscZipName, projectDir)

  downloadZip(portableDataDownloadUrl, portableDataZipName, projectDir)

  downloadZip(mernStarterDownloadUrl, mernStarterZipName, projectDir)

}

export async function createOrOpen(options){
  options = {
    ...options
  }
  // console.log(options)

  if(options.openProject){
    const projectName = options.openProject
    openProject(projectName)
  } 

  if(options.createProject){
    const projectName = options.createProject
    createProject(projectName)
  }

}

// const portableDir = path.join(os.homedir(), '/Desktop/vscPortable')
// console.log(portableDir)