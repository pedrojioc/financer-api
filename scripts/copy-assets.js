const fs = require('fs');
const path = require('path');

// Function to create directory if it doesn't exist
function ensureDirectoryExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to copy files recursively
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  ensureDirectoryExistence(destination);

  // Get all files and subdirectories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });

  // Copy each entry
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    // If the entry is a directory, recursively copy it
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      // Copy the file
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied: ${sourcePath} -> ${destPath}`);
    }
  }
}

// Main function to copy template files
function copyTemplateFiles() {
  console.log('Copying template files...');
  const sourceDir = path.join(__dirname, '../src/pdf/templates');
  const destDir = path.join(__dirname, '../dist/src/pdf/templates');
  
  copyDirectory(sourceDir, destDir);
  console.log('Template files copied successfully!');
}

// Execute the copy function
copyTemplateFiles();

