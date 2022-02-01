import * as fs from 'fs-extra'
import { render } from 'mustache'
import { basename, join } from 'path'
import { TextEncoder } from 'util'
import { commands, FileType, Uri, window, workspace } from 'vscode'
import { ToGenerate } from './to-generate'
import { ensureDirectoryExistence, getCamelCase, getPascalCase } from './utils'

export async function createFile(file: ToGenerate) {
    if (
        fs.existsSync(
            join(file.uri.fsPath, file.name.toLowerCase() + `.${file.type}.ts`)
        )
    ) {
        return window.showErrorMessage('A file already exists with given name')
    } else {
        console.log(file)

        const stats = await workspace.fs.stat(file.uri)

        if (stats.type === FileType.Directory) {
            file.uri = Uri.joinPath(
                file.uri,
                file.dir ? file.dir : '',
                file.fullName
            )
        } else {
            file.uri = Uri.parse(
                file.uri.path.replace(basename(file.uri.path), '')
            )
            file.uri = Uri.joinPath(
                file.uri,
                file.dir ? file.dir : '',
                file.fullName
            )
        }

        return getFileTemplate(file)
            .then((data) => {
                ensureDirectoryExistence(file.uri.path)
                return workspace.fs.writeFile(
                    file.uri,
                    new TextEncoder().encode(data)
                )
            })
            .then(() => {
                return formatTextDocument(file.uri)
            })
            .then(() => {
                return true
            })
            .catch((err) => {
                return window.showErrorMessage(err)
            })
    }
}

export async function formatTextDocument(uri: Uri) {
    return workspace
        .openTextDocument(uri)
        .then((doc) => {
            return window.showTextDocument(doc)
        })
        .then(() => {
            return commands.executeCommand('editor.action.formatDocument')
        })
}

export async function getFileTemplate(file: ToGenerate): Promise<string> {
    return fs.readFile(file.type, 'utf8').then((data) => {
        let view = {
            inputName: file.name,
            Name: getPascalCase(file.name),
            name: getCamelCase(file.name),
        }
        return render(data, view)
    })
}
