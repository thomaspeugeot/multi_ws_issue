
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

This repo contains two directories, "a" and "b". Each is an angular workspaces. The "a" workspace app component imports directly a standalone "BComponent" from the "b" workspace (b\src\app\b\b.component.ts).

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

### Why is it important to import directly across workspaces and not import through a library ?

The import is a direct import of a component outside the workspace. This is contrary to the Angular proper way which is to import components through a library (see https://angular.dev/tools/libraries/creating-libraries).

Indeed, the proper way would be to build a into a "B" lib within the "b" workspace, publish the "B" lib into a private repo and then import it into the "a" workspace through a proper import in the node_modules.

This "proper way" is unfortunatly not suitable here. If one build the "B" component in the "b" workspace, that means 400 MB of node_modules. This is an example repo, but in real application repos, one worksapce routinely imports components from 5 or more other workspaces. That translates into GBs of node_modules stuff. With angular v16, import outside the workspace did work, but the trick does not work anymore with angular v17. With tens of repos like this one, there is simply no enough disk space on mid-range computer.

## Question

Is there a trick to the "a" workspace configuration for enabling the direct import ?

## Working solution

```json
    "paths": {
      "*": [
        "./node_modules/*"
      ]
    }
```

## getting close to target conf

| Step                                                                                  | Description / commit/tag | Status |
| ------------------------------------------------------------------------------------- | ------------------------ | ------ |
| App A imports component B from workspace "b"                                          | ImportBintoAppA          | OK     |
| App A displays non standalone component A that imports component B from workspace "b" | ImportBintoComponentA    | -      |