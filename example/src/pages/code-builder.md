# `code()` Builder

The code builder is designed to making representing code easy. It starts out by providing functionality you'd expect. Using _blocks_ of code encapsulated by the triple-backtick marker provides the critical first step:

```rust
let foo = "bar".to_string();
```

## Feature Overview

Beyond that we can do the following:

1. **Line Numbers**

    ```#rust
    // is foo really bar?
    let foo = "bar".to_string();
    // or is bar really foo?
    let bar = "foo".to_string();
    ```

    While configuration let's us state a _default_ for whether we want line number or not, you can explicitly "opt-in" to line numbers but putting a `#` in front of the language. You can also state you want the _inverse_ of the global configuration by using the `!` modifier prior to the language.

2. **Highlighting**

    ```rust highlight=2
    let foo = "bar".to_string();
    let notable = "wow".to_string();
    let bar = "foo".to_string();
    ```

    Certain lines (or ranges of lines) can be highlighted as being more important.

3. **Heading / Footer**

    ```rust {"heading": "Rust by Example", "footer": "bullshit in, bullshit out"}
    let foo = "bar".to_string();
    let bar = "foo".to_string();
    ```

4. **Light / Dark Mode**

    Toggling between light and dark mode automatically adjusts the code styling. Try with the button above and if you're adventurous, try changing the default `theme` in the configuration.

5. **Clipboard**

    You can turn on a clipboard feature which will copy the code to the clipboard.

    ```rust {"clipboard": true }
    let foo = "bar".to_string();
    let bar = "foo".to_string();
    ```

    This can be turned on _locally_ by setting the `clipboard` property to **true** or globally by setting the similarly named property in configuration.

6. **Inverse Contrast**

    By default the themes for _light mode_ tend to be lighter and for _dark mode_ they are darker. Go figure. Still, sometimes we want to have the code block more distinguished from the rest of the page and in these cases an option is to state that an "inverse" color mode should be used. In essence, it reverses the code block's light/dark settings.

    This change can be made globally by setting the `invertColorMode` configuration option to true.

<div @click="copyToClipboard('foobar')">Just Do It</div>
