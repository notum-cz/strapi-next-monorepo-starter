# Trail Mixx Content Growth Playbook

## Mission
Build a sustainable, community-driven music platform that celebrates local artists, supports nonprofits, and serves BIPOC communities.

## Content Pillars

### 1. Local Artist Development
**Goal:** 30% of airtime dedicated to local and emerging artists

#### Discovery Pipeline
- [ ] Partner with local venues and music schools
- [ ] Create submission portal on website
- [ ] Monthly artist showcase events
- [ ] Social media discovery campaigns

#### Onboarding Process
1. Artist submits tracks via website form
2. CopyAgent generates artist bio and promo copy
3. Content team reviews for quality/appropriateness
4. Add to Strapi with `isLocal: true` and appropriate bin
5. Schedule debut during local artist hour
6. Social media announcement and artist interview

#### Success Metrics
- Tracks submitted per month
- Local artist retention (return submissions)
- Social media engagement on local artist posts
- Listener feedback and requests

### 2. Nonprofit Partnerships
**Goal:** Amplify community organizations and causes

#### Partnership Tiers

**Bronze (Free)**
- 2 promo spots per week
- Social media mentions
- Event calendar listing

**Silver (Trade)**
- 5 promo spots per week
- Recorded PSA production
- Featured on weekly nonprofit spotlight
- Cross-promotion on partner channels

**Gold (Sponsor)**
- Unlimited promo spots
- Custom programming block
- Live remote broadcasts
- VIP event passes

#### Activation Workflow
1. Nonprofit applies via website
2. Review mission alignment and community impact
3. Create promo content in Strapi (`kind: nonprofit`)
4. TTS-Polly agent generates voiceover if needed
5. Schedule in rotation via MixerAgent
6. Track impression metrics
7. Monthly impact report to partner

### 3. BIPOC Community Focus
**Goal:** Center and celebrate BIPOC artists and culture

#### Content Initiatives
- **BIPOC Artist Hour:** Weekly dedicated programming
- **Cultural Heritage Months:** Special rotation emphasis
- **Language Diversity:** Bilingual (EN/ES) content and DJ
- **Community Voices:** Interview series with BIPOC leaders

#### Representation Targets
- 40% of artists in rotation identify as BIPOC
- Monthly BIPOC-focused programming events
- Partnerships with cultural organizations
- Scholarship program for BIPOC DJs

### 4. Merchant Engagement
**Goal:** Support local businesses while funding operations

#### Merchant Tiers

**Starter ($200/month)**
- 10 ad spots per week
- Business listing on website
- Social media tag in related posts

**Business ($500/month)**
- 30 ad spots per week
- Featured merchant of the month
- Custom audio production
- Analytics dashboard access

**Champion ($1000/month)**
- Unlimited ad spots
- Show sponsorship
- Live event presenting sponsor
- Co-branded content series

#### Merchant Onboarding
1. Business inquiry via website
2. Schedule intro call (community benefits pitch)
3. Create merchant profile in Strapi
4. CopyAgent generates ad copy
5. Audio production session
6. Launch campaign with social media push
7. Monthly performance reports

## Growth Strategies

### Month 1-3: Foundation
- [ ] Launch with seed content (100 tracks, 10 artists, 5 nonprofits)
- [ ] Establish daily rotation and on-air sound
- [ ] Build social media presence
- [ ] Document processes and playbooks
- [ ] Recruit volunteer DJs and content team

### Month 4-6: Community Building
- [ ] Host first live event (listening party/artist showcase)
- [ ] Launch artist submission portal
- [ ] Onboard 5 nonprofit partners
- [ ] Secure 3 merchant sponsors
- [ ] Begin weekly live shows
- [ ] Implement listener feedback system

### Month 7-12: Scale and Sustainability
- [ ] Reach 50+ local artists in rotation
- [ ] 10+ active nonprofit partners
- [ ] 10+ merchant sponsors ($5k+ MRR)
- [ ] Monthly community events
- [ ] Launch mobile app
- [ ] Expand to second market or language

## Content Calendar Template

### Weekly
- **Monday:** Nonprofit Spotlight
- **Tuesday:** New Release Tuesday (emerging artists)
- **Wednesday:** BIPOC Artist Hour
- **Thursday:** Local Business Feature
- **Friday:** Weekend Preview / Event Promotion
- **Saturday:** Extended Sets / Guest DJ
- **Sunday:** Chill Vibes / Discovery

### Monthly
- First Friday: Live Local Artist Showcase
- Third Thursday: Nonprofit Mixer Event
- Last Sunday: Town Hall / Community Feedback

### Quarterly
- Q1: Winter Showcase
- Q2: Spring Fest (outdoor event)
- Q3: Summer Block Party
- Q4: Year in Review / Awards

## Content Sourcing

### Artist Recruitment Channels
1. Local venue partnerships
2. Music schools and colleges
3. Open mic nights and jam sessions
4. Social media (Instagram, TikTok, SoundCloud)
5. Artist collectives and co-ops
6. Cultural festivals and events

### Quality Standards
- [ ] Production quality (no lo-fi demos unless intentional)
- [ ] Lyrics appropriate for broadcast
- [ ] Copyright and licensing verified
- [ ] Artist consent and agreement signed
- [ ] Metadata complete (title, artist, album, year)

### Diversity Metrics
Track monthly:
- Genre distribution
- Gender representation
- BIPOC percentage
- Language diversity
- Local vs. non-local ratio
- Emerging vs. established artists

## Automation and AI Agents

### MixerAgent Usage
Generate playlist respecting diversity targets:
```json
{
  "clock": "seattle-top-hour",
  "rotation": "standard",
  "targets": {
    "localMinimum": 30,
    "bipocMinimum": 40,
    "genderParity": true,
    "genreDiversity": 5
  }
}
```

### CopyAgent Usage
Generate promotional content:
```json
{
  "type": "artist-bio",
  "artistName": "The Local Band",
  "genre": "Indie Rock",
  "locale": "en",
  "tone": "energetic"
}
```

### RAG Agent for Recommendations
Discover similar artists based on listener behavior:
```json
{
  "seedArtist": "Urban Echo",
  "context": "evening-grooves",
  "excludePlayed": "24hours",
  "localPreference": true
}
```

## Success Metrics Dashboard

### Content KPIs
- Local artist percentage (target: 30%)
- BIPOC artist percentage (target: 40%)
- Nonprofit promo fulfillment (target: 100%)
- Merchant ad delivery (target: 100%)
- Playlist diversity score (target: >8/10)

### Growth KPIs
- New artists onboarded per month
- Active nonprofit partnerships
- Merchant sponsors and MRR
- Social media followers and engagement
- Website visitors and submissions

### Community KPIs
- Event attendance
- Volunteer applications
- Artist and listener testimonials
- Media mentions
- Community impact stories

## Tools and Resources

- **Content Management:** Strapi CMS
- **Automation:** DeepAgents (Mixer, Copy, RAG)
- **Analytics:** Stream service metrics + Google Analytics
- **Communication:** Discord/Slack for community
- **Scheduling:** Google Calendar + custom scheduling agent
- **Asset Storage:** AWS S3 / Cloudflare R2

## Continuous Improvement

### Monthly Review
- Review analytics and adjust rotation
- Gather feedback from artists and listeners
- Update agent configurations
- Refresh content calendar
- Celebrate wins and learn from misses

### Quarterly Planning
- Set goals for next quarter
- Budget review and fundraising plan
- Major event planning
- Technology improvements
- Partnership development
