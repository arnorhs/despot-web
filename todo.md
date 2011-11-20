## TODO

# Features

This is on my "want" list:

- login
- upvoting songs in the queue
- seeing what's currently being played
- seeing when things get updated (new things in the queue etc)

# Queue architecture

It would be best suited for the future, especially if we support multiple audio
clients, if the process didn't remove stuff from the queue. So removal from the
queue would be handled by the web app process.

I'm suggesting the following architecture:

- We maintain the redis key "queue:nowplaying" for the song that's currently
  being played. Optionally we could set a TTL on that key which would equal
  either what is remaining off the song, or a TTL that always starts with
  86400 (24 hours) and the despot audio client uses that to calculate where in
  the song it should skip to (if it connects in the middle of a song (if that's
  even possible using libspotify.
- In the background, the web app sets a timer to rotate songs according to the
  length of the song being played.

# Web app architecture

*Socket.io*

It would probably be more fitting to use web sockets (via socket.io) to push
info back to the client every now and then (when things get removed from the
queue, more things added, etc).

Here's an article/tutorial that delves into how to use express and socket.io
using the same session: http://www.danielbaulig.de/socket-ioexpress/

*Login*

We should start adding login soon. Both to see who added what song, prevent
the same user from upvoting the same song many times, etc.

It would be fun to support normal auth, twitter and facebook, but I would
vote on just supporting Twitter or something to begin with.

We might be able to use every auth http://search.npmjs.org/#/everyauth it seems
to have support for connect (what Express is built on top of), so it should
be relatively easy to integrate.

Questions, though:

- Will we then require login before you do anything?
- What about upvoting songs?

*Search*

We might want to change to a http ajax search directly in the spotify API. The
reason for that is that the rate limit might get us pretty soon if a few people
started searching at the same time.

We also should change the instant search into something where it only searches
after hitting the space bar, since searching for a song name with half a word
isn't very helpful (especially since we don't have a auto-suggest feature (which
we could also opt into integrating at a later point...


