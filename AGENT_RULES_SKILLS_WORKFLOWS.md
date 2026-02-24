# Rules
Rules are manually defined constraints for the Agent to follow, at both the local and global levels. Rules allow users to guide the agent to follow behaviors particular to their own use cases and style.

To get started with Rules:

Open the Customizations panel via the "..." dropdown at the top of the editor's agent panel.
Navigate to the Rules panel.
Click + Global to create new Global Rules, or + Workspace to create new Workspace-specific rules.
A Rule itself is simply a Markdown file, where you can input the constraints to guide the Agent to your tasks, stack, and style.

Rules files are limited to 12,000 characters each.

Global Rules
Global rules live in ~/.gemini/GEMINI.md and are applied across all workspaces.

Workspace Rules
Workspace rules live in the .agent/rules folder of your workspace or git root.

At the rule level you can define how a rule should be activated:

Manual: The rule is manually activated via at mention in Agent’s input box.
Always On: The rule is always applied.
Model Decision: Based on a natural language description of the rule, the model decides whether to apply the rule.
Glob: Based on the glob pattern you define (e.g., .js, src/**/.ts), the rule will be applied to all files that match the pattern.
@ Mentions
You can reference other files using @filename in a Rules file. If filename is a relative path, it will be interpreted relative to the location of the Rules file. If filename is an absolute path, it will be resolved as a true absolute path, otherwise it will be resolved relative to the repository. For example, @/path/to/file.md will first attempt to be resolved to /path/to/file.md, and if that file does not exist, it will be resolved to workspace/path/to/file.md.

# Workflows
Workflows enable you to define a series of steps to guide the Agent through a repetitive set of tasks, such as deploying a service or responding to PR comments. These Workflows are saved as markdown files, allowing you to have an easy repeatable way to run key processes. Once saved, Workflows can be invoked in Agent via a slash command with the format /workflow-name.

While Rules provide models with guidance by providing persistent, reusable context at the prompt level, Workflows provide a structured sequence of steps or prompts at the trajectory level, guiding the model through a series of interconnected tasks or actions.

To create a workflow:

Open the Customizations panel via the "..." dropdown at the top of the editor's agent panel.
Navigate to the Workflows panel.
Click the + Global button to create a new global workflow that can be accessed across all your workspaces, or click the + Workspace button to create a workflow specific to your current workspace.
To execute a workflow, simply invoke it in Agent using the /workflow-name command. You can call other Workflows from within a workflow! For example, /workflow-1 can include instructions like “Call /workflow-2” and “Call /workflow-3”. Upon invocation, Agent sequentially processes each step defined in the workflow, performing actions or generating responses as specified.

Workflows are saved as markdown files and contain a title, a description and a series of steps with specific instructions for Agent to follow. Workflow files are limited to 12,000 characters each.

## Agent-Generated Workflows
You can also ask Agent to generate Workflows for you! This works particularly well after manually working with Agent through a series of steps since it can use the conversation history to create the Workflow.

# Agent Skills
Skills are an open standard for extending agent capabilities. A skill is a folder containing a SKILL.md file with instructions that the agent can follow when working on specific tasks.

What are skills?
Skills are reusable packages of knowledge that extend what the agent can do. Each skill contains:

Instructions for how to approach a specific type of task
Best practices and conventions to follow
Optional scripts and resources the agent can use
When you start a conversation, the agent sees a list of available skills with their names and descriptions. If a skill looks relevant to your task, the agent reads the full instructions and follows them.

Where skills live
Antigravity supports two types of skills:

Location	Scope
<workspace-root>/.agent/skills/<skill-folder>/	Workspace-specific
~/.gemini/antigravity/skills/<skill-folder>/	Global (all workspaces)

Workspace skills are great for project-specific workflows, like your team's deployment process or testing conventions.

Global skills work across all your projects. Use these for personal utilities or general-purpose tools you want everywhere.

Creating a skill
To create a skill:

Create a folder for your skill in one of the skill directories
Add a SKILL.md file inside that folder
.agent/skills/
└─── my-skill/
    └─── SKILL.md
Every skill needs a SKILL.md file with YAML frontmatter at the top:

---
name: my-skill
description: Helps with a specific task. Use when you need to do X or Y.
---

# My Skill

Detailed instructions for the agent go here.

## When to use this skill

- Use this when...
- This is helpful for...

## How to use it

Step-by-step guidance, conventions, and patterns the agent should follow.
Frontmatter fields
Field	Required	Description
name	No	A unique identifier for the skill (lowercase, hyphens for spaces). Defaults to the folder name if not provided.
description	Yes	A clear description of what the skill does and when to use it. This is what the agent sees when deciding whether to apply the skill.

Tip: Write your description in third person and include keywords that help the agent recognize when the skill is relevant. For example: "Generates unit tests for Python code using pytest conventions."

Skill folder structure
While SKILL.md is the only required file, you can include additional resources:

.agent/skills/my-skill/
├─── SKILL.md       # Main instructions (required)
├─── scripts/       # Helper scripts (optional)
├─── examples/      # Reference implementations (optional)
└─── resources/     # Templates and other assets (optional)
The agent can read these files when following your skill's instructions.

How the agent uses skills
Skills follow a progressive disclosure pattern:

Discovery: When a conversation starts, the agent sees a list of available skills with their names and descriptions
Activation: If a skill looks relevant to your task, the agent reads the full SKILL.md content
Execution: The agent follows the skill's instructions while working on your task
You don't need to explicitly tell the agent to use a skill—it decides based on context. However, you can mention a skill by name if you want to ensure it's used.

Best practices
Keep skills focused
Each skill should do one thing well. Instead of a "do everything" skill, create separate skills for distinct tasks.

Write clear descriptions
The description is how the agent decides whether to use your skill. Make it specific about what the skill does and when it's useful.

Use scripts as black boxes
If your skill includes scripts, encourage the agent to run them with --help first rather than reading the entire source code. This keeps the agent's context focused on the task.

Include decision trees
For complex skills, add a section that helps the agent choose the right approach based on the situation.

Example: A code review skill
Here's a simple skill that helps the agent review code:

---
name: code-review
description: Reviews code changes for bugs, style issues, and best practices. Use when reviewing PRs or checking code quality.
---

# Code Review Skill

When reviewing code, follow these steps:

## Review checklist

1. **Correctness**: Does the code do what it's supposed to?
2. **Edge cases**: Are error conditions handled?
3. **Style**: Does it follow project conventions?
4. **Performance**: Are there obvious inefficiencies?

## How to provide feedback

- Be specific about what needs to change
- Explain why, not just what
- Suggest alternatives when possible