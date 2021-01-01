import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import extract from 'extract-zip';
import axios from 'axios';
import Listr from 'listr';
import chalk from 'chalk'
import urljoin from 'url-join';

async function unzipFiles(zip, dir){
  try {
    await extract(zip, { dir: dir })
  } catch (err) {
    console.log("%s unzipping the following file:", chalk.red.bold('ERROR'), zip)
    console.log(err)
  }

  fs.unlink(zip,function(err){
    if(err){
      console.log("%s deleting the following file:", chalk.red.bold('ERROR'), zip)
      console.log(err);
    }
  })
}

async function downloadZip(downloadUrl, zipFileName){

  const filestream = fs.createWriteStream(zipFileName);
  const response = await axios.get(downloadUrl, {responseType: "stream"})
    .catch((err) =>{
      console.log("%s downloading the following file:", chalk.red.bold('ERROR'), zipFileName)
      console.log(err);
    })

  response.data.pipe(filestream)

  return new Promise((resolve, reject) => {
    filestream.on('finish', () => {
      filestream.close();
      resolve(true)
    })
    filestream.on('error', (err) =>{
      console.log("%s downloading the following file:", chalk.red.bold('ERROR'), zipFileName)
      console.log(err);
      reject
    })
  })
}

async function openProject(name, withTemplate, starter){
  
  const portableDir = path.join(os.homedir(), '/Desktop/vscPortable')
  const appPath = path.join(portableDir, name, '/Visual\ Studio\ Code.app')
  const starterbase = starter + '-starter'
  const starterPath = path.join(portableDir, name, starterbase)

  let open;

  if(withTemplate){
    open = spawn('open', ["-a", appPath, starterPath])
  }else{
    open = spawn('open', ["-a", appPath])
    console.log("%s opening \'%s\' project", chalk.bold.white('DONE'), name)
  }

  // open.stdout.on("data", (data)=>{
  //   console.log(`data:\n${data}`)
  // })

  open.stderr.on("data", (err)=>{
    console.log(`error: ${err}`);
  })

}

async function createProject(name, starter){

  const projectDir = path.join(os.homedir(), '/Desktop/vscPortable', name)
  // console.log(projectDir)

  const vscDownloadUrl = "https://go.microsoft.com/fwlink/?LinkID=620882"
  const vscZipName = path.join(projectDir, 'vscode-portable.zip')

  const portableDataDownloadUrl = "https://github.com/k-morgan22/vscPortableStarter/raw/main/code-portable-data.zip"
  const portableDataZipName = path.join(projectDir, 'code-portable-data.zip')

  const starterFile = starter + '-starter.zip'
  const starterDownloadUrl = urljoin('https://github.com/k-morgan22/vscPortableStarter/raw/cli/templates/', starterFile)
  const starterZipName = path.join(projectDir, starterFile)
  
  const tasks = new Listr([
    {
      title: "Downloading Files",
      task: () => {
        return new Listr([
          {
            title: "Downloading " + starter.toUpperCase() + " Starter Files",
            task: () => downloadZip(starterDownloadUrl, starterZipName)
          },
          {
            title: "Downloading VS Code (MAC version)",
            task: () => downloadZip(vscDownloadUrl, vscZipName)
          },
          {
            title: "Downloading Portable VSC Files",
            task: () => downloadZip(portableDataDownloadUrl, portableDataZipName)
          }
        ], {concurrent: true})
      }
    },
    {
      title: "Installing",
      task: () => Promise.all([unzipFiles(starterZipName, projectDir), unzipFiles(vscZipName, projectDir), unzipFiles(portableDataZipName, projectDir)])
    },
    {
      title: "Opening VS Code",
      task: () => openProject(name, true, starter)
    },

  ])

  if(!fs.existsSync(projectDir)){
    fs.mkdirSync(projectDir, {recursive: true});
    await tasks.run();
    console.log("%s \'%s\' project ready", chalk.bold.white('DONE'), name)
  } else{
    console.log("%s \'%s\' project already exists", chalk.bold.red('ERROR'), name)
    process.exit(1);
  }


}

export async function createOrOpen(options){
  options = {
    ...options
  }

  const correctTemplateNames = ['mern', 'mean', 'mevn', 'cli']

  if(correctTemplateNames.includes(options.template)){

    if(options.openProject){
      const projectName = options.openProject
      openProject(projectName, false)
    } else if(options.createProject){
      const projectName = options.createProject
      const starterName = options.template
      createProject(projectName, starterName)
    }

  } else{
    console.error('%s Invalid template name. Use \'--help\' for more information.', chalk.red.bold('ERROR'));
    process.exit(1);
  }





}