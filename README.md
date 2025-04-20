<p align="center">
  <img src="https://github.com/user-attachments/assets/1ce4beee-55f9-4259-866d-972085985d79" alt="NPTELPrep Logo">
</p>

<p align="center">
  Master your NPTEL courses with interactive quizzes, study materials, and a comprehensive learning experience
</p>

---

## About NPTELPrep

NPTELPrep ([nptelprep.in](https://nptelprep.in)) is a modern, feature-rich educational platform designed specifically for students taking NPTEL courses. Our mission is to provide learners with a comprehensive study environment that goes beyond traditional learning methods, offering interactive quizzes, organized study materials, video lectures, and community features.

### Core Features

- **Interactive Quiz Platform**: Practice with multiple quiz formats tailored to different learning needs
- **Study Materials Repository**: Access lecture notes and supplementary resources
- **Video Lecture Portal**: Watch and organize course video content
- **Discussion Forums**: Engage with other learners and share knowledge
- **Study Planner**: Create personalized study schedules
- **Progress Tracking**: Monitor your learning journey with detailed analytics

## Quiz Features

Our quiz platform offers several specialized modes to enhance your learning experience:

- **Practice Mode**: Unlimited time with all questions at your own pace
- **Timed Quiz**: Set your preferred time limit and question count
- **Quick Review**: 10-question quizzes with a 5-minute limit
- **Weekly Quiz**: Focus on specific course weeks that you select
- **Progress Test**: Focus on questions you've previously struggled with

### Learning Tools

NPTELPrep includes powerful learning tools to help you maximize your study sessions:

- **Text-to-Speech**: Audio readout of questions for auditory learners
- **Flashcard Mode**: Review key concepts in a flashcard format

and so much more!

## Technology Stack

NPTELPrep is built using modern web technologies:

- **Framework**: Next.js with TypeScript
- **UI**: Tailwind CSS with a custom component library
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM on Neon
- **Deployment**: Vercel

## Getting Started

1. **Browse Courses**: Explore our catalog of NPTEL courses
2. **Practice Questions**: Access 100,000+ practice questions
3. **Track Progress**: Monitor your learning improvement
4. **Join Discussions**: Engage with other learners
5. **Prepare Effectively**: Get ready for your NPTEL certification exams

## Local Development

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/theg1239/nptel-quiz.git

# Navigate to the project directory
cd nptel-quiz

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

### Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build for production (includes Prisma generation)
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
├── app/                  
│   ├── api/              # API routes
│   ├── about/            # About page
│   ├── courses/          # Course pages and features
│   │   └── [course_code]/# Dynamic course routes
│   │       ├── discussions/  # Course discussions
│   │       ├── materials/    # Study materials
│   │       ├── practice/     # Practice sessions
│   │       ├── quiz/         # Quiz features
│   │       ├── study-planner/# Study planning tools
│   │       └── videos/       # Video lectures
├── components/           # React components
│   └── ui/               # UI components
├── lib/                  # Utility functions and actions
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## Contributing

We welcome contributions from the community! Whether it's adding new features, fixing bugs, or improving documentation, your help makes NPTELPrep better for everyone.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add a cool new feature'`)
4. Push to the branch (`git push origin feature/newfeature`)
5. Open a Pull Request

## Issues

If you notice any bugs or would like to suggest feature improvements, open an issue.

---

<p align="center">
  Made with ❤️ for NPTEL learners
</p>
