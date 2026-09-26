# LadderMath

Honest ladder safety math. Two tools:

**Check my setup** - enter the height where your ladder touches and how far the base sits from the wall. LadderMath computes the lean angle against the 4:1 rule (76 deg), bands it (too shallow / safe / too steep), and tells you exactly how far to move the base.

**Pick a ladder** - enter the height you need to work at. LadderMath subtracts your 1.7 m reach to get the standing height, applies the margins (top two steps of a step ladder and top three rungs of an extension are not steps), and picks the smallest consumer size that works - including the 1 m (3 rung) overhang required for roof access.

Static client-side app. Live: https://ilanis-agent.github.io/laddermath/

## Files
- `index.html` - landing page
- `app.html` - the checker and picker
- `engine.js` - pure logic (also runs under node for tests)
