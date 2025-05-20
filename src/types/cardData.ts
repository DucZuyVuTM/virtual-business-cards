export interface CardData {
  name: string;
  title: string;
  organization: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  positions: {
    group1: { x: number; y: number };
    group2: { x: number; y: number };
    group3: { x: number; y: number };
    logo: { x: number; y: number };
  };
}