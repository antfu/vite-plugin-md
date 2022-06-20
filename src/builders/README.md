# Builder APIs

This folder provides required symbols and resources to create your own Builder API which can plug into this plugin's transformation pipeline. It also includes three built-in builders that are intended to provide utility as well as serve as examples:

- code
- meta
- link

## Resource to build a Builder

- use the `createBuilder()` function to structure your builder
  - this will allow you to state where in the core Pipeline you'll want execution control
  - or you can also just _subscribe_ to another Builder's exposed events
