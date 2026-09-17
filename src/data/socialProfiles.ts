export interface SocialProfile {
  id: 'facebook' | 'instagram' | 'linkedin' | 'gmail';
  name: string;
  url: string;
}

export const SOCIAL_PROFILES: SocialProfile[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://facebook.com/smileyminhaj',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://instagram.com/smileyminhaj',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/smileyminhaj',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    url: 'mailto:smileyminhaj@gmail.com',
  },
];
