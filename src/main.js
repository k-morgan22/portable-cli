import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';


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

  // if(options.createProject){

  // }

}

// const portableDir = path.join(os.homedir(), '/Desktop/vscPortable')
// console.log(portableDir)