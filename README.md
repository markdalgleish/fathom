# [Fathom.js](http://markdalgleish.com/projects/fathom) [![endorse](http://api.coderwall.com/markdalgleish/endorsecount.png)](http://coderwall.com/markdalgleish)

### Present JavaScript in its native environment.

If you're making a presentation ***on JavaScript***, make it ***in JavaScript***.

## Usage

Example HTML:

``` html
<div id="presentation">

  <div class="slide">
    <h1>My Presentation</h1>
  </div>
  
  <div class="slide">
    <h2>My Dot Points</h2>
    <ul>
      <li>First dot point</li>
      <li>Second dot point</li>
      <li>Third dot point</li>
    </ul>
  </div>
  
</div>
```

---

jQuery Plugin Setup:
``` js
$('#presentation').fathom();
```

Advanced Setup:
``` js
var fathom = new Fathom('#presentation');
```

---

Full guide available at the [official Fathom.js project page](http://markdalgleish.com/projects/fathom).

I've included a sample CSS file in the repo to get you started.

---

Please note that Fathom.js is not trying to recreate Powerpoint or Keynote. While they're good tools, I personally find that style of interface to be inappropriate on the web. If you're wondering why feature *x* from Powerpoint is missing, this is probably why.

## How to Build

The code is minified using UglifyJS using the following command:

`uglifyjs -o fathom.min.js fathom.js`

## Contributing to Fathom.js

If you want to contribute in a way that changes the API, please file an issue before submitting a pull request so we can dicuss how to appropriately integrate your ideas.

## Questions?

Contact me on GitHub or Twitter: [@markdalgleish](http://twitter.com/markdalgleish)