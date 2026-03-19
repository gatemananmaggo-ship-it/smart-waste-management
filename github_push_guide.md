# How to Push Your Project to GitHub

Follow these steps to set up Git and share your project.

## 1. Install Git
The easiest way on Windows is to download and install **Git for Windows**:
- Download from: [git-scm.com/download/win](https://git-scm.com/download/win)
- During installation, you can keep the default settings.
- **Alternative**: You can also use [GitHub Desktop](https://desktop.github.com/), which provides a visual interface if you prefer not to use the command line.

## 2. Create a GitHub Repository
1. Log in to [GitHub](https://github.com/).
2. Click the **+** (plus) icon in the top right and select **New repository**.
3. Give it a name (e.g., `smart-waste-management`).
4. Keep it **Public** (or Private if you prefer).
5. **DO NOT** initialize with a README, license, or gitignore (we already created these!).
6. Click **Create repository**.

## 3. Push Your Project (via Command Line)
Once Git is installed, open your terminal (PowerShell or Command Prompt) in the project root:
`c:\Users\DELL\OneDrive\Desktop\smart-waste-management`

Run these commands:

```bash
# 1. Initialize the local repository
git init

# 2. Add all files (the .gitignore files I created will skip node_modules and .env)
git add .

# 3. Create your first commit
git commit -m "Initial commit: Smart Waste Management System"

# 4. Rename the default branch to main
git branch -M main

# 5. Connect to your GitHub repository (Replace <URL> with your actual GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/smart-waste-management.git

# 6. Push to GitHub
git push -u origin main
```

## 4. Troubleshooting
- **Permission Denied (403 Error)**: This happens when the GitHub account logged into your computer doesn't have write access to the repository.
    - **Step 1**: Check your current user: `git config user.name` and `git config user.email`.
    - **Step 2**: If the repository belongs to a different account (like `gatemananmaggo-ship-it`), ensure your account (`maggomanansingh`) is added as a **Collaborator** in the GitHub repository settings.
    - **Step 3**: Try using a **Personal Access Token (PAT)**. When Git asks for a password, use the token instead of your GitHub password. [How to create a PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
    - **Step 4**: Alternatively, try using the SSH URL if you have SSH keys set up: `git remote set-url origin git@github.com:gatemananmaggo-ship-it/smart-waste-management.git`.
- **Case Sensitivity**: Windows is case-insensitive, but GitHub is not. Ensure your file paths match exactly.
