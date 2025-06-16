
export interface Chapter {
  id: number;
  name: string;
}

export interface SubjectData {
  [key: string]: Chapter[];
}

export const SUBJECTS: SubjectData = {
  physics: [
    { id: 1, name: "Physical World" },
    { id: 2, name: "Units and Measurements" },
    { id: 3, name: "Motion in a Straight Line" },
    { id: 4, name: "Motion in a Plane" },
    { id: 5, name: "Laws of Motion" },
    { id: 6, name: "Work, Energy and Power" },
    { id: 7, name: "System of Particles and Rotational Motion" },
    { id: 8, name: "Gravitation" },
    { id: 9, name: "Mechanical Properties of Solids" },
    { id: 10, name: "Mechanical Properties of Fluids" },
    { id: 11, name: "Thermal Properties of Matter" },
    { id: 12, name: "Thermodynamics" },
    { id: 13, name: "Kinetic Theory" },
    { id: 14, name: "Oscillations" },
    { id: 15, name: "Waves" },
    { id: 16, name: "Electric Charges and Fields" },
    { id: 17, name: "Electrostatic Potential and Capacitance" },
    { id: 18, name: "Current Electricity" },
    { id: 19, name: "Moving Charges and Magnetism" },
    { id: 20, name: "Magnetism and Matter" },
    { id: 21, name: "Electromagnetic Induction" },
    { id: 22, name: "Alternating Current" },
    { id: 23, name: "Electromagnetic Waves" },
    { id: 24, name: "Ray Optics and Optical Instruments" },
    { id: 25, name: "Wave Optics" },
    { id: 26, name: "Dual Nature of Radiation and Matter" },
    { id: 27, name: "Atoms" },
    { id: 28, name: "Nuclei" },
    { id: 29, name: "Semiconductor Electronics: Materials, Devices and Simple Circuits" }
  ],
  chemistry: [
    { id: 1, name: "Some Basic Concepts of Chemistry" },
    { id: 2, name: "Structure of Atom" },
    { id: 3, name: "Classification of Elements and Periodicity in Properties" },
    { id: 4, name: "Chemical Bonding and Molecular Structure" },
    { id: 5, name: "States of Matter" },
    { id: 6, name: "Thermodynamics" },
    { id: 7, name: "Equilibrium" },
    { id: 8, name: "Redox Reactions" },
    { id: 9, name: "Hydrogen" },
    { id: 10, name: "The s-Block Elements" },
    { id: 11, name: "The p-Block Elements (Group 13 and 14)" },
    { id: 12, name: "Organic Chemistry – Some Basic Principles and Techniques" },
    { id: 13, name: "Hydrocarbons" },
    { id: 14, name: "Environmental Chemistry" },
    { id: 15, name: "The Solid State" },
    { id: 16, name: "Solutions" },
    { id: 17, name: "Electrochemistry" },
    { id: 18, name: "Chemical Kinetics" },
    { id: 19, name: "Surface Chemistry" },
    { id: 20, name: "General Principles and Processes of Isolation of Elements" },
    { id: 21, name: "The p-Block Elements (Group 15 to 18)" },
    { id: 22, name: "The d- and f-Block Elements" },
    { id: 23, name: "Coordination Compounds" },
    { id: 24, name: "Haloalkanes and Haloarenes" },
    { id: 25, name: "Alcohols, Phenols and Ethers" },
    { id: 26, name: "Aldehydes, Ketones and Carboxylic Acids" },
    { id: 27, name: "Amines" },
    { id: 28, name: "Biomolecules" },
    { id: 29, name: "Polymers" },
    { id: 30, name: "Chemistry in Everyday Life" }
  ],
  mathematics: [
    { id: 1, name: "Sets" },
    { id: 2, name: "Relations and Functions" },
    { id: 3, name: "Trigonometric Functions" },
    { id: 4, name: "Principle of Mathematical Induction" },
    { id: 5, name: "Complex Numbers" },
    { id: 6, name: "Quadratic Equations" },
    { id: 7, name: "Linear Inequalities" },
    { id: 8, name: "Permutations and Combinations" },
    { id: 9, name: "Binomial Theorem" },
    { id: 10, name: "Sequences and Series" },
    { id: 11, name: "Straight Lines" },
    { id: 12, name: "Conic Sections" },
    { id: 13, name: "Introduction to Three Dimensional Geometry" },
    { id: 14, name: "Limits and Derivatives" },
    { id: 15, name: "Mathematical Reasoning" },
    { id: 16, name: "Statistics" },
    { id: 17, name: "Probability" },
    { id: 18, name: "Relations and Functions" },
    { id: 19, name: "Inverse Trigonometric Functions" },
    { id: 20, name: "Matrices" },
    { id: 21, name: "Determinants" },
    { id: 22, name: "Continuity and Differentiability" },
    { id: 23, name: "Application of Derivatives" },
    { id: 24, name: "Integrals" },
    { id: 25, name: "Application of Integrals" },
    { id: 26, name: "Differential Equations" },
    { id: 27, name: "Vector Algebra" },
    { id: 28, name: "Three Dimensional Geometry" },
    { id: 29, name: "Linear Programming" },
    { id: 30, name: "Probability" }
  ]
};

export const SUBJECT_NAMES = {
  physics: "Physics",
  chemistry: "Chemistry", 
  mathematics: "Mathematics"
};

export const SUBJECT_COLORS = {
  physics: "bg-red-100 text-red-800 border-red-200",
  chemistry: "bg-green-100 text-green-800 border-green-200",
  mathematics: "bg-blue-100 text-blue-800 border-blue-200"
};
