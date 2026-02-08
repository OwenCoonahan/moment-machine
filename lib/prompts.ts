// Prompt templates for content generation

export type EventType = 
  | 'touchdown'
  | 'fumble'
  | 'interception'
  | 'fieldgoal'
  | 'halftime'
  | 'bigplay'
  | 'injury'
  | 'celebration'
  | 'turnover'
  | 'generic';

export type ContentFormat = 
  | 'marketing'
  | 'meme'
  | 'story'
  | 'square'
  | 'reaction';

export interface BrandContext {
  name: string;
  industry?: string;
  colors?: string[];
  tagline?: string;
  products?: string[];
}

export interface EventContext {
  type: EventType;
  description: string;
  team?: string;
  player?: string;
  score?: string;
}

// Event-specific prompts
const eventPrompts: Record<EventType, string> = {
  touchdown: "Epic touchdown celebration, crowd going wild, confetti flying, victory moment, high energy sports photography",
  fumble: "Dramatic fumble moment, ball loose on the field, players diving, intense action shot, sports photography",
  interception: "Game-changing interception, defender triumphant with ball, dramatic lighting, peak action moment",
  fieldgoal: "Field goal splitting the uprights, perfect kick trajectory, stadium lights, clutch moment",
  halftime: "Halftime entertainment vibes, stadium lights, show atmosphere, spectacular performance",
  bigplay: "Incredible athletic play, superhuman catch or run, crowd amazement, highlight reel moment",
  injury: "Team solidarity, players gathered together, supportive atmosphere, respectful moment",
  celebration: "Team celebration, joy and excitement, championship vibes, confetti and lights",
  turnover: "Momentum shift moment, dramatic play, intense action, game-changing energy",
  generic: "Exciting game day atmosphere, stadium energy, passionate fans, sports excitement"
};

// Content format templates
const formatTemplates: Record<ContentFormat, string> = {
  marketing: "Professional marketing content, clean design, polished aesthetic, brand-forward, advertisement quality, commercial photography style",
  meme: "Viral meme format, funny and relatable, internet culture style, shareable content, bold text overlay space, comedic timing",
  story: "Vertical story format, eye-catching, Instagram/TikTok style, dynamic and engaging, scroll-stopping content, 9:16 aspect ratio optimized",
  square: "Perfect square composition, social media ready, Instagram grid aesthetic, balanced layout, high engagement format",
  reaction: "Reaction content style, expressive faces, emotional moment, relatable vibes, comment-worthy"
};

// Brand integration prompts
function getBrandPrompt(brand: BrandContext): string {
  const parts: string[] = [];
  
  if (brand.name) {
    parts.push(`for ${brand.name}`);
  }
  
  if (brand.industry) {
    parts.push(`(${brand.industry} brand)`);
  }
  
  if (brand.colors && brand.colors.length > 0) {
    parts.push(`featuring ${brand.colors.join(' and ')} color scheme`);
  }
  
  if (brand.products && brand.products.length > 0) {
    parts.push(`subtly incorporating ${brand.products[0]}`);
  }
  
  return parts.join(' ');
}

// Main prompt builder
export function buildPrompt(
  event: EventContext,
  format: ContentFormat,
  brand?: BrandContext,
  customPrompt?: string
): string {
  const parts: string[] = [];
  
  // Start with custom prompt if provided
  if (customPrompt) {
    parts.push(customPrompt);
  }
  
  // Add event context
  parts.push(eventPrompts[event.type] || eventPrompts.generic);
  
  // Add event description
  if (event.description) {
    parts.push(`Scene: ${event.description}`);
  }
  
  // Add team/player context
  if (event.team) {
    parts.push(`Team: ${event.team}`);
  }
  if (event.player) {
    parts.push(`Featuring player like ${event.player}`);
  }
  
  // Add format styling
  parts.push(formatTemplates[format] || formatTemplates.marketing);
  
  // Add brand context
  if (brand) {
    parts.push(getBrandPrompt(brand));
  }
  
  // Quality enhancers
  parts.push("high quality, 4k, professional photography, vibrant colors, dynamic composition");
  
  return parts.join('. ');
}

// Pre-built prompt variations for nuke mode
export const nukePromptVariations = {
  touchdown: [
    "Touchdown celebration, football spiked on ground, player pointing to sky, stadium erupting",
    "End zone dance, pure joy, championship energy, confetti moment",
    "Score! Player sliding on knees, arms raised, crowd on their feet",
    "Victory touchdown, ball held high, teammates rushing to celebrate",
    "Game-winning score, dramatic lighting, ultimate triumph moment"
  ],
  fumble: [
    "Chaos on the field, ball bouncing free, players scrambling",
    "Turnover moment, defense creates opportunity, momentum shift",
    "Loose ball drama, game-changing fumble, intense action"
  ],
  halftime: [
    "Halftime show spectacular, lights and lasers, stadium entertainment",
    "Commercial break vibes, snack time, game day party atmosphere",
    "Mid-game energy, fans and food, social gathering moment"
  ],
  generic: [
    "Game day excitement, passionate fans, stadium atmosphere",
    "Big game energy, Sunday football vibes, community celebration",
    "Super Bowl party, friends watching together, memorable moment"
  ]
};

// Caption templates for social posts
export const captionTemplates = {
  touchdown: [
    "TOUCHDOWN! 🏈🔥 {brand} is celebrating with you!",
    "SCORE! Nothing hits different like a TD and {brand} 💪",
    "That's 6 points and 6 reasons to grab {brand} right now 🎉",
    "TD ENERGY! {brand} keeping up with the big plays 🏆"
  ],
  fumble: [
    "Did you SEE that?! 😱 {brand} keeping it exciting!",
    "Turnover time! Things just got interesting 👀 - {brand}",
    "The drama! {brand} is here for every twist 🎬"
  ],
  halftime: [
    "Halftime = {brand} time! 🙌",
    "Quick break to grab some {brand} before the second half!",
    "Refuel with {brand} - we're only halfway there! ⚡"
  ],
  generic: [
    "Game day is {brand} day! 🏈",
    "Watching the game with {brand} hits different 💯",
    "{brand} x Super Bowl - name a better duo 🤝"
  ]
};

// Get a random caption for event type
export function getRandomCaption(eventType: EventType, brandName: string): string {
  const templates = captionTemplates[eventType as keyof typeof captionTemplates] || captionTemplates.generic;
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace('{brand}', brandName);
}

// Get platform-specific formatting
export function getPlatformFormat(platform: string): { aspectRatio: string; size: string } {
  switch (platform) {
    case 'instagram-story':
    case 'tiktok':
      return { aspectRatio: '9:16', size: 'portrait_16_9' };
    case 'instagram-post':
      return { aspectRatio: '1:1', size: 'square_hd' };
    case 'twitter':
    case 'facebook':
      return { aspectRatio: '16:9', size: 'landscape_16_9' };
    default:
      return { aspectRatio: '1:1', size: 'square_hd' };
  }
}
