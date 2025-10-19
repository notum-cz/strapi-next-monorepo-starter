const fs = require('fs');
const path = require('path');

// Load the stations configuration from the v0-leonradio repository
const stationsConfig = {
  mixfm: {
    id: "mixfm",
    name: "MixFM",
    genre: "Pop",
    description: "The hottest pop hits and chart-toppers, 24/7",
    color: "#0284c7", // blue-600
    bgClass: "bg-blue-600",
    streamUrl: "https://azura.typicalmedia.net/listen/mixfm/radio.mp3",
    apiUrl: "https://azura.typicalmedia.net/api/nowplaying/mixfm",
    logoUrl: "https://itsdefnotleon.neocities.org/image-removebg-preview%20(1).png",
    backgroundUrl: "https://itsdefnotleon.neocities.org/Untitled%20design%20(6).png",
  },
  "mixfm-fresh": {
    id: "mixfm-fresh",
    name: "MixFM Fresh",
    genre: "Fresh Hits",
    description: "The newest releases and fresh discoveries",
    color: "#86efac", // green-300
    bgClass: "bg-green-300",
    streamUrl: "https://azura.typicalmedia.net/listen/fresh/radio.mp3",
    apiUrl: "https://azura.typicalmedia.net/api/nowplaying/fresh",
    logoUrl: "https://itsdefnotleon.neocities.org/Untitled%20design%20(23)%20(1).png",
    backgroundUrl: "https://framerusercontent.com/images/byJQ5rcsaGGvKgvhii2X9tgKW4.png",
  },
  "power-hit": {
    id: "power-hit",
    name: "Power Hit Radio",
    genre: "Hits",
    description: "Hits Non Stop - Your ultimate destination for non-stop hit music",
    color: "#dc2626", // red-600
    bgClass: "bg-red-600",
    streamUrl: "https://cdnstream1.typicalmedia.net/powerhits",
    apiUrl: "https://azura.typicalmedia.net/api/nowplaying/powerhitradio",
    logoUrl: "https://framerusercontent.com/images/wxVwutZaQjcsPdIrE8bm3EjAB0.png?scale-down-to=512",
    backgroundUrl: "/images/power-hit-background.png",
  },
  "radio-pride": {
    id: "radio-pride",
    name: "Trendy Radio",
    genre: "Trendy",
    description: "The hottest trends and latest hits that everyone's talking about",
    color: "#16a34a", // green-600
    bgClass: "bg-green-600",
    streamUrl: "https://cdnstream1.typicalmedia.net/trendy",
    apiUrl: "https://azura.typicalmedia.net/api/nowplaying/trendy",
    logoUrl: "https://itsdefnotleon.neocities.org/image__1_-removebg-preview.png",
    backgroundUrl: "https://itsdefnotleon.neocities.org/Sonic_cleanup%20(1).jpg",
  },
  hit10s: {
    id: "hit10s",
    name: "Hit10s",
    genre: "2010s",
    description: "The biggest hits from the 2010s decade",
    color: "#7c3aed", // violet-600
    bgClass: "bg-violet-600",
    streamUrl: "https://azura.typicalmedia.net/listen/hit10s/live",
    apiUrl: "https://azura.typicalmedia.net/api/nowplaying/hit10s",
    logoUrl: "https://itsdefnotleon.neocities.org/10's%20(1)%20(1).png",
    backgroundUrl: "https://itsdefnotleon.neocities.org/background.1750505316.png",
  },
  "kiss-957": {
    id: "kiss-957",
    name: "KISS 95.7 (Affiliate)",
    genre: "Top 40",
    description: "Your favorite hits and today's hottest music - affiliate station",
    color: "#f59e0b", // amber-500
    bgClass: "bg-amber-500",
    streamUrl: "https://azura.typicalmedia.net/listen/kiss_95-7/radio.mp3",
    apiUrl: "https://azura.typicalmedia.net/api/nowplaying/kiss_95-7",
    logoUrl: "https://kiss.olivereverest.xyz/kisslogocropped.png",
    backgroundUrl: "https://itsdefnotleon.neocities.org/Untitled%20design%20(95).png",
  },
  xmas: {
    id: "xmas",
    name: "Xmas Radio",
    genre: "Christmas",
    description: "Your favorite Christmas songs and holiday classics all season long",
    color: "#dc2626", // red-600 (Christmas red)
    bgClass: "bg-red-600",
    streamUrl: "https://azura.typicalmedia.net/listen/xmas/radio.mp3",
    apiUrl: "https://azura.typicalmedia.net/api/nowplaying/xmas",
    logoUrl: "/images/xmas-radio-logo.png",
    backgroundUrl: "/images/xmas-radio-background.png",
  },
};

// Team members data
const teamMembers = [
  {
    name: "Leon",
    role: "Founder & CEO",
    bio: "Visionary behind TRAILMIXX FM, passionate about bringing great music to the world.",
    avatar: null,
    order: 1
  },
  {
    name: "Music Team",
    role: "Curators & DJs",
    bio: "Our talented team of music experts who carefully select every track we play.",
    avatar: null,
    order: 2
  },
  {
    name: "Tech Team",
    role: "Engineers & Developers",
    bio: "The technical wizards who keep our streams running smoothly 24/7.",
    avatar: null,
    order: 3
  }
];

// About page content
const aboutPageContent = {
  title: "About TRAILMIXX FM",
  subtitle: "Your Music, Your Way",
  description: "Broadcasting the best music across multiple stations, bringing you the soundtrack to your life with carefully curated playlists and the latest hits.",
  mission: {
    title: "Our Mission",
    content: "To provide high-quality music streaming across diverse genres, connecting listeners with the music they love and discovering new favorites."
  },
  community: {
    title: "Our Community",
    content: "Building a vibrant community of music lovers who share their passion for discovering and enjoying great music together."
  },
  passion: {
    title: "Our Passion",
    content: "Music is our passion. We carefully curate every playlist and ensure the highest quality streaming experience for our listeners."
  },
  story: {
    title: "The TRAILMIXX FM Story",
    content: "TRAILMIXX FM was founded with a simple vision: to create a radio network that truly understands music lovers. We believe that great music has the power to bring people together, inspire creativity, and soundtrack life's most important moments.\n\nOur network operates four distinct stations, each with its own personality and carefully curated music selection. From the latest pop hits to fresh discoveries, from powerful rock anthems to trending electronic beats, we have something for every musical taste.\n\nWhat sets us apart is our commitment to quality and our understanding that music is personal. Our team of music enthusiasts works around the clock to ensure that every song we play meets our high standards and resonates with our listeners."
  },
  stats: [
    { value: "4", label: "Radio Stations" },
    { value: "24/7", label: "Live Streaming" },
    { value: "1000+", label: "Songs Daily" },
    { value: "∞", label: "Music Love" }
  ]
};

// Navigation menu items
const navigationMenu = [
  { title: "Home", url: "/", order: 1 },
  { title: "Radio Stations", url: "/stations", order: 2 },
  { title: "About", url: "/about", order: 3 }
];

// Footer content
const footerContent = {
  copyright: "© 2024 TRAILMIXX FM. All rights reserved.",
  description: "Broadcasting the best music across multiple stations. Your soundtrack to life.",
  stations: [
    "MixFM - Top 40 Hits",
    "MixFM Fresh - Latest Releases",
    "Power Hit Radio - Rock & Alternative",
    "Trendy Radio - Electronic & Dance"
  ],
  links: [
    { title: "About Us", url: "/about" },
    { title: "Contact", url: "#" },
    { title: "Advertise", url: "#" },
    { title: "Support", url: "#" }
  ]
};

// Contact information
const contactInfo = {
  email: "hello@trailmixxfm.com",
  phone: "+1 (555) 123-TRAIL",
  address: "Music City, Worldwide"
};

// Quick links
const quickLinks = [
  { title: "Home", url: "/" },
  { title: "MixFM", url: "/station/mixfm" },
  { title: "MixFM Fresh", url: "/station/mixfm-fresh" },
  { title: "Power Hit Radio", url: "/station/power-hit" },
  { title: "Trendy Radio", url: "/station/trendy" },
  { title: "Support", url: "#" }
];

async function seedData() {
  console.log('Seeding v0-leonradio data...');
  
  // In a real implementation, this would connect to Strapi and create entries
  // For now, we'll just log what would be created
  
  console.log('\n--- Radio Stations ---');
  Object.values(stationsConfig).forEach(station => {
    console.log(`Creating station: ${station.name}`);
    console.log(`  Genre: ${station.genre}`);
    console.log(`  Description: ${station.description}`);
    console.log(`  Stream URL: ${station.streamUrl}`);
    console.log('');
  });
  
  console.log('\n--- Team Members ---');
  teamMembers.forEach(member => {
    console.log(`Creating team member: ${member.name}`);
    console.log(`  Role: ${member.role}`);
    console.log(`  Bio: ${member.bio}`);
    console.log('');
  });
  
  console.log('\n--- About Page Content ---');
  console.log(`Title: ${aboutPageContent.title}`);
  console.log(`Subtitle: ${aboutPageContent.subtitle}`);
  console.log(`Description: ${aboutPageContent.description}`);
  console.log('');
  
  console.log('\n--- Navigation Menu ---');
  navigationMenu.forEach(item => {
    console.log(`Creating menu item: ${item.title} -> ${item.url}`);
  });
  
  console.log('\n--- Footer Content ---');
  console.log(`Copyright: ${footerContent.copyright}`);
  console.log(`Description: ${footerContent.description}`);
  console.log('Stations:');
  footerContent.stations.forEach(station => {
    console.log(`  - ${station}`);
  });
  console.log('Links:');
  footerContent.links.forEach(link => {
    console.log(`  - ${link.title}: ${link.url}`);
  });
  
  console.log('\n--- Contact Information ---');
  console.log(`Email: ${contactInfo.email}`);
  console.log(`Phone: ${contactInfo.phone}`);
  console.log(`Address: ${contactInfo.address}`);
  
  console.log('\n--- Quick Links ---');
  quickLinks.forEach(link => {
    console.log(`  - ${link.title}: ${link.url}`);
  });
  
  console.log('\nData seeding completed!');
}

// Run the seed function
seedData().catch(error => {
  console.error('Error seeding data:', error);
});
