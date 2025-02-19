import { Command } from "commander";
import inquirer from "inquirer";
import { capitalizeFirstLetter } from "../src/utils/utils.mjs";
import angularWizard from "./frameworks-wizard/angular.mjs";
import astroWizard from "./frameworks-wizard/astro.mjs";
import qwikWizard from "./frameworks-wizard/qwik.mjs";
import reactWizard from "./frameworks-wizard/react.mjs";
import svelteWizard from "./frameworks-wizard/svelte.mjs";
import vueWizard from "./frameworks-wizard/vue.mjs";

const program = new Command();

export type Answers = {
	componentName: string;
	framework: string;
	template: string;
	folder: string;
};

const wizard = async () => {
	// Parse command line arguments using commander
	const frameworks = ["Vue", "Angular", "React", "Svelte", "Qwik", "Astro"];

	program
		.option("--name <value>", "Specify a name")
		.option(
			"-f, --framework <value>",
			`Specify framework [${frameworks.join("|")}]`
		)
		.option("--folder <value>", "Specify the subfolder")
		.parse(process.argv);

	const options = program.opts();
	const componentNameFromFlag = options.name || "";
	const frameworkFromFlag = options.framework || "";
	const folderFromFlag = options.folder || "";

	const prompts = [];

	// Only ask for componentName if --name argument is not provided
	if (!componentNameFromFlag) {
		prompts.push({
			type: "input",
			name: "componentName",
			message: "Give a name to your component",
			validate: (input: string) => {
				const trimmedInput = input.trim();
				if (trimmedInput === "") {
					return "Component name cannot be empty";
				}
				// Use a regular expression to check for only alphanumeric characters
				const isValid = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/.test(trimmedInput);
				return (
					isValid || "Component name can only contain alphanumeric characters"
				);
			},
		});
	}

	if (!folderFromFlag) {
		prompts.push({
			type: "input",
			name: "folder",
			message: "Custom path for the component (default: src/components)",
			default: "",
		});
	}

	if (!frameworkFromFlag) {
		prompts.push({
			type: "list",
			name: "framework",
			message: "Pick a framework to create the component for",
			choices: frameworks,
		});
	}

	return inquirer
		.prompt(prompts)
		.then(
			(answers: {
				componentName: string;
				folder: string;
				framework: string;
			}) => {
				const folder = answers.folder || folderFromFlag;
				const framework =
					answers.framework || capitalizeFirstLetter(frameworkFromFlag);
				const componentName = answers.componentName || componentNameFromFlag;
				switch (framework) {
					case "Vue":
						return vueWizard(componentName, folder);
					case "Angular":
						return angularWizard(componentName, folder);
					case "React":
						return reactWizard(componentName, folder);
					case "Svelte":
						return svelteWizard(componentName, folder);
					case "Qwik":
						return qwikWizard(componentName, folder);
					case "Astro":
						return astroWizard(componentName, folder);
					default:
						throw new Error("A valid framework must be selected");
				}
			}
		)
		.then<Answers>((values: Answers | PromiseLike<Answers>) => {
			return values;
		})
		.catch((e: Error) => {
			throw new Error(e.message);
		});
};
export default wizard;
