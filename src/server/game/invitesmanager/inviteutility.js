
/*
 * This script stores utility methods for working
 * with single invites, not multiple
 */

// System imports
const fs = require('fs')
const path = require('path');

// Middleware imports
const { logEvents } = require('../../middleware/logEvents.js');
const { readFile, writeFile } = require('../../utility/lockFile.js');
const { getUsernameCaseSensitive } = require('../../controllers/members.js')

// Custom imports
// eslint-disable-next-line no-unused-vars
const { Socket } = require('../TypeDefinitions.js')
const wsutility = require('../wsutility.js');
const sendNotify = wsutility.sendNotify;
const sendNotifyError = wsutility.sendNotifyError;
const math1 = require('../math1.js')
const variant1 = require('../variant1.js')
const clockweb = require('../clockweb.js');
const { writeFile_ensureDirectory } = require('../../utility/fileUtils');
const { setTimeServerRestarting, cancelServerRestart, getTimeServerRestarting } = require('../serverrestart.js');
const { createGame, isSocketInAnActiveGame } = require('../gamemanager/gamemanager.js');
const { getDisplayNameOfPlayer } = require('../gamemanager/gameutility.js');
const { getInviteSubscribers, addSocketToInvitesSubs, removeSocketFromInvitesSubs } = require('./invitessubscribers.js');

const { getActiveGameCount } = require('../gamemanager/gamecount')

//-------------------------------------------------------------------------------------------

/**
 * @typedef {Object} Invite - The invite object.
 * @property {string} id - A unique identifier, containing lowercase letters a-z and numbers 0-9.
 * @property {Object} name - The display name of the owner, "(Guest)" if not logged in.
 * @property {Object} owner - An object with either the `member` or `browser` property, which tells us who owns it.
 * @property {string} tag - Used to verify if an invite is your own.
 * @property {string} variant - The name of the variant this invite is for
 * @property {string} clock - The clock value: "s+s"
 * @property {string} color - white/black
 * @property {string} rated - rated/casual
 * @property {string} publicity - Whether this is a "public"/"private" game.
 */

//-------------------------------------------------------------------------------------------

/**
 * Returns true if the invite is private
 * @param {Invite} invite 
 * @returns {boolean}
 */
function isInvitePrivate(invite) {
    return invite.publicity === 'private'
}

/**
 * Returns true if the invite is public
 * @param {Invite} invite 
 * @returns {boolean}
 */
function isInvitePublic(invite) {
    return invite.publicity === 'public'
}

/**
 * Removes sensitive data such as their browser-id.
 * MODIFIES the invite! Make sure it's a copy!
 * @param {Invite} invite - A copy of the invite
 * @returns {Invite}
 */
function makeInviteSafe(invite) {
    delete invite.owner;
    return invite;
}

/**
 * Makes a deep copy of provided invite, and
 * removes sensitive data such as their browser-id.
 * @param {Invite} invite
 * @returns {Invite}
 */
function safelyCopyInvite(invite) {
    const inviteDeepCopy = math1.deepCopyObject(invite);
    return makeInviteSafe(inviteDeepCopy);
}

/**
 * Tests if the provided invite belongs to the provided socket.
 * @param {Socket} ws 
 * @param {Invite} invite 
 * @returns {boolean}
 */
function isInviteOurs(ws, invite) {
    return ws.metadata.user && ws.metadata.user === invite.owner.member
        || ws.metadata['browser-id'] && ws.metadata['browser-id'] === invite.owner.browser
}

//-------------------------------------------------------------------------------------------

module.exports = {
    isInvitePrivate,
    isInvitePublic,
    makeInviteSafe,
    safelyCopyInvite,
    isInviteOurs,
}