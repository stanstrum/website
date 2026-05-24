import { spawn } from "node:child_process";

import { comment, printCommand } from "./formatting.mjs";

const git = {
  ensure: () => ({ args: ["--version"] }),

  clone: (repo_url, repo_dir, cwd = undefined) => ({ args: ["clone", repo_url, repo_dir] }),
  status: (cwd = undefined) => ({ args: ["status", "--porcelain"], cwd }),
  getOriginUrl: (cwd = undefined) => ({ args: ["remote", "get-url", "origin"], cwd }),
  getCurrentBranch: (cwd = undefined) => ({ args: ["branch", "--show-current"], cwd }),
  switch: (branch, cwd = undefined) => ({ args: ["switch", branch], cwd }),
  pull: (cwd = undefined) => ({ args: ["pull"], cwd }),
  diff: ({ options, targets, cwd }) => ({ args: ["diff", ...options, ...targets], cwd }),
  add: (cwd = undefined) => ({ args: ["add", "-A"], cwd }),
  commitWithMessage: (message, cwd = undefined) => ({ args: ["commit", "-m", message], cwd }),
  push: (cwd = undefined) => ({ args: ["push"], cwd }),
};

const test = {
  ensure: () => ({ args: ["--version"] }),

  existsDir: directory => ({ args: ["-d", directory] }),
  strcmp: (a, b) => ({ args: [a, "=", b] }),
};

const rsync = {
  ensure: () => ({ args: ["--version"] }),

  syncAndPrune: (source, dest) => ({ args: ["-a", "--delete", "-f", "protect .git/", source, dest] }),
};

const pwd = {
  ensure: () => ({ args: ["--version"] }),

  run: (cwd = undefined) => ({ args: [], cwd }),
};

const CONFIGURATIONS = {
  git,
  test,
  rsync,
  pwd,
};

export async function ensureCommands() {
  const commands = {};

  for (const [name, configuration] of Object.entries(CONFIGURATIONS)) {
    commands[name] = {};

    for (const [subcommand, cb] of Object.entries(configuration)) {
      commands[name][subcommand] = async (...arg_values) => {
        const { args, cwd } = cb(...arg_values);
        return await spawnAndFormat(name, args, cwd);
      };
    };
  };

  for (const command in commands) {
    comment(`Check if we have ${command}`);
    await commands[command].ensure();
  };

  return commands;
}

async function spawnAndFormat(command, args, cwd = undefined) {
  printCommand([command, ...args], cwd);

  const child = spawn(command, args, { cwd });

  const pipe = {
    buffer: "",
    midLine: false,
    blankLines: 0,
  };

  const pipes = {
    stdout: { ...pipe },
    stderr: { ...pipe },
  };

  const applyPipe = (child, name) => {
    const pipe = pipes[name];

    child[name].on("data", message => {
      message = message.toString();
      pipe.buffer += message;

      let firstLine = true;
      for (const line of message.split('\n')) {
        if (!firstLine && !pipe.midLine) {
          process[name].write('\n');
          pipe.midLine = false;
        };

        if (!line.trim()) {
          pipe.blankLines += 1;
          continue;
        };

        process[name].write("       \x1b[1m|\x1b[0m\n".repeat(pipe.blankLines));
        pipe.blankLines = 0;

        for (const pipeName in pipes) {
          if (name === pipeName) {
            continue;
          };

          const otherPipe = pipes[pipeName];

          if (otherPipe.midLine) {
            process[pipeName].write('\n');
            otherPipe.midLine = false;
          };
        };

        if (!pipe.midLine) {
          process[name].write(`\x1b[1;31m${name}\x1b[39m | \x1b[0m`);
        };

        process[name].write(`\x1b[37m${line}\x1b[0m`);

        firstLine = false;
      };

      pipe.midLine = !message.endsWith('\n');

      if (!pipe.midLine) {
        process[name].write('\n');
      };
    });
  };

  for (const pipe in pipes) {
    applyPipe(child, pipe);
  };

  try {
    await new Promise((resolve, reject) => {
      let finished = false;

      const exitHandler = (code, signal) => {
        if (finished) {
          return;
        };

        finished = true;

        if (signal) {
          reject(new Error(signal));
        };

        if (code !== 0) {
          reject(new Error(`${command} process exited with code ${code}`));
        } else {
          resolve();
        };
      };

      child.on("exit", exitHandler);
      child.on("close", exitHandler);
    });

    return {
      stdout: pipes.stdout.buffer,
      stderr: pipes.stderr.buffer,
    };
  } catch (e) {
    console.log(`\x1b[1;31m error\x1b[0m | exited unsuccessfully`);
    throw e;
  } finally {
    console.log();
  };
}
