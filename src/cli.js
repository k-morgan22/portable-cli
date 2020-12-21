import arg from 'arg';

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

export function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  console.log(options);
}