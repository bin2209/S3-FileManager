<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	<!-- Node.js project with client and backend for AWS S3 file upload and download functionality -->

- [x] Scaffold the Project
	<!--
	✅ Created Node.js project structure with:
	- Backend server using Express.js for handling file uploads/downloads to S3
	- React client application for user interface
	- AWS S3 integration using AWS SDK v2
	- REST API endpoints for upload, download, list, and delete operations
	-->

- [x] Customize the Project
	<!--
	✅ Implemented AWS S3 file upload/download functionality:
	- File upload with multer middleware and S3 integration
	- File download with streaming support
	- File listing and deletion capabilities
	- React frontend with FileManager component
	- Responsive UI design with modern CSS
	-->

- [x] Install Required Extensions
	<!-- ✅ No specific extensions required for this project type -->

- [x] Compile the Project
	<!--
	✅ Installed npm dependencies for both backend and client
	✅ Project structure ready for environment configuration
	⚠️  Requires .env file setup with AWS credentials
	-->

- [x] Create and Run Task
	<!--
	✅ Created development task that runs both backend and client concurrently
	✅ Development servers started successfully
	 -->

- [x] Launch the Project
	<!--
	✅ Backend server running on http://localhost:5000
	✅ React client application starting
	⚠️  Requires AWS credentials configuration to be fully functional
	 -->

- [x] Ensure Documentation is Complete
	<!--
	✅ README.md contains comprehensive setup instructions
	✅ API endpoints documented
	✅ Environment setup guide included
	✅ Project structure and features documented
	✅ Copilot-instructions.md file created and maintained
	-->

## Project: AWS S3 File Management System
A Node.js application with client and backend for uploading and downloading files from Amazon S3.

### Features:
- File upload to S3 bucket
- File download from S3 bucket
- REST API backend with Express.js
- Client-side interface
- AWS S3 integration