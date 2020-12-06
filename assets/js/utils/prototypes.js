import {BadgeAdmin, BadgeAuthor} from "../components/common/Badges";
import {Badge} from "react-bootstrap";

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * Get date string in format YYYY-MM-DD HH-MM-SS
 * @returns {string}
 */
Date.prototype.formatDefault = function() {
    const year = this.getFullYear(),
        month = this.getMonth()+1,
        day = this.getDate(),
        hour = this.getHours(),
        min = this.getMinutes();

    return `${year}-${month < 10 ? '0'+month : month}-${day < 10 ? '0'+day : day} ${hour < 10 ? '0'+hour : hour}:${min < 10 ? '0'+min : min}`;
}

/**
 * Get 'time ago' string, e.g. '5 minutes ago', '12 days ago'
 * @returns {string}
 */
Date.prototype.timeAgo = function () {
    const seconds = Math.round((Date.now() - this.valueOf()) / 1000), // seconds passed since date
        minutes = Math.round(seconds / 60),
        hours = Math.round(minutes / 60),
        days = Math.round(hours / 24),
        months = Math.round(days / 30.5),
        years = Math.round(months / 12);

    const s = number => number % 10 === 1 && number !== 11 ? '' : 's';

    switch (true) {
        case seconds < 0:
            return this.formatDefault();
        case minutes < 1:
            return 'less than a minute ago';
        case minutes < 60:
            return `${minutes} minute${s(minutes)} ago`;
        case hours < 24:
            return `${hours} hour${s(hours)} ago`;
        case days < 31:
            return `${days} day${s(days)} ago`;
        case months < 12:
            return `${months} month${s(months)} ago`;
        case years > 0:
            return `${years} year${s(years)} ago`;
        default:
            return this.formatDefault();
    }
}

/**
 * Push element to the array only if it does not exist already. Immutable operation.
 * @param element
 */
Array.prototype.pushIfNotExist = function (element) {
    let exists = this.indexOf(element) !== -1;
    let newArray = [...this];
    if (!exists)
        newArray.push(element);

    return newArray;
}

/**
 * Returns a new array with all occurrences of element removed. Immutable operation.
 * @param element
 */
Array.prototype.removeAll = function (element) {
    return this.filter(e => e !== element);
}


Badge.Admin = BadgeAdmin;
Badge.Author = BadgeAuthor;
