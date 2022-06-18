# `PascalCase` Components

While it is common to find examples of `<PascalCase>...</PascalCase>` components littered throughout examples of all the major SPA frameworks, this is a "bad habit which feels good". Why? Well for one the HTML specification _does not_ permit tags with uppercase characters. That said, browsers are forgiving beasts and it tends to be one of those "look the other way" sort of rules.

That is -- of course -- until you're trying to build "custom components" and then sometimes the rules can be a bit more strict. These rules state that not only can you not use CAPS in your component names but that they **must** be kebab-case with at least one dash!

All this is being written down here because this ended up as an issue in this repo when we started to transform the HTML using `happy-dom`'s DOM API and people who were using VueJS components in PascalCase found their names were being lower-cased out of the gate and when they got to VueJS the block in the HTML no longer matched the VueJS component name. Whoops.

Now we're trying to address this with appropriate checks. Checks which allow PascalCase to stay unchanged in code blocks such as:

```html
<FooBar class="please-lower-your-case">not gonna happen</FooBar>
```

While at the same time that same code as raw HTML inside the markdown document is converted to kebab-case and allowing your bad habits to remain hidden from your guilty mind.

<FooBar class="yuck">change is hard</FooBar>
