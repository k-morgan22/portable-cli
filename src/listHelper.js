import os from 'os'
import fs from 'fs'
import path from 'path'



export function projectsExist(){
  const portableDir = path.join(os.homedir(), '/Desktop/vscPortable')
  
  try {
    fs.statSync(portableDir).isDirectory();
    return true
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }

}


export function listFolders(){
  const folders = [];
  const portableDir = path.join(os.homedir(), '/Desktop/vscPortable')

  const folderNames = fs.readdirSync(portableDir, {withFileTypes: true})
  for(const name of folderNames){
    if(name.isDirectory()){
      folders.push(name.name)
    }
  }
  if(folders.length === 0){
    console.log("No portable projects exist. Use \"portable-cli --create projectName\" to get started")
    return false
  } else{
    return folders
  }
}
