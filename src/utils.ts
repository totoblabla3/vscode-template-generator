import * as fs from 'fs-extra'
import { dirname, relative } from 'path'
import { Position, Uri } from 'vscode'
import path = require('path')

export function _getPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function _getCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1)
}

export function getRelativePathForImport(appModule: Uri, importFile: Uri) {
    return (
        './' +
        relative(dirname(appModule.path), importFile.path)
            .replace(/\\/g, '/')
            .replace('.ts', '')
    )
}

type ReplaceCallback<T> = (
    key: string,
    i: number,
    data: T,
    str: string
) => string

export function replace<
    T extends { [key: string]: string | ReplaceCallback<T> }
>(str: string, data: T, delimiter = ['{{', '}}']) {
    Object.keys(data).forEach((key, i) => {
        const regexp = new RegExp(delimiter[0] + key + delimiter[1], 'g')
        const value =
            typeof data[key] === 'function'
                ? (data[key] as ReplaceCallback<T>)(key, i, data, str)
                : (data[key] as string)

        str = str.replace(regexp, value)
    })

    return str
}

export function getName(str: string, name: string) {
    return replace(str, {
        inputName: name,
        name: getCamelCase(name),
        Name: getPascalCase(name),
    }).replace('.mustache', '')
}

export function getArraySchematics(arrayType: string): RegExp {
    return new RegExp(`${arrayType}(\\s+)?:(\\s+)?\\[`)
}

export function getBootstrapFunction(): RegExp {
    return new RegExp('app.listen')
}

export function getLineNoFromString(
    str: string,
    match: RegExpExecArray
): Position {
    const array = str.substring(0, match.index).split('\n')
    const charPosition = str.split('\n')[array.length - 1].indexOf('[')
    return new Position(array.length - 1, charPosition + 1)
}

export const invalidFileNames =
    /^(\d|\-)|[\\\s+={}\(\)\[\]"`/;,:.*?'<>|#$%^@!~&]|\-$/

export function removeSpecialChar(str: string) {
    const specialCharIndex = str.indexOf('-')
    if (specialCharIndex !== -1) {
        return _getCamelCase(str.substring(0, specialCharIndex)).concat(
            _getPascalCase(str.substring(specialCharIndex + 1, str.length))
        )
    } else {
        return str
    }
}
export function getPascalCase(fileName: string): string {
    const name = removeSpecialChar(fileName)
    return _getPascalCase(name)
}
export function getCamelCase(fileName: string): string {
    const name = removeSpecialChar(fileName)
    return _getCamelCase(name)
}

export interface TemplatePath {
    dir: string
    file: string
    fullPath: string
}

export function getFirstDirLayer(dir: string): string[] | null {
    try {
        return fs.readdirSync(dir)
    } catch (err) {
        return null
    }
}

export function isDirectory(path: string) {
    try {
        return fs.lstatSync(path).isDirectory()
    } catch (err) {
        console.log(err)
        return ''
    }
}

export function traverseDir(
    templatesPath: string,
    dir: string = '/'
): TemplatePath[] | null {
    try {
        return fs.readdirSync(templatesPath).reduce((result, file) => {
            let pathToFile = path.join(dir, file)
            let fullPathToFile = path.join(templatesPath, file)

            if (isDirectory(fullPathToFile)) {
                const paths = traverseDir(fullPathToFile, pathToFile)
                if (paths === null) throw Error()
                result = result.concat(paths)
            } else {
                result.push({
                    dir,
                    file,
                    fullPath: fullPathToFile,
                })
            }
            return result
        }, [] as TemplatePath[])
    } catch (err) {
        console.log(err)
        return null
    }
}

export function ensureDirectoryExistence(filePath: string) {
    var dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) {
        return true
    }
    ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)
}
