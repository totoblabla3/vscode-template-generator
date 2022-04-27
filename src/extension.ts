import path = require('path')
import { commands, ExtensionContext, Uri, window, workspace } from 'vscode'
import { createFile } from './file-helper'
import {
    getFirstDirLayer,
    getName,
    invalidFileNames,
    isDirectory,
    traverseDir,
} from './utils'

export function activate(context: ExtensionContext) {
    const generateLocalTemplate = commands.registerCommand(
        'extension.GenerateTemplate',
        async (resource: Uri) => {
            if (workspace === undefined) {
                return window.showErrorMessage(
                    'Please select a workspace first'
                )
            }
            if (workspace.workspaceFolders === undefined) {
                return window.showErrorMessage(
                    'YOUR-EXTENSION: Working folder not found, open a folder an try again'
                )
            }

            const wf = workspace.workspaceFolders[0].uri.fsPath
            const templatesFolder = path.join(wf, '.vscode', 'templates')
            const templatesNames = getFirstDirLayer(templatesFolder)
            if (!templatesNames) {
                return window.showErrorMessage(
                    'Templates folder not found. Templates must be located in ~/.vscode/templates '
                )
            }

            const template = await window.showQuickPick(templatesNames)
            if (!template) {
                return window.showErrorMessage('Invalid template')
            }

            const input = await window.showInputBox({
                placeHolder: 'Please enter Name',
            })
            if (input === undefined) return
            if (invalidFileNames.test(input)) {
                return window.showErrorMessage('Invalid filename')
            }

            const templatePath = path.join(templatesFolder, template)

            if (isDirectory(templatePath)) {
                const templates = traverseDir(templatePath)
                if (!templates) {
                    return window.showErrorMessage('Reading template error')
                }

                templates.forEach((el) => {
                    createFile({
                        name: input,
                        type: el.fullPath,
                        uri: resource,
                        dir: getName(el.dir, input),
                        fullName: getName(el.file, input),
                    })
                })
            } else {
                createFile({
                    name: input,
                    type: templatePath,
                    uri: resource,
                    fullName: getName(template, input),
                })
            }
        }
    )
    context.subscriptions.push(generateLocalTemplate)
}

// this method is called when your extension is deactivated
export function deactivate() {}
