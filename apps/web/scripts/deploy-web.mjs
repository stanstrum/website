import fs from "fs";

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const CHECK_IF_WE_HAVE = [
  // ["ls", "--version"],
  ["[", "--version ]"],
  ["git", "--version"],
  ["rsync", "--version"],
  // ["mktemp", "--version"],
  // ["rm", "--version"],
  ["!", "[ ]"],
];

const BUILD_DIR = "build";

const REPO_DIR = "static-repository";
const REPO_URL = "https://github.com/stanstrum/stanstrum.github.io";
const REPO_BRANCH = "static";

const printCommand = command =>
  console.log(`\x1b[97m$ \x1b[1m${command}\x1b[0m`);

const formatMultilinePrefix = (prefix, string) =>
  string.trimEnd().split('\n')
    .map(line => prefix + line)
    .join('\n');

const comment = comment =>
  console.log(
    comment.split('\n')
      .map(line => `$ \x1b[37m# ${comment}\x1b[0m`)
      .join('\n'),
  );

async function execAndFormat(command) {
  const execAsync = promisify(exec);

  printCommand(command);

  try {
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.log(
        formatMultilinePrefix("\x1b[1;31mstderr\x1b[39m | \x1b[0m", stderr),
      );
    };

    if (stdout) {
      console.log(
        "\x1b[37m" +
          stdout.trimEnd().split('\n')
            .map(line => `\x1b[37m${line}\x1b[0m`)
            .join('\n')
        + "\x1b[0m",
        // formatMultilinePrefix("\x1b[1;37mstdout | \x1b[0m", stdout),
      );
    };

    return { stdout, stderr };
  } catch (e) {
    console.log(`\x1b[1;31merror\x1b[0m Process exited unsucessfully`);
    throw e;
  } finally {
    console.log();
  };
}

async function ensureCommands() {
  for (const [command, args] of CHECK_IF_WE_HAVE) {
    comment(`Check if we have ${command}`);
    await execAndFormat(`${command} ${args}`);
  };
}

async function main() {
  console.log();

  let starting_working_dir = process.cwd();
  console.log(`Starting working dir is ${starting_working_dir}`);

  await ensureCommands();

  // comment("ls for good measure");
  // await execAndFormat("ls --color=always");

  comment("Make sure we have the build dir");
  await execAndFormat("[ -d ${REPO_DIR} ] && echo All good.")

  comment("Make sure we have the repo dir");
  try {
    await execAndFormat(`[ -d ${REPO_DIR} ] && echo All good.`);
  } catch (e) {
    console.log(`No repository: ${REPO_DIR} does not exist ... cloning`);

    await execAndFormat(`git clone ${REPO_URL} ${REPO_DIR}`);
  };

  comment("Try going there");
  printCommand(`cd ${REPO_DIR}`);
  console.log();
  process.chdir(REPO_DIR);

  {
    comment("Check out the place");
    const { stdout, stderr } = await execAndFormat("git status --porcelain");

    if (stdout || stderr) {
      throw new Error(
        `There are uncomitted or unstaged changes in ${process.cwd()}, ` +
        "or an error occurred."
      );
    };
  };

  {
    comment("Make sure the repo dir is the one we actually want, i.e., rsync didn't screw us over");
    const { stdout } = await execAndFormat("git remote get-url origin");

    await execAndFormat(`[ "${stdout.trim()}" = "${REPO_URL}" ]`);
  };

  {
    comment(`Make sure we're on the right branch: ${REPO_BRANCH}`);
    const { stdout } = await execAndFormat("git branch --show-current");
    const current_branch = stdout.trim();

    if (current_branch != REPO_BRANCH) {
      comment(`We need to switch from ${current_branch} to ${REPO_BRANCH}`);
      await execAndFormat(`git switch ${REPO_BRANCH}`);
    };
  };

  comment("Make sure we have the latest version");
  await execAndFormat("git pull");

  {
    comment(`Make sure we're actually 1-to-1 with origin/${REPO_BRANCH}`);
    const { stdout, stderr } = await execAndFormat(`git diff origin/${REPO_BRANCH} --stat --color=always`);

    if (stdout || stderr) {
      throw new Error(`Repository is out of sync with origin/${REPO_BRANCH}.  Please verify.`);
    };
  };

  comment(`Sync from ${BUILD_DIR}, deleting removed content`);
  await execAndFormat(`rsync -a --delete --filter='protect .git/' ${starting_working_dir}/${BUILD_DIR}/ .`);

  comment("Make sure .git is still around");
  await execAndFormat(`[ -d .git ]`);

  {
    comment("Make sure changes were applied");
    const { stdout } = await execAndFormat("git status --porcelain");

    if (!stdout) {
      comment("No changes are present.  Goodbye!");

      return;
    };
  };

  comment("Stage the changes");
  await execAndFormat(`git add -A`);

  comment("Commit the changes");
  await execAndFormat("git commit -m Deploy\\ static\\ content");

  comment("Push the changes");
  await execAndFormat("git push");

  comment("Complete!");
};

try {
  await main();
} catch (err) {
  console.error(err);

  process.exit(1);
};
