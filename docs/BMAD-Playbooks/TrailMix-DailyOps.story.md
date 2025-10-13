# Trail Mixx Daily Operations Playbook

## Morning Startup (6:00 AM)

### Pre-Flight Checklist
- [ ] Verify stream is live (`GET /healthz` on stream service)
- [ ] Check overnight logs for errors
- [ ] Confirm HLS origin connectivity
- [ ] Verify Strapi CMS is accessible
- [ ] Check plays.csv and ads.csv for overnight activity

### MixerAgent Configuration
```json
{
  "clock": "seattle-top-hour",
  "rotation": "morning-mix",
  "locale": "en",
  "startHour": 6
}
```

**Action:** Generate morning playlist and load into automation system

### Content Verification
- [ ] Today's featured local artists are published
- [ ] Nonprofit promos for the day are ready
- [ ] Merchant ads are current (not expired)
- [ ] Show metadata is updated

## Midday Operations (12:00 PM)

### Rotation Switch
Switch from `morning-mix` to `standard` rotation at noon.

### Analytics Check
Run analytics report for morning performance:
```bash
node agents/deepagents-runtime/auto-onboard.js call analytics-agent '{
  "timeRange": "today",
  "metrics": ["plays", "listeners", "localPercentage"]
}'
```

### Content Pipeline
- [ ] Review submissions from local artists
- [ ] Queue tracks for evening rotation
- [ ] Approve pending promo content
- [ ] Schedule social media posts

## Evening Transition (5:00 PM)

### Rotation Switch
Activate `evening-grooves` rotation for commute time.

### Live Show Prep (if applicable)
- [ ] Verify live DJ equipment
- [ ] Test backup stream source
- [ ] Confirm guest arrival (if interview scheduled)
- [ ] Prepare show notes and playlist

### Community Engagement
- [ ] Post "Now Playing" updates to social media
- [ ] Respond to listener messages
- [ ] Highlight featured local artist of the day
- [ ] Share upcoming events

## Evening Wrap (10:00 PM)

### Daily Reports
Generate end-of-day analytics:
```bash
curl http://localhost:3001/metrics
```

Review:
- Total plays
- Ad impressions
- Local content percentage
- Peak listening hours
- Error logs

### Next Day Prep
- [ ] Schedule morning content
- [ ] Prepare featured artist spotlight
- [ ] Queue nonprofit announcements
- [ ] Check weather/traffic for morning show

## Overnight Automation (10:00 PM - 6:00 AM)

### Rotation Configuration
```json
{
  "clock": "seattle-top-hour",
  "rotation": "weekend-special",
  "locale": "en",
  "autoRepeatPrevention": true
}
```

### Monitoring
- Automated health checks every 15 minutes
- Alert on stream failure
- Fallback MP3 activates if HLS fails
- Email/SMS alerts for critical issues

## Weekly Tasks (Monday Morning)

- [ ] Review weekly analytics dashboard
- [ ] Update rotation weights based on performance
- [ ] Archive old promo content
- [ ] Refresh merchant ad inventory
- [ ] Plan featured content for the week

## Emergency Procedures

### Stream Failure
1. Check HLS origin connectivity
2. Activate fallback MP3 stream
3. Contact stream provider
4. Update social media about technical difficulties
5. Log incident in ops log

### Content Issue (Inappropriate/Copyright)
1. Immediately skip track
2. Remove from rotation
3. Document incident
4. Review approval process
5. Update filter rules

### CMS Outage
1. Switch to pre-generated static playlists
2. Alert dev team
3. Use cached content
4. Monitor for recovery
5. Resume normal ops when CMS restored

## Contact List

- **Stream Provider:** [Provider Name] - [Phone/Email]
- **Strapi Admin:** [Admin Name] - [Phone/Email]
- **On-Call Dev:** [Dev Name] - [Phone/Email]
- **Community Manager:** [Manager Name] - [Phone/Email]

## Tools & Resources

- Stream Dashboard: http://localhost:3001/metrics
- Strapi Admin: http://localhost:1337/admin
- Agent Registry: `node agents/deepagents-runtime/auto-onboard.js list`
- Logs Location: `services/stream/out/`
