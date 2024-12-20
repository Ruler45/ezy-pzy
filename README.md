# Linkedfy  
Effortlessly connect with professionals and send personalized messages on LinkedIn through the command-line.  

![GitHub Repo Stars](https://img.shields.io/github/stars/Ruler45/linkedfy?style=social)  
![GitHub License](https://img.shields.io/github/license/Ruler45/linkedfy)  
![Version](https://img.shields.io/badge/version-0.0.1-blue)  

## 🚀 Features  
- **Automated Connections**: Search for LinkedIn users and send connection requests effortlessly.  
- **Custom Messaging**: Tailor your messages for each connection with ease.  
- **Intuitive CLI**: Minimal and user-friendly command-line interface for maximum productivity.  
- **Data Security**: Credentials are stored locally for your safety, ensuring no external sharing.  


## 📦 Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Ruler45/linkedfy.git
   cd linkedfy
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file in the root directory with your LinkedIn credentials:
   ```env
   LINKEDIN_EMAIL=your_email@example.com
   LINKEDIN_PASSWORD=your_password
   ```
4. Install executable chrome driver
   ```bash
   npx puppeteer browsers install chrome
   ```
5. Include a `Message.js` module to generate personalized messages for connections.

6. Choose whichever function you want to use and put it in [index.js](index.js)
Example:
   ```javascript
      await searchConnect("Software Engineer","Google",10);
   ```

---

## Functions


### 1. `searchConnect(Role, Company, limit = 20)`

Searches for people on LinkedIn based on the specified role and company, and sends connection requests up to the given limit.

#### Parameters:

- `Role` (string): Job role to search for (e.g., "Software Engineer").
- `Company` (string): Company to filter by (e.g., "Google").
- `limit` (number): Maximum number of connection requests to send (default: 20).

#### Process:

1. Logs into LinkedIn via `openAndLogin()`.
2. Searches for the specified role.
3. Applies filters for people and company.
4. Iteratively sends connection requests to available profiles.
5. Provides progress updates and logs the number of successful invites.
6. Closes the browser after execution.

---

### 2. `connectionMessage(Company, limit = 20)`

Sends personalized messages to first-degree connections in the specified company.

#### Parameters:

- `Company` (string): Company to filter by (e.g., "Microsoft").
- `limit` (number): Maximum number of messages to send (default: 20).

#### Process:

1. Logs into LinkedIn via `openAndLogin()`.
2. Searches and filters by company.
3. Sends messages to first-degree connections using a personalized template from `Message.js`.
4. Provides progress updates and logs the number of successful messages sent.
5. Closes the browser after execution.

## Execution

```bash
node index.js
```

## 📝 Notes

1. **Ethics and LinkedIn Policies**:

   - Ensure your use of this script complies with LinkedIn’s terms of service.
   - Avoid excessive or spammy behavior to prevent account restrictions.

2. **Bot Detection**:

   - Run the script sparingly.
   - Use randomized delays to mimic human-like interactions.

3. **Troubleshooting**:

   - Verify login credentials in `.env`.
   - Ensure the `Message.js` module is properly implemented.

## 🛡️ Security  

- **Local Storage**: Credentials are securely stored in the `storage/` directory using `node-localstorage`.  
- **No External Sharing**: Linkedfy does not send your data to external servers.  

---

## 🙌 Contributing  

We welcome all contributors to improve and expand Linkedfy! Here's how you can contribute:  

1. **Fork the Repository**: Create a personal copy of the repository.  
2. **Create a Branch**: Work on your feature or bug fix in a dedicated branch:  
   ```bash
   git checkout -b feature-name
   ```  
3. **Commit Your Changes**: Use clear and concise commit messages:  
   ```bash
   git commit -m "Add feature description here"
   ```  
4. **Push Your Branch**: Push the branch to your forked repository:  
   ```bash
   git push origin feature-name
   ```  
5. **Open a Pull Request**: Create a pull request on the original repository.  


## 📝 License  

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for complete details.  

---

## 🌟 Acknowledgments  

- **Puppeteer**: Powering browser automation tasks ([GitHub Repository](https://github.com/puppeteer/puppeteer)).  
- **Commander.js**: Making CLI development easy ([GitHub Repository](https://github.com/tj/commander.js)).  

---

Feel free to star ⭐ the repo if you find Linkedfy helpful and share it with others!  


