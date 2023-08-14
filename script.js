const fs = require("fs");
const path = require("path");
const util = require("util");
const execSync = require("child_process").execSync;

const directoryPath = "/Users/pranav/codedamn-classrooms/react-a-to-z";

const staticPath = "/Users/pranav/codedamn-classrooms/react-static";

function execShellCommand(cmd) {
	const stdout = execSync(`${cmd}`);
	console.log(stdout.toString());
	return stdout;
}

const createBranchesFromFolders = async () => {
	const folders = fs
		.readdirSync(staticPath)
		.filter((folder) =>
			fs.statSync(path.join(staticPath, folder)).isDirectory()
		);

	console.log(folders);

	for (const folder of folders) {
		const branchName = folder;

		if (branchName === ".git") {
			continue;
		}

		// First checkout back to the base branch
		execShellCommand(
			`cd ${directoryPath} && git checkout -b ${branchName}`
		);
		// Then checkout new branch from base

		// Remove all old files
		execShellCommand(`cd ${directoryPath} && ((rm -rf *) || true)`);

		// Copy new files from your directories into the branch
		execShellCommand(
			`cp -r ${staticPath}/${branchName}/. ${directoryPath}`
		);

		const packageJsonPath = path.join(directoryPath, "./package.json");

		// If package.json exists, modify it
		if (fs.existsSync(packageJsonPath)) {
			const packageJson = require(packageJsonPath);

			packageJson.scripts["dev"] = "vite dev —host -p 1337";
			packageJson.dependencies = { vite: "^2.6.14", react: "^17.0.2" };

			// Write the changes back to package.json
			fs.writeFileSync(
				packageJsonPath,
				JSON.stringify(packageJson, null, 4)
			);

			// Add the revised file to the staged commit
		}

		execShellCommand(`git add .`);

		// Commit and push changes
		execShellCommand(`git commit -m "Update dependencies and scripts"`);

		console.log(`${branchName} is Ready`);
	}
	execShellCommand(`git push --all origin`);
};

createBranchesFromFolders().catch(console.error);
