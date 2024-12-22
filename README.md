# Linkedfy  

Effortlessly connect with professionals and send personalized messages on LinkedIn through the command-line.

**Note:** Currently works only on Windows & Linux (haven't tested it for MacOS)

![GitHub Repo Stars](https://img.shields.io/github/stars/Ruler45/linkedfy?style=social)  
![GitHub License](https://img.shields.io/github/license/Ruler45/linkedfy)  
![Version](https://img.shields.io/badge/version-0.0.11-blue)

## 🚀 Features  

- **Automated Connections**: Search for LinkedIn users and send connection requests effortlessly.  
- **Custom Messaging**: Tailor your messages for each connection with ease.  
- **Intuitive CLI**: Minimal and user-friendly command-line interface for maximum productivity.  
- **Data Security**: Credentials are stored locally for your safety, ensuring no external sharing.  

## 📦 Installation  

Install the CLI tool globally using `npm`:  

   ```bash
   npm install linkedfy -g
   ```  

## 🛠️ Usage  

### 🛠️ Set Configurations

Use the command `linkedfy config` to set configurations.
Read the help manual before using the command : Run `linkedfy help config`

### Command Descriptions and Examples  

1. **Set Credentials**:  
   Save your LinkedIn credentials for automated tasks.  

   ```bash
   linkedfy config email johndoe@gmail.com
   ```  

   Example:  

   ```bash
   linkedfy config password SuperSecretPassword
   ```  

2. **Set Message File Path**:  
   Set the path for Message.js file for message (Follow a simillar template as [Message.js](Message.js))

   ```bash
   linkedfy config message D://User/Project/Message.js
   ```

3. **Send Connection Requests**:  
   Automate sending connection requests to LinkedIn users.  

   ```bash
   linkedfy connect
   ```  

4. **Send Messages to Connections**:  
   Automatically send messages to your LinkedIn connections.  

   ```bash
   linkedfy message
   ```  

---

### General Help  

Display a list of commands and their descriptions:  

   ```bash
   linkedfy --help
   ```  

## ⚙️ Command Help Output  

When you run `linkedfy --help`, the following output is displayed:  

```plaintext
    Usage: linkedfy [options] [command]

    Welcome to Linkedfy CLI

    Options:
      -v, --version                   Output the version number
      -h, --help                      display help for command

    Commands:
      setup                           Setup the CLI tool post installation. Run this before using the tool(If     it's not run automatically)
      config <key> [value]  Set the configuration for the CLI tool
      connect                         Search people and send connection requests on LinkedIn
      message                         Send messages to LinkedIn connections
      help [command]                  display help for command
```

---

## Example Message.js File

```javascript

const generateMessage = (name) => {
  name = name.trim().split(" ")[0];
  const Message = `Subject: Request for Referral for the Software
  Developer Intern Role at Company (Req ID: 733359BR)

Hello ${name},

I hope this message finds you well.

My name is Your Name, and I am a pre-final year B.Tech student at
NIT Silchar with a strong foundation in Data Structures and
Algorithms, Computer Science fundamentals, and beginner-level
experience in web development technologies.

Name: Your Name
Email: some.work@gmail.com
Phone: 9000000000
Resume: {Resume Link}

Thank you for your time and consideration.

Best regards,
Your Name
`;

  return Message;
};

export default generateMessage;

```

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
