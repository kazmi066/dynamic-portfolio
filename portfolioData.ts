// ===================================================================
// PORTFOLIO DATA - EDIT THIS TO CUSTOMIZE YOUR PORTFOLIO
// ===================================================================
export const portfolioData = {
  // Personal Information
  personal: {
    name: "John Doe",
    title: "Graphic Designer, Web designer/developer",
    avatar:
      "https://img.freepik.com/free-photo/young-male-posing-isolated-against-blank-studio-wall_273609-12356.jpg?semt=ais_hybrid&w=740&q=80",
    bio: [
      "I am a seasoned graphic designer with over 14 years of experience in creating visually appealing and user-centric designs. My expertise spans across UI design, design systems, and custom illustrations, helping clients bring their digital visions to life.",
      "Currently, I work remotely for Notion, where I design template UIs, convert them into HTML and CSS, and provide comprehensive support to our users. I am passionate about crafting elegant and functional designs that enhance user experiences.",
    ],
  },

  // Contact Information
  contacts: [
    {
      name: "Email",
      value: "johndoe997@about.me",
      link: "mailto:johndoe997@about.me",
    },
    {
      name: "Twitter",
      value: "@johndoe997",
      link: "https://twitter.com/johndoe997",
    },
  ],

  // Navigation Links
  navigation: [
    { label: "Home", link: "#", active: true },
    { label: "Projects", link: "#projects" },
    { label: "Work", link: "#work" },
    { label: "Articles", link: "#articles" },
  ],

  // Projects
  projects: [
    {
      title: "Project 1",
      image:
        "https://images.unsplash.com/photo-1656618724305-a4257e46e847?q=80&w=320&auto=format&fit=crop",
      link: "https://www.google.com",
    },
    {
      title: "Project 2",
      image:
        "https://images.unsplash.com/photo-1616427592793-67b858804534?q=80&w=320&auto=format&fit=crop",
      link: "#",
    },
    {
      title: "Project 3",
      image:
        "https://images.unsplash.com/photo-1516131206008-dd041a9764fd?q=80&w=320&auto=format&fit=crop",
      link: "#",
    },
    {
      title: "Project 4",
      image:
        "https://images.unsplash.com/photo-1707760696486-2a2cd7e0b6a6?q=80&w=320&auto=format&fit=crop",
      link: "#",
    },
    {
      title: "Project 5",
      image:
        "https://images.unsplash.com/photo-1585159812596-fac104f2f069?q=80&w=320&auto=format&fit=crop",
      link: "#",
    },
    {
      title: "Project 6",
      image:
        "https://images.unsplash.com/photo-1654131300276-db70adf4f85d?q=80&w=320&auto=format&fit=crop",
      link: "#",
    },
  ],

  // Testimonials
  testimonials: [
    {
      name: "Josh Grazioso",
      content:
        "I'm absolutely floored by the level of care and attention to detail Eliana has put into this project and for one can guarantee that we will be a return customer.",
      avatar:
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80",
    },
    {
      name: "Nicole Grazioso",
      content:
        "To say that hiring Eliana has been life-changing is an understatement. My business has tripled and I got my life back.",
      avatar:
        "https://images.unsplash.com/photo-1671726203390-cdc4354ee2eb?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80",
    },
  ],

  // Skills (organized by category)
  skills: [
    {
      category: "Design Tools",
      items: ["Figma", "Sketch", "Adobe XD", "Photoshop"],
    },
    {
      category: "Development",
      items: ["HTML", "CSS", "Tailwind CSS", "React", "Vue", "Next.js"],
    },
    {
      category: "Collaboration",
      items: ["Notion", "Mailchimp", "Slack", "GitHub"],
    },
    {
      category: "Design Expertise",
      items: [
        "UI/UX Design",
        "Design Systems",
        "Custom Illustrations",
        "Responsive Design",
      ],
    },
    {
      category: "Soft Skills",
      items: [
        "Strong communication",
        "Problem-solving",
        "Attention to detail",
        "Time management",
      ],
    },
  ],

  // Work Experience
  workExperience: [
    {
      company: "Notion",
      role: "Web Designer & Web Developer",
      period: "2023 - Present",
      description:
        "The company has high expectations and using OKRs there is a mutual understanding of expectations and performance.",
      responsibilities: [
        "Designed template UIs and design systems in Figma.",
        "Converted UIs into responsive HTML and CSS with a mobile-first approach.",
        "Created custom illustrations and item description banners.",
        "Provided detailed documentation and customer support on GitHub.",
        "Engaged with users to address setup inquiries, bug issues, and feedback.",
      ],
    },
    {
      company: "Mailchimp",
      role: "Senior Software Engineer",
      period: "2021 - 2023",
      description:
        "This is an excellent company and they reward their employees. It's becoming a big company but it's still private, so the culture is as good as it gets at 1,000+ employees if you ask me. Managers are still adapting to the growth I think, but everyone has to. Great place to work.",
      featuredWork: {
        title: "Studio by Mailchimp",
        description:
          "Produce professional, reliable streams easily leveraging Mailchimp's innovative broadcast studio.",
        image:
          "https://images.unsplash.com/photo-1661956600655-e772b2b97db4?q=80&w=560&auto=format&fit=crop",
        link: "#",
      },
    },
    {
      company: "Slack",
      role: "Junior Software Engineer",
      period: "2011 - 2021",
      description:
        "Work in Slack is one of the beautiful experience I can do in my entire life. There are a lot of interesting thing to learn and manager respect your time and your personality.",
    },
    {
      company: "Freelance",
      role: "Freelance Graphic Designer",
      period: "2010 - 2011",
      responsibilities: [
        "Worked with a diverse range of clients, delivering tailored design solutions.",
        "Developed and maintained strong client relationships through effective communication and project management.",
        "Utilized tools such as Notion for project tracking, Mailchimp for email marketing designs, Slack for team collaboration, and GitHub for version control and project sharing.",
      ],
    },
  ],

  // Education
  education: [
    {
      degree: "Master's degree in Computer Software Engineering",
      institution: "The University of Manchester",
      period: "2012 - 2013",
      logo: "https://d2bps9p1kiy4ka.cloudfront.net/5b09189f7285894d9130ccd0/50afffb9-f201-41d7-b40e-b9cb89336447.jpg",
    },
    {
      degree: "Bachelor's degree in Computer Software Engineering",
      institution: "Harvard University",
      period: "2009 - 2012",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Harvard_University_coat_of_arms.svg",
    },
  ],

  // Articles
  articles: [
    {
      year: "2024",
      title: "The complete guide to OKRs",
      description:
        "How to make objectives and key results work for your company.",
      link: "#",
    },
    {
      year: "2024",
      title: "Enhancement in Customer Engagement",
      description:
        "With the aim of optimizing customer interactions and boosting brand loyalty, the team at Preline leveraged Mailchimp's powerful tools and expertise to deliver exceptional results.",
      link: "#",
    },
    {
      year: "2023",
      title: "How Google Assistant now helps you record stories for kids",
      description:
        "Google is constantly updating its consumer AI, Google Assistant, with new features.",
      link: "#",
    },
  ],

  // Newsletter
  newsletter: {
    enabled: true,
    title: "Subscribe",
    placeholder: "Enter your email",
    buttonText: "Join",
    disclaimer: "unsubscribe at any time.",
  },

  // Footer
  footer: {
    copyright: "© 2025 Portfolio.",
    socialLinks: [
      { name: "X (Twitter)", link: "https://twitter.com" },
      { name: "Github", link: "https://github.com" },
    ],
  },
};

// ===================================================================
// PORTFOLIO COMPONENT - NO NEED TO EDIT BELOW
// ===================================================================
