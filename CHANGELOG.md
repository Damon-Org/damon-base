# Damon Base Changelog

## Versioning Policy

Following:
**major.minor.patch**

* **major** is almost never used unless a complete rewrite happened of Damon Music
* **minor** used whenever a single file was rewritten or significant change happened
* **patch** may only be bumped after a bug was resolved as whole

## 2020-12-22, Version 1.2.0, @Yimura

### Changes

 * Fixed CommandHandler module where error handling would have an unreferenced msg
 * Added a forgotten bootUp property to Main (client)
 * Changed some comments in the example commands to stay consistent
 * Upstream merged changes from Damon Music into Damon's Base

## 2020-10-19, Version 1.1.0, @Yimura

### Changes

 * Changed how ModuleManager is used fundamentally for a better intuitive usage.
 * Updated the Modules as they had some old bugs remaining in them.

## 2020-10-16, Version 1.0.0, @Yimura

### Changes

 * Initial Release based of off Damon Music v0.8.0
