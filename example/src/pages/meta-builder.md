---
layout: home
---

# META Builder

The `meta` builder is designed to help make managing meta data easy. The meta data we are concerned with fits into the following broad categories:

1. `frontmatter` props
2. `head` descriptors
3. `meta` properties in page's head section
4. `route` properties

## Frontmatter Properties

The foundation of metadata in Markdown is usually _frontmatter_ and here is no different. The core ability to add a dictionary of name/value pairs as frontmatter and then refer to this data on the
page is unchanged from the base behavior of this plugin but we offer some additional configurations which make taking advantage of frontmatter easier.

1. Default Values

    Sometimes we want to ensure that a given property is always provided on pages but still allow page authors to override this value. Let's imagine that we have a boolean value called `needsAuth` which is a boolean value and we'd like by default to have it set to `false`:

    ```ts
    Markdown({
      builders: [
        meta({ defaults: { needsAuth: false } }
        )]
    })
    ```

    Beyond this, we can be more _dynamic_ and rather than set a value we can pass in a callback:

    ```ts
    Markdown({
      builders: [
        meta({
          defaults: { needsAuth: filename => !!filename.includes('secure') }
        })
      ]
    })
    ```

    > Note: in this example we leverage the filename being passed into us but we also get all of
    > the frontmatter properties too.

2. Override Values

    Unlike with _default values_, an override value is the ultimate authority on setting property values (versus the page author). Otherwise, the syntax and functionality is the same between the two features.

    > Note: because the callback variant provides all frontmatter data, you can react to a page author's "request" to set certain metadata but ultimately the override will decide the final value at build time.

3. Async Build Pipeline
