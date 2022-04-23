---
title: Escape Tag Interpolation
description: in this case we markdown intended for the setting to be turned on
---

# Escape Code Interpolation

This is a config based feature that effects code blocks. If the `options.escapeCodeInterpolation` feature is turned on -- and it is by default -- then it will add the property "v-pre" to the `<pre>` tag so that any double curly brackets inside the code block _are not_ mistakenly interpreted as being variables by Vue when it is processing the page.


## Do Not Interpolate

For example in the code below we are showing a VueJS template and it has these brackets and we _do not_ want them translated:

```vue
<div class="do-not-interpolate">
    {{ value }}
</div>
```

## Please DO Interpolate

There might, however, be a cases where you want the opposite behavior but the global configuration is correctly set to `true` so in this case you can indicate you want the opposite behavior by putting a `!` character before the language:

```!vue
<div class="interpolate">
    {{ description }}
</div>
```


