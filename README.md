
Edit : a solution has been found thanks to npm workspace (see branch "npm-workspace")


# Issue in ng 17 with standalone component imported from outside the angular workspace

## Sequence

```
git clone https://github.com/thomaspeugeot/multi_ws_issue.git
cd multi_ws_issue
cd a
npm i
ng build
```

## Unexpected result

```
$ ng build
Application bundle generation failed. [6.929 seconds]

X [ERROR] Could not resolve "@angular/core"

    ../b/src/app/b/b.component.ts:1:26:
      1 │ import { Component } from '@angular/core';
        ╵                           ~~~~~~~~~~~~~~~
...

```

## Analysis

### Description

This repo contains two directories, "a" and "b". Each is an angular workspaces. The "a" workspace´s app-root component imports directly a standalone "BComponent" from the "b" workspace.

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { BComponent } from '../../../b/src/app/b/b.component'


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BComponent,
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

With the above sequence, `ng build` fails to properly resolve dependencies in the "BComponent".

One need to install dependencies in the "b" workspace to build the "AComponent".

```
cd ../b
npm i
cd ../a
ng build

...
Application bundle generation complete. [8.837 seconds]
```

And the application is correctly displayed.

Problem: installing modules in the dependant workspace is not optimal.

### Why is it important to import directly across workspaces and not import through a library ?

Before flaming this question, please read the following.

The import is a direct import of a component outside the workspace. This is contrary to the Angular proper way which is to import  components through a library (see https://angular.dev/tools/libraries/creating-libraries).

The proper way would be to build a "BLib" lib within the "b" workspace, include the standalone BComponent into the "Blib", publish the "BLib" lib as a module into a private repo and then import it into the "a" workspace through a proper import in the node_modules.

This "proper way" is unfortunatly not suitable here. If one build the "B" component in the "b" workspace, that means an additonal 400 MB of modules into the "b" workspace node_modules. This is an example repo, but in real application repos, one workspace routinely imports components from 5 or more other workspaces (https://github.com/fullstack-lang/gonggantt). That translates into GBs of node_modules stuff. With angular v16, import outside the workspace did work, but the trick does not work anymore with angular v17. With tens of repos like this one, there is simply no enough disk space on mid-range computer.

Besides, it seems that the idea of standalone component is to diminish the need for modules (cf. Angular web site). 

> Standalone components provide a simplified way to build Angular applications. Standalone components, directives, and pipes aim to streamline the authoring experience by reducing the need for NgModules

## Question

Is there a trick to the "a" workspace configuration for enabling the direct import ?

Note : keeping esbuild is a desired outcome, otherwise the technical debt would grow.

## Tentative solution

In the tsconfig.json of the "a" workspace, tell the compiler to uses local node_modules.

```json
    "paths": {
      "*": [
        "./node_modules/*"
      ]
    }
```

compilation is fine but at runtime, there is an error

```log
ERROR Error: NG0203: inject() must be called from an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`. Find more at https://angular.io/errors/NG0203
    Angular 46
    <anonymous> main.ts:5
core.mjs:6531:22
...
```

Any explanation of this error / any idea to solve this need would be welcomed.