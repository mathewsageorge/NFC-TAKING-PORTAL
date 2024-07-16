# NFC Attendance Management System (NFCAMS)

## Description
NFC Attendance Management System (NFCAMS) is a comprehensive solution developed by Mathews A George and Ansu Rose Joseph for automating attendance tracking in educational institutions. The system leverages NFC (Near Field Communication) technology to streamline the process of marking student attendance. It includes a server-side component for data management and a client-side web interface for teachers to interact with.

## Key Features
- **NFC Tag Integration**: Teachers can use NFC tags to quickly mark student attendance by tapping the tags.
- **Dynamic Subject Selection**: The system allows teachers to select subjects based on the teacher's profile, ensuring accurate attendance tracking.
- **Class Management**: Teachers can start classes, increment class counts, and receive absence notifications for students who are marked absent.
- **Email Notifications**: Absentees are automatically notified via email, providing a seamless communication channel.
- **Database Integration**: Utilizes MongoDB for storing attendance records and class information securely.
- **User-Friendly Interface**: The web interface offers an intuitive design for easy navigation and interaction.

## Developers
- **Mathews A George**
  - Role: Backend Development, Database Management
  - GitHub: [mathewsgeorge2003](https://github.com/mathewsgeorge2003)

- **Ansu Rose Joseph**
  - Role: Frontend Development, User Interface Design
  - GitHub: [ansurose41](https://github.com/ansurose41)

## Files
- `server.js`: Contains the server-side code written in Node.js using Express and MongoDB for handling attendance records and class management.
- `index.js`: Includes the client-side JavaScript code for interacting with NFC tags, updating attendance records, and starting classes.
- `index.html`: Provides the user interface for teachers to select subjects, start classes, and view attendance information.

## Usage
1. Start the server by running `node server.js`.
2. Open `index.html` in a browser to access the NFC Attendance Taking Portal.
3. Select a teacher, period, and subject to begin taking attendance.
4. Tap NFC tags to mark students present or absent.
5. Click the "Start Class" button to start the class and send absence notifications.

## Setup
1. Clone the repository: `git clone https://github.com/your-username/nfc-attendance-system.git`
2. Install dependencies: `npm install`
3. Configure MongoDB connection in `server.js`.
4. Run the server: `node server.js`
5. Open `index.html` in a browser to start taking attendance.

For more information and updates, please refer to the individual GitHub profiles of Mathews A George and Ansu Rose Joseph.
