import fs from "fs";

import { ensureCommands } from "./commands.mjs";
import { comment } from "./formatting.mjs"

const BUILD_DIR = "build";

const REPO_DIR = "static-repository";
const REPO_URL = "https://github.com/stanstrum/stanstrum.github.io";
const REPO_BRANCH = "static";

async function main() {
  console.log();

  let starting_working_dir = process.cwd();
  console.log(`Starting working dir is ${starting_working_dir}`);

  const { test, git, rsync, pwd, rm, mv } = await ensureCommands();

  // comment("ls for good measure");
  // await spawnAndFormat("ls --color=always");

  comment("Make sure we have the build dir");
  await test.existsDir(BUILD_DIR);

  comment("Make sure we have the repo dir");
  try {
    await test.existsDir(REPO_DIR);
  } catch {
    console.log(`No repository: ${REPO_DIR} does not exist ... cloning`);

    await git.clone(REPO_URL, REPO_DIR);
  };

  comment("Try going there");
  await pwd.run(REPO_DIR);

  {
    comment("Check out the place");
    const { stdout, stderr } = await git.status(REPO_DIR);

    if (stdout || stderr) {
      throw new Error(
        `There are uncomitted or unstaged changes in ${REPO_DIR}, or an error occurred.`,
      );
    };
  };

  {
    comment("Make sure the repo dir is the one we actually want, i.e., rsync didn't screw us over");
    const { stdout } = await git.getOriginUrl(REPO_DIR);

    await test.strcmp(stdout.trim(), REPO_URL);
  };

  {
    comment(`Make sure we're on the right branch: ${REPO_BRANCH}`);
    const { stdout } = await git.getCurrentBranch(REPO_DIR);
    const current_branch = stdout.trim();

    if (current_branch != REPO_BRANCH) {
      comment(`We need to switch from ${current_branch} to ${REPO_BRANCH}`);
      await git.switch(REPO_BRANCH, REPO_DIR);
    };
  };

  comment("Make sure we have the latest version");
  await git.pull(REPO_DIR);

  {
    comment(`Make sure we're actually 1-to-1 with origin/${REPO_BRANCH}`);
    const { stdout, stderr } = await git.diff({
      targets: [`origin/${REPO_BRANCH}`, "HEAD"],
      options: ["--stat", "--color=always"],
      cwd: REPO_DIR,
    });

    if (stdout || stderr) {
      throw new Error(`Repository is out of sync with origin/${REPO_BRANCH}.  Please verify.`);
    };
  };

  comment(`Sync from ${BUILD_DIR}, deleting removed content`);
  await rsync.syncAndPrune(BUILD_DIR + '/', REPO_DIR);

  comment("Make sure .git is still around");
  await test.existsDir(`${REPO_DIR}/.git`);

  // We have to do some fixing to make 404.html appear where GitHub Pages wants it
  comment(`Find out if 404/index.html is generated`);

  try {
    const error_folder = REPO_DIR + "/404";
    const index_html = error_folder + "/index.html";
    const dest = REPO_DIR + "/404.html";

    await test.existsDir(error_folder);
    await test.existsFile(index_html);

    comment(`Make sure ${dest} doesn't exist`);
    await test.notExists(dest);

    comment("Move it to where it belongs -- this is entirely bespoke");
    await mv.run({ sources: [index_html], dest });

    comment("Clean up empty directory");
    await rm.emptyDir(error_folder);
  } catch  {
    throw new Error("404/index.html does not exist");
  };

  {
    comment("Make sure changes were applied");
    const { stdout } = await git.status(REPO_DIR);

    if (!stdout) {
      comment("No changes are present.  Goodbye!");

      return;
    };
  };

  comment("Stage the changes");
  await git.add(REPO_DIR);

  comment("Commit the changes");
  await git.commitWithMessage("Deploy static content", REPO_DIR);

  comment("Push the changes");
  await git.push(REPO_DIR);

  comment("Complete!");
};

try {
  await main();
} catch (err) {
  console.error(err);

  process.exit(1);
};
