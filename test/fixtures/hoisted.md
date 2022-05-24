---
title: Hoisted Scripts
description: when an import or script block is embedded in HTML we need to preserve this
---
<script setup lang='ts'>
import { foobar } from 'some-other-place';
</script>

# {{title}}

The import above should be brought into the VueJS component which would then allow us to use this _fake_ component in our page:

<foobar title='i am not real' />

Furthermore we can add a script setup block like this:

<script setup lang='ts'>
const sayHi = (name: string) => `hi ${name}`
</script>

And now the function we've defined can be used: {{ sayHi('Foo') }}

This doesn't just apply to `<script setup>` blocks but also more traditional `<script>` blocks too:

<script lang='ts'>
// note that this variable is available within the script block but _not yet_ the template
export const meToo = (thing: string) => `I'm not materialistic but I want a ${thing} too!`
// with a traditional script block we need to return the variable to expose it to the template
return { meToo }
</script>

The traditional _script blocks_ can appear multiple times, and even use different languages without incident. These blocks will be maintained as separate blocks in the resulting SFC component.

<script lang='js'>
export const ANSWER = 42
</script>
