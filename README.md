# QuantCloud Web

## Installing (Dev)

After cloning, perform the following tasks:

1. Make sure you have all dependencies installed (Node.js incl. npm, grunt, and bower).
2. Run `npm install`.
3. Run `bower update`.
4. Run `grunt serve`, this should display the main page. Alternatively, import into IntelliJ as new project and open index.html.

## Dependencies Management

To add js dependencies run, e.g. `bower install gridster --save`, remove dependencies with `bower uninstall jquery --save`.
The `--save` switch is important because then you can use grunt to automatically inject dependencies into your index.html with `grunt bowerInstall`.

## Deploying

Run `grunt` to build minified version (html + js + css) in `<root>/dist` ready for deployment to server.
