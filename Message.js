const generateMessage = (name) => {
  name = name.trim().split(" ")[0];
  const Message = `Subject: Request for Referral for the Software Developer Intern Role at Company (Req ID: 733359BR)

Hello ${name},

I hope this message finds you well.

My name is Sahin Alam, and I am a pre-final year B.Tech student at NIT Silchar with a strong foundation in Data Structures and Algorithms, Computer Science fundamentals, and beginner-level experience in web development technologies.

I have over a year of experience working with React and more than six months of hands-on experience with the MERN stack. I am proficient in both frontend and backend technologies, with additional knowledge spanning Operating Systems, DBMS, Computer Networks, and UI automation. In fact, this very message was sent using a UI automation tool I created.

I am confident that my technical expertise, combined with a positive attitude toward work, makes me a strong fit for the Software Developer Intern role at IBM. I kindly request you to consider referring me for this position. My contact details and resume are attached below for your reference.

Name: Your Name
Email: some.work@gmail.com
Phone: 9000000000
Resume: {Resume Link}

Thank you for your time and consideration.

Best regards,
Sahin Alam
`;

  return Message;
};

export default generateMessage;
