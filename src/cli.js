import arg from 'arg';
import inquirer from 'inquirer';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--create': String,
      '--open': String,
      '--list': Boolean,
      '-c': '--create',
      '-o': '--open',
      '-l': '--list',
    },
    {
      argv: rawArgs.slice(1),
    }
  );
  return {
    createProject: args['--create'] || undefined,
    openProject: args['--open'] || undefined,
    listProjects: args['--list'] || false,
  };
}

async function promptForMissingOptions(options) {
  if(options.listProjects){

  }

  const taskQuestion = [];
  const questions = []
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
  const taskAnswer = await inquirer.prompt(taskQuestion);
  if(taskAnswer.task === 'Create a new portable project'){
    questions.push({
      type: 'input',
      name: 'createName',
      message: 'Project Name?',
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
  }

  const answer = await inquirer.prompt(questions)

  return {
    ...options,
    createProject: options.createProject || answer.createName,
    openProject: options.openProject || answer.openName,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  console.log(options);
}