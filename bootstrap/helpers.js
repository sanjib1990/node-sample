/**
 * Created by sanjibdevnath on 21/6/17.
 */
"use strict";

module.exports  = {
    /**
     * Check for emptiness.
     *
     * @param item
     * @returns {boolean}
     */
    empty: (item) => {
        return item === null || item === undefined || item.length === 0;
    }
};
