/**
 * @typedef {import('./command-builder.js').CommandVO} CommandVO
 * @typedef {import('./command-builder.js').ParamVO} ParamVO
 * @typedef {import('./command-builder.js').OutputCommand} OutputCommand
 * @typedef {import('./command-builder.js').OutputParam} OutputParam
 */

/**
 * @typedef { object } CommandDTO
 * @property { '1.2.1' | '1.4.2' } version
 * @property { string } id
 * @property { ParamDTO[] } [params]
 */

/**
 * @typedef { object } ParamDTO
 * @property { number } index
 * @property { ParamValue | string | number } [value]
 * @property { ParamDTO } [subparam]
 */

class SerialisedCommandCollection {
    constructor() {
        /** @const @private @type { Map<number, CommandVO> } */
        this._map = new Map()
        /** @type { number } */
        this.index = 0
    }

    /**
     * @param { OutputCommand } outputCommand
     * @return { number } index
     */
    push(outputCommand) {
        this._map.set(this.index, outputCommand.getDTO())
        return this.index++
    }

    /**
     * @param { number } index
     */
    delete(index) {
        this._map.delete(index)
    }

    /**
     * @return { CommandDTO[] }
     */
    getList() {
        const list = []
        this._map.forEach((index, command) => {
            list.push(command)
        })
        return list
    }
}