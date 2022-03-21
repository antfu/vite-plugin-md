---
title: Links Testing
---

# Links

- An [external link](https://google.com) is one which links to another site whereas an [internal link](./simple.md) links to content on the same site. 
- Within the category of "internal links" we have [fully qualified links](/foo/bar) and [relative links](foo/bar) where with relative links we must ensure that the current page's route is understood and incorporated into the link
- Check out [Section 2](#section-2) for the good stuff ... well actually to be fair it's just an example of an "anchor tag" where we're linking to the another part of the same page
- External links are great but some aren't safe: [scary link](http://bad-juju.com)

## Markdown file in a link

- When we reference an index MD file the [index route](./foobar/index.md) is left with just the path component, no file component
- Similarly if an _internal_ link to a [non-index route](./foo/bar.md) has a `.md` reference in it ... this is cleaned up.
- NOTE: _external_ links for both [external index routes](https://dev.null/foo/index.md) and [external non-index routes](https://dev.null/foo/bar.md) are not changed (but shouldn't really be happening a lot)

## Content Types

- If we link to [images](https://my-photos.com/profile.jpg), [documents](https://xyz.com/profile.doc), or [code](https://example.com/foobar.wasm) we should get classes which indicate the content type
- My favorite colors are [red](https://colors.com/red), [blue](https://colors.com/blue), and [green](https://colors.com/green)

## Router Awareness

- we can convert all internal links from normal `<a href="xyz">` tags to `<router-link to="xyz">` tags instead; this feature is on by default
- this is helpful for a PWA as you get the benefits of 

## Section 2
The good stuff

[contact us](mailto:yur-da-best@dev.null)
