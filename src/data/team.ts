export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    role: "Founder & Performance Director",
    image: "/images/team/marcus-vance.png",
  },
  {
    id: "sarah-connor",
    name: "Sarah Connor",
    role: "Lead Sublimation Engineer",
    image: "/images/team/sarah-connor.png",
  },
  {
    id: "dave-miller",
    name: "Dave Miller",
    role: "Elite Embroidery Specialist",
    image: "/images/team/dave-miller.png",
  },
];

export interface AboutStat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  /** The third stat is rendered in brand green on the source site. */
  accent?: boolean;
}

export const aboutStats: AboutStat[] = [
  { id: "teams-outfitted", label: "TEAMS OUTFITTED", value: 500, suffix: "+" },
  { id: "athletic-expertise", label: "ATHLETIC EXPERTISE", value: 10, suffix: "+ Years" },
  { id: "custom-engineered", label: "CUSTOM ENGINEERED", value: 100, suffix: "%", accent: true },
  { id: "sports-supported", label: "SPORTS SUPPORTED", value: 15, suffix: "+" },
];
