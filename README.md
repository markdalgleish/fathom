[Fathom.js](http://markdalgleish.com/projects/fathom) - Present JavaScript in its native environment.
=====================================================================================================

If you're making a presentation ***on JavaScript***, make it ***in JavaScript***.

Usage
-----

Example HTML:

&lt;div id="presentation"&gt;

  &lt;div class="slide"&gt;
    &lt;h1&gt;My Presentation&lt;/h1&gt;
  &lt;/div&gt;
  
  &lt;div class="slide"&gt;
    &lt;h2&gt;My Dot Points&lt;/h2&gt;
    &lt;ul&gt;
      &lt;li&gt;First dot point&lt;/li&gt;
      &lt;li&gt;Second dot point&lt;/li&gt;
      &lt;li&gt;Third dot point&lt;/li&gt;
    &lt;/ul&gt;
  &lt;/div&gt;
  
&lt;/div&gt;

---

jQuery Plugin Setup: ```$('#presentation').fathom();```

Advanced Setup: ```var fathom = new Fathom('#presentation');``` 

---

Full guide available at the [official Fathom.js project page](http://markdalgleish.com/projects/fathom).

I've included a sample CSS file in the repo to get you started.

---

Please note that Fathom.js is not trying to recreate Powerpoint or Keynote. While they're good tools, I personally find that style of interface to be inappropriate on the web. If you're wondering why feature *x* from Powerpoint is missing, this is probably why.

How to Build
------------

The code is minified using UglifyJS using the following command:

`uglifyjs -o fathom.min.js fathom.js`

Contributing to Fathom.js
-------------------------

If you want to contribute in a way that changes the API, please file an issue before submitting a pull request so we can dicuss how to appropriately integrate your ideas.

Questions?
----------

Contact me on GitHub or Twitter: [@markdalgleish](http://twitter.com/markdalgleish)