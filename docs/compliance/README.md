# Trail Mixx Compliance & Licensing

## Overview
Trail Mixx operates as a non-interactive internet radio station, streaming music to listeners without user-controlled playlists or on-demand features. This document outlines the legal and compliance requirements for operating such a service in the United States.

## Music Licensing Requirements

### SoundExchange (Statutory License)
**Sections 112 & 114 of the Copyright Act**

Trail Mixx MUST obtain a statutory license from SoundExchange to:
- Publicly perform sound recordings over the internet
- Make ephemeral copies for streaming purposes

**Requirements:**
- Register with SoundExchange: https://www.soundexchange.com/
- Pay per-performance royalties based on aggregate tuning hours (ATH)
- File monthly reports of usage (plays.csv data)
- Display "Report of Use" with artist, title, album, label, ISRC

**Rate Structure (2023-2027):**
- Per-performance fee varies by ATH
- Annual minimum fee: ~$500 for small webcasters
- Reporting due by 45 days after month end

**Non-Interactive Requirements:**
- No more than 3 tracks from same album in 3-hour period
- No more than 4 tracks from same artist/compilation in 3-hour period
- No advance playlist publication
- No user-controllable playlists

### ASCAP, BMI, SESAC (Performance Rights)
**Musical Composition Copyrights**

Trail Mixx MUST obtain licenses from all three PROs (Performance Rights Organizations) to publicly perform musical compositions (the underlying songs, not recordings).

**ASCAP (American Society of Composers, Authors, and Publishers)**
- License type: Internet Radio License
- Website: https://www.ascap.com/
- Fees: Based on gross revenue or flat annual fee (~$300-500 for small stations)

**BMI (Broadcast Music, Inc.)**
- License type: Internet Music Performance Agreement
- Website: https://www.bmi.com/
- Fees: Similar to ASCAP, revenue-based or flat fee

**SESAC (Society of European Stage Authors and Composers)**
- License type: Internet Streaming License
- Website: https://www.sesac.com/
- Fees: Negotiated case-by-case

**Compliance:**
- Obtain all three licenses (songs may be registered with any PRO)
- Pay annual fees
- Submit usage reports if required
- Display PRO affiliations for played songs

### GMR (Global Music Rights)
**Emerging PRO**

GMR represents a smaller catalog but includes some major artists. Consider licensing if playing GMR-affiliated artists.

## State and Local Compliance

### Washington State (RCW - Revised Code of Washington)
Trail Mixx is based in Seattle/Washington. Relevant state laws:

**Business Registration:**
- Register business with WA Secretary of State
- Obtain business license from local jurisdiction
- File annual reports

**Sales Tax:**
- Collect B&O tax on advertising revenue
- File quarterly tax returns with WA DOR

**Employment:**
- Follow WA minimum wage laws for any employees
- Comply with WA labor laws (breaks, overtime, etc.)

### FCC Regulations
**Note:** Internet-only stations are NOT regulated by the FCC like traditional broadcast radio. However:

- Cannot use "KXXX" or "WXXX" call signs (reserved for licensed broadcasters)
- If using streaming technology that mimics broadcast, consult FCC rules
- Political advertising rules do NOT apply to internet-only stations

## Content Standards

### Community Standards
Trail Mixx voluntarily adheres to broadcast-style content standards:

**Prohibited Content:**
- Obscene or indecent material during daytime hours
- Hate speech or discriminatory content
- Copyright-infringing material
- Content promoting illegal activities

**Encouraged Content:**
- Local and emerging artists
- Nonprofit and community organizations
- BIPOC and underrepresented voices
- Educational and cultural programming

### Advertising Standards
- Clearly distinguish ads from content
- No false or misleading claims
- Disclose sponsored content
- Respect FTC guidelines for endorsements

## Data Privacy & Security

### User Data Protection
- Comply with GDPR if serving EU listeners
- Provide privacy policy and terms of service
- Secure listener data (minimal collection recommended)
- Cookie consent for analytics

### COPPA (Children's Online Privacy Protection Act)
- Do not knowingly collect data from children under 13
- If children's programming, implement COPPA safeguards

## Accessibility

### ADA (Americans with Disabilities Act)
- Website must be accessible (WCAG 2.1 AA)
- Player controls must be keyboard-navigable
- Provide transcripts for spoken content
- Audio descriptions for visual content (if applicable)

## Reporting & Record-Keeping

### Required Records
**SoundExchange Reports:**
- Track title, artist, album, label
- ISRC code (if available)
- Play date and time
- Duration

**PRO Reports (if required):**
- Similar to SoundExchange
- May be less detailed depending on license

**Financial Records:**
- Revenue (ads, sponsorships, donations)
- Royalty payments
- Operating expenses
- Tax filings (7 years)

### Data Location
- `services/stream/out/plays.csv` - Track plays log
- `services/stream/out/ads.csv` - Advertisement plays log
- Strapi CMS - Content metadata and track information

## Liability & Insurance

### Recommended Insurance
- **General Liability:** Covers bodily injury, property damage
- **Professional Liability:** Errors & omissions
- **Cyber Liability:** Data breach protection
- **Media Liability:** Copyright infringement defense

### Risk Mitigation
- Obtain all required licenses BEFORE launching
- Document licensing agreements and payments
- Implement content approval workflow
- Regular compliance audits
- Legal review of contracts and agreements

## International Considerations

### Streaming to Other Countries
If Trail Mixx has significant listenership outside the US:

**Canada:**
- SOCAN (like ASCAP/BMI)
- Re:Sound (like SoundExchange)

**UK:**
- PRS for Music (compositions)
- PPL (sound recordings)

**EU:**
- Multiple collection societies by country
- GDPR compliance required

**General:**
- Geographic restrictions may be necessary
- Per-country licensing can be expensive
- Consider limiting to US-only initially

## Penalties for Non-Compliance

### Copyright Infringement
- Statutory damages: $750-$30,000 per work
- Willful infringement: up to $150,000 per work
- Criminal penalties: up to 5 years prison for willful infringement

### Other Violations
- FTC fines for false advertising
- State penalties for tax non-compliance
- Contract damages for license violations

## Compliance Checklist

### Before Launch
- [ ] Register business entity
- [ ] Obtain SoundExchange license
- [ ] Obtain ASCAP license
- [ ] Obtain BMI license
- [ ] Obtain SESAC license
- [ ] Register for state/local taxes
- [ ] Create privacy policy and terms of service
- [ ] Implement data collection consent
- [ ] Verify all content is licensed or public domain
- [ ] Set up reporting systems (plays.csv, ads.csv)

### Ongoing (Monthly)
- [ ] File SoundExchange report (45 days after month)
- [ ] Pay royalties on time
- [ ] Archive logs and reports
- [ ] Review content for compliance
- [ ] Update privacy policy as needed

### Ongoing (Annually)
- [ ] Renew PRO licenses
- [ ] File annual business reports
- [ ] File tax returns
- [ ] Review insurance coverage
- [ ] Audit compliance procedures

## Resources & Contacts

### Licensing Organizations
- **SoundExchange:** https://www.soundexchange.com/ | (202) 640-5858
- **ASCAP:** https://www.ascap.com/ | (800) 952-7227
- **BMI:** https://www.bmi.com/ | (888) 689-5264
- **SESAC:** https://www.sesac.com/ | (615) 320-0055

### Legal Resources
- **Copyright Office:** https://www.copyright.gov/
- **FTC:** https://www.ftc.gov/
- **WA Secretary of State:** https://www.sos.wa.gov/

### Recommended Legal Counsel
- Entertainment attorney with music licensing experience
- Business attorney for entity formation and contracts

## Disclaimer

**This document is for informational purposes only and does not constitute legal advice.** Trail Mixx operators should consult with a qualified attorney specializing in music licensing and internet radio to ensure full compliance with all applicable laws and regulations.

Laws and rates change frequently. Verify current requirements before launching and operating the station.

---

**Last Updated:** 2024-01-01  
**Next Review:** 2024-06-01
