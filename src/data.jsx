// Portfolio content — from CV

const PROFILE = {
  name: "Younes Essafouri",
  role: "PhD Student",
  lab: "Institut de Mathématiques de Toulouse",
  tag: "Explainable AI for weather forecasting.",
  location: "Toulouse, France",
  email: "younes.essafouri@math.univ-toulouse.fr",
  links: [
    { label: "Google Scholar", href: "https://scholar.google.com/citations?user=xJJI31wAAAAJ&hl=fr" },
    { label: "ORCID", href: "https://orcid.org/0009-0005-9830-409X" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/younes-essafouri/" },
    { label: "GitHub", href: "https://github.com/YounesEssafouri" },
    { label: "CV · PDF", href: "assets/YounesEssafouri_CV.pdf" },
  ],
};

const BIO = [
  "I'm a PhD student at the Institut de Mathématiques de Toulouse, working on explainable AI for numerical weather prediction. My research asks a simple-sounding question: when a deep learning model forecasts the weather, can we understand why — and is its reasoning physically plausible?",
  "Before the PhD I studied at Grenoble INP — Ensimag and spent a semester at KTH in Stockholm. I've worked on physics-informed machine learning for cardiac modelling at Dassault Systèmes, neural operators for the Kuramoto–Sivashinsky equations at the Hubert Curien laboratory, and a handful of smaller projects that sit between mathematics and code.",
];

const EDUCATION = [
  {
    year: "2025 — 2028",
    degree: "PhD in Explainable AI for Weather Forecasting",
    where: "Institut de Mathématiques de Toulouse (IMT)",
    note: "",
  },
  {
    year: "2024 — 2025",
    degree: "Exchange program in Machine Learning",
    where: "KTH Royal Institute of Technology, Stockholm",
    note: "Aug 2024 – Jan 2025",
  },
  {
    year: "2022 — 2025",
    degree: "Engineer's degree, Computer Science & Applied Mathematics",
    where: "Grenoble INP — Ensimag, UGA",
    note: "",
  },
  {
    year: "2020 — 2022",
    degree: "Classes préparatoires (MP)",
    where: "Entrance exams, Grandes Écoles",
    note: "",
  },
];

const PROJECTS = [
  {
    id: "01",
    title: "Explaining Neural Weather Models",
    sub: "Gradient-based attributions for deep forecasters",
    year: "2025 — present",
    desc: "PhD research: a framework that interrogates deep forecasting models by tracing the influence of input fields (geopotential, humidity, wind) onto predicted variables. The goal is to separate real physical reasoning from spurious correlations, and to make the results legible to operational meteorologists.",
    tags: ["XAI", "PyTorch", "ERA5", "Attribution"],
    status: "Active",
  },
  {
    id: "02",
    title: "Physics-Informed ML for Cardiac Modelling",
    sub: "Research internship at Dassault Systèmes",
    year: "Feb — Aug 2025",
    desc: "Investigated physics-informed machine learning methods for cardiac physics modelling, combining differential-equation priors with data-driven surrogates.",
    tags: ["PINN", "Cardiac", "Simulation"],
    status: "Completed",
  },
  {
    id: "03",
    title: "Neural Operators for Kuramoto–Sivashinsky",
    sub: "Hubert Curien laboratory",
    year: "Jun — Aug 2024",
    desc: "Developed physics-informed neural networks as surrogates for expensive numerical solvers of the Kuramoto–Sivashinsky equations, and explored Fourier Neural Operators (FNOs) for efficient spatial–temporal modelling on continuous domains.",
    tags: ["PINN", "FNO", "PDE"],
    status: "Completed",
  },
  {
    id: "04",
    title: "Embedded Topic Modelling",
    sub: "Reproducing Dieng et al. (ICML 2019)",
    year: "Nov — Dec 2024",
    desc: "Implemented the Embedded Topic Model from scratch and ran a comparative analysis against Latent Dirichlet Allocation on the 20 Newsgroups dataset, evaluating interpretability and topic coherence.",
    tags: ["NLP", "PyTorch", "Topic Models"],
    status: "Completed",
  },
  {
    id: "05",
    title: "Neural Networks for Finance PDEs",
    sub: "Black–Scholes via the Feynman–Kac method",
    year: "Feb — May 2024",
    desc: "Used neural networks and the Feynman–Kac method to numerically solve the Black–Scholes equation and price call options, exploring how deep learning can stand in for classical PDE solvers.",
    tags: ["PDE", "Finance", "TensorFlow"],
    status: "Completed",
  },
  {
    id: "06",
    title: "Deca Compiler & Math Library",
    sub: "Software engineering project",
    year: "Dec 2023 — Jan 2024",
    desc: "A Java-based compiler for Deca, an object-oriented sub-language of Java, together with a small math library for accurate trigonometric functions written in Deca.",
    tags: ["Java", "ANTLR", "Compilers"],
    status: "Completed",
  },
];

const PUBLICATIONS = [
  {
    year: "2026",
    authors: "Essafouri, Y., Seznec, C., Drozda, L., Raynaud, L., Risser, L.",
    title: "A Framework for Explainable AI in Weather Forecasting: Diagnosing Deep Learning Models via Gradient-Based Attributions",
    venue: "EGU General Assembly 2026, Vienna, Austria — EGU26-4039",
    type: "Conference",
    doi: "10.5194/egusphere-egu26-4039",
    href: "https://doi.org/10.5194/egusphere-egu26-4039",
  },
];

const TALKS = [
  { year: "May 2026", what: "A Framework for Explainable AI in Weather Forecasting", where: "EGU General Assembly, Vienna", kind: "Talk" },
];

// Real teaching — TPs taught at Université Paul Sabatier / IMT doctoral context
const TEACHING = [
  {
    year: "2025 — 26",
    what: "Modèle Linéaire",
    where: "Travaux pratiques — Université Paul Sabatier",
    role: "TP",
    desc: "Hands-on sessions on linear models: least squares, diagnostics, and inference, in R.",
  },
  {
    year: "2025 — 26",
    what: "Statistique Inférentielle",
    where: "Travaux pratiques — Université Paul Sabatier",
    role: "TP",
    desc: "Practical sessions on estimation, hypothesis testing, and confidence intervals.",
  },
];

const SKILLS = {
  languages: ["Python", "C / C++", "Java", "SQL", "R", "LaTeX"],
  libraries: ["PyTorch", "PyG", "TensorFlow", "Pandas", "NumPy", "Scikit-learn", "Matplotlib", "Seaborn"],
  tools: ["Git", "Unix shell", "Jupyter", "VS Code", "RStudio", "IntelliJ IDEA", "PyCharm", "CLion"],
  spoken: ["Arabic (native)", "English (professional)", "French (professional)"],
};

const WRITING = [];

const READING = [
  { title: "East of Eden", author: "John Steinbeck", state: "reading" },
  { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", state: "loved" },
  { title: "Narcissus and Goldmund", author: "Hermann Hesse", state: "loved" },
  { title: "No Longer Human", author: "Osamu Dazai", state: "loved" },
];

const LISTENING = [
  "The Beatles", "The Doors", "Fleetwood Mac", "Bob Dylan",
  "Leonard Cohen", "Nick Drake", "Joni Mitchell",
];

Object.assign(window, { PROFILE, BIO, EDUCATION, PROJECTS, PUBLICATIONS, TALKS, TEACHING, SKILLS, WRITING, READING, LISTENING });
