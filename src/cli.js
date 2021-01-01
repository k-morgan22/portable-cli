import arg from 'arg';
import inquirer from 'inquirer';
import { createOrOpen } from './main';
import { projectsExist } from './listHelper';
import { listFolders } from './listHelper';


function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--create': String,
      '--open': String,
      '--list': Boolean,
      '--template': String,
      '-c': '--create',
      '-o': '--open',
      '-l': '--list',
      '-t': '--template',
    },
    {
      argv: rawArgs.slice(1),
    }
  );
  return {
    createProject: args['--create'] || undefined,
    openProject: args['--open'] || undefined,
    listProjects: args['--list'] || false,
    template: args['--template'] || undefined,
  };
}

async function promptForMissingOptions(options) {

  const taskQuestion = [];
  const questions = []
  const defaultTemplate = 'mern';

  if(!options.createProject && !options.openProject && !options.listProjects){
    taskQuestion.push({
      type: 'list',
      name: 'task',
      message: 'What would you like to do today?',
      choices: [
        'Create a new portable project', 
        'Open an existing portable project', 
        'List all existing portable projects'
      ],
      // default: 'Create a new portable project'
    });
  }

  const taskAnswer = await inquirer.prompt(taskQuestion);
  if(taskAnswer.task === 'Create a new portable project'){
    questions.push({
      type: 'input',
      name: 'createName',
      message: 'Project Name?',
    });
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Please choose which project template to use',
      choices: [
        'mern', 
        'mean', 
        'mevn',
        'cli'
      ],
      default: defaultTemplate,
    });
  }

  if(taskAnswer.task === 'Open an existing portable project'){
    questions.push({
      type: 'input',
      name: 'openName',
      message: 'Project Name?',
    });
  }

  if(taskAnswer.task === 'List all existing portable projects'){
    options.listProjects = true
  }

  if(options.listProjects){

    try {
      projectsExist(); 
      if(projectsExist){
        const folders = listFolders()
        if(folders){
          questions.push({
            type: 'list',
            name: 'listSelect',
            message: 'Select an existing project to open',
            choices: folders, 
          });
        }
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log("No portable projects exist. Use \"portable-cli --create projectName\" to get started")
      } else {
        throw e;
      }
    }
    
  }

  const answer = await inquirer.prompt(questions)

  return {
    ...options,
    createProject: options.createProject || answer.createName,
    openProject: options.openProject || answer.openName || answer.listSelect,
    template: options.template || answer.template || defaultTemplate
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await createOrOpen(options)
}