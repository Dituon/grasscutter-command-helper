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
    /** @param { CommandDTO[] } [commandDTOList] */
    constructor(commandDTOList) {
        /** @const @private @type { Set<CommandDTO> } */
        this._set = new Set(commandDTOList)
    }

    /**
     * @param { CommandDTO } commandDTO
     */
    push(commandDTO) {
        this._set.add(commandDTO)
    }

    /**
     * @param { CommandDTO } commandDTO
     */
    delete(commandDTO) {
        this._set.delete(commandDTO)
    }

    /**
     * @return { CommandDTO[] }
     */
    getList() {
        return Array.from(this._set)
    }

    /** 
     * @return { string }
     */
    toBase64() {
        return window.btoa(JSON.stringify(this.getList()))
    }

    /** 
     * @param { string } base64
     * @return { SerialisedCommandCollection }
     */
    static fromBase64(base64) {
        return new SerialisedCommandCollection(JSON.parse(window.atob(base64)))
    }
}

export { SerialisedCommandCollection }