export type SkillCategory =
  | "language"
  | "frontend"
  | "backend"
  | "mobile"
  | "database"
  | "devops"
  | "design";

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
};

export const skills: Skill[] = [
  { id: "javascript",    name: "JavaScript",      category: "language" },
  { id: "typescript",    name: "TypeScript",      category: "language" },
  { id: "python",        name: "Python",          category: "language" },
  { id: "php",           name: "PHP",             category: "language" },
  { id: "java",          name: "Java",            category: "language" },
  { id: "kotlin",        name: "Kotlin",          category: "language" },
  { id: "swift",         name: "Swift",           category: "language" },
  { id: "go",            name: "Go",              category: "language" },
  { id: "rust",          name: "Rust",            category: "language" },
  { id: "csharp",        name: "C#",              category: "language" },
  { id: "cpp",           name: "C++",             category: "language" },
  { id: "sql",           name: "SQL",             category: "language" },

  { id: "react",         name: "React",           category: "frontend" },
  { id: "nextjs",        name: "Next.js",         category: "frontend" },
  { id: "vue",           name: "Vue.js",          category: "frontend" },
  { id: "nuxt",          name: "Nuxt",            category: "frontend" },
  { id: "angular",       name: "Angular",         category: "frontend" },
  { id: "svelte",        name: "Svelte",          category: "frontend" },
  { id: "tailwind",      name: "Tailwind CSS",    category: "frontend" },
  { id: "bootstrap",     name: "Bootstrap",       category: "frontend" },

  { id: "nodejs",        name: "Node.js",         category: "backend" },
  { id: "express",       name: "Express.js",      category: "backend" },
  { id: "nestjs",        name: "NestJS",          category: "backend" },
  { id: "laravel",       name: "Laravel",         category: "backend" },
  { id: "django",        name: "Django",          category: "backend" },
  { id: "flask",         name: "Flask",           category: "backend" },
  { id: "fastapi",       name: "FastAPI",         category: "backend" },
  { id: "springboot",    name: "Spring Boot",     category: "backend" },
  { id: "rails",         name: "Ruby on Rails",   category: "backend" },

  { id: "flutter",       name: "Flutter",         category: "mobile" },
  { id: "react-native",  name: "React Native",    category: "mobile" },
  { id: "android-native",name: "Android Native",  category: "mobile" },
  { id: "ios-native",    name: "iOS Native",      category: "mobile" },
  { id: "ionic",         name: "Ionic",           category: "mobile" },

  { id: "postgresql",    name: "PostgreSQL",      category: "database" },
  { id: "mysql",         name: "MySQL",           category: "database" },
  { id: "mongodb",       name: "MongoDB",         category: "database" },
  { id: "redis",         name: "Redis",           category: "database" },
  { id: "sqlite",        name: "SQLite",          category: "database" },
  { id: "firebase",      name: "Firebase",        category: "database" },
  { id: "supabase",      name: "Supabase",        category: "database" },

  { id: "docker",        name: "Docker",          category: "devops" },
  { id: "aws",           name: "AWS",             category: "devops" },
  { id: "gcp",           name: "Google Cloud",    category: "devops" },
  { id: "azure",         name: "Azure",           category: "devops" },
  { id: "kubernetes",    name: "Kubernetes",      category: "devops" },
  { id: "cicd",          name: "CI/CD",           category: "devops" },

  { id: "figma",         name: "Figma",           category: "design" },
  { id: "photoshop",     name: "Adobe Photoshop", category: "design" },
  { id: "git",           name: "Git",             category: "design" },
  { id: "github",        name: "GitHub",          category: "design" },
  { id: "postman",       name: "Postman",         category: "design" },
];