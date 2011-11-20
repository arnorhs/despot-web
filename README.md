# despot web interface

for interfacing with https://github.com/paulrosania/despot

# Using

So far you need both this and the /despot app to 

# Requirements

- node.js w/express and requirements
- redis server
- the computer running despot needs to have an audio adapter and the music
  has to play straight from that computer, because it
  uses libspotify to play music. Libspotify is a library from spotify and
  it requires you to have an API key etc.. you'll see more info on
  paul's github repo for despot (yes we have plans on joining them in to
  a single repo.

# How does it work?

So far it's incredibly user-unfriendly

Redis is used to communicate between the libspotify (despot) and the web app
(despot-web), by placing a spotify track uri into a queue in redis. The
despot process waits for stuff in that queue and plays it and loops through
the queue as you go.

You use the web app to find music and add it to the queue.

# Authors

Despot was created by Paul Rosania http://twitter.com/paulrosania && Arnor Heidar Sigurdsson http://twitter.com/arnorhs

## License

(The MIT License)

    Copyright (c) 2010 LearnBoost &lt;dev@learnboost.com&gt;

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
            'Software'), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
