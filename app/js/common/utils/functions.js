import React from 'react'
import {browserHistory} from 'react-router'
import Cookie from 'universal-cookie'
import moment from 'moment'
import Store from 'app/store'
import {fetchData, hideAlert, showAlert, storeToken} from 'app/actions'
import {storageUrl, url} from 'app/constants'
import {api} from 'app/utils'

const cookie = new Cookie()

export default {

    /**
     * Shows alert
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @param   {array}   alerts    Array of alerts
     * @param   {array}   type        Type (success, warning, error)
     */
    showAlert(alerts, type) {
        alerts = typeof alerts === 'string' ? [alerts] : alerts
        Store.dispatch(showAlert({alerts, type}))
    },

    /**
     * Hides the currently showing alert
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @return  {object}    Redux object
     */
    hideAlert() {
        Store.dispatch(hideAlert())
    },

    escapeUrl(string) {
        if (!string.match(/^[a-zA-Z]+:\/\//)) {
            return `http://${string}`
        }

        return string
    },

    /**
     * Deletes cookie by key
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @param   {string}   key    Stored cookie key
     */
    deleteCookie(key) {
        return cookie.remove(key, {path: '/'})
    },

    /**
     * Gets cookie by key
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @param   {string}   key    Stored cookie key
     * @return  {string}        Value of the cookie
     */
    getCookie(key) {
        return cookie.get(key)
    },

    /**
     * Saves cookie
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @param   {string}   key        Cookie key
     * @param   {string}   value    Cookie value
     * @param   {object}   options    Options such as path, age, etc.
     */
    saveCookie(key, value, options) {
        return cookie.set(key, value, options)
    },

    /**
     * Gets token and return its value
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @param   {string}   key    Token key
     * @return  {string}        Token value
     */
    getToken(key) {
        const value = this.getCookie(key)
        Store.dispatch(storeToken(this.parseToken(value)))
        return this.parseToken(value)
    },

    /**
     * Converts token to a readable json object
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @param   {string}   token    Token string
     * @return  {object}            Formatted token object
     */
    parseToken(token = '') {
        if (!token) {
            return ''
        }
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace('-', '+').replace('_', '/')
        return JSON.parse(window.atob(base64))
    },

    async downloadAttachment(fileUrl, fileName = 'filename') {
        const response = await api.get(`${fileUrl}`, {
            method: 'get',
            headers: new Headers({
                Authorization: `Bearer ${this.getCookie('token')}`,
            }),
        })

        const linkUrl = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = linkUrl
        link.setAttribute('download', `${fileName}${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    },

    /**
     * Builds an url query.
     *
     * @param      {<type>}                         params  The parameters
     * @param      {string}                         start   The start
     * @return     {(string)}  The url query.
     */
    buildUrlQuery(params = {}, start = '&') {
        if (_.isEmpty(params)) {
            return ''
        }

        let queryString = start

        _.map(params, (value, key) => {
            if (key && value && value !== 'all') {
                // check if value is an array and split
                if (_.isArray(value)) {
                    value = value.join(',')

                    if (!value) {
                        return false
                    }
                }

                queryString = `${queryString}${key}=${value}&`
            }
        })

        return queryString.replace(/\&$/, '')
    },

    /**
     * Formates date in the desired format
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @param   {string}   date        Date in YYYY-MM-DD HH:mm:ss format
     * @param   {string}   format    Date format
     * @return  {string}            Formatted date
     */
    formatDate(date, format = 'D MMM YYYY') {
        if (!date || date === '0000-00-00 00:00:00') {
            return null
        }

        const newDate = date !== 'now' ? date : null
        return moment(newDate, 'YYYY-MM-DD hh:mm:ss').format(format)
    },

    /**
     * Checks if the build is production
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @return  {boolean}        True if production, false if development
     */
    isProduction() {
        return process.env.NODE_ENV && process.env.NODE_ENV === 'production'
    },

    /**
     * Navigate to an internal URL
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-31
     */
    navigate(to) {
        // if to is goBack then go back to the previous page
        if (to === 'goBack') {
            browserHistory.goBack()
            return
        }

        browserHistory.push(to)
    },

    /**
     * Logs out the user, clears the redux object
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     */
    logOut() {
        this.user = ''
        this.deleteCookie('token')
        Store.dispatch({type: 'USER_LOGOUT'})
    },

    /**
     * Checks if user logged in or not
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @return  {boolean}        True if logged in, false if logged out
     */
    isLoggedIn() {

        if (this.getUser().id) {
            return true
        }

        return false
    },

    /**
     * Gets the current logged in user
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @return  {object}        User
     */
    getUser() {

        // get global store
        const store = Store.getState()

        // check if user is fetched and has role
        if (store.me.isLoading || !store.me.data) {
            return false
        }

        // cache user role
        this.user = store.me.data

        return this.user
    },

    /**
     * Checks if the current user is admin
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @return  {boolean}        True if user is admin, false if user is not admin
     */
    isAdmin() {
        if (this.getUser().role !== 'admin') {
            return false
        }

        return true
    },

    /**
     * Checks if the current user is user
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @return  {boolean}        True if user is user, false if user is not user
     */
    isUser() {
        if (this.getUser().role !== 'user') {
            return false
        }

        return true
    },

    /**
     * Checks if the provided user is the logged in user
     *
     * @author  Mark Homoki
     * @version 1.0
     * @since   2017-07-21
     * @return  {boolean}        True if user matches
     */
    isMe(id) {
        if (this.getUser().id !== id) {
            return false
        }

        return true
    },

    /**
     * Retrieve the plural or single form based on the amount.
     *
     * @param      {<type>}  single  The single
     * @param      {<type>}  plural  The plural
     * @param      {number}  number  The number
     * @return     {<type>}  { description_of_the_return_value }
     */
    nGetText(single, plural, number) {
        // if number is 1, then return the single text
        if (number === 1) {
            return single
        }

        return plural
    },

    /**
     * Makes a proptype required, if a condition is true.
     *
     * @param {function} type
     * @param {function} condition
     * @return {function}
     */
    requiredIf(type, condition) {
        return function (props, propName, componentName) {
            if (typeof type !== 'function') {
                return new Error(
                    `Invalid prop type supplied to ${componentName}. Validation failed`
                )
            }

            if (typeof condition !== 'function') {
                return new Error(
                    `Invalid condition supplied to ${componentName}. Validation failed`
                )
            }

            const test = condition(props) ? type.isRequired : type
            return test.apply(this, arguments)
        }
    },

    /**
     * Converts a number into a string and formats it with commas and a decimal point.
     *
     * @param {number} amount
     * @param {number} decimalCount
     * @param {string} decimal
     * @param {string} thousands
     * @return {string}
     */
    formatMoney(amount, decimalCount = 2, decimal = '.', thousands = ',') {

        const currencySign = '$'
        try {

            const dc = Number.isNaN(Math.abs(decimalCount)) ? 2 : decimalCount

            const negativeSign = amount < 0 ? '-' : ''
            let a
            const i = parseInt(a = Math.abs(Number(amount) || 0).toFixed(dc), 10).toString()
            const j = (i.length > 3) ? i.length % 3 : 0

            return negativeSign + currencySign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${thousands}`) + (decimalCount ? decimal + Math.abs(a - i).toFixed(decimalCount).slice(2) : '')
        } catch (e) {
            return console.error(e)
        }
    },

    // get time delay in days between 2 dates
    timeSince(date, to = Date.now()) {
        const dateNow = new Date(date)
        const dateThen = new Date(to)
        return Math.floor((Date.UTC(dateThen.getFullYear(), dateThen.getMonth(), dateThen.getDate()) - Date.UTC(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate())) / (1000 * 60 * 60 * 24))
    },

    // Extract the filename including extension from a pull path
    getFilenameFromPath(url) {
        return url.substring(url.lastIndexOf('/') + 1)
    },

    activeMaintenanceMode(settings) {
        const {setting, me} = Store.getState()

        // check if maintenance mode is set to enabled
        if (setting.maintenanceMode && me.data.role !== 'admin') {
            return true
        }

        return false
    },

    getImage(filename) {
        const imageDir = '../../../images'
        return `${imageDir}/${filename}`
    },

    getContainer() {
        const container = document.getElementById('gridwrapper-inner')
        const containerHeight = (container || {}).offsetHeight || 0
        const containerWidth = (container || {}).offsetWidth || 0
        return {
            height: containerHeight,
            width: containerWidth
        }
    },

    getQuadrant(x, y) {
        if (x > 50) {
            if (y > 50) {
                return 'VIP'
            } else {
                return 'STA'
            }
        } else {
            if (y > 50) {
                return 'UP'
            } else {
                return 'NF'
            }
        }
    },

    getAvatarClass(gender) {
        if ('m' === gender) {
            return 'male'
        }
        return 'female'
    },

    getPeopleCharacters() {
        return [
            {
                id: 1,
                title: 'The Ambassador',
                largeImage: 'Ambassador.svg',
                iconImage: 'icon-character-ambassador',
                description: 'High royalty high loyalty organisations and people who recommend and protect. Think marketing department. Think forcefield.'
            },
            {
                id: 2,
                title: 'The Beaver',
                largeImage: 'Beaver.svg',
                iconImage: 'icon-character-eager-beaver',
                description: 'Coming up fast on royalty, ripe for moving up on loyalty.'
            },
            {
                id: 3,
                title: 'The Deadweight',
                largeImage: 'Deadweight.svg',
                iconImage: 'icon-character-deadweight',
                description: 'Low Royalty, low loyalty. Going nowhere.'
            },
            {
                id: 4,
                title: 'The Pirate',
                largeImage: 'Pirate_1.svg',
                iconImage: 'icon-character-pirate',
                description: 'Your competitors'
            },
            {
                id: 5,
                title: 'The Smiley',
                largeImage: 'Smiley.svg',
                iconImage: 'icon-character-smiley',
                description: 'Low royalty, high loyalty. Nice to spend time with but will never give you work or whatever else you need to succeed.'
            },
            {
                id: 6,
                title: 'The Assassin',
                largeImage: '/Assassin.svg',
                iconImage: 'icon-character-assassin',
                description: 'High royalty but negative loyalty, damaging your organisation.'
            },
            {
                id: 7,
                title: 'The Boomerang',
                largeImage: 'Boomerang.svg',
                iconImage: 'icon-character-boomerang',
                description: 'High royalty but reversed on loyalty'
            },
            {
                id: 8,
                title: 'The Mirage',
                largeImage: 'Mirage.svg',
                iconImage: 'icon-character-mirage',
                description: 'High royalty low loyalty sometimes disguised as The Prize. But, they are never going to choose you.'
            },
            {
                id: 9,
                title: 'The Prize',
                largeImage: 'Prize.svg',
                iconImage: 'icon-character-prize',
                description: 'High royalty low loyalty but worth pursuing because others will follow.'
            },
            {
                id: 10,
                title: 'The Trojan Horse',
                largeImage: 'Trojan Horse.svg',
                iconImage: 'icon-character-trojan-horse',
                description: 'High royalty low loyalty organisations where you know someone on the inside.'
            }
        ]
    },

    getPeopleCharacter(id) {
        if (id === 0) {
            return {}
        }
        const totalArray = this.getPeopleCharacters().length
        if (totalArray < id) {
            return _.find(this.getPeopleCharacters(), {id: 1})
        }
        return _.find(this.getPeopleCharacters(), {id: id})
    },

    handleReportPrint() {
        window.print()
    },

    getQuadrant(x, y) {
        if (x > 50) {
            if (y > 50) {
                return 'VIP'
            } else {
                return 'STA'
            }
        } else {
            if (y > 50) {
                return 'UP'
            } else {
                return 'NF'
            }
        }
    },

    shouldDisplayCharacters() {
        const value = this.getCookie('showCharacters')
        if (value && value == 1) {
            return true
        }
        return false
    },

    toggleDisplayCharacters() {
        const value = this.getCookie('showCharacters')
        let showCharacters
        if (value && value == 1) {
            showCharacters = 0
        } else {
            showCharacters = 1
        }

        return this.saveCookie('showCharacters', showCharacters, {path: '/'})
    },

    /**
     *
     * @param currentTrajectory
     * @returns {null}
     */
    getTrajectory(currentTrajectory) {
        let newTrajectory = null
        switch (currentTrajectory) {
            case 0:
                newTrajectory = 1
                break

            case 1:
                newTrajectory = 2
                break

            case 2:
                newTrajectory = 3
                break

            case 3:
                newTrajectory = 4
                break

            case 4:
                newTrajectory = 0
        }

        return newTrajectory
    },

    /**
     *
     * @param item
     * @param routeLocation
     * @returns {boolean}
     */
    isItemShow(item, routeLocation) {
        const zoom = routeLocation.query.zoom && routeLocation.query.zoom ? routeLocation.query.zoom : null
        const positionX = item.positionX
        const positionY = item.positionY

        if (zoom === null) {
            return true
        }
        switch (zoom) {
            case 'nf':
                if (positionX <= 50 && positionY <= 50) {
                    return true
                }
                break
            case 'std':
                if (positionX >= 50 && positionY <= 50) {
                    return true
                }
                break

            case 'up':
                if (positionX <= 50 && positionY >= 50) {
                    return true
                }
                break

            case 'vip':
                if (positionX >= 50 && positionY >= 50) {
                    return true
                }
                break
        }

        return false
    },

    /**
     *
     * @param item
     * @param routeLocation
     * @returns {{positionY: number, positionX: number}}
     */
    getPosition(item, routeLocation) {
        const zoom = routeLocation.query.zoom && routeLocation.query.zoom ? routeLocation.query.zoom : null
        const container = this.getContainer()
        let positionX = item.positionX
        let positionY = item.positionY

        if (zoom !== null) {
            switch (zoom) {
                case 'nf':
                    positionX = positionX * 2
                    positionY = positionY * 2
                    break

                case 'std':
                    positionX = (positionX - 50) * 2
                    positionY = positionY * 2
                    break

                case 'up':
                    positionX = positionX * 2
                    positionY = (positionY - 50) * 2
                    break

                case 'vip':
                    positionY = (positionY - 50) * 2
                    positionX = (positionX - 50) * 2
                    break
            }
        }

        positionX = container.width / 100 * positionX
        positionY = container.height - (container.height / 100 * positionY)

        // Decrease position x, y base on icon_size
        switch (item.icon_size) {
            case 's':
                positionX = positionX - 20
                positionY = positionY - 48

                // Add shadow
                positionY = positionY + 3

                if (positionX >= container.width - 40) {
                    positionX = container.width - 40
                }

                if (positionX <= 0) {
                    positionX = 0
                }

                if (positionY <= 0) {
                    positionY = 0
                }

                if (positionY >= container.height - 48) {
                    positionY = container.height - 48
                }
                break

            case 'm':
            case 'f':
                positionX = positionX - 32
                positionY = positionY - 78

                // Add shadow
                positionY = positionY + 5

                if (positionX >= container.width - 64) {
                    positionX = container.width - 64
                }

                if (positionX < 0) {
                    positionX = 0
                }

                if (positionY >= container.height - 78) {
                    positionY = container.height - 78
                }

                if (positionY < 0) {
                    positionY = 0
                }
                break

            case 'l':
                positionX = positionX - 41
                positionY = positionY - 95

                // Add shadow
                positionY = positionY + 4

                if (positionX >= container.width - 82) {
                    positionX = container.width - 82
                }

                if (positionX < 0) {
                    positionX = 0
                }

                if (positionY < 0) {
                    positionY = 0
                }

                if (positionY >= container.height - 95) {
                    positionY = container.height - 95
                }
                break
        }

        return {
            positionX: positionX,
            positionY: positionY
        }
    },

    /**
     *
     * @param item
     * @param routeLocation
     * @returns {{positionY: number, positionX: *}}
     */
    getPositionForSave(item, routeLocation, iconSize = null) {
        const zoom = routeLocation.query.zoom && routeLocation.query.zoom ? routeLocation.query.zoom : null
        const container = this.getContainer()
        let positionX = item.x
        let positionY = item.y

        // Increase  position x, y base on icon_size
        switch (iconSize) {
            case 's':
                positionX = positionX + 20
                positionY = positionY + 45

                //Remove shadow 
                positionY = positionY - 3
                break

            case 'm':
            case 'f':
                positionX = positionX + 32
                positionY = positionY + 78

                // Remove shadow 
                positionY = positionY - 5
                break

            case 'l':
                positionX = positionX + 42
                positionY = positionY + 95

                // Remove shadow
                positionY = positionY - 4
                break
        }

        if (zoom !== null) {
            switch (zoom) {
                case 'nf':
                    positionX = positionX / 2
                    positionY = (container.height / 2) + (positionY / 2)
                    break
                case 'std':
                    positionX = (container.width / 2) + positionX / 2
                    positionY = (container.height / 2) + (positionY / 2)
                    break
                case 'up':
                    positionX = positionX / 2
                    positionY = positionY / 2
                    break
                case 'vip':
                    positionY = positionY / 2
                    positionX = (container.width / 2) + (positionX / 2)
            }
        }

        positionY = 100 - _.round((positionY / container.height) * 100, 4)
        positionX = _.round((positionX / container.width) * 100, 4)

        return {
            positionX: positionX,
            positionY: positionY
        }
    },

    /**
     *
     * @param event
     * @returns {string|null}
     */
    getZoomLabel(event) {
        const container = this.getContainer()
        let positionX = event.clientX - 40
        let positionY = event.clientY - 40
        // convert PX to %
        positionY = 100 - _.round((positionY / container.height) * 100, 4)
        positionX = _.round((positionX / container.width) * 100, 4)

        if (positionX < 50 && positionY < 50) {
            return 'nf'
        }

        if (positionX < 50 && positionY > 50) {
            return 'up'
        }

        if (positionX > 50 && positionY < 50) {
            return 'std'
        }

        if (positionX > 50 && positionY > 50) {
            return 'vip'
        }

        return null
    },

    /**
     *
     * @param routeLocation
     * @returns {boolean}
     */
    isZoom(routeLocation) {
        return routeLocation.query.zoom && routeLocation.query.zoom ? true : false
    },

    /**
     *
     * @param trajectory
     * @returns {string}
     */
    getTrajectoryClass(trajectory) {
        switch (trajectory) {
            case 1:
                return 'top-right'
                break

            case 2:
                return 'bottom-right'
                break

            case 3:
                return 'bottom-left'
                break

            case 4:
                return 'top-left'
                break
            default:
                return ''

        }
    },

    /**
     *
     * @param value
     * @returns {number}
     */
    convertFloatToInt(value) {
        return value | 0
    },

    /**
     *
     * @param item
     * @returns {string}
     */
    getDraggableActionClass(item) {
        const container = this.getContainer();
        const width = container.width;
        const height = container.height;
        const positionX = item.positionX;
        const positionY = item.positionY;
        if (positionX < 74) {
            return 'action-right'
        }else{
            if(positionX < width / 2 - 74 && positionY < 74){
                return 'action-right'
            }

            if (positionY < 80) {
                return 'action-left'
            }
        }

        if (positionX > width - 148) {
            if (positionY < 80 || positionY > 500) {
                return 'action-left'
            }
            return 'action-left'
        }
        return '';
    }
}
