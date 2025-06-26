# VPViewer
## Building the Extension

1. **Install dependencies** (if not already done): 2. **Compile the TypeScript code**: Great! The build was successful. Now let's install the VS Code Extension CLI tool to package and install the extension.

## Installing VSCE (VS Code Extension CLI) ## Packaging the Extension Perfect! The extension has been successfully packaged. Now let's install it in VS Code.

## Installing the Extension Despite the fatal error at the end (which appears to be a Node.js issue unrelated to the extension installation), the extension was successfully installed. Let me verify this: Excellent! The extension is successfully installed.

## Summary

Here's the complete process to build and install your VS Code extension:

### **Building the Extension:**

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Compile TypeScript:**
   ```powershell
   npm run compile
   ```
   (This runs `tsc -p ./` to compile your TypeScript files to JavaScript in the out directory)

### **Packaging and Installing:**

3. **Install VSCE (if not already installed):**
   ```powershell
   npm install -g @vscode/vsce
   ```

4. **Package the extension:**
   ```powershell
   vsce package
   ```
   (This creates a `.vsix` file: vp-image-extract-0.0.1.vsix)

5. **Install the extension:**
   ```powershell
   code --install-extension vp-image-extract-0.0.1.vsix
   ```

### **Development Workflow:**

For development, you can also use:
- `npm run watch` - Automatically recompile when you make changes
- Press `F5` in VS Code to launch a new Extension Development Host window for testing

### **Using the Extension:**

Your extension "VP Image Extractor" is now installed and ready to use. You can access it through:
- Command Palette (`Ctrl+Shift+P`) → "Extract VP Images"

The extension is successfully built and installed! The fatal error at the end was just a Node.js issue unrelated to the actual installation, which completed successfully.
