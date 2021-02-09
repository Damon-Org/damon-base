# Damon Base Changelog

## Versioning Policy

Following:
**major.minor.patch**

* **major** is almost never used unless a complete rewrite happened of Damon Music
* **minor** used whenever a single file was rewritten or significant change happened
* **patch** may only be bumped after a bug was resolved as whole

## 2020-02-09, Version 1.3.0, @Yimura

### Changes

 * A docker-compose file was added as an example
 * The start & test scripts have been swapped out with docker-compose
 * ModuleManager has fixes making the init happen after all modules have had their events mapped
 * Logger has been reviewed and added verbose log level
 * The command registrar has been changed to allow for other modules to register their own commands

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
