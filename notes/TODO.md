### Chores

- [ ] Make logos of different sizes for the Chrome extension
- [ ] Warning when user isn't logged in - since they can track and have sessions stored locally, but not permenantly. (Is lost when they log in)
= [ ] Edit the fonts 

### Features I want to add (user facing)

- [ ] Add a note to each session, at the beginning and the end.
- [ ] Add an insights feature (not sure how) to improve and fill gaps, not just track sessions
- [ ] Streaks?
- [ ] Entire re-design

### Features to add (behind the scenes)

- [ ] Track the amount of sessions logged, even local ones (aggregate count, send a tiny event with no user identifier, OR a POST /api/stats/ping that increments a counter)


### BUGS

- [x] Timer not working properly when closing the tab sometimes. How can we ensure it always works?
- [ ] Circular ring still looks weird with multiple colours, I think.


### Features to reconsider

- [ ] The bottom 'bookmarks' feature. I like the popup, and it's convenient but there's probably a better way to do this - kind of useless, and also doesn't show the logo for anything other than Claude, Pinterest, and some other hard-coded companies. Even when Notion changed their URLs to start with 'app', it doesn't pick up the Notion name. Check how this works, and see if there's a real need for this feature
- [ ] Deploy backend somewhere other than Railway? Also, should we try and make this mobile-friendly.
- [ ] GitHub-style graph: Bring back filter by task, think of a more unique way to do this
- [ ] Interactions, interface design - give it more personality?


forget about your distractions
fayd
stop thinking about your distractions
stayd

new name - stayd? :)


Notes - Things I'm noticing and want to change
- on the start working page we could definitely have a cooler interaction animation for the timer/stopwatch change. + everything can be formatted better 
- manage tasks card - colours are weird. yo i'm thinking we don't have to use tailwind, we could use some other css framework who agrees... (i feel like it's kind of annoying for this type of project.)
