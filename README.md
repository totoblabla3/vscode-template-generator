# Mustache Template Generator

✨ This extension helps in creating files and folders easily from defined templates.

## Features

- File template support
- Folder template support

## Usage

![Generate from Template](/assets/demo.gif)

Right click on any folder/file in your current project. You can find command that has been added to the context menu: `Generate from Template`. Click on it, select a template and enter a word that will replace the fields in the template.

### Templates path

- workspace/.vscode/templates

### Custom fields

- `{{ inputName }}` : input name
- `{{ Name }}` : PascalCaseFileName
- `{{ name }}` : camelCaseFileName

You can define the name displayed on the template selector, like:

- `{{inputName}}.ts.mustache`

Also you can define folder name in your template folder:

- `template1/{{inputName}}.ts.mustache`
- `template2/{{inputName}}/{{inputName}}.ts.mustache`

> ⚠ The name of the file or folder must not contain spaces.  
> e.g not {{ inputName }}, but {{inputName}}

### Example

File name :

`{{inputName}}.ts.mustache`

File content :

```
import { Module } from '@nestjs/common'
import { {{ Name }}Controller } from './{{ inputName }}.controller'
import { {{ Name }}Service } from './{{ inputName }}.service'

@Module({
    controllers: [{{ Name }}Controller],
    providers: [{{ Name }}Service],
    exports: [{{ Name }}Service],
})
export class {{ Name }}Module {}
```

[Example code](.vscode/templates/example/{{inputName}})
