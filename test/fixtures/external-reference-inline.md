---
title: External Referencing using CSV notation
subHeading: you can also see the merging of code 
---

> {{ subHeading }}

When referencing external code it's not uncommon to want to annotate something about it and while the `heading` and `footer` are the most common means of doing this ... you can also add content _into_ the code block and this code will be added ABOVE the code which is imported.

> Note: highlighting will use the imported code as the beginning of the line numbers, whereas the inline code will have negative line numbers

Below is an example of using CSV format to bring in external code _and_ add in code of our own:

```#ts filename="./foo/code.ts", heading="Using CSV format", highlight=2, footer="to be or not to be"
// the code below was brought in from an external file ...
// pretty great, eh?
```
