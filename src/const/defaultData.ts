import { CardData } from "../types/cardData";
import { v4 as uuidv4 } from 'uuid';

export const defaultData: CardData = {
  id: uuidv4(),
  name: 'John Doe',
  title: 'Position',
  organization: 'Organization',
  location: 'City, State',
  phone: '(123) 555-1234',
  email: 'john.doe@email.com',
  website: 'www.john-doe.com',
  positions: {
    group1: { x: 0, y: 0 },
    group2: { x: 0, y: 0 },
    group3: { x: 0, y: 0 },
    logo: { x: 0, y: 0 },
  },
  backgroundImage: null,
  logoImage: null,
};