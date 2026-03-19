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
- **Permission Denied (403 Error)**: This means GitHub doesn't recognize you as having permission to write to this repository.
    - **The Easiest Fix (Personal Access Token)**:
      1. Go to GitHub **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
      2. Click **Generate new token (classic)**. Give it a name and select the **'repo'** scope.
      3. **Copy the token** (you won't see it again!).
      4. Run this command to include your token in the URL:
         `git remote set-url origin https://YOUR_TOKEN@github.com/gatemananmaggo-ship-it/smart-waste-management.git`
      5. Try `git push -u origin main` again.
- **Missing Folders / Submodules (mode 160000)**: If `Smartwaste Management App` appears as a "grey folder" on GitHub:
    - **Fix**: Run these commands in your project root:
      1. `rm -rf "Smartwaste Management App/.git"` (Deletes the hidden folder)
      2. `git rm --cached "Smartwaste Management App"`
      3. `git add .`
      4. `git commit -m "Convert submodule to normal folder"`
- **Case Sensitivity**: Windows is case-insensitive, but GitHub is not. Ensure your file paths match exactly.
