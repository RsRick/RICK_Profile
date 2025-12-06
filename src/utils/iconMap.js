import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Code,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  ExternalLink,
} from 'lucide-react';

export const iconMap = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  mapPin: MapPin,
  code: Code,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  globe: Globe,
  externalLink: ExternalLink,
};

export const getIcon = (iconName) => {
  return iconMap[iconName] || Globe;
};


